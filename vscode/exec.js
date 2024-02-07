const { spawn } = require('cross-spawn');

const process = spawn('npm', ['run', 'dev'], { cwd: 'F:/demo/vite-5.1.0' });

process.stdout.on('data', (data) => {
	console.log(`stdout: ${data}`);
});

process.stderr.on('data', (data) => {
	console.error(`stderr: ${data}`);
});

process.on('close', (code) => {
	console.log(`child process exited with code ${code}`);
});