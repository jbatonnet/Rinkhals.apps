import socket
import struct

# Multicast group for SSDP
multicast_group = '239.255.255.250'
interface_ip = '0.0.0.0'

# Create a raw socket for IGMP
sock = socket.socket(socket.AF_INET, socket.SOCK_RAW, socket.IPPROTO_IGMP)
mreq = struct.pack('4s4s', socket.inet_aton(multicast_group), socket.inet_aton(interface_ip))
sock.setsockopt(socket.IPPROTO_IP, socket.IP_ADD_MEMBERSHIP, mreq)

# Create the initial IGMPv2 Membership Report packet
type = 0x16
max_resp_time = 0
checksum = 0
group_address = socket.inet_aton(multicast_group)
igmp_header = struct.pack('!BBH4s', type, max_resp_time, checksum, group_address)

def calculate_checksum(data):
    """Calculates 16-bit one's complement (Internet checksum)"""
    sum = 0
    for i in range(0, len(data), 2):
        if i + 1 >= len(data):
            sum += data[i] & 0xff
        else:
            sum += ((data[i] << 8) & 0xff00) + (data[i+1] & 0xff)

    while (sum >> 16) > 0:
        sum = (sum & 0xffff) + (sum >> 16)

    return ~sum & 0xffff

# Checksum the packet
checksum = calculate_checksum(igmp_header)
igmp_header = struct.pack('!BBH4s', type, max_resp_time, checksum, group_address)

# Send the packet to the multicast group
sock.sendto(igmp_header, (multicast_group, 0))
sock.close()

print(f"IGMPv2 Membership Report sent to group {multicast_group}")
