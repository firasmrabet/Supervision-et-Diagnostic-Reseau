import subprocess
import re
import socket
import psutil
import platform
from datetime import datetime
import asyncio

class NetworkScanner:
    def __init__(self):
        self.os_type = platform.system().lower()

    def get_interfaces(self):
        """Get network interfaces and their stats"""
        stats = psutil.net_io_counters()
        return {
            "bytes_sent": stats.bytes_sent,
            "bytes_recv": stats.bytes_recv,
            "packets_sent": stats.packets_sent,
            "packets_recv": stats.packets_recv,
            "errin": stats.errin,
            "errout": stats.errout,
            "dropin": stats.dropin,
            "dropout": stats.dropout
        }

    async def scan_wifi(self):
        """Scan for available WiFi networks (Windows only for now)"""
        if self.os_type != "windows":
            return []
            
        try:
            # Run netsh command asynchronously
            proc = await asyncio.create_subprocess_shell(
                'netsh wlan show networks mode=bssid',
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, _ = await proc.communicate()
            output = stdout.decode('utf-8', errors='ignore')
            
            networks = []
            current_network = {}
            
            for line in output.split('\n'):
                line = line.strip()
                if line.startswith('SSID'):
                    if current_network and 'ssid' in current_network:
                        networks.append(current_network)
                    current_network = {'ssid': line.split(':')[1].strip()}
                elif line.startswith('Signal') or line.startswith('Signal'):
                    # Some Windows versions use different localized strings, but usually Signal is there
                    val = line.split(':')[1].strip()
                    current_network['signal'] = val
                elif line.startswith('Authentication') or line.startswith('Authentification'):
                    val = line.split(':')[1].strip()
                    current_network['auth'] = val
            
            if current_network and 'ssid' in current_network:
                networks.append(current_network)
                
            return networks
        except Exception as e:
            print(f"WiFi scan error: {e}")
            return []

    async def arp_scan(self):
        """Run ARP scan to find devices on local network"""
        try:
            proc = await asyncio.create_subprocess_shell(
                'arp -a',
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, _ = await proc.communicate()
            output = stdout.decode('utf-8', errors='ignore')
            
            devices = []
            for line in output.split('\n'):
                # Basic regex for IP and MAC parsing from arp -a output
                parts = line.split()
                if len(parts) >= 2 and parts[0].count('.') == 3 and parts[1].count('-') == 5:
                    ip = parts[0]
                    mac = parts[1]
                    type_str = parts[2] if len(parts) > 2 else "dynamic"
                    if ip.startswith('192.168.') or ip.startswith('10.') or ip.startswith('172.'):
                        if not ip.endswith('.255'):
                            devices.append({
                                'ip': ip,
                                'mac': mac,
                                'type': type_str,
                                'status': 'online',
                                'last_seen': datetime.now().isoformat()
                            })
            
            return devices
        except Exception as e:
            print(f"ARP scan error: {e}")
            return []

    async def ping(self, host):
        """Ping a host to check latency"""
        param = '-n' if self.os_type == 'windows' else '-c'
        try:
            proc = await asyncio.create_subprocess_shell(
                f'ping {param} 1 -w 1000 {host}',
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, _ = await proc.communicate()
            output = stdout.decode('utf-8', errors='ignore')
            
            if proc.returncode == 0:
                # Extract latency
                if self.os_type == 'windows':
                    match = re.search(r'temps[=<]([0-9]+)ms', output) or re.search(r'time[=<]([0-9]+)ms', output)
                    if match:
                        return int(match.group(1))
                return 10 # Default fallback if regex fails but ping succeeds
            return -1 # Offline
        except Exception:
            return -1

    async def get_active_devices(self):
        """Combines ARP scan with ping to confirm status and latency"""
        devices = await self.arp_scan()
        
        # We will only ping a subset to avoid taking too long
        active_devices = []
        
        # To avoid blocking, we can ping concurrently
        async def check_device(dev):
            latency = await self.ping(dev['ip'])
            if latency >= 0:
                dev['latency'] = latency
                dev['status'] = 'online'
            else:
                dev['latency'] = 0
                dev['status'] = 'offline'
            return dev
            
        tasks = [check_device(d) for d in devices[:20]] # Limit to 20 devices for speed
        results = await asyncio.gather(*tasks)
        
        # Identify types basically
        for i, r in enumerate(results):
            r['id'] = f"dev-{i:03d}"
            r['name'] = f"Device-{r['mac'][-8:].replace('-', '')}"
            if r['ip'].endswith('.1') or r['ip'].endswith('.254'):
                r['device_type'] = 'Router/Gateway'
            else:
                r['device_type'] = 'Workstation/IoT'
            r['bandwidth'] = round((i % 5) * 0.1, 2) # Still simulated bandwidth per device as we can't easily get it without promiscuous sniffing
        
        return results

scanner = NetworkScanner()
