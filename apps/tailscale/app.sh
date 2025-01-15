source /useremain/rinkhals/.current/tools.sh

APP_ROOT=$(dirname $(realpath $0))

status() {
    PIDS=$(get_by_name tailscaled)

    if [ "$PIDS" == "" ]; then
        report_status $APP_STATUS_STOPPED
    else
        report_status $APP_STATUS_STARTED "$PIDS"
    fi
}
start() {
    cd $APP_ROOT

    chmod +x tailscale
    chmod +x tailscaled

    ./tailscaled --state=tailscaled.state -tun="userspace-networking" &> $RINKHALS_ROOT/logs/app-tailscale.log &
    sleep 2
    ./tailscale up &> $RINKHALS_ROOT/logs/app-tailscale.log &
}
stop() {
    kill_by_name tailscale
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
