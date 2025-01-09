source /useremain/rinkhals/.current/tools.sh

EXAMPLE_ROOT=$(dirname $(realpath $0))
EXAMPLE_VERSION=0.1

version() {
    echo $EXAMPLE_VERSION
}
status() {
    mkdir -p /tmp/app-example
    STATUS=$(cat /tmp/app-example/.status 2> /dev/null)

    if [ "$STATUS" == "1" ]; then
        echo $APP_STATUS_STARTED
    else
        echo $APP_STATUS_STOPPED
    fi
}
start() {
    mkdir -p /tmp/app-example
    echo 1 > /tmp/app-example/.status
    log "Started example app $EXAMPLE_VERSION from $EXAMPLE_ROOT"
}
stop() {
    mkdir -p /tmp/app-example
    echo 0 > /tmp/app-example/.status
    log "Stopped example app"
}

case "$1" in
    version)
        version
        ;;
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
        echo "Usage: $0 {version|status|start|stop}" >&2
        exit 1
        ;;
esac
