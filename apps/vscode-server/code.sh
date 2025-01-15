GLIBC_ROOT=$(pwd)/arm-linux-gnueabihf

GLIBC_INTERPRETER=$GLIBC_ROOT/ld-linux-armhf.so.3
chmod +x $GLIBC_INTERPRETER

SERVER_ROOT=$(pwd)/vscode-server-linux-armhf

LD_LIBRARY_PATH=$GLIBC_ROOT $GLIBC_INTERPRETER \
    $SERVER_ROOT/node "$SERVER_ROOT/out/server-main.js" --host 0.0.0.0 --accept-server-license-terms --disable-telemetry&

LD_LIBRARY_PATH=$GLIBC_ROOT $GLIBC_INTERPRETER \
    ./code tunnel --accept-server-license-terms --disable-telemetry
