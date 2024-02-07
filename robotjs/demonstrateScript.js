// 操作键鼠的演示脚本
// 爬去百度搜索结果
const robot = require('robotjs');
const puppeteer = require('puppeteer');
const { computeTargetPosition } = require('./utils.js');
// 启动浏览器
let browser;
let page;
// 登录统一门户
const loginUnifiedPortal = async () => {
    // 打开页面
    page = await browser.newPage();
    // 设置页面大小
    await page.setViewport({ width: 1920, height: 1080 });
    // 跳转到统一门户的登录页面
    await page.goto('http://10.10.120.211:30100/login');
    // 等待搜索结果页面加载完成
    await page.waitForSelector('#app .el-form input');
    // 等待搜索结果页面加载完成
    robot.moveMouse(1000, 500);
    await Promise.resolve();
    robot.moveMouseSmooth(1570, 520, 2);
    robot.mouseClick('left', false);
    await new Promise(resolve => setTimeout(resolve, 200));
    const userName = 'admin';
    for (let i = 0; i < userName.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 20));
        robot.keyToggle(userName[i], 'down');
        robot.keyToggle(userName[i], 'up');
    }
    robot.keyToggle(' ', 'down');
    robot.keyToggle(' ', 'up');
    await new Promise(resolve => setTimeout(resolve, 200));
    // 等待登录页面in
    robot.moveMouseSmooth(1570, 590, 2);
    robot.mouseClick('left', false);
    await new Promise(resolve => setTimeout(resolve, 200));
    const password = 'Zrx@2020';
    for (let i = 0; i < password.length; i++) {
        const shift = /[A-Z]/.test(password[i]) || '@'.includes(password[i]);
        const key = ({ '@': 2 })[password[i]] || password[i];
        await new Promise(resolve => setTimeout(resolve, 20));
        shift && robot.keyToggle('shift', 'down');
        robot.keyToggle(key, 'down');
        robot.keyToggle(key, 'up');
        shift && robot.keyToggle('shift', 'up');
    }
    await new Promise(resolve => setTimeout(resolve, 200));
    // 点击验证码按钮
    robot.moveMouseSmooth(1570, 660, 2);
    robot.mouseClick('left', false);
    await new Promise(resolve => setTimeout(resolve, 200));
    while (true) {
        // 获取开始状态的验证码图片
        const beforeImageData = await page.evaluate(() => {
            const canvas = document.querySelector('#app canvas');
            const ctx = canvas.getContext('2d');
            return {
                width: ctx.canvas.width,
                height: ctx.canvas.height,
                data: Array.from(ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height).data)
            }
        });
        // 拖拽滑块
        const dragStartX = 780;
        robot.moveMouseSmooth(dragStartX, 770, 2);
        await new Promise(resolve => setTimeout(resolve, 200));
        robot.mouseToggle('down', 'left');
        robot.moveMouseSmooth(880, 770, 2);
        // 再获取一次用以对比位置的验证码图片
        const afterImageData = await page.evaluate(() => {
            const canvas = document.querySelector('#app canvas');
            const ctx = canvas.getContext('2d');
            return {
                width: ctx.canvas.width,
                height: ctx.canvas.height,
                data: Array.from(ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height).data)
            }
        });
        // 获得移动距离
        const offsetX = await computeTargetPosition(beforeImageData, afterImageData);
        robot.moveMouseSmooth(dragStartX + offsetX, 770, 2);
        robot.mouseToggle('up', 'left');
        await new Promise(resolve => setTimeout(resolve, 1000));
        const verifySuccess = await page.evaluate(() => {
            const verifyBtn = document.querySelector('#app .verify-btn');
            return (document.querySelector('.verify-btn').innerText || '').trim() === '验证通过';
        });
        if (verifySuccess) {
            break;
        }
        await new Promise(resolve => setTimeout(resolve, 200));
    };
    // 点击登录按钮
    robot.moveMouseSmooth(1555, 735, 2);
    robot.mouseClick('left', false);
};

(async () => {
    // 创建浏览器
    browser = await puppeteer.launch({
        headless: false,
        args: [
            // `--window-size=1920,1080`,
            '--start-maximized',
            '--no-first-run'
        ]
    });
    // 等待统一门户登录,并打开移动运营中心PC管理端
    await loginUnifiedPortal();
    // 操作运营中心
    // await operaMobileManage();
})();
