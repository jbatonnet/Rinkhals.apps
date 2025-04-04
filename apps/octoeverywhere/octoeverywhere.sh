. /useremain/rinkhals/.current/tools.sh

# Create Python venv
python -m venv --without-pip .
. bin/activate

# Start OctoEverywhere
cd octoeverywhere
OCTOEVERYWHERE_CONFIG=$1
OCTOEVERYWHERE_LOG_PATH=$RINKHALS_ROOT/logs/app-octoeverywhere.log
python -m moonraker_octoeverywhere "$OCTOEVERYWHERE_CONFIG" >> $OCTOEVERYWHERE_LOG_PATH 2>&1 &

# Look for URL in the logs
while [ 1 ]; do
    OCTOEVERYWHERE_LINE=$(tail -n 30 $OCTOEVERYWHERE_LOG_PATH 2> /dev/null | grep https://octoeverywhere.com/getstarted | tail -n 1)
    if [ "$OCTOEVERYWHERE_LINE" != "" ]; then
        OCTOEVERYWHERE_URL=$(echo $OCTOEVERYWHERE_LINE | sed -r -e 's/.*(http.*)/\1/')
        echo "Found URL: $OCTOEVERYWHERE_URL"
        set_temporary_app_property octoeverywhere printer_link $OCTOEVERYWHERE_URL
    fi

    sleep 2
done
