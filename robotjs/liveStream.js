const NodeMediaServer= require('node-media-server');
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

// ffmpeg -f gdigrab -framerate 20 -i desktop -c:v libx264 -preset veryfast -f flv rtmp://10.10.4.53:1935/live/desktopLive
// ffmpeg -f gdigrab -framerate 20 -i desktop -c:v libx264 -preset ultrafast -tune zerolatency -crf 18 -g 30 -f flv rtmp://10.10.4.53:1935/live/desktopLive
// ffmpeg -f gdigrab -framerate 20 -i desktop -c:v libx264 -preset ultrafast -tune zerolatency -crf 3 -b:v 100k -g 30 -f flv rtmp://10.10.4.53:1935/live/desktopLive
// ffmpeg -f gdigrab -framerate 15 -video_size 1920x1080 -i desktop -c:v libx264 -preset ultrafast -tune zerolatency -crf 3 -b:v 100k -g 15 -f flv rtmp://10.10.4.53:1935/live/desktopLive
// ffmpeg -f gdigrab -framerate 15 -video_size 1920x1080 -i desktop -c:v libx264 -preset ultrafast -tune zerolatency -crf 18 -b:v 80k -g 15 -f flv rtmp://10.10.4.53:1935/live/desktopLive

// http://10.10.4.53:8090/live/desktopLive.flv
// const ffmpeg = require('fluent-ffmpeg');
// const WebSocket = require('ws');

// ffmpeg.setFfmpegPath('ffmpeg'); // 设置ffmpeg的路径

// const wss = new WebSocket.Server({ port: 3000 });

// wss.on('connection', function connection(ws) {
//     console.log('Client connected');

//     ffmpeg('desktop') // 这里'desktop'是ffmpeg的输入设备，代表桌面
//         .outputOptions([
//           // 可能需要的输出选项
//         ])
//         .videoCodec('libx264') // 使用x264编码
//         .pipe(ws, { highWaterMark: 16384 }); // 将视频流通过WebSocket发送
//     ws.on('close', () => {
//         console.log('Client disconnected');
//     });
// });
