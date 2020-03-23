#!/bin/sh

# Create a new Certificate Authority
# -------------------------------------------------------------------
mkdir -p ca
mkdir -p config
if [ ! -f ca/ca-key.pem ]; then
  echo "Creating a NEW Certificate Authority (CA)"
  
  # Step 1: Create a CA private key and secure with password
  openssl genrsa -aes256 -out ca/ca-key.pem 4096
  chmod 400 ca/ca-key.pem

  # Step 2: Create a CA public key
  openssl req -new -x509 -days 365 -key ca/ca-key.pem -sha256 -out ca/ca.pem
  chmod 444 ca/ca.pem

  # Step 3: Convert public key to ssh-rsa format
  ssh-keygen -y -f ca/ca-key.pem > ca/ca.pub
  chmod 444 ca/ca.pub

  echo -e "@cert-authority * $(cat ca.pub)" > config/ssh_known_hosts
else
  echo "Using provided Certificate Authority (CA)"
fi

# Ensure keys folder exists
# -------------------------------------------------------------------
mkdir -p keys
cd keys

# Create host keys and sign
# -------------------------------------------------------------------
for HOST in $HOSTS; do
  
  # Create Host keys if needed
  if [ ! -f "ssh_${HOST}_host_rsa_key" ] || [ ! -f "ssh_${HOST}_host_rsa_key.pub" ]; then
    echo "Create new host keys for host: ${HOST}"
    ssh-keygen -t rsa -C "${HOST} Hostkey" -N "" -f ssh_${HOST}_host_rsa_key
    chmod 400 ssh_${HOST}_host_rsa_key
    chmod 444 ssh_${HOST}_host_rsa_key.pub
  fi

  # Sign host keys (we do this always, even if a signed key is present, to refresh expired keys)
  echo "Signing host key for host: ${HOST}"
  ssh-keygen -s ../ca/ca-key.pem -I ${HOST}-host-key -h -V +52w ssh_${HOST}_host_rsa_key.pub
  chmod 644 ssh_${HOST}_host_rsa_key-cert.pub
done