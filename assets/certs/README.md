# Certificate authority for signing host keys

Communication between frontend and backend is implemented via ssh using host-based authentication. For this to work, backend and frontend host keys need to be signed by a
common certificate authority (CA).

This container provides a convinience environment to generate a CA, hostkeys, and sign them with the CA.

## Usage

To issue a new CA (if needed) and create host keys for the default hosts (`web` and `backend` use

```bash
docker build -t ca-builder .
docker run -v $(pwd):/data ca-builder
```

The `HOSTS` environment variable contains the host list. To create/manage keys for a custom set of hosts use:

```bash
docker build -t ca-builder .
docker run -v $(pwd):/data -e HOSTS="myhost1 myhost2" ca-builder
```

## Generated files

The following files will be genertated if needed. Generally, a file is only created if it does not exists. The exception are signed public host keys. These will be regenerted and overwritten to allow renewal of expired certs.

| Filename                             | Comment                                                                                                | Permissions |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------ | ----------- |
| `ca.pem`                             | The public key of the Certificate authority                                                            | `400`       |
| `ca.pub`                             | The public key of the Certificate Authority in `ssh-rsa` format                                        | `444`       |
| `ca-key.pem`                         | The private key of the Certificate Authority (*protect at any cost*)                                   | `444`       |
| `ssh_known_hosts`                    | Contains an entry to accept signed host certificates.                                                  | `644`       |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------ | ----------- |
| `keys/ssh_xxx_host_rsa_key`          | Private host key for host `xxx`                                                                        | `400`       |
| `keys/ssh_xxx_host_rsa_key.pub`      | Public host key for host `xxx`                                                                         | `444`       |
| `keys/ssh_xxx_host_rsa_key-cert.pub` | Signed public host key for host `xxx` (referenced in `/etc/ssh/ssh_config` variable `HostCertificate`) | `644`       |

### Location of files

A server that should *accept* host-authenticated ssh connections needs the following files

| Filename          | Location                   | Comment                                                             |
| ----------------- | -------------------------- | ------------------------------------------------------------------- |
| `ca.pub`          | `/etc/ssh/ca-local.pub`    | Referenced in `/etc/ssh/sshd_config` (variable `TrustedUserCAKeys`) |
| `ssh_known_hosts` | `/etc/ssh/ssh_known_hosts` | Could be appended to exisiting file                                 |

> The public CA key is only needed if signed user certificates are used for authentication. For host-based authentication, this is not needed.

Every host `xxx` needs its set of host keys (clients and server) provided. *Attention*: Default naming conventions apply.

| Filename                             | Location                             | Comment                                |
| ------------------------------------ | ------------------------------------ | -------------------------------------- |
| `keys/ssh_xxx_host_rsa_key`          | `/etc/ssh/ssh_host_rsa_key`          | Private key - confirm file permissions |
| `keys/ssh_xxx_host_rsa_key.pub`      | `/etc/ssh/ssh_host_rsa_key.pub`      | Public key                             |
| `keys/ssh_xxx_host_rsa_key-cert.pub` | `/etc/ssh/ssh_host_rsa_key-cert.pub` | The signed public key                  |

## Hostbased authentication with signed certificates

Signed host certificates can be used to authenticate users logging in from trusted hosts. This requires three things:

1. Mutual recognition of host keys (via a mutually recognised CA)
2. Appropriate security setting on the server to allow `user` to authenticate from `client`
3. The `user` must have an account on the server

## Recognition of signed host keys

### Configure CA as trust provider on server

For a server to recognise a signed hostkey, an appropriate line needs to be added to `/etc/ssh/ssh_known_hosts` with the `@cert-authority` prefix.

```ssh_known_hosts
@cert-authority * ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQCzxU928LpiGsXt2j2VXFcCAh4c8r2M72R9U[...]SX6d+6WOdDLusPuYhTJQ9Q1
```

This line configures a CA with public key `AAAAB3NzaC1yc...hTJQ9Q1` as trust provider for all connecting hosts (wildcard `*`).
Every host that can present an appropriately signed host key is valid.

> The wildcard can be replaced with more restrictive filter (e.g., a domain) to increase security.

### Enable hostbased authentication

On the server edit `/etc/ssh/sshd_config` and add

```sshd_config
HostbasedAuthentication yes
IgnoreUserKnownHosts yes
IgnoreRhosts yes
HostbasedUsesNameFromPacketOnly yes
```

On each client edit `/etc/ssh/ssh_config` and add

```ssh_config
Host *
  HostbasedAuthentication yes
  StrictHostKeyChecking yes
  EnableSSHKeysign yes
  LogLevel ERROR
```

### Configure usage of signed certificates

The usage of the signed host keys needs to be configured. On the server edit `/etc/ssh/sshd_config` and add

```sshd_config
HostCertificate /etc/ssh/ssh_host_rsa_key-cert.pub
```

## Appropriate security setting on the server

The host-based authentication flow also checks a number files to verify that a `user` has the right to login from `client`.
An important distinction in this is the username that is used on the client (`clientuser`) and the one that will be used
on the server after successful login (`serveruser`). The security chain refers to the `clientuser`.

There are two important files to configure the security settings server-wide:

| File                    | Comment                                                          |
| ----------------------- | ---------------------------------------------------------------- |
| `/etc/ssh/shosts.equiv` | Line-by-line pairs of `hostname` and `user` with permissions     |
| `/etc/netgroup`         | Definition of netgroups that can be referenced in `shosts.equiv` |

The file format of `shosts.equiv` is similar to the (better documented) `hosts.equiv` format, but lacks some
features. Especially, the wildcard features (+) were deliberately removed. Hence, usage of `shosts.equiv` alone
would require the listing of all permitted hosts (which defeates the purpose of signed host keys).

Fortunately, the netgroup feature allows to emulate the missing wildcard features. A netgroup can be defined through a directory service or a file. The default configuration is to use `nis` to define netgroups. `/etc/nsswitch.conf` needs to be configured to use the file `/etc/netgroup`. Add/edit the following line to enable file-based netgroups:

```nsswitch.conf
netgroup:       files nis
```

A netgroup is defined by a line in the `/etc/netgroup` file

```netgroup
groupname (host,user,domain)
```

with a `NULL` value allowing all. Two possible netgroup definitions are

```netgroup
all (,,)
web (,web,)
```

The `all` group encompases all hosts, users, and domains and really is not secure at all. This should only be used in well-controlled environments where access to to the ssh port is stricly limited to trusted machines.

The `web` group defines a `web` clientuser that is allowed to authenticate. Please note that this also is not particularly secure, because everyone with root control over a client machine can create a `web` user and initiate an ssh connection through it. Anyway, similarly loose security settings are needed to avoid having to configure trusted hosts on a server.

A netgroup is configured in `shosts.equiv` with the `@` directive. To use the `all` netgroup add a line like this

```shosts.equiv
@all @all
```

> Note that a netgroup definition is needed for the host field *and* the user field. I think this is a bug in OpenSSH. OpenSSH first matches the host against all tuples in the given netgroup. If at least one matches, it matches the username separately against the same set of tuplets. Hence a netgroup "complex (host1,user1,) (host2,user2,)" should not autheticate user2 from host1. In the current implementation of OpenSSH, however, it would. If the user field is not defined, OpenSSH requires the same username on client and server. For reference, the security check is implemented in [auth-rhosts.c](https://github.com/openssh/openssh-portable/blob/d0c3ac427f6c52b872d6617421421dd791664445/auth-rhosts.c) in the OpenSSH source code.

## User account on server

A user can only login if the server has a corresponding user account configured. THis can be a local unix account, but it is more likely that this is an LDAP-provided account (or from a similar directory service). OpenSSH uses PAM internally to validate users. The file `/etc/pam.d/sshd` configures this.
