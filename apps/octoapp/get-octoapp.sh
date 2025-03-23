#!/bin/sh

# Run from Docker:
#   docker run --rm -it -v .\apps:/apps ghcr.io/jbatonnet/rinkhals/build /apps/octoapp/get-octoapp.sh

mkdir /work
cd /work


OCTOAPP_VERSION=2.1.10
OCTOAPP_DIRECTORY=/apps/octoapp


# OctoApp
echo "Downloading OctoApp..."

wget -O octoapp.zip https://github.com/crysxd/OctoApp-Plugin/archive/refs/tags/${OCTOAPP_VERSION}.zip
unzip -d octoapp octoapp.zip

mkdir -p $OCTOAPP_DIRECTORY/octoapp
rm -rf $OCTOAPP_DIRECTORY/octoapp/*
cp -pr /work/octoapp/*/* $OCTOAPP_DIRECTORY/octoapp

sed -i "s/\"version\": *\"[^\"]*\"/\"version\": \"${OCTOAPP_VERSION}\"/" $OCTOAPP_DIRECTORY/app.json
