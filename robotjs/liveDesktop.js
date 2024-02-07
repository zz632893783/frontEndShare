const screenshot = require('screenshot-desktop');

// 捕获整个屏幕的截图
screenshot().then(image => {
    // image 是一个Buffer对象，包含了截图的图像数据
    // 你可以将这个Buffer保存为文件，或者进行其他操作
    const fs = require('fs');
    fs.writeFileSync('screen.png', image);
    console.log('Screenshot saved as screen.png', image);
}).catch(error => {
    console.error('Error taking screenshot:', error);
});