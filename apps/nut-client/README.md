# NUT-Client for Rinkhals

This app monitors a UPS device connected to your printer and automatically pauses a print job during a power outage.

## Installation

Install and enable the app through the Rinkhals app system.

## Configuration

Before using the NUT client, configure your NUT server address and optional credentials.

The app includes a sample configuration file. Copy it into place:

```bash
cp /useremain/home/rinkhals/apps/nut-client/config/nut-client.conf.sample \
   /useremain/home/rinkhals/apps/nut-client/config/nut-client.conf
```

Then edit the new file:

```bash
nano /useremain/home/rinkhals/apps/nut-client/config/nut-client.conf
```

Set these options to match your NUT server:

* `nut_address`: (Required) IP address or hostname of the NUT server
* `nut_port`: Port (default `3493`)
* `nut_user`: (Optional) Username for authentication
* `nut_password`: (Optional) Password for authentication
* `ups_name`: (Optional) If blank, the first UPS advertised by the server will be used

### UPS requirements

You need a NUT-supported UPS whose capacity exceeds your printer’s maximum power draw. For example, the K3Max can peak at 950 W during initial bed heat-up (without ACE Pro drying). It’s recommended that your expected peak draw not exceed 80 % of the UPS capacity. Additinal capacity is needed for ACE Pro, or the ACE Pro can be connected to it's own dedicated UPS (not monitored currently)

### Running a NUT server

The NUT client requires a reachable NUT server. All network equipment between the server and the printer (including any Wi‑Fi access points) must remain on UPS power during an outage. You can run a NUT server on Windows, Linux, a Raspberry Pi, or other supported hardware—just connect it to the UPS monitoring port.

Follow the official NUT documentation to install and configure the server. If you enable authentication, include your username and password in the client configuration.

## Usage

The app starts automatically when the app is enabled, but can be manually started and stopped and the status checked with:

```bash
/useremain/home/rinkhals/apps/nut-client/app.sh start
```

Check its status:

```bash
/useremain/home/rinkhals/apps/nut-client/app.sh status
```

Stop the client:

```bash
/useremain/home/rinkhals/apps/nut-client/app.sh stop
```

## Power‑outage behavior

In version 1.0, when the UPS reports `"OB"` (On Battery), the client will:

1. Pause any active print
2. Set the target nozzle temperature to 0 °C
3. Stop drying on any connected ACE Pro devices

The target bed temperature is left unchanged until the battery level falls below 30 %, at which point the bed temperature is set to 0 °C to extend remaining runtime.

## Other Considerations

* Note that the ACE Pro fan will run for 1-2 minutes after drying is stopped. This is normal.
* No auto-resums, so you will need to manually reset the tempratures and resume printing and drying after power is restored. This may be done automatically in a future version.
* Please following all recommenced security practices for both the NUT server and communication between the server and the printer.
* The ACE Pro should be on battery backup as well to prevent print failures from shutdown of the hub. If desired this could be a seperate UPS to reduce load on the printer's UPS but it will not be monitered in version 1.0 (may come later).

## Possible future feature additions

* Support for print resume.
* Support for ACE Pro drying resume.
* Notifications (email, etc)
* Logging
* Warn if known max wattage of printer (+ACE) exceeds known capacity of the UPS.
* On NUT server with multiple UPS's connected allow selection of the correct UPS via the touch-UI.
* Allow other config changes through the touch UI.
* Add support for enclousre fans, heating, and lighting..

## Advanced: Raspberry Pi USB gadget‑mode NUT server

If your NUT server is a Raspberry Pi running in USB gadget Ethernet mode (e.g. Pi 4B/5B, Zero W, Zero 2 W), you can connect it directly to the printer via virtual Ethernet, avoiding external network gear. This requires installing the experimental USB‑Ethernet drivers on the printer and configuring static networking on both devices. More documentation on this subject to come later.

## Resources

* [NUT documentation](https://networkupstools.org/documentation.html)
