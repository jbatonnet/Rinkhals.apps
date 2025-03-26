. /useremain/rinkhals/.current/tools.sh

APP_ROOT=$(dirname $(realpath $0))

status() {
    PID=$(get_by_name ngrok)

    if [ "$PID" == "" ]; then
        report_status $APP_STATUS_STOPPED
        return
    fi

    report_status $APP_STATUS_STARTED
}
start() {
    stop
    cd $APP_ROOT

    if [ -f ./.enabled ] || [ ! -f ./.disabled ]; then
        rm ./.enabled
        touch ./.disabled

        exit 1
    fi

    NGROK_AUTHTOKEN=$(cat .ngrok-authtoken 2> /dev/null)
    if [ "$NGROK_AUTHTOKEN" == "" ]; then
        echo "A valid auth-key must be in .ngrok-authtoken for remote debugging to work"
        exit 1
    fi

    rm -f ./ngrok-err.log 2> /dev/null

    chmod +x ./ngrok
    ./ngrok tcp --authtoken=${NGROK_AUTHTOKEN} 22 1> /dev/null 2> ./ngrok-err.log &

    while [ 1 ]; do
        NGROK_ERROR=$(cat ./ngrok-err.log 2> /dev/null | grep ERROR)
        if [ "$NGROK_ERROR" != "" ]; then
            echo $NGROK_ERROR
            exit 1
        fi

        API_OUTPUT=$(curl -s http://localhost:4040/api/tunnels/)
        EXIT_CODE=$?
        if [ "$EXIT_CODE" = "0" ]; then
            TCP_ADDRESS=$(echo $API_OUTPUT | jq -r .tunnels[0].public_url)
            if [ "$TCP_ADDRESS" != "null" ]; then
                echo "Remote TCP endpoint: $TCP_ADDRESS"
                exit 0
            fi
        fi
    done
}
stop() {
    kill_by_name ngrok
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
