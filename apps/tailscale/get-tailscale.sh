#!/bin/sh

# From a Windows machine:
#   <cd to this git repo root>
#   docker run --rm -it -v .\apps:/apps ghcr.io/jbatonnet/rinkhals/build /apps/tailscale/get-tailscale.sh

mkdir /work
cd /work


TAILSCALE_VERSION="1.84.0"
TAILSCALE_DIRECTORY=/apps/tailscale


echo "Downloading Tailscale..."

wget -O tailscale.tgz https://pkgs.tailscale.com/stable/tailscale_${TAILSCALE_VERSION}_arm.tgz
tar -xzvf tailscale.tgz

mkdir -p $TAILSCALE_DIRECTORY/bin
rm -rf $TAILSCALE_DIRECTORY/bin/*
cp -p /work/tailscale*/* $TAILSCALE_DIRECTORY/bin

sed -i "s/\"version\": *\"[^\"]*\"/\"version\": \"${TAILSCALE_VERSION}\"/" $TAILSCALE_DIRECTORY/app.json
echo $TAILSCALE_VERSION > $TAILSCALE_DIRECTORY/bin/version
