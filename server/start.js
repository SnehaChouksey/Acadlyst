import { fork } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log('Starting server and worker...');

const server = fork(join(__dirname, 'index.js'), [], { stdio: 'inherit' });
const worker = fork(join(__dirname, 'worker.js'), [], { stdio: 'inherit' });

server.on('exit', (code) => {
  console.error('Server exited with code:', code);
  process.exit(code ?? 1);
});

worker.on('exit', (code) => {
  console.error('Worker exited with code:', code);
  process.exit(code ?? 1);
});
