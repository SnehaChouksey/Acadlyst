import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const dir = dirname(fileURLToPath(import.meta.url));

console.log('Starting server and worker...');

const server = spawn(process.execPath, ['index.js'], {
  stdio: 'inherit',
  cwd: dir,
  env: process.env,
});

const worker = spawn(process.execPath, ['worker.js'], {
  stdio: 'inherit',
  cwd: dir,
  env: process.env,
});

server.on('error', (err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});

worker.on('error', (err) => {
  console.error('Failed to start worker:', err.message);
  process.exit(1);
});

server.on('close', (code) => {
  console.error('Server exited with code:', code);
  process.exit(code ?? 1);
});

worker.on('close', (code) => {
  console.error('Worker exited with code:', code);
  process.exit(code ?? 1);
});
