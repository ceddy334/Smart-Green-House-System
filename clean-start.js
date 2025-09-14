#!/usr/bin/env node

const { exec } = require('child_process');

console.log('🧹 Cleaning up existing processes...');

// Kill processes on port 5000
exec('netstat -ano | findstr :5000', (error, stdout) => {
  if (stdout) {
    const lines = stdout.trim().split('\n');
    lines.forEach(line => {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && pid !== '0') {
        exec(`taskkill /PID ${pid} /F`, (err) => {
          if (!err) {
            console.log(`✅ Killed process ${pid} on port 5000`);
          }
        });
      }
    });
  }
});

// Kill processes on port 3000
exec('netstat -ano | findstr :3000', (error, stdout) => {
  if (stdout) {
    const lines = stdout.trim().split('\n');
    lines.forEach(line => {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && pid !== '0') {
        exec(`taskkill /PID ${pid} /F`, (err) => {
          if (!err) {
            console.log(`✅ Killed process ${pid} on port 3000`);
          }
        });
      }
    });
  }
});

setTimeout(() => {
  console.log('🚀 Starting servers...');
  require('./start-dev.js');
}, 2000);