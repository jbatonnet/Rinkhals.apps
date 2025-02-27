# Cloudflare Tunnel Manager for Rinkhals

This app allows you to create a secure tunnel between your 3D printer and the Cloudflare network, enabling remote access to your printer without exposing it directly to the internet.

## About Rinkhals

Rinkhals already includes Mainsail and Fluidd interfaces with Moonraker, allowing you to control your printer via a web interface. This Cloudflare Tunnel app simply makes that interface securely accessible from the internet.

## Installation

The app will be installed automatically when added through the Rinkhals app system.

## Configuration

Before the tunnel can be used, you need to provide your Cloudflare tunnel token:

1. Create a directory for the configuration:
   ```
   mkdir -p /useremain/home/rinkhals/apps/cloudflare-tunnel-manager/config
   ```

2. Create a file containing only your tunnel token:
   ```
   nano /useremain/home/rinkhals/apps/cloudflare-tunnel-manager/config/token.txt
   ```

3. Paste your Cloudflare tunnel token into this file (just the token, nothing else) and save.

### Getting a Cloudflare Tunnel Token

To configure your tunnel, you'll need to create one in your Cloudflare account:

1. Sign up or log in to [Cloudflare](https://dash.cloudflare.com/)
2. Navigate to the Zero Trust dashboard by clicking on "Zero Trust" in the sidebar
3. In the Zero Trust dashboard, select "Access" → "Tunnels"
4. Click "Create a tunnel"
5. Give your tunnel a name (e.g., "My 3D Printer")
6. In the "Install connector" step, you'll see a token in the installation command that looks like:
   ```
   cloudflared tunnel --token eyJhIjoiZDc3YWY5NjQ0ZDk1NGEyYjk3NWNiM2ZjZDg5YjVkZTkiLCJ0IjoiYzQ5YjI0ZmItYjRiZC00YWVkLWFmNmEtZWYxODk4ZTA4NWM2IiwicyI6Ik5EWmtNR0poTlRjdFlqY3pNaTAwTmpWakxUZ3pNV010TVdJMk5qWmpNVEU1Wm1VeiJ9
   ```
   Copy the entire token (the part after `--token`).

7. In the "Public Hostname" tab, configure your hostname:
   - Type: HTTP
   - Subdomain: Choose a subdomain for your printer
   - Domain: Select one of your Cloudflare domains
   - Path: Leave blank or specify a path
   - Service: `http://localhost:80` (or the appropriate port for your printer interface)
   
8. Click "Save" to create the tunnel

### Example token.txt File

Your `token.txt` file should contain only the token, like this:

```
eyJhIjoiZDc3YWY5NjQ0ZDk1NGEyYjk3NWNiM2ZjZDg5YjVkZTkiLCJ0IjoiYzQ5YjI0ZmItYjRiZC00YWVkLWFmNmEtZWYxODk4ZTA4NWM2IiwicyI6Ik5EWmtNR0poTlRjdFlqY3pNaTAwTmpWakxUZ3pNV010TVdJMk5qWmpNVEU5Wm1VeiJ9
```

That's it! No additional configuration is needed. All tunnel configuration is managed through the Cloudflare dashboard.

## Usage

### Starting the Tunnel

The tunnel will start automatically when the app is started. You can manually start it with:

```
/useremain/home/rinkhals/apps/cloudflare-tunnel-manager/app.sh start
```

### Checking Status

To check if the tunnel is running:

```
/useremain/home/rinkhals/apps/cloudflare-tunnel-manager/app.sh status
```

### Stopping the Tunnel

To stop the tunnel:

```
/useremain/home/rinkhals/apps/cloudflare-tunnel-manager/app.sh stop
```

## Troubleshooting

If you encounter issues:

1. Check the logs:
   ```
   cat /useremain/home/rinkhals/apps/cloudflare-tunnel-manager/config/cloudflared.log
   ```

2. Verify your configuration file is correct
3. Make sure your token is valid and not expired
4. Check your internet connection

## Security Considerations

- The tunnel provides encrypted access to your printer
- Access is controlled via Cloudflare's Zero Trust policies
- Consider setting up Cloudflare Access policies for additional security

## Additional Resources

- [Cloudflare Tunnel Documentation](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Zero Trust Documentation](https://developers.cloudflare.com/cloudflare-one/)