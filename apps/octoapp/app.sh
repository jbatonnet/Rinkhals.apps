. /useremain/rinkhals/.current/tools.sh

APP_ROOT=$(dirname $(realpath $0))

get_octoapp_config() {
    OCTOAPP_CONFIG=$(cat <<EOF
{
    "KlipperConfigFolder": "$RINKHALS_HOME/printer_data/config",
    "MoonrakerConfigFile": "$RINKHALS_HOME/printer_data/config/moonraker.generated.conf",
    "KlipperLogFolder": "$RINKHALS_HOME/printer_data/logs",
    "LocalFileStoragePath": "$RINKHALS_HOME/octoapp",
    "IsObserver": false,
    "ServiceName": "OctoApp",
    "VirtualEnvPath": "$RINKHALS_HOME",
    "RepoRootFolder": "$APP_ROOT/octoapp"
}
EOF
)

    echo "$OCTOAPP_CONFIG" | base64 -w 0
}

status() {
    PIDS=$(get_by_name moonraker_octoapp)

    if [ "$PIDS" == "" ]; then
        report_status $APP_STATUS_STOPPED
    else
        report_status $APP_STATUS_STARTED "$PIDS"
    fi
}
start() {
    stop
    cd $APP_ROOT

    mkdir -p $RINKHALS_HOME/octoapp/logs
    mkdir -p $RINKHALS_HOME/printer_data/config
    rm -f $RINKHALS_HOME/printer_data/config/moonraker.conf
    ln -s $RINKHALS_HOME/printer_data/config/moonraker.generated.conf $RINKHALS_HOME/printer_data/config/moonraker.conf

    # Create Python venv
    python -m venv --without-pip .
    . bin/activate

    # Start OctoApp
    cd octoapp
    OCTOAPP_CONFIG=$(get_octoapp_config)
    python -m moonraker_octoapp "$OCTOAPP_CONFIG" >> $RINKHALS_ROOT/logs/app-octoapp.log 2>&1 &

    assert_by_name moonraker_octoapp
}
debug() {
    stop
    cd $APP_ROOT

    mkdir -p $RINKHALS_HOME/octoapp/logs
    mkdir -p $RINKHALS_HOME/printer_data/config
    rm -f $RINKHALS_HOME/printer_data/config/moonraker.conf
    ln -s $RINKHALS_HOME/printer_data/config/moonraker.generated.conf $RINKHALS_HOME/printer_data/config/moonraker.conf

    # Create Python venv
    python -m venv --without-pip .
    . bin/activate

    # Start OctoApp
    cd octoapp
    OCTOAPP_CONFIG=$(get_octoapp_config)
    python -m moonraker_octoapp "$OCTOAPP_CONFIG" $@
}
stop() {
    kill_by_name moonraker_octoapp
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
        echo "Usage: $0 {status|start|stop}" >&2
        exit 1
        ;;
esac
