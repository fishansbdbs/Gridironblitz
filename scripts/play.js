import { spawn } from 'node:child_process';

console.log('');
console.log('GRIDIRON BLITZ 97 local play');
console.log('Open this URL: http://localhost:5173');
console.log('');

const child = spawn('npm', ['run', 'dev', '--prefix', 'client'], {
  stdio: 'inherit',
  shell: true
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
