// 爬去百度搜索结果
const puppeteer = require('puppeteer');
const fs = require('fs');
// 浏览器对象
let browser;
// 页面对象
let page;
// 用户名
const userName = 'v10001';
// 密码
const password = 'Zrx@2020';
// 登录禅道
const loginZentao = async () => {
    // 跳转到登录页面
    await page.goto('http://10.10.120.20:8089/zentao/user-login.html');
    // 等待登录表单加载完成
    await page.waitForSelector('#loginPanel');
    // 解析页面结构（evaluate 内部回调函数无法直接获取外部变量）
    await page.evaluate(({ userName, password }) => {
        const userNameInput = document.querySelector('.table-row form tbody tr:nth-child(1) input');
        const passwordInput = document.querySelector('.table-row form tbody tr:nth-child(2) input');
        userNameInput.value = userName;
        passwordInput.value = password;
    }, { userName, password });
    // 获取登录按钮
    const loginBtn = await page.waitForSelector('#submit');
    // 点击登录
    loginBtn.click();
};
// 打开日志页面
const openCalendar = async () => {
    // 等待页面加载
    await page.waitForSelector('#subNavbar ul li:nth-child(2)');
    // 操作点击的按钮，需要是一个可见元素，这里将元素 display 设置为 block 可见
    await page.evaluate(() => (document.querySelector('#subNavbar ul li:nth-child(2) ul').style.display = 'block'));
    const calendarBtn = await page.waitForSelector('#subNavbar ul li:nth-child(2) .dropdown-menu li:nth-child(2) a');
    calendarBtn.click();
};
const parseJournal = async (start = '2023-11-15', end = '2024-01-26', save = true) => {
    await page.waitForSelector('.calendar-caption');
    await Promise.resolve();
    // 解析日历中当前月份元素
    let currentYearMonth = await page.evaluate(() => document.querySelector('.calendar-caption').innerText);
    // 获取当前月份
    const [year, month] = currentYearMonth.split(/年|月|-/).filter(n => !!n).map((n, i) => n - (i === 1 ? 1 : 0));
    // 获取开始月份
    const [startYear, startMonth, startDate] = start.split(/年|月|-/).filter(n => !!n).map((n, i) => n - (i === 1 ? 1 : 0));
    // 获取结束月份
    const [endYear, endMonth, endDate] = end.split(/年|月|-/).filter(n => !!n).map((n, i) => n - (i === 1 ? 1 : 0));
    // 如果日志开始日期小于当前月份，往前跳转到合适的月份
    if (year * 12 + month > startYear * 12 + startMonth) {
        const times = (year * 12 + month) - (startYear * 12 + startMonth);
        for (let i = 0; i < times; i++) {
            const prevMonthBtn = await page.waitForSelector('.calender-header .btn-toolbar .btn:nth-child(1)');
            prevMonthBtn.click();
            await new Promise(resolve => setTimeout(resolve, 100));
            // await page.waitForSelector('.month-days');
        }
        // await new Promise(resolve => setTimeout(resolve, times / 5 * 100 + 500));
    }
    // 如果日志开始日期大于当前月份，往后跳转到合适的月份
    if (year * 12 + month < startYear * 12 + startMonth) {
        const times = (startYear * 12 + startMonth) - (year * 12 + month);
        for (let i = 0; i < times; i++) {
            const nextMonthBtn = await page.waitForSelector('.calender-header .btn-toolbar .btn:nth-child(3)');
            nextMonthBtn.click();
            await new Promise(resolve => setTimeout(resolve, 100));
            // await page.waitForSelector('.month-days');
        }
        // await new Promise(resolve => setTimeout(resolve, times / 5 * 100 + 500));
    }
    currentYearMonth = new Date(startYear, startMonth);
    let journalResult = [];
    while (currentYearMonth.getTime() <= new Date(endYear, endMonth)) {
        await page.waitForSelector('.month-days');
        // 过滤单个本月的日志（去除上个月跟下个月多余部分）
        const thisMonthJournal = await page.evaluate(({ startYear, startMonth }) => {
            const currentYearMonth = new Date(startYear, startMonth);
            const cells = [...document.querySelectorAll('.cell-day')];
            const index = cells.findIndex(n => Number(n.querySelector('.heading .number').innerText) < 14);
            // 计算这个月份有多少天
            const thisMonthDayCount = currentYearMonth.getMonth() !== 1 ? ([0, 2, 4, 6, 7, 9, 11].includes(currentYearMonth.getMonth()) ? 31 : 30) : (((currentYearMonth.getFullYear() % 100 === 0 && currentYearMonth.getFullYear() % 400 === 0) || (currentYearMonth.getFullYear() % 100 !== 0 && currentYearMonth.getFullYear() % 4 === 0)) ? 29 : 28);
            return cells.slice(index, index + thisMonthDayCount).map((item, index) => {
                const events = [...item.querySelectorAll('.events .event')];
                return {
                    timestamp: `${ currentYearMonth.getFullYear() }-${ currentYearMonth.getMonth() + 1 }-${ index + 1 }`,
                    // events: events.map(n => {
                    //     return {
                    //         content: n.querySelector('.title').innerText,
                    //         tookTime: n.querySelector('.time').innerText,
                    //     }
                    // })
                    workContent: events.map(n => `${ n.querySelector('.title').innerText } - 花费${ n.querySelector('.time').innerText.replace(/h$/, '小时') }`).join(';')
                }
            });
        }, { startYear: currentYearMonth.getFullYear(), startMonth: currentYearMonth.getMonth() });
        journalResult.push(...thisMonthJournal);
        currentYearMonth.setMonth(currentYearMonth.getMonth() + 1);
        // 每次观察页面元素变化
        await page.evaluate(async () => {
            await new Promise(resolve => {
                // 获取需要观察的元素
                const targetElement = document.querySelector('.month-days');
                const observer = new MutationObserver((mutationsList, observer) => {
                    // 遍历mutation记录
                    for (const mutation of mutationsList) {
                        // 检查是否有子元素的变化
                        if (mutation.type === 'childList') {
                            // 检测到子元素变化后，认为月份切换已完成，停止观察
                            return resolve(observer.disconnect());
                        }
                    };
                });
                // 开始观察
                observer.observe(targetElement, { childList: true, subtree: true });
                // 切换到下个月
                const nextMonthBtn = document.querySelector('.calender-header .btn-toolbar .btn:nth-child(3)');
                nextMonthBtn.click();
            });
        });
    }
    journalResult = journalResult.filter(n => new Date(n.timestamp) >= new Date(start) && new Date(n.timestamp) <= new Date(end))
    save && fs.writeFileSync('result.json', JSON.stringify(journalResult), err => {});
    return journalResult;
};
(async () => {
    // 创建浏览器
    browser = await puppeteer.launch({ headless: false, args: ['--start-maximized'] });
    // 创建页面对象
    page = await browser.newPage();
    // 设置窗口
    await page.setViewport({ width: 1600, height: 900 });
    // 保存爬虫结果的数组
    await loginZentao();
    await openCalendar();
    const result = await parseJournal('2024-1-29', '2024-2-4');
    const sendMessage = `这是我这周的工作内容\n${ result.map(n => n.workContent).join('\n') }\n帮我总结一份周报`;
    // 将元素写入 .json 文件
})();