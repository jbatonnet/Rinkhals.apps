This repository contains apps for [Rinkhals](https://github.com/jbatonnet/Rinkhals), a custom firmware for the Anycubic Kobra 3 3D printer.

Rinkhals allows side-loading custom apps to add more features to the printer.
Feel free to use install them, use them and add more apps to this repository, PR are welcome!


<p align="center">
    <img width="48" src="https://github.com/jbatonnet/Rinkhals/blob/master/icon.png?raw=true" />
</p>


## How to use / install Rinkhals apps?

There are 2 options to install Rinkhals apps on your printer. You will obviously need Rinkhals installed first.

### Using SWU packages

You can use the SWU packages provided on this page: https://github.com/jbatonnet/Rinkhals.apps/actions/workflows/build-apps.yml

You can download the SWU file for the app you want, copy it on a FAT32 USB drive in a **aGVscF9zb3Nf** directory, plug the USB drive in the Kobra and it just works. You will ear two beeps, the second one will tell you that the app is installed. There is no need to reboot afterwards.

You might need to enable the app for it to start. Use the Rinkhals touch UI or create a **/useremain/home/rinkhals/apps/[APP_NAME].enabled** file and reboot.

### Manually

You can connect to SSH / SFTP and copy the app directory in **/useremain/home/rinkhals/apps**. Enable the app as described above.



<p align="center">
    <img width="48" src="https://github.com/jbatonnet/Rinkhals/blob/master/icon.png?raw=true" />
</p>


## Rinkhals apps system

> [!WARNING]
> If you develop on Windows, like I'm doing, don't forget to disable Git's autocrlf function, as this repo contains Linux scripts running on Linux machines.<br />
> Run `git config core.autocrlf false` **BEFORE** cloning the repo

### Location and startup

Apps are stored in two locations:
- Built-in apps are provided in the firmware: **/useremain/rinkhals/[VERSION]/home/rinkhals/apps**
- User apps are stored in: **/useremain/home/rinkhals/apps**

During startup, the firmware **start.sh** script will list apps in the directories listed above, sort them by directory name (1, 2, 11, a, b) and start them if they are enabled.
If an app exists in both locations with the same name, the user app will take precendence to allow the user to override the default app.

For an app to be considered as enabled, the following conditions must be met:
- **[APP_ROOT]/.enabled** or **/useremain/home/rinkhals/apps/[APP_NAME].enabled** exist
- **[APP_ROOT]/.disabled** and **/useremain/home/rinkhals/apps/[APP_NAME].disabled** do not exist

It allows for the app developper to enable their app by defaut on startup by providing a **.enabled** file in the app directory.
Then, the user or the Rinkhals touch UI can create a **/useremain/home/rinkhals/apps/[APP_NAME].disabled** file to override the default behavior for example.

### App structure

Apps have a relatively simple structure, a minimum of two files are needed:
- **app.json**: The app manifest, with its name, version, description and some additional information. This file is used in the Rinkhals touch UI to display some information
- **app.sh**: The app loader script, used to start, stop and get the app status

The **app.sh** script must provide 3 actions, passed as first parameter:
- `./app.sh status` to report current app status. The status must respect a specific format and some helpers are provided. You should `source /useremain/rinkhals/.current/tools.sh` from the **app.sh** script to use the `report_status` function.

    This function takes 2 parameters:
    - The status, using the provided constants `$APP_STATUS_STARTED` or `$APP_STATUS_STOPPED`
    - (optional) The PIDs of the running processes for this app. You can use `PIDS=$(get_by_name my_process)` to easily get the PIDs. This will allow Rinkhals to provide some live app metrics to the user
- `./app.sh start` to start the app. No additional parameters are allowed since apps will be started automatically during startup. This call is supposed to be non blocking, and start separated processes for the app being started. A timeout of 5 seconds is applied while starting the app from the touch UI or during startup.
- `./app.sh stop` to stop/kill the app. No additional parameters are allowed since apps will be started automatically during startup. This call is supposed to be non blocking. If processes or services need to stop, they have to stop very quickly or they should be killed instead.

You can check **apps/example/app.sh** in this repo, it is a simple example to demonstrate how to implement apps.

### App packaging and deployment

A packaging system is provided in this repo to easily share and install apps, as described above.

The **build/deploy-apps.sh** script will synchronize your workspace with all apps in **apps/** to your printer. This is the easiest way to iterate on your app during development.


To use it, you will need Docker or a Linux machine. For Windows, run:
```
docker run --rm -it -e KOBRA_IP=x.x.x.x -v .\build:/build -v .\apps:/apps --entrypoint=/bin/sh rclone/rclone:1.68.2 /build/deploy-apps.sh
```

The **build/build-swu.sh** script will package your app in a SWU file users will be able to install directly on their printer. During installation, the app will be copied to their printer's **/useremain/home/rinkhals/apps** directory making it available.
They will need to enable the app as described above if you didn't explicitely enable it by default.

To use it, you will need Docker or a Linux machine. For Windows, run:
```
docker run --rm -it -v .\build:/build -v .\files:/files -v .\apps:/apps ghcr.io/jbatonnet/rinkhals/build /build/build-swu.sh "APP_ROOT"
```


<p align="center">
    <img width="48" src="https://github.com/jbatonnet/Rinkhals/blob/master/icon.png?raw=true" />
</p>


## Apps ideas

Here are some apps ideas:
- Cloudflare Tunnel (thanks to dan3805 for the idea: https://github.com/jbatonnet/Rinkhals/issues/17)
- Tailscale VPN
- FTP / Samba server to add files / apps easily

You can take inspirations to this great script for Creality printers: https://github.com/Guilouz/Creality-Helper-Script
