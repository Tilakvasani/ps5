const { spawn } = require('child_process');
const { networkInterfaces } = require('os');

const nets = networkInterfaces();
let localIp = '';

for (const name of Object.keys(nets)) {
  for (const net of nets[name]) {
    const isIPv4 = net.family === 'IPv4' || net.family === 4;
    if (isIPv4 && !net.internal) {
      localIp = net.address;
      break;
    }
  }
  if (localIp) break;
}

const hostIp = localIp || '127.0.0.1';

console.log(`\n🚀 Zupwell Dev Server starting...`);
console.log(`📡 Binding to all interfaces (0.0.0.0) for both Local and Network access.`);

const isWin = process.platform === 'win32';
const nextCmd = isWin ? 'npx.cmd' : 'npx';

// We bind to 0.0.0.0 so it is accessible on both localhost and local network
const child = spawn(nextCmd, ['next', 'dev', '-H', '0.0.0.0'], { shell: true });

child.stdout.on('data', (data) => {
  let output = data.toString();
  
  // Replace unroutable 0.0.0.0 with localhost and network IP in Next.js output
  if (output.includes('0.0.0.0')) {
    output = output
      .replace(/(-\s+Local:\s+)http:\/\/0\.0\.0\.0:(\d+)/g, (match, prefix, port) => `${prefix}http://localhost:${port}`)
      .replace(/(-\s+Network:\s+)http:\/\/0\.0\.0\.0:(\d+)/g, (match, prefix, port) => `${prefix}http://${hostIp}:${port}`);
  }
  
  process.stdout.write(output);
});

child.stderr.on('data', (data) => {
  process.stderr.write(data);
});

child.on('close', (code) => {
  process.exit(code);
});
