#!/bin/sh

# From a Windows machine:
#   <cd to this git repo root>
#   docker run --rm -it -v .\apps:/apps ghcr.io/jbatonnet/rinkhals/build /apps/octoeverywhere/get-octoeverywhere.sh

mkdir /work
cd /work


OCTOEVERYWHERE_VERSION=4.1.0
OCTOEVERYWHERE_DIRECTORY=/apps/octoeverywhere


# OctoEverywhere
echo "Downloading OctoEverywhere..."

wget -O octoeverywhere.zip https://github.com/QuinnDamerell/OctoPrint-OctoEverywhere/archive/refs/tags/${OCTOEVERYWHERE_VERSION}.zip
unzip -d octoeverywhere octoeverywhere.zip

mkdir -p $OCTOEVERYWHERE_DIRECTORY/octoeverywhere
rm -rf $OCTOEVERYWHERE_DIRECTORY/octoeverywhere/*
cp -pr /work/octoeverywhere/*/* $OCTOEVERYWHERE_DIRECTORY/octoeverywhere

sed -i "s/\"version\": *\"[^\"]*\"/\"version\": \"${OCTOEVERYWHERE_VERSION}\"/" $OCTOEVERYWHERE_DIRECTORY/app.json
