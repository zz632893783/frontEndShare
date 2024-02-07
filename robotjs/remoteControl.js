const { exec } = require('child_process');

const commands = [
	{ dir: 'C:/Users/10138/Desktop/前端分享/nodejs/robotjs', command: 'node server.js' },
	{ dir: 'C:/Users/10138/Desktop/前端分享/nodejs/robotjs/computerRemoteControl', command: 'npm run dev' }
]

// 启动项目
commands.forEach(project => {
    const { dir, command } = project;
    const childProcess = exec(command, { cwd: dir });
    childProcess.stdout.on('data', data => console.log(`[${dir}] stdout: ${data}`));
    childProcess.stderr.on('data', data => console.error(`[${dir}] stderr: ${data}`));
    childProcess.on('close', code => console.log(`[${dir}] child process exited with code ${code}`));
});
