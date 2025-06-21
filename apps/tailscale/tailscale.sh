#!/bin/sh

. /useremain/rinkhals/.current/tools.sh

# Start the deamon
nohup $TAILSCALE_BIN_DIR/tailscaled \
    --tun=userspace-networking \
    --statedir="$TAILSCALE_DATA_DIR" \
    --socket="$TAILSCALE_SOCKET" \
    --port=41641 \
    > $TAILSCALED_LOG_FILE 2>&1 &
    
PID=$!
echo $PID > "$TAILSCALE_PID_FILE"
  
sleep 3

# Start the client
$TAILSCALE_BIN_DIR/tailscale \
    --socket="$TAILSCALE_SOCKET" \
    up \
    --accept-dns=false \
    --accept-routes \
    > $TAILSCALE_LOG_FILE 2>&1 &

# Monitor logs for a URL to login
while [ 1 ]; do
    TAILSCALE_LOGIN_LINE=$(tail -n 30 $TAILSCALE_LOG_FILE 2> /dev/null | grep https://login.tailscale.com | tail -n 1)
    if [ "$TAILSCALE_LOGIN_LINE" != "" ]; then
        TAILSCALE_LOGIN_URL=$(echo $TAILSCALE_LOGIN_LINE | sed -r -e 's/.*(http.*)/\1/')
        echo "Found URL: $TAILSCALE_LOGIN_URL"
        set_temporary_app_property tailscale account_login $TAILSCALE_LOGIN_URL
    fi

    sleep 2
done
