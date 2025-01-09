#!/bin/sh

function beep() {
    echo 1 > /sys/class/pwm/pwmchip0/pwm0/enable
    usleep $(($1 * 1000))
    echo 0 > /sys/class/pwm/pwmchip0/pwm0/enable
}

UPDATE_PATH="/useremain/update_swu"

# Identify app to be installed
APP_ROOT=$(find $UPDATE_PATH -type d -mindepth 1 -maxdepth 1 2> /dev/null)
APP=$(basename $APP_ROOT)

chmod +x $APP_ROOT/app.sh
APP_VERSION=$($APP_ROOT/app.sh version)

# Copy to final path
DESTINATION_ROOT=/useremain/home/rinkhals/apps/$APP

# TODO: Check if we are downgrading
# if [ -f $DESTINATION_ROOT/app.sh ]; then
#     DESTINATION_VERSION=$($DESTINATION_ROOT/app.sh version)
#     if [ "$APP_VERSION" \> "$DESTINATION_VERSION" ]; then
#     fi
# fi

mkdir -p $DESTINATION_ROOT
cp -r $APP_ROOT/* $DESTINATION_ROOT/

# Beep to notify completion
beep 500
