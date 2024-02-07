const WebSocket = require('ws');
const robot = require('robotjs');
const { exec } = require('child_process');
const screenshot = require('screenshot-desktop');
const NodeMediaServer= require('node-media-server');

const wss = new WebSocket.Server({ port: 3000 });

const config = {
    rtmp: {
        port: 1935,
        chunk_size: 512,
        gop_cache: true,
        ping: 25,
        ping_timeout: 10
    },
    http: {
        port: 8090,
        allow_origin: '*'
    }
};
const nms = new NodeMediaServer(config);
nms.run();

wss.on('connection', ws => {
    ws.on('message', message => {
        message = JSON.parse(message);
        if (message.operate === 'mouseOffset') {
            console.log('鼠标移动', message.offsetX, message.offsetY);
            const {x, y} = robot.getMousePos()
            robot.moveMouse(x + message.offsetX, y + message.offsetY);
        }
        if (message.operate === 'mouseClick') {
            console.log('鼠标点击');
            robot.mouseClick(message.keyType, false);
        }
        if (message.operate === 'getMousePosition') {
            const {x, y} = robot.getMousePos();
            ws.send(JSON.stringify({ operate: 'getMousePosition', x, y }));
        }
        if (message.operate === 'mouseMove') {
            robot.moveMouse(message.x, message.y);
        }
        if (message.operate === 'keydown') {
            robot.keyToggle(message.key, 'down');
        }
        if (message.operate === 'keyup') {
            robot.keyToggle(message.key, 'up');
        }
        // if (message.operate === 'getScreenshot') {
        //     const timer = setInterval(() => {
        //         ws.send(JSON.stringify({ operate: 'getScreenshot' }));
        //         screenshot({ format: 'png' }).then(image => {
        //             ws.send(JSON.stringify({
        //                 operate: 'getScreenshot',
        //                 image: `data:image/png;base64,${image.toString('base64')}`
        //             }));
        //         }).catch(error => {});
        //     }, 1000 / 15);
        // }
    });
});
