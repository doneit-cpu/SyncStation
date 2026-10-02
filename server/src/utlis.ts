import os from "os";

export function getLocalIp(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]!) {
      // Look for IPv4 and skip internal loopback addresses (like 127.0.0.1)
      if (net.family === 'IPv4' && !net.internal) {
        return net.address; // Usually returns something like 192.168.1.X
      }
    }
  }
  return '127.0.0.1';
}

// git add 