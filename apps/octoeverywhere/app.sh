. /useremain/rinkhals/.current/tools.sh

APP_ROOT=$(dirname $(realpath $0))

get_octoeverywhere_config() {
    # These are required for the plugin to operate, see this url to see how they are used:
    # https://github.com/QuinnDamerell/OctoPrint-OctoEverywhere/blob/master/moonraker_octoeverywhere/__main__.py
    OCTOEVERYWHERE_CONFIG=$(cat <<EOF
{
    "ConfigFolder": "$RINKHALS_HOME/printer_data/config",
    "MoonrakerConfigFile": "$RINKHALS_HOME/printer_data/config/moonraker.generated.conf",
    "LogFolder": "$RINKHALS_HOME/printer_data/logs",
    "LocalFileStoragePath": "$RINKHALS_HOME/octoeverywhere",
    "ServiceName": "OctoEverywhere",
    "VirtualEnvPath": "$RINKHALS_HOME",
    "RepoRootFolder": "$APP_ROOT/octoeverywhere",
    "IsRinkhals": true
}
EOF
)

    echo "$OCTOEVERYWHERE_CONFIG" | base64 -w 0
}

status() {
    PIDS=$(get_by_name moonraker_octoeverywhere)

    if [ "$PIDS" == "" ]; then
        report_status $APP_STATUS_STOPPED
    else
        report_status $APP_STATUS_STARTED "$PIDS"
    fi
}
start() {
    stop
    cd $APP_ROOT

    mkdir -p $RINKHALS_HOME/octoeverywhere/logs
    mkdir -p $RINKHALS_HOME/printer_data/config
    rm -f $RINKHALS_HOME/printer_data/config/moonraker.conf
    ln -s $RINKHALS_HOME/printer_data/config/moonraker.generated.conf $RINKHALS_HOME/printer_data/config/moonraker.conf

    OCTOEVERYWHERE_CONFIG=$(get_octoeverywhere_config)

    chmod +x ./octoeverywhere.sh
    ./octoeverywhere.sh "$OCTOEVERYWHERE_CONFIG" &
}
debug() {
    stop
    cd $APP_ROOT

    mkdir -p $RINKHALS_HOME/octoeverywhere/logs
    mkdir -p $RINKHALS_HOME/printer_data/config
    rm -f $RINKHALS_HOME/printer_data/config/moonraker.conf
    ln -s $RINKHALS_HOME/printer_data/config/moonraker.generated.conf $RINKHALS_HOME/printer_data/config/moonraker.conf

    # Create Python venv
    python -m venv --without-pip .
    . bin/activate

    # Start OctoEverywhere
    cd octoeverywhere
    OCTOEVERYWHERE_CONFIG=$(get_octoeverywhere_config)
    python -m moonraker_octoeverywhere "$OCTOEVERYWHERE_CONFIG" $@
}
stop() {
    kill_by_name moonraker_octoeverywhere
    kill_by_name octoeverywhere.sh
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
