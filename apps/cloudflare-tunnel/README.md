# Cloudflare Tunnel Manager for Rinkhals

This app allows you to create a secure tunnel between your 3D printer and the Cloudflare network, enabling remote access to your printer without exposing it directly to the internet.

## About Rinkhals

Rinkhals already includes Mainsail and Fluidd interfaces with Moonraker, allowing you to control your printer via a web interface. This Cloudflare Tunnel app simply makes that interface securely accessible from the internet.

## Installation

The app will be installed automatically when added through the Rinkhals app system.

## Configuration

Before the tunnel can be used, you need to provide your Cloudflare tunnel token.

The app includes a sample token file that you can edit:

1. Copy the sample file to create your token file:
   ```
   cp /useremain/home/rinkhals/apps/cloudflare-tunnel/config/token.txt.sample /useremain/home/rinkhals/apps/cloudflare-tunnel/config/token.txt
   ```

2. Edit the token file:
   ```
   nano /useremain/home/rinkhals/apps/cloudflare-tunnel/config/token.txt
   ```

3. Replace the placeholder `<CF_TOKEN_HERE>` with your actual Cloudflare tunnel token, save and exit (Ctrl+X, then Y, then Enter).

### Getting a Cloudflare Account and Creating a Tunnel

To configure your tunnel, you'll need to create one in your Cloudflare account:

1. Sign up or log in to [Cloudflare](https://dash.cloudflare.com/)
   - Note: While Cloudflare may ask for credit card verification during sign-up, the Tunnels service is completely free for personal use. The credit card is only for verification purposes.

2. Add your domain to Cloudflare (if you haven't already)
   - If you don't have a domain, you can purchase one through Cloudflare or any domain registrar
   - Follow the steps to configure your domain's nameservers to point to Cloudflare

3. Navigate to the Zero Trust dashboard by clicking on "Zero Trust" in the sidebar

4. In the Zero Trust dashboard, select "Network" → "Tunnels"

5. Click "Create a tunnel"

6. Give your tunnel a name (e.g., "My 3D Printer")

7. In the "Install connector" step, you'll see a token in the installation command that looks like:

   ```
   cloudflared tunnel --token eyJhIjoiZDc3YWY5NjQ0ZDk1NGEyYjk3NWNiM2ZjZDg5YjVkZTkiLCJ0IjoiYzQ5YjI0ZmItYjRiZC00YWVkLWFmNmEtZWYxODk4ZTA4NWM2IiwicyI6Ik5EWmtNR0poTlRjdFlqY3pNaTAwTmpWakxUZ3pNV010TVdJMk5qWmpNVEU5Wm1VeiJ9
   ```

   Copy the entire token (the part after `--token`).

### Configuring DNS and Public Access

8. In the "Public Hostname" tab:
   - Type: HTTP
   - Subdomain: Choose a subdomain for your printer (e.g., "printer", "3dprinter")
   - Domain: Select one of your Cloudflare domains
   - Path: Leave blank or specify a path
   - Service: `http://localhost:80` (or the appropriate port for your printer interface)
   - Additional application settings:
     - For Mainsail/Fluidd, enable "Additional settings" and set HTTP Host Header to the hostname to help with WebSocket connections

9. Click "Save" to create the tunnel and DNS entry
   - This automatically creates the DNS record for the subdomain you specified
   - No additional DNS configuration is required

### Setting Up Zero Trust Access Policies (Highly Recommended)

To secure your printer interface with authentication:

1. In the Zero Trust dashboard, go to "Access" → "Applications"

2. Click "Add an application"

3. Select "Self-hosted" application

4. Configure the application:
   - Application name: Your printer name
   - Session duration: How long the authentication remains valid
   - Application domain: Enter the same domain you configured for your tunnel (e.g., printer.yourdomain.com)

5. Set up access policies:
   - Click "Add policy"
   - Name your policy (e.g., "Owner Access")
   - Configure who can access:
      - Select "Emails" and enter your email address
      - Or use other authentication options like Google Workspace, GitHub, etc.
   - Click "Save policy"

6. Finish by clicking "Save application"

Now, when someone tries to access your printer interface, they'll be required to authenticate through Cloudflare Access.

### Example token.txt File

Your `token.txt` file should contain only the token, like this:

```
eyJhIjoiZDc3YWY5NjQ0ZDk1NGEyYjk3NWNiM2ZjZDg5YjVkZTkiLCJ0IjoiYzQ5YjI0ZmItYjRiZC00YWVkLWFmNmEtZWYxODk4ZTA4NWM2IiwicyI6Ik5EWmtNR0poTlRjdFlqY3pNaTAwTmpWakxUZ3pNV010TVdJMk5qWmpNVEU5Wm1VeiJ9
```

That's it! No additional configuration is needed on the Rinkhals side. All tunnel and access configuration is managed through the Cloudflare dashboard.

## Usage

### Starting the Tunnel

The tunnel will start automatically when the app is started. You can manually start it with:

```
/useremain/home/rinkhals/apps/cloudflare-tunnel/app.sh start
```

### Checking Status

To check if the tunnel is running:

```
/useremain/home/rinkhals/apps/cloudflare-tunnel/app.sh status
```

### Stopping the Tunnel

To stop the tunnel:

```
/useremain/home/rinkhals/apps/cloudflare-tunnel/app.sh stop
```

## Troubleshooting

If you encounter issues:

1. Check the logs:

   ```
   cat /useremain/home/rinkhals/apps/cloudflare-tunnel/config/cloudflared.log
   ```
2. Verify your configuration file is correct
3. Make sure your token is valid and not expired
4. Check your internet connection
5. If you receive WebSocket errors in Mainsail/Fluidd, make sure you've configured the HTTP Host Header in your Cloudflare tunnel configuration

## Security Considerations

- The tunnel provides encrypted access to your printer
- Access is controlled via Cloudflare's Zero Trust policies (strongly recommended)
- Always set up authentication using the Access policies described above
- Consider enabling additional security options like device posture checking in Cloudflare Zero Trust

## Additional Resources

- [Cloudflare Tunnel Documentation](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Zero Trust Documentation](https://developers.cloudflare.com/cloudflare-one/)
- [Cloudflare Access Documentation](https://developers.cloudflare.com/cloudflare-one/policies/access/)