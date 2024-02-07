const express = require('express');
const fs = require('fs');
const serve = express();
const { exec } = require('child_process');

// serve.get('/api', (req, res) => {
//     // 获取传参
//     const { startCol = 5, filename = '城运中心子项目', start = '2010-02-03' } = req.query;
//     exec(`node ./excelCreateWordDay.js ${ startCol } ${ filename } ${ start }`);
//     // 设置响应状态码和响应体
//     res.status(200).json({ message: 'success' });
// }).listen(3100, () => console.log('Server is running on http://localhost:3100'));

(async () => {
    // const files = await fs.promises.readdir(__dirname);
    // console.log(files);
    const v = fs.existsSync('./excelCreateWordDay.js');
    console.log(v);
})()

