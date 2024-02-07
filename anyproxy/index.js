// B 站硬核会员自动答题脚本
// 脚本启动命令
// anyproxy --intercept --silent --rule index.js -i --ignore-unauthorized-ssl
// 导出代理
module.exports = {
    // 监听请求
    *beforeSendResponse(requestDetail, responseDetail) {
        // 羊了个羊替换脚本
        if (/https?:\/\/cat-match\.easygame2021\.com\/sheep\/v1\/game\/map_info_ex/.test(requestDetail.url)) {
            console.log('替换地图数据');
            responseDetail.response.body = JSON.stringify({
                "err_code": 0,
                "err_msg": "",
                "data": {
                    "user_item": 0,
                    "map_md5": ["046ef1bab26e5b9bfe2473ded237b572", "046ef1bab26e5b9bfe2473ded237b572"],
                    "map_seed": [873767995, 2273906736, 3092859239, 2621998234],
                    "map_seed_2": "873767995",
                    "req_id": -1,
                    "title": "",
                    "sync_match_step_to_server": false
                }
            });
        }
    }
};