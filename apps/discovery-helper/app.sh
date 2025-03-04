source /useremain/rinkhals/.current/tools.sh

APP_ROOT=$(dirname $(realpath $0))

status() {
    report_status $APP_STATUS_STOPPED
}

start() {
    log "Starting discovery helper"
    nohup python $APP_ROOT/join-multicast.py 2>&1 &
}

stop() {
    exit 0
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
