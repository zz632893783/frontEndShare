const { exec } = require('child_process');
// 脚本文件列表
const scripts = ['./excelCreateWordDay.js', './excelCreateWordWeek.js', './excelCreateWordMonth.js'];
// 逐个执行文件
scripts.forEach(script => {
    const child = exec(`node ${script}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing ${script}: ${error.message}`);
            return;
        }
        console.log(`${script} executed successfully`);
        console.log(stdout);
    });
    // 打印子进程的输出到控制台
    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);
});
