#!/bin/sh

# From a Windows machine:
#   <cd to this git repo root>
#   docker run --rm --privileged multiarch/qemu-user-static --reset -p yes
#   docker run --platform=linux/arm/v7 --rm -it -v .\build\cache\pip:/root/.cache/pip -v .\build:/build -v .\apps:/apps ghcr.io/jbatonnet/armv7-uclibc /apps/octoeverywhere/get-packages.sh


cd /apps/octoeverywhere

echo "Removing old packages..."
rm -rf lib

echo "Creating temporary venv..."
python -m venv .
. bin/activate

echo "Installing OctoEverywhere requirements..."
python -m pip install -r octoeverywhere/requirements.txt

echo "Cleaning up..."
rm -rf bin
rm -rf include
rm -rf lib/python3.*/site-packages/_distutils_hack
rm -rf lib/python3.*/site-packages/pip
rm -rf lib/python3.*/site-packages/pip*
rm -rf lib/python3.*/site-packages/pkg_resources
rm -rf lib/python3.*/site-packages/setuptools
rm -rf lib/python3.*/site-packages/setuptools*
rm -f lib/python3.*/site-packages/distutils-precedence.pth
rm -f pyvenv.cfg
find lib/python3.* -name '*.pyc' -type f | xargs rm
