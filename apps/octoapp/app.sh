source /useremain/rinkhals/.current/tools.sh

OCTOAPP_ROOT=$(dirname $(realpath $0))

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

    # Create Python venv
    python -m venv --without-pip --system-site-packages $OCTOAPP_ROOT

    # Prepare OctoApp config
    mkdir -p $RINKHALS_HOME/octoapp/logs

    OCTOAPP_CONFIG=$(cat <<EOF
{
    "KlipperConfigFolder": "$RINKHALS_HOME/printer_data/config",
    "MoonrakerConfigFile": "$RINKHALS_HOME/printer_data/config/moonraker.conf",
    "KlipperLogFolder": "$RINKHALS_HOME/printer_data/logs",
    "LocalFileStoragePath": "$RINKHALS_HOME/octoapp",
    "IsObserver": false,
    "ServiceName": "OctoApp",
    "VirtualEnvPath": "$RINKHALS_HOME",
    "RepoRootFolder": "$OCTOAPP_ROOT/octoapp"
}
EOF
)

    OCTOAPP_CONFIG=$(echo "$OCTOAPP_CONFIG" | base64 -w 0)

    # Start Python venv
    cd $OCTOAPP_ROOT
    source bin/activate

    # Start OctoApp
    cd octoapp
    python -m moonraker_octoapp "$OCTOAPP_CONFIG" >> $RINKHALS_ROOT/logs/app-octoapp.log 2>&1 &

    assert_by_name moonraker_octoapp
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
    stop)
        stop
        ;;
    *)
        echo "Usage: $0 {status|start|stop}" >&2
        exit 1
        ;;
esac
