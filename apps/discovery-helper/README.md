# Discovery helper app

This app improves the printer discovery function for Anycubic Slicer Next when in LAN mode.

## How it works

In some networks, connecting the printer from Anycubic Slicer Next is impossible, even if the printer is reachable over the network by other means.

This happens if a router or switch uses "IGMP snooping" which filters where multicast packets are delivered. The printer listens for a multicast SSDP message from the slicer, but because it is not a member of the SSDP multicast group, the network will not deliver the message to the printer. In order to join the multicast group, the printer has to send a specific IGMP report, but the stock firmware does not do this.

That is where this app comes in. When it starts it will send an IGMP report to add the printer to the SSDP multicast group, allowing it to receive the discovery request.

## Usage

When the app is started, the printer can be connected to from Anycubic Slicer Next. It's important not to wait too long, as the multicast membership can expire after some time.

Once connected, the app is not strictly necessary as long as the printer is listed in the slicer and the IP address stays the same.

If for some reason you waited too long before connecting from the slicer, you can disable and re-enable the app to renew the multicast membership.
