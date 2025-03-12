source /useremain/rinkhals/.current/tools.sh

# Activate Python venv
python -m venv --without-pip $APP_ROOT
source bin/activate

# Prepare configuration
KLIPPER_CONFIG=printer.klipper_${KOBRA_MODEL_CODE}.cfg
if [ ! -f $KLIPPER_CONFIG ]; then
    exit 1
fi

CONFIG_PATH=/userdata/app/gk/printer_data/config/printer.klipper.cfg
if [ ! -f $CONFIG_PATH ]; then
    sed '/-- SAVE_CONFIG --/,$d' /userdata/app/gk/printer.cfg > /tmp/printer.1.cfg
    sed -n '/-- SAVE_CONFIG --/,$p' /userdata/app/gk/printer.cfg > /tmp/printer.2.cfg
    python /opt/rinkhals/scripts/process-cfg.py /tmp/printer.1.cfg $KLIPPER_CONFIG printer.rinkhals.cfg > $CONFIG_PATH
    cat /tmp/printer.2.cfg >> $CONFIG_PATH
fi

# Start Klippy
cd klippy
python -m klippy -a /tmp/unix_uds1 $CONFIG_PATH >> $RINKHALS_ROOT/logs/app-klippy.log 2>&1 &

assert_by_name klippy
