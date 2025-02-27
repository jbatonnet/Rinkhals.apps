#!/bin/sh
source /useremain/rinkhals/.current/tools.sh

APP_ROOT=$(dirname $(realpath $0))
CLOUDFLARED_BIN="$APP_ROOT/bin/cloudflared"
CONFIG_DIR="/useremain/home/rinkhals/apps/cloudflare-tunnel-manager/config"
PID_FILE="/tmp/cloudflared.pid"
STATUS_FILE="/tmp/cloudflared.status"
LOG_FILE="$CONFIG_DIR/cloudflared.log"

# Ensure executable permissions
chmod +x "$CLOUDFLARED_BIN"

ensure_config() {
    mkdir -p "$CONFIG_DIR"
    
    # Check if token file exists
    if [ ! -f "$CONFIG_DIR/token.txt" ]; then
        log "No token found. Please create $CONFIG_DIR/token.txt with your Cloudflare tunnel token"
        return 1
    fi
    
    # Make sure token is not empty
    TOKEN=$(cat "$CONFIG_DIR/token.txt" | tr -d '\n')
    if [ -z "$TOKEN" ]; then
        log "Token file is empty. Please add your Cloudflare tunnel token to $CONFIG_DIR/token.txt"
        return 1
    fi
    
    log "Token found and validated"
    return 0
}

status() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE" 2>/dev/null)
        if [ -n "$PID" ] && ps | grep -q "^ *$PID "; then
            log "Cloudflare tunnel is running with PID: $PID"
            report_status $APP_STATUS_STARTED
            return 0
        fi
    fi
    
    log "Cloudflare tunnel is not running"
    report_status $APP_STATUS_STOPPED
    return 1
}

start() {
    # Check if already running
    if status >/dev/null; then
        log "Cloudflare tunnel is already running"
        return 0
    fi
    
    # Ensure config exists
    if ! ensure_config; then
        log "Cannot start cloudflared: missing token"
        return 1
    fi
    
    # Get the token
    TOKEN=$(cat "$CONFIG_DIR/token.txt" | tr -d '\n')
    
    log "Starting Cloudflare tunnel..."
    
    # Start cloudflared directly with the token
    nohup "$CLOUDFLARED_BIN" tunnel run --token "$TOKEN" > "$LOG_FILE" 2>&1 &
    PID=$!
    
    # Save PID
    echo $PID > "$PID_FILE"
    
    # Verify it's actually running after a brief delay
    sleep 2
    if ps | grep -q "^ *$PID "; then
        log "Cloudflare tunnel started successfully (PID: $PID)"
        echo 1 > "$STATUS_FILE"
        return 0
    else
        log "Failed to start Cloudflare tunnel"
        if [ -f "$LOG_FILE" ]; then
            log "Check logs at: $LOG_FILE"
        fi
        rm -f "$PID_FILE" "$STATUS_FILE"
        return 1
    fi
}

stop() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if [ -n "$PID" ]; then
            log "Stopping Cloudflare tunnel (PID: $PID)..."
            kill $PID 2>/dev/null || kill -9 $PID 2>/dev/null
            rm -f "$PID_FILE" "$STATUS_FILE"
            log "Cloudflare tunnel stopped"
            return 0
        fi
    fi
    
    log "No running Cloudflare tunnel found"
    rm -f "$PID_FILE" "$STATUS_FILE"
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