. /useremain/rinkhals/.current/tools.sh

# Activate Python venv
python -m venv --without-pip $APP_ROOT
. bin/activate

# Prepare configuration
CONFIG_SOURCE=printer.klipper_${KOBRA_MODEL_CODE}.cfg
if [ ! -f $CONFIG_SOURCE ]; then
    exit 1
fi

CONFIG_DESTINATION=/userdata/app/gk/printer_data/config/printer.klipper.cfg
if [ ! -f $CONFIG_DESTINATION ]; then
    cp $CONFIG_SOURCE $CONFIG_DESTINATION
fi

# Start Klippy
cd klippy
python -m klippy -a /tmp/unix_uds1 $CONFIG_DESTINATION >> $RINKHALS_ROOT/logs/app-klippy.log 2>&1 &

assert_by_name klippy
