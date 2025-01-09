#!/bin/sh

# From a Windows machine:
#   docker run --rm -it -v .\build:/build -v .\files:/files -v .\apps:/apps ghcr.io/jbatonnet/rinkhals/build /build/build-swu.sh "APP_PATH"

set -e


# Prepare update
mkdir -p /tmp/update_swu
rm -rf /tmp/update_swu/*

cp /build/update.sh /tmp/update_swu/update.sh

APP_ROOT=$1
APP=$(basename $APP_ROOT)

if [ ! -f $APP_ROOT/app.sh ]; then
    echo "No app found in $APP_ROOT. Exiting SWU build"
    exit 1
fi

echo "Preparing update package for $APP..."

mkdir -p /tmp/update_swu/$APP
cp -r $APP_ROOT/* /tmp/update_swu/$APP/


# Create the setup.tar.gz
echo "Building update package..."

mkdir -p /build/dist/update_swu
rm -rf /build/dist/update_swu/*

cd /tmp/update_swu
tar -czf /build/dist/update_swu/setup.tar.gz --exclude='setup.tar.gz' .


# Create the update.swu
rm -rf /build/dist/update.swu

cd /build/dist
zip -P U2FsdGVkX19deTfqpXHZnB5GeyQ/dtlbHjkUnwgCi+w= -r update.swu update_swu

echo "Done, your update package is ready: build/dist/update.swu"
