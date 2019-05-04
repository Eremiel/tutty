import logger from './logger';
import * as LDAP from 'ldapjs';

import config from './config';

export type ValueCallback<ValueType> = (err: any, value: ValueType) => void;
export type Callback = (err: any) => void;

import { User, Group } from './interfaces';


/****************************************************************************************
 * LDAP-based user implementation
 ****************************************************************************************/

/*
LdapUser implements the User interface backed by an Ldap Server
*/
export default class LdapUser implements User {
  username: string;
  uid:      number;
  gid:      number;

  /*
  FindByName looks up a user by username. If the user is not stored in the LDAP,
  an error and a null value for the user is returned
  */
  public static FindByName(username: string, cb: (err: Error, user: LdapUser) => void) {
    
    ldap_get_user(username, (err: Error,user: User) => { cb(err, user); });
    
  }

  public static CreateUser(username: string, cb: (err: Error, user: LdapUser) => void) {
    this.FindByName(username, (err: Error, user: LdapUser) => {
      if ( (err != undefined && err != null) || user != null ) {
        cb(new Error(`User with username ${username} exists.`), user);
      } else {
        ldap_add_user(username, null, (err: Error, user: User) => {
          cb(err,user)
        });
      }
    });
  }

}


/****************************************************************************************
 * Internal ldap functions
 ****************************************************************************************/

/*
  Obtain the largest registered uid,gid,etc. 
*/
function ldap_max_attrib(attrib: string, cb: ValueCallback<number>) {
  
  var ldap = LDAP.createClient({
    url: config.Instance.LDAP_SERVER_URL,    // string
  });

  ldap.bind(config.Instance.LDAP_ADMIN_DN, config.Instance.LDAP_ADMIN_PASSWORD, (err) => {
    
    var filterString = '';
    switch (attrib) {
      case 'uidNumber': 
        filterString='(objectClass=posixAccount)'
        break;
      case 'gidNumber':
        filterString='(objectClass=posixGroup)'
        break;
    }

    var opts:LDAP.SearchOptions = {
      filter: filterString,
      scope: 'sub',
      attributes: [attrib],
    }

    ldap.search(config.Instance.LDAP_BASE, opts, (err,res) => {
      
      var uid = 0;

      res.on('searchEntry', (e) =>  {
        e.attributes.forEach( (v) => {
          if ( v.json.type === attrib ) {      
            var auid = parseInt(v.vals[0]);
            if (auid > uid) uid = auid;
          }
        });
      });

      res.on('end', (e) => {
        ldap.unbind();
        cb(null, uid);
      });

    });
  });

}

function ldap_max_uid(cb: ValueCallback<number>) { return ldap_max_attrib('uidNumber',cb); };
function ldap_max_gid(cb: ValueCallback<number>) { return ldap_max_attrib('gidNumber',cb); };

function create_group_ou(cb) {
  
  var ldap = LDAP.createClient({
    url: config.Instance.LDAP_SERVER_URL,    // string
  });

  ldap.bind(config.Instance.LDAP_ADMIN_DN, config.Instance.LDAP_ADMIN_PASSWORD, (err) => {
    
    var entry = {
      objectClass: ['top', 'organizationalUnit'],
    };

    ldap.add(`ou=groups,${config.Instance.LDAP_BASE}`, entry, (err) => {
      if ( err ) console.error(err);
      ldap.unbind();
      cb(err);
    });

  });

}

function ldap_add_group(groupname: string, gid: number, cb: ValueCallback<Group> ) {

  ldap_max_gid((mgid) => {
    
    var new_gid = (gid) ? gid : Math.max(mgid+1,config.Instance.LDAP_ID_RANGE_START);

    var ldap = LDAP.createClient({
      url: config.Instance.LDAP_SERVER_URL,    // string
    });

    ldap.bind(config.Instance.LDAP_ADMIN_DN, config.Instance.LDAP_ADMIN_PASSWORD, (err) => {
    
      var entry = {
        cn: groupname,
        objectClass: ['top', 'posixGroup'],
        gidNumber: new_gid,
      };

      ldap.add(`cn=${groupname},ou=groups,${config.Instance.LDAP_BASE}`, entry, (err) => {
        if ( err ) {
          create_group_ou((err) => {
            if ( !err ) { 
              ldap_add_group(groupname, gid, cb)
            } else {
              ldap.unbind();
              return cb(err,{ groupname: groupname, gid: new_gid });
            }
          }) ;
        } else {
          ldap.unbind();
          return cb(err,{ groupname: groupname, gid: new_gid });
        }
      });

    });
  });

}

function ldap_add_user(username: string , uid:number, cb: ValueCallback<User>) {

  ldap_add_group(username, null, (err, group) => {
  //if (err) return cb(err,null);
  ldap_max_uid((muid) => {
    
    var new_uid = (uid) ? uid : Math.max(muid+1,config.Instance.LDAP_ID_RANGE_START);
    var new_gid = group.gid;

    var ldap = LDAP.createClient({
      url: config.Instance.LDAP_SERVER_URL,    // string
    });

    ldap.bind(config.Instance.LDAP_ADMIN_DN, config.Instance.LDAP_ADMIN_PASSWORD, (err) => {
    
      var entry = {
        cn: username,
        objectClass: ['top', 'account', 'posixAccount', 'shadowAccount'],
        uid: username,
        gecos: username,
        uidNumber: new_uid,
        gidNumber: new_gid,
        homeDirectory: `/home/${username}`,
        loginShell: '/bin/bash',
        shadowLastChange: 17981,
        shadowMax: 99999,
        shadowMin: 0,
        shadowWarning: 7,
        shadowExpire: 99999,
        shadowInactive: 99999,
        shadowFlag: 0,
        userPassword: ''
      };

      ldap.add(`cn=${username},${config.Instance.LDAP_BASE}`, entry, (err) => {
        if ( err ) console.error(err);
        ldap.unbind();
        cb(err,{ username: username, uid: new_uid, gid: new_gid });
      });

    });
  })});

}

function ldap_get_user(username: string, cb: ValueCallback<User>) {

  var ldap = LDAP.createClient({
    url: config.Instance.LDAP_SERVER_URL,    // string
  });

  ldap.bind(config.Instance.LDAP_ADMIN_DN, config.Instance.LDAP_ADMIN_PASSWORD, (err) => {
    
    var filterString=`(&(objectClass=posixAccount)(uid=${username}))`
    
    var opts = {
      filter: filterString,
      scope: 'sub',
      attributes: [ "uid", "uidNumber", "gidNumber" ],
    }

    ldap.search(config.Instance.LDAP_BASE, opts, (err,res) => {
      
      var user: User = null;

      res.on('searchEntry', (e) =>  {
        user = new LdapUser();
        e.attributes.forEach( (v) => {
          switch (v.json.type) {
            case 'uid':       user.username = v.vals[0].toString(); break;
            case 'uidNumber': user.uid = parseInt(v.vals[0]); break;
            case 'gidNumber': user.gid = parseInt(v.vals[0]); break;
          }
        });
      });

      res.on('end', (e) => {
        ldap.unbind();
        cb(null,user);
      });

    });
  });

}