source /useremain/rinkhals/.current/tools.sh

# Activate Python venv
python -m venv --without-pip $APP_ROOT
source bin/activate

# Prepare configuration
cp /userdata/app/gk/printer_data/config/default/printer.${KOBRA_MODEL_CODE}_${KOBRA_VERSION}.cfg printer.cfg
python /opt/rinkhals/scripts/process-cfg.py printer.cfg printer.generated.cfg

# Start Klippy
cd klippy
python -m klippy -a /tmp/unix_uds1 $APP_ROOT/printer.generated.cfg >> $RINKHALS_ROOT/logs/app-klippy.log 2>&1 &

assert_by_name klippy
