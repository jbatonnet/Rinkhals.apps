#!/bin/sh

source /useremain/rinkhals/.current/tools.sh

TAILSCALE_ROOT=$(dirname $(realpath $0))
TAILSCALE_BIN_DIR="$TAILSCALE_ROOT/bin"
TAILSCALE_DATA_DIR="$TAILSCALE_ROOT/data"
TAILSCALE_RUN_DIR="$TAILSCALE_ROOT/run"
TAILSCALE_STATE_FILE="$TAILSCALE_DATA_DIR/tailscaled.state"
TAILSCALE_SOCKET="$TAILSCALE_RUN_DIR/tailscaled.sock"
TAILSCALE_PID_FILE="$TAILSCALE_RUN_DIR/tailscaled.pid"
TAILSCALE_LOG_FILE="$TAILSCALE_ROOT/tailscaled.log"

# Ensure directories exist
mkdir -p "$TAILSCALE_BIN_DIR"
mkdir -p "$TAILSCALE_DATA_DIR"
mkdir -p "$TAILSCALE_RUN_DIR"

download_tailscale() {
    # Detect system architecture
    ARCH=$(uname -m)
    case "$ARCH" in
        x86_64) ARCH="amd64" ;;
        armv7l) ARCH="arm" ;;
        aarch64) ARCH="arm64" ;;
        *) log "Unsupported architecture: $ARCH" && return 1 ;;
    esac

    log "Detected architecture: $ARCH"

    # Retrieve the latest Tailscale version from GitHub
    LATEST=$(curl -s https://api.github.com/repos/tailscale/tailscale/releases/latest | grep '"tag_name":' | sed -E 's/.*"v([^"]+)".*/\1/')
    if [ -z "$LATEST" ]; then
        log "Unable to fetch the latest version." && return 1
    fi
    log "Latest Tailscale version: $LATEST"

    # Check if we already have this version
    if [ -f "$TAILSCALE_BIN_DIR/version" ] && [ "$(cat "$TAILSCALE_BIN_DIR/version")" = "$LATEST" ]; then
        log "Tailscale version $LATEST already installed."
        return 0
    fi

    # Construct the download URL for the static binary package
    URL="https://pkgs.tailscale.com/stable/tailscale_${LATEST}_${ARCH}.tgz"
    log "Downloading from: $URL"
    
    # Create a temporary directory
    TMP_DIR="/tmp/tailscale-download"
    mkdir -p "$TMP_DIR"
    
    # Download and extract in one step to save space
    curl -L "$URL" | tar -xz -C "$TMP_DIR"

    # Determine the first directory from the extracted files
    DIR=$(find "$TMP_DIR" -mindepth 1 -maxdepth 1 -type d | head -1)
    
    if [ -f "$DIR/tailscale" ] && [ -f "$DIR/tailscaled" ]; then
        log "Installing Tailscale binaries..."
        cp "$DIR/tailscale" "$TAILSCALE_BIN_DIR/"
        cp "$DIR/tailscaled" "$TAILSCALE_BIN_DIR/"
        chmod +x "$TAILSCALE_BIN_DIR/tailscale" "$TAILSCALE_BIN_DIR/tailscaled"
        echo "$LATEST" > "$TAILSCALE_BIN_DIR/version"
        log "Tailscale binaries installed successfully."
    else
        log "Unexpected archive structure: binaries not found in directory '$DIR'."
        rm -rf "$TMP_DIR"
        return 1
    fi

    # Clean up
    rm -rf "$TMP_DIR"
    return 0
}

status() {
    if [ -f "$TAILSCALE_PID_FILE" ]; then
        PID=$(cat "$TAILSCALE_PID_FILE" 2>/dev/null)
        if [ -n "$PID" ] && ps | grep -q "^ *$PID "; then
            log "Tailscale is running with PID: $PID"
            report_status $APP_STATUS_STARTED "$PID"
            return 0
        fi
    fi
    
    log "Tailscale is not running"
    report_status $APP_STATUS_STOPPED
    return 1
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
    
    # Ensure binaries exist
    if [ ! -f "$TAILSCALE_BIN_DIR/tailscaled" ] || [ ! -f "$TAILSCALE_BIN_DIR/tailscale" ]; then
        log "Tailscale binaries not found, downloading..."
        download_tailscale || return 1
    fi
    
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
    
    # Run with userspace networking mode
    nohup "$TAILSCALE_BIN_DIR/tailscaled" \
        --tun=userspace-networking \
        --statedir="$TAILSCALE_DATA_DIR" \
        --socket="$TAILSCALE_SOCKET" \
        --port=41641 \
        > "$TAILSCALE_LOG_FILE" 2>&1 &
    
    PID=$!
    echo $PID > "$TAILSCALE_PID_FILE"
    log "Tailscaled started with PID: $PID"
    
    # Give the daemon a moment to start
    sleep 3
    
    # Verify it's actually running after a brief delay
    if ps | grep -q "^ *$PID "; then
        log "Tailscale daemon started successfully"
        
        # Check if we need to authenticate
        if [ ! -f "$TAILSCALE_STATE_FILE" ] || ! "$TAILSCALE_BIN_DIR/tailscale" --socket="$TAILSCALE_SOCKET" status &> /dev/null; then
            log "Tailscale needs authentication. Run: $TAILSCALE_BIN_DIR/tailscale --socket=$TAILSCALE_SOCKET up"
            log "For headless setup: $TAILSCALE_BIN_DIR/tailscale --socket=$TAILSCALE_SOCKET up --authkey=YOUR_AUTH_KEY"
        else
            # Try to connect using existing state
            "$TAILSCALE_BIN_DIR/tailscale" --socket="$TAILSCALE_SOCKET" up --accept-dns=false --accept-routes
            log "Tailscale started with existing configuration"
        fi
        
        return 0
    else
        log "Failed to start Tailscale daemon"
        log "Check logs at: $TAILSCALE_LOG_FILE"
        rm -f "$TAILSCALE_PID_FILE"
        return 1
    fi
}

stop() {
    if [ -f "$TAILSCALE_PID_FILE" ]; then
        PID=$(cat "$TAILSCALE_PID_FILE")
        if [ -n "$PID" ]; then
            log "Stopping Tailscale daemon (PID: $PID)..."
            kill $PID 2>/dev/null
            
            # Wait a bit and force kill if still running
            sleep 2
            if ps | grep -q "^ *$PID "; then
                log "Daemon still running, force killing..."
                kill -9 $PID 2>/dev/null
            fi
            
            rm -f "$TAILSCALE_PID_FILE"
            log "Tailscale daemon stopped"
            return 0
        fi
    fi
    
    log "No running Tailscale daemon found"
    rm -f "$TAILSCALE_PID_FILE"
    return 0
}

version() {
    if [ -f "$TAILSCALE_BIN_DIR/version" ]; then
        cat "$TAILSCALE_BIN_DIR/version"
    else
        echo "0.0.0"  # Default version if not installed yet
    fi
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
    version)
        version
        ;;
    *)
        echo "Usage: $0 {status|start|stop|version}" >&2
        exit 1
        ;;
esac