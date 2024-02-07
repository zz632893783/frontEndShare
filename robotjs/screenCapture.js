// const robot = require('robotjs');
// const Jimp = require('jimp');

// const { image, width, height } = robot.screen.capture(0, 0, 600, 500);
// for (let i = 0; i < width * height * 4; i += 4) {
//     [image[i], image[i + 2]] = [image[i + 2], image[i]];
// }
// new Jimp({ data: image, width, height }, (err, image) => {
//     !err && image.write('./screenshot.png');
// });

const { Screenshots } = require('node-screenshots');
const fs = require('fs');

const capturer = Screenshots.fromPoint(0, 0);

capturer.capture().then(data => fs.writeFileSync('screenshot.png', data));