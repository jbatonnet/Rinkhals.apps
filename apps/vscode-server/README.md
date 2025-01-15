Meh, code binary is build with glibc, requiring the wrong interpreter.

The other way could be to bootstrap glibc interpreter as we were doing with Rinkhals before. This might be interesting for apps broader compatibility.
- Build Buildroot glibc for arm
- Get the interpreter and the missing libs
- Run code with the interpreter as standalone

Tests with uclibc:

```
file code
# code: ELF 32-bit LSB pie executable, ARM, EABI5 version 1 (SYSV), dynamically linked, interpreter /lib/ld-linux-armhf.so.3, for GNU/Linux 4.19.255, stripped

ldd code
# checking sub-depends for '/lib/libgcc_s.so.1'
# checking sub-depends for 'not found'
# checking sub-depends for 'not found'
# checking sub-depends for 'not found'
# checking sub-depends for 'not found'
# checking sub-depends for 'not found'
# checking sub-depends for '/lib/libc.so.0'
#         libgcc_s.so.1 => /lib/libgcc_s.so.1 (0x00000000)
#         librt.so.1 => not found (0x00000000)
#         libpthread.so.0 => not found (0x00000000)
#         libm.so.6 => not found (0x00000000)
#         libdl.so.2 => not found (0x00000000)
#         libc.so.6 => not found (0x00000000)
#         libc.so.0 => /lib/libc.so.0 (0x00000000)
#         /lib/ld-uClibc.so.1 => /lib/ld-uClibc.so.1 (0x00000000)
```

I can try to patch the interpreter to see where it goes

/lib/ld-linux-armhf.so.3
/lib//////ld-uClibc.so.0

```
cat code |
    sed "s/\/lib\/ld-linux-armhf.so.3/\/lib\/\/\/\/\/\/ld-uClibc.so.0/g" \
    > code.patched

chmod +x code.patched

file code.patched
# code.patched: ELF 32-bit LSB pie executable, ARM, EABI5 version 1 (SYSV), dynamically linked, interpreter /lib//////ld-uClibc.so.0, for GNU/Linux 4.19.255, stripped

./code.patched
# /useremain/home/rinkhals/apps/vscode-server/code.patched: can't load library 'librt.so.1'
```

Now we need to firgure out if Buildroot can build librt, and libpthread, libm, libdl as well. libc.so.6 might be an issue as well?

Other attempts using glibc

```
LD_DEBUG=all glibc/ld-linux-armhf.so.3 ./code
...
./code: error while loading shared libraries: librt.so.1: cannot open shared object file: No such file or directory
```

Trying to fetch missing libs from docker.io/arm32v7/debian:12.8:

```
docker run --privileged --rm tonistiigi/binfmt --install all
docker run --rm -it -v .\apps\vscode-server\glibc:/host --platform linux/arm/v7 arm32v7/debian:12.8

cd /usr/lib/arm-linux-gnueabihf/
cp libgcc_s.so.1 /host/
```

YAY

```
LD_LIBRARY_PATH=$(pwd)/glibc glibc/ld-linux-armhf.so.3 ./code tunnel
*
* Visual Studio Code Server
*
* By using the software, you agree to
* the Visual Studio Code Server License Terms (https://aka.ms/vscode-server-license) and
* the Microsoft Privacy Statement (https://privacy.microsoft.com/en-US/privacystatement).
*
? How would you like to log in to Visual Studio Code? ›
❯ Microsoft Account
  GitHub Account
```

Tunnel is working, but server not yet

```
LD_LIBRARY_PATH=$GLIBC_ROOT ldd vscode-server-linux-armhf/node
checking sub-depends for '/useremain/home/rinkhals/apps/vscode-server/arm-linux-gnueabihf/libdl.so.2'
checking sub-depends for '/lib/libatomic.so.1'
checking sub-depends for '/usr/lib/libstdc++.so.6'
checking sub-depends for '/useremain/home/rinkhals/apps/vscode-server/arm-linux-gnueabihf/libm.so.6'
checking sub-depends for '/useremain/home/rinkhals/apps/vscode-server/arm-linux-gnueabihf/libgcc_s.so.1'
checking sub-depends for '/useremain/home/rinkhals/apps/vscode-server/arm-linux-gnueabihf/libpthread.so.0'
checking sub-depends for '/useremain/home/rinkhals/apps/vscode-server/arm-linux-gnueabihf/libc.so.6'
checking sub-depends for '/lib/libc.so.0'
        libdl.so.2 => /useremain/home/rinkhals/apps/vscode-server/arm-linux-gnueabihf/libdl.so.2 (0x00000000)
        libatomic.so.1 => /lib/libatomic.so.1 (0x00000000)
        libstdc++.so.6 => /usr/lib/libstdc++.so.6 (0x00000000)
        libm.so.6 => /useremain/home/rinkhals/apps/vscode-server/arm-linux-gnueabihf/libm.so.6 (0x00000000)
        libgcc_s.so.1 => /useremain/home/rinkhals/apps/vscode-server/arm-linux-gnueabihf/libgcc_s.so.1 (0x00000000)
        libpthread.so.0 => /useremain/home/rinkhals/apps/vscode-server/arm-linux-gnueabihf/libpthread.so.0 (0x00000000)
        libc.so.6 => /useremain/home/rinkhals/apps/vscode-server/arm-linux-gnueabihf/libc.so.6 (0x00000000)
        libc.so.0 => /lib/libc.so.0 (0x00000000)
        /lib/ld-uClibc.so.1 => /lib/ld-uClibc.so.1 (0x00000000)
        /lib/ld-uClibc.so.1 => /lib/ld-uClibc.so.1 (0x00000000)
```

Missing:
- libatomic.so.1
- libstdc++.so.6


```
docker run --privileged --rm tonistiigi/binfmt --install all
docker run --rm -it -v .\apps\vscode-server\arm-linux-gnueabihf:/host --platform linux/arm/v7 arm32v7/debian:12.8

cd /usr/lib/arm-linux-gnueabihf/
cp libgcc_s.so.1 /host/
```