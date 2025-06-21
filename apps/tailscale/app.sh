#!/bin/sh

. /useremain/rinkhals/.current/tools.sh

RINKHALS_LOGS=${RINKHALS_LOGS:-/tmp/rinkhals}

export TAILSCALE_ROOT=$(dirname $(realpath $0))
export TAILSCALE_BIN_DIR="$TAILSCALE_ROOT/bin"
export TAILSCALE_DATA_DIR="$TAILSCALE_ROOT/data"
export TAILSCALE_RUN_DIR="$TAILSCALE_ROOT/run"
export TAILSCALE_STATE_FILE="$TAILSCALE_DATA_DIR/tailscaled.state"
export TAILSCALE_SOCKET="$TAILSCALE_RUN_DIR/tailscaled.sock"
export TAILSCALE_PID_FILE="$TAILSCALE_RUN_DIR/tailscaled.pid"
export TAILSCALED_LOG_FILE="$RINKHALS_LOGS/app-tailscaled.log"
export TAILSCALE_LOG_FILE="$RINKHALS_LOGS/app-tailscale.log"

# Ensure directories exist
mkdir -p "$TAILSCALE_BIN_DIR"
mkdir -p "$TAILSCALE_DATA_DIR"
mkdir -p "$TAILSCALE_RUN_DIR"

status() {
    PIDS=$(get_by_name tailscale.sh)

    if [ "$PIDS" == "" ]; then
        report_status $APP_STATUS_STOPPED
    else
        PIDS=$(get_by_name tailscale)
        report_status $APP_STATUS_STARTED "$PIDS"
    fi
}

start() {
    # Check if already running
    if [ -f "$TAILSCALE_PID_FILE" ]; then
        PID=$(cat "$TAILSCALE_PID_FILE" 2>/dev/null)
        if [ -n "$PID" ] && ps | grep -q "^ *$PID "; then
            log "Tailscale is already running"
            return 0
        fi
    fi
    
    # Check binary permissions
    chmod +x $TAILSCALE_BIN_DIR/tailscale
    chmod +x $TAILSCALE_BIN_DIR/tailscaled
    
    TAILSCALE_VERSION=$([ -f "$TAILSCALE_BIN_DIR/version" ] && cat "$TAILSCALE_BIN_DIR/version" || echo "N/A")
    
    # Start tailscaled daemon with userspace networking (no TUN required)
    log "Starting Tailscale app v$TAILSCALE_VERSION from $TAILSCALE_ROOT"
    log "Using socket at: $TAILSCALE_SOCKET"
    log "Using state directory: $TAILSCALE_DATA_DIR"
    log "Using userspace networking mode (no TUN required)"
    
    # Make sure socket directory exists and is writable
    mkdir -p "$(dirname "$TAILSCALE_SOCKET")"
    
    # Delete socket if it already exists (might be stale)
    if [ -e "$TAILSCALE_SOCKET" ]; then
        rm -f "$TAILSCALE_SOCKET"
    fi
    
    # Start Tailscale
    kill_by_name tailscale.sh
    chmod +x ./tailscale.sh
    ./tailscale.sh &
}

debug() {
    kill_by_name tailscaled
    rm -f "$TAILSCALE_SOCKET"

    kill_by_name tailscale.sh
    chmod +x ./tailscale.sh
    ./tailscale.sh
}

stop() {
    kill_by_name tailscale.sh
    kill_by_name tailscaled
    kill_by_name tailscale

    rm -f "$TAILSCALE_PID_FILE"
}

version() {
    cat "$TAILSCALE_BIN_DIR/version"
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
    version)
        version
        ;;
    *)
        echo "Usage: $0 {status|start|stop|version}" >&2
        exit 1
        ;;
esac