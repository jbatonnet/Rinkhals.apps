## To download OctoApp

On a computer:
- Download https://github.com/crysxd/OctoApp-Plugin/archive/refs/tags/2.1.6.zip
- Extract to /apps/octoapp/octoapp

## To cache packages

On the printer:
```
PIP_TEMP=/useremain/tmp/pip

mkdir -p $PIP_TEMP

export PATH=/usr/libexec/gcc/arm-buildroot-linux-uclibcgnueabihf/11.4.0:$PATH
export CC=/usr/bin/gcc
export LD_LIBRARY_PATH=/lib:/usr/lib
export HOME=$PIP_TEMP
export TMPDIR=$PIP_TEMP

python -m venv --without-pip --system-site-packages /useremain/home/rinkhals/apps/octoapp

python -m pip install -r octoapp/requirements.txt
python -m pip uninstall -y pip

find . -name '*.pyc' -type f -exec rm {} +
```
