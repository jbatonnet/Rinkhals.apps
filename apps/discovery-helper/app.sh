source /useremain/rinkhals/.current/tools.sh

APP_ROOT=$(dirname $(realpath $0))
PID_FILE="/tmp/discovery-helper.pid"

status() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE" 2>/dev/null)
        if [ -n "$PID" ] && ps | grep -q "^ *$PID "; then
            log "Discovery helper is running with PID: $PID"
            report_status $APP_STATUS_STARTED
            return 0
        fi
    fi
    
    log "Discovery helper is not running"
    report_status $APP_STATUS_STOPPED
    return 1
}

start() {
    log "Starting discovery helper"
    nohup python $APP_ROOT/join-multicast.py 2>&1 &
    PID=$!
    echo $PID > "$PID_FILE"
}

stop() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if [ -n "$PID" ]; then
            log "Stopping discovery helper (PID: $PID)"
            kill $PID 2>/dev/null || kill -9 $PID 2>/dev/null
            rm -f "$PID_FILE"
            log "Stopped discovery helper"
            return 0
        fi
    fi
    
    log "Discovery helper not found"
    rm -f "$PID_FILE"
    return 0
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
