// 爬去百度搜索结果
const puppeteer = require('puppeteer');
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
    await page.goto('http://10.10.120.211:30101/login');
    // 等待搜索结果页面加载完成
    await page.waitForSelector('#app .el-form input');
    // 等待登录页面
    await page.evaluate(() => {
        // 自动填充账号密码
        const [userNameInput, passwordInput] = document.querySelectorAll('#app .el-form input');
        userNameInput.value = 'admin';
        passwordInput.value = 'Zrx@2020';
        // 需要通过 input 元素 dispatch 触发校验
        const event = new Event('input', { bubbles: true });
        userNameInput.dispatchEvent(event);
        passwordInput.dispatchEvent(event);
        // 自动登录
        document.querySelector('#app .login-btn')?.click();
    });
    // 等待搜索结果页面加载完成
    await page.waitForSelector('#app .app-menu .app-name[title="移动门户PC管理端"]');
    // 解析门户菜单主页面
    await page.evaluate(() => {
        const container = document.querySelector('#app .app-menu');
        const appDom = container.querySelector('.app-name[title="移动门户PC管理端"').parentElement.parentElement;
        const containerBounding = container.getBoundingClientRect();
        const appDomBounding = appDom.getBoundingClientRect();
        container.scrollTo({ top: appDomBounding.top - containerBounding.top, behavior: 'smooth' });
        appDom.click();
    });
};
// 操作运营中心
const operaMobileManage = async () => {
    // 已有页签打开新页签
    const newPageTarget = await browser.waitForTarget(target => target.opener() === page.target());
    // 获取新页面实例
    page = await newPageTarget.page();
    await page.setViewport({ width: 1920, height: 1080 });
    // 等待移动运营中心管理端页面打开
    await page.waitForSelector('#app .g-floor-context .u-common-container');
    // 解析页面结构
    await page.evaluate(async () => {
        // 获取新增按钮
        const createBtn = document.querySelector('#app .g-floor-context .u-common-container .operate-btns .el-button');
        // 打开新增表单
        createBtn.click();
    });
    // 等待表单打开
    await page.waitForSelector('#app .el-dialog__body .el-form-item');
    // 解析表单结构
    await page.evaluate(async () => {
        const formItems = document.querySelectorAll('#app .el-dialog__body .el-form-item');
        const nameInput = formItems[0].querySelector('.el-input__inner');
        const sortInput = formItems[4].querySelector('.el-input__inner');
        nameInput.value = `zz-test-${ Math.round(Math.random() * 0xffff).toString(16).padStart(4, 0) }`;
        sortInput.value = Math.round(Math.random() * 10);
        // 需要通过 input 元素 dispatch 触发校验
        const event = new Event('input', { bubbles: true });
        nameInput.dispatchEvent(event);
        sortInput.dispatchEvent(event);
    });
    // 上传文件,这部分要通过 puppeteer 模拟实现
    const fileInput = await page.waitForSelector('input[type=file]');
    await fileInput.uploadFile('./cover.jpg');
    const saveBtn = await page.waitForSelector('.el-dialog__footer .el-button');
    saveBtn.click();
};

(async () => {
    // 创建浏览器
    browser = await puppeteer.launch({
        headless: false,
        // args: ['--window-size=1600,900']
        args: ['--start-maximized']
    });
    // 等待统一门户登录,并打开移动运营中心PC管理端
    await loginUnifiedPortal();
    // 操作运营中心
    await operaMobileManage();
})()