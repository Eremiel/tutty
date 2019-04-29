import util, { isError } from 'util'

import LDAP from 'ldapjs';
 
import config from './config.json';

var ldap = LDAP.createClient({
  url: config.LDAP_SERVER_URL,    // string
});

/*
  Obtain the largest registered uid,gid,etc. 
*/
function ldap_max_attrib(attrib, cb) {
  
  ldap.bind(config.LDAP_ADMIN_DN, config.LDAP_ADMIN_PASSWORD, (err) => {
    
    var filterString = '';
    switch (attrib) {
      case 'uidNumber': 
        filterString='(objectClass=posixAccount)'
        break;
      case 'gidNumber':
        filterString='(objectClass=posixGroup)'
        break;
    }

    var opts = {
      filter: filterString,
      scope: 'sub',
      attributes: attrib,
    }

    ldap.search(config.LDAP_BASE, opts, (err,res) => {
      
      var uid = 0;

      res.on('searchEntry', (e) =>  {
        e.attributes.forEach( (v) => {
          if ( v.type === attrib ) {      
            var auid = parseInt(v._vals[0]);
            if (auid > uid) uid = auid;
          }
        });
      });

      res.on('end', (e) => {
        cb(uid);
      });

    });
  });

}

export function ldap_max_uid(cb) { return ldap_max_attrib('uidNumber',cb); };
export function ldap_max_gid(cb) { return ldap_max_attrib('gidNumber',cb); };

function create_group_ou(cb) {
  
  ldap.bind(config.LDAP_ADMIN_DN, config.LDAP_ADMIN_PASSWORD, (err) => {
    
    var entry = {
      objectClass: ['top', 'organizationalUnit'],
    };

    ldap.add(`ou=groups,${config.LDAP_BASE}`, entry, (err) => {
      if ( err ) console.error(err);
      cb(err);
    });

  });

}

export function ldap_add_group(groupname, gid, cb) {

  ldap_max_gid((mgid) => {
    
    var new_gid = (gid) ? gid : Math.max(mgid+1,config.LDAP_ID_RANGE_START);

    ldap.bind(config.LDAP_ADMIN_DN, config.LDAP_ADMIN_PASSWORD, (err) => {
    
      var entry = {
        cn: groupname,
        objectClass: ['top', 'posixGroup'],
        gidNumber: new_gid,
      };

      ldap.add(`cn=${groupname},ou=groups,${config.LDAP_BASE}`, entry, (err) => {
        if ( err ) {
          create_group_ou((err) => {
            if ( !err ) { 
              ldap_add_group(groupname, gid, cb)
            } else {
              return cb(err,{ groupname: groupname, gid: new_gid });
            }
          }) ;
        } else {
          return cb(err,{ groupname: groupname, gid: new_gid });
        }
      });

    });
  });

}

export function ldap_add_user(username , uid, cb) {

  ldap_add_group(username, null, (err, group) => {
  if (err) return cb(err,null);
  ldap_max_uid((muid) => {
    
    var new_uid = (uid) ? uid : Math.max(muid+1,config.LDAP_ID_RANGE_START);
    var new_gid = group.gid;

    ldap.bind(config.LDAP_ADMIN_DN, config.LDAP_ADMIN_PASSWORD, (err) => {
    
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

      ldap.add(`cn=${username},${config.LDAP_BASE}`, entry, (err) => {
        if ( err ) console.error(err);
        cb(err,{ username: username, uid: new_uid, gid: new_gid });
      });

    });
  })});

}

export function ldap_get_user(username, cb) {

  ldap.bind(config.LDAP_ADMIN_DN, config.LDAP_ADMIN_PASSWORD, (err) => {
    
    var filterString=`(&(objectClass=posixAccount)(uid=${username}))`
    
    var opts = {
      filter: filterString,
      scope: 'sub',
      attributes: [ "uid", "uidNumber", "gidNumber" ],
    }

    ldap.search(config.LDAP_BASE, opts, (err,res) => {
      
      var user = null;

      res.on('searchEntry', (e) =>  {
        if ( user === null ) user = {};
        e.attributes.forEach( (v) => {
          switch (v.type) {
            case 'uid':       user.username = v._vals[0].toString(); break;
            case 'uidNumber': user.uid = parseInt(v._vals[0]); break;
            case 'gidNumber': user.gid = parseInt(v._vals[0]); break;
          }
        });
      });

      res.on('end', (e) => {
        cb(user);
      });

    });
  });

}

export default { ldap_max_uid, ldap_add_user }