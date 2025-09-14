#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Full-Stack Authentication App...\n');

// Start backend server
console.log('📡 Starting backend server...');
const backendPath = path.join(__dirname, 'Backend');
const backend = spawn('npm', ['run', 'dev'], {
  cwd: backendPath,
  stdio: 'inherit',
  shell: true
});

// Start frontend server
console.log('🎨 Starting frontend server...');
const frontendPath = path.join(__dirname, 'frontend');
const frontend = spawn('npm', ['start'], {
  cwd: frontendPath,
  stdio: 'inherit',
  shell: true
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down servers...');
  backend.kill();
  frontend.kill();
  process.exit(0);
});

backend.on('error', (err) => {
  console.error('❌ Backend error:', err);
});

frontend.on('error', (err) => {
  console.error('❌ Frontend error:', err);
});

console.log('\n✅ Both servers are starting...');
console.log('📱 Frontend: http://localhost:3000');
console.log('🔧 Backend: http://localhost:5000');
console.log('\nPress Ctrl+C to stop both servers');