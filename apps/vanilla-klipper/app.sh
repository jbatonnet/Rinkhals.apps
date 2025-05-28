source /useremain/rinkhals/.current/tools.sh

export APP_ROOT=$(dirname $(realpath $0))

status() {
    PIDS=$(get_by_name klippy)

    if [ "$PIDS" == "" ]; then
        report_status $APP_STATUS_STOPPED
    else
        report_status $APP_STATUS_STARTED "$PIDS"
    fi
}

start() {
    stop
    cd $APP_ROOT

    # Stop gklib
    kill_by_name gklib

    # Start Klippy
    chmod +x klippy.sh
    ./klippy.sh &
}

debug() {
    stop
    cd $APP_ROOT

    kill_by_name gklib

    # Create Python venv
    python -m venv --without-pip $APP_ROOT
    . bin/activate

    # Start OctoApp
    cd klippy
    python -m klippy -a /tmp/unix_uds1 $@
}

stop() {
    kill_by_name klippy
    
    cd /userdata/app/gk

    LD_LIBRARY_PATH=/userdata/app/gk:$LD_LIBRARY_PATH \
        ./gklib -a /tmp/unix_uds1 /userdata/app/gk/printer_data/config/printer.generated.cfg &> $RINKHALS_ROOT/logs/gklib.log &
}

case "$1" in
    status)
        status
        ;;
    start)
        start
        ;;
    debug)
        shift
        debug $@
        ;;
    stop)
        stop
        ;;
    *)
        echo "Usage: $0 {status|start|debug|stop}" >&2
        exit 1
        ;;
esac
