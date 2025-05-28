#!/bin/sh

# Run from Docker:
#   docker run --rm -it -v .\apps:/apps ghcr.io/jbatonnet/rinkhals/build /apps/vanilla-klipper/get-klipper.sh

mkdir /work
cd /work


# Klipper
echo "Downloading Klipper..."

wget -O klipper.zip https://github.com/ANYCUBIC-3D/Kobra3/archive/refs/heads/main.zip
unzip -d klipper klipper.zip

mkdir -p /apps/vanilla-klipper/klippy
rm -rf /apps/vanilla-klipper/klippy/*

cp -pr /work/klipper/*/klipper-mcu/klippy/* /apps/vanilla-klipper/klippy/
cp -p /work/klipper/*/klipper-mcu/scripts/klippy-requirements.txt /apps/vanilla-klipper/

cd /apps/vanilla-klipper
patch -p0 < klippy.patch
