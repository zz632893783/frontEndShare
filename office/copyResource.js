const fs = require('fs');
const path = require('path');

const copyDirectory = (src, dst) => {
	!fs.existsSync(dst) && fs.mkdirSync(dst);
    // 读取源目录中的所有文件和子目录
    const files = fs.readdirSync(src);
    for (const file of files) {
        const srcPath = path.join(src, file);
        const dstPath = path.join(dst, file);
        // 判断是文件还是目录
        fs.statSync(srcPath).isFile() ? fs.copyFileSync(srcPath, dstPath) : copyDirectory(srcPath, dstPath);
    }
}
fs.existsSync('./excelCreateWordDay.js') && fs.copyFile('./excelCreateWordDay.js', './dist/win-unpacked/excelCreateWordDay.js', err => {});
fs.existsSync('./util.js') && fs.copyFile('./util.js', './dist/win-unpacked/util.js', err => {});
copyDirectory('./input', './dist/win-unpacked/input');