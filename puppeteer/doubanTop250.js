// 爬去百度搜索结果
const puppeteer = require('puppeteer');
const fs = require('fs');
// 浏览器对象
let browser;
// 页面对象
let page;
// 爬取某一页数据方法
const doubanTop250 = async pageNum => {
    // 转到搜索结果页面
    await page.goto(`https://movie.douban.com/top250?start=${ (pageNum - 1) * 25 }&filter=`);
    // 等待搜索结果页面加载完成
    await page.waitForSelector('.article ol li .item');
    // 解析页面结构
    return page.evaluate(() => {
        // 查找目标元素
        const records = [...document.querySelectorAll('.article ol li .item')];
        // 遍历元素数组
        return records.map((record, index) => {
            // 查找对应链接,封面,标题,描述,排名元素
            const link = record.querySelector('.info .hd a')?.href;
            const cover = record.querySelector('.pic img')?.src;
            const title = record.querySelector('.info .hd a .title')?.innerText;
            const description = record.querySelector('.info .bd')?.innerText;
            const rank = record.querySelector('.pic em')?.innerText;
            return { link, cover, title, description, rank };
        });
    });
};
(async () => {
    // 创建浏览器
    browser = await puppeteer.launch({ headless: false, args: [`--window-size=1600,900`] });
    // 打开页面
    page = await browser.newPage();
    // 保存爬虫结果的数组
    let spiderResults = [];
    for (let pageNum = 1; pageNum <= 10; pageNum++) {
        // 调用 doubanTop250 函数读取每一张页面的元素
        spiderResults = [...spiderResults, ...await doubanTop250(pageNum)];
    }
    // 将元素写入 .json 文件
    fs.writeFile('./doubanTop250.json', JSON.stringify(spiderResults, null, 4), 'utf8', err => !err && console.log('保存成功'));
})();