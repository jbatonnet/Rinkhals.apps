#!/bin/sh

# Run from Docker:
#   docker run --rm -it -v .\apps:/apps ghcr.io/jbatonnet/rinkhals/build /apps/vanilla-moonraker/get-moonraker.sh

mkdir /work
cd /work


MOONRAKER_DIRECTORY=/apps/vanilla-moonraker


echo "Downloading Moonraker..."

wget -O moonraker.zip https://github.com/Arksine/moonraker/archive/4eb23ef2817dc56e9a8a2bf81e1a011ee27888e3.zip
unzip -d moonraker moonraker.zip

mkdir -p $MOONRAKER_DIRECTORY/moonraker
rm -rf $MOONRAKER_DIRECTORY/moonraker/*
cp -pr /work/moonraker/*/* $MOONRAKER_DIRECTORY/moonraker

CURRENT_DATE=$(date +"%Y-%m-%d")
sed -i "s/\"version\": *\"[^\"]*\"/\"version\": \"${CURRENT_DATE}\"/" $MOONRAKER_DIRECTORY/app.json
