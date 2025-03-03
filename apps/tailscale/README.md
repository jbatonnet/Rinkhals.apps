# Tailscale App for Rinkhals

This application installs and runs Tailscale on your Anycubic Kobra 3 printer with the Rinkhals firmware, allowing you to securely access your printer from anywhere via the Tailscale VPN network.

## Installation

### Using the SWU Package (Recommended)

1. Download the `app-tailscale.swu` file from GitHub Actions.
2. Copy it to a FAT32-formatted USB drive inside a folder named `aGVscF9zb3Nf`.
3. Plug the USB drive into your Kobra 3 printer.
4. Wait for two beeps (the second beep confirms the installation).
5. Enable the application via the Rinkhals touchscreen interface or by creating the file `/useremain/home/rinkhals/apps/tailscale.enabled`.
6. Restart your printer.

### Manual Installation

1. Connect to your printer via SSH/SFTP.
2. Copy the `tailscale` folder to `/useremain/home/rinkhals/apps/`.
3. Create the file `/useremain/home/rinkhals/apps/tailscale.enabled`.
4. Restart your printer.

## Initial Configuration

After installing and enabling the application, you need to authenticate Tailscale:

1. Connect to your printer via SSH: `ssh root@your-printer-ip` (password: `rockchip`).
2. Run one of the following commands:

   - Using an authentication key (recommended for headless setup):
     ```
     /useremain/home/rinkhals/apps/tailscale/bin/tailscale --socket=/useremain/home/rinkhals/apps/tailscale/run/tailscaled.sock up --authkey=YOUR_TAILSCALE_AUTH_KEY
     ```
   
   - Using interactive authentication:
     ```
     /useremain/home/rinkhals/apps/tailscale/bin/tailscale --socket=/useremain/home/rinkhals/apps/tailscale/run/tailscaled.sock up
     ```
     This will provide a URL that you need to open in a browser to authenticate.

3. Once authenticated, your printer will be accessible via its Tailscale IP address.

## Checking Status

To check if Tailscale is running and get its current status:

```
/useremain/home/rinkhals/apps/tailscale/bin/tailscale --socket=/useremain/home/rinkhals/apps/tailscale/run/tailscaled.sock status
```

This will display your printer’s Tailscale IP address and connection status.

## Manual Start and Stop

To manually start Tailscale:
```
/useremain/home/rinkhals/apps/tailscale/app.sh start
```

To stop Tailscale:
```
/useremain/home/rinkhals/apps/tailscale/app.sh stop
```

## Troubleshooting

- **Tailscale does not start**: Check the log file at `/useremain/home/rinkhals/apps/tailscale/tailscaled.log`.
- **Authentication issues**: Try re-authenticating using the commands in the Initial Configuration section.
- **Network connectivity issues**: Ensure your printer has internet access.
- **"Device not found" error**: This is normal, as the application uses userspace networking mode, which does not require a TUN interface.

## Features

- Secure remote access to your printer from anywhere.
- End-to-end encryption.
- No need to open ports on your router.
- Works across NAT and firewalls.
- Uses userspace networking mode for Rinkhals compatibility.

## Technical Notes

This application uses Tailscale’s "userspace networking" mode because the Rinkhals firmware lacks the necessary TUN module for standard Tailscale operation. While this mode is less performant, it is fully functional for SSH and web access to your printer.

