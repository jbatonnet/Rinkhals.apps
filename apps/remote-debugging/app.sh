. /useremain/rinkhals/.current/tools.sh

APP_ROOT=$(dirname $(realpath $0))

TAILSCALE_STATE_DIR=$APP_ROOT/state
TAILSCALE_SOCKET=$TAILSCALE_STATE_DIR/tailscaled.sock

status() {
    cd $APP_ROOT

    TAILSCALED_PID=$(cat ./state/tailscaled.pid 2> /dev/null)
    TAILSCALE_PID=$(cat ./state/tailscale.pid 2> /dev/null)

    if [ "$TAILSCALED_PID" == "" ] || [ "$TAILSCALE_PID" == "" ]; then
        report_status $APP_STATUS_STOPPED
        return
    fi

    TAILSCALED_PS=$(ps | grep $TAILSCALED_PID)
    TAILSCALE_PS=$(ps | grep $TAILSCALE_PID)

    if [ "$TAILSCALED_PS" == "" ] || [ "$TAILSCALE_PS" == "" ]; then
        report_status $APP_STATUS_STOPPED
        return
    fi

    report_status $APP_STATUS_STARTED
}
start() {
    stop
    cd $APP_ROOT

    rm ./.enabled
    touch ./.disabled

    chmod +x ./tailscale
    chmod +x ./tailscaled

    mkdir -p ./logs
    mkdir -p $TAILSCALE_STATE_DIR

    TAILSCALE_AUTH_KEY=$(cat .tailscale-auth-key 2> /dev/null)
    if [ "$TAILSCALE_AUTH_KEY" == "" ]; then
        echo "A valid auth-key must be in .tailscale-auth-key for remote debugging to work"
        exit 1
    fi

    rm -f $TAILSCALE_SOCKET 2> /dev/null

    ./tailscaled --tun=userspace-networking --statedir="$TAILSCALE_STATE_DIR" --socket="$TAILSCALE_SOCKET" >> ./logs/tailscaled.log 2>&1 &
    TAILSCALED_PID=$!
    echo $TAILSCALED_PID > ./state/tailscaled.pid

    ./tailscale --socket="$TAILSCALE_SOCKET" up --auth-key="$TAILSCALE_AUTH_KEY" --hostname="${KOBRA_MODEL_CODE}-${RINKHALS_VERSION}-${KOBRA_DEVICE_ID:-$RANDOM}" >> ./logs/tailscale.log 2>&1 &
    TAILSCALE_PID=$!
    echo $TAILSCALE_PID > ./state/tailscale.pid
}
debug() {
    stop
    cd $APP_ROOT

    TAILSCALE_AUTH_KEY=$(cat .tailscale-auth-key 2> /dev/null)

    rm -f $TAILSCALE_SOCKET 2> /dev/null

    ./tailscaled --tun=userspace-networking --statedir="$TAILSCALE_STATE_DIR" --socket="$TAILSCALE_SOCKET" >> ./logs/tailscaled.log 2>&1
    ./tailscale --socket="$TAILSCALE_SOCKET" up --auth-key="$TAILSCALE_AUTH_KEY" --hostname="${KOBRA_MODEL_CODE}-${RINKHALS_VERSION}-${KOBRA_DEVICE_ID:-$RANDOM}" >> ./logs/tailscale.log 2>&1
}
stop() {
    cd $APP_ROOT

    TAILSCALED_PID=$(cat ./state/tailscaled.pid 2> /dev/null)
    TAILSCALE_PID=$(cat ./state/tailscale.pid 2> /dev/null)

    kill_by_id $TAILSCALED_PID
    kill_by_id $TAILSCALE_PID

    rm ./state/tailscaled.pid 2> /dev/null
    rm ./state/tailscale.pid 2> /dev/null
}

case "$1" in
    status)
        status
        ;;
    start)
        start
        ;;
    stop)
        stop
        ;;
    *)
        echo "Usage: $0 {status|start|stop}" >&2
        exit 1
        ;;
esac
