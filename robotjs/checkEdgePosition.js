const Jimp = require('jimp');
const fs = require('fs');

const computeImgFinger = buffer => {
    const average = buffer.reduce((x, y) => x + y, 0) / buffer.length;
    buffer = buffer.map(n => n >= average ? 1 : 0);
    return buffer.join('');
};

const computeTargetPosition = async () => {
    const [beforeImage, afterImage] = await Promise.all([
        new Promise(resolve => Jimp.read('input0.png', (err, image) => resolve(image))),
        new Promise(resolve => Jimp.read('input1.png', (err, image) => resolve(image)))
    ]);
    const { width, height } = beforeImage.bitmap;
    const top = (() => {
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = y * width * 4 + x * 4;
                const beforeR = beforeImage.bitmap.data[index];
                const beforeG = beforeImage.bitmap.data[index + 1];
                const beforeB = beforeImage.bitmap.data[index + 2];
                // const beforeA = beforeImage.bitmap.data[index + 3] / 255;
                const afterR = afterImage.bitmap.data[index];
                const afterG = afterImage.bitmap.data[index + 1];
                const afterB = afterImage.bitmap.data[index + 2];
                // const afterA = afterImage.bitmap.data[index + 3] / 255;
                if (beforeR !== afterR || beforeG !== afterG || beforeB !== afterB) {
                    return y;
                }
            }
        }
    })();
    const left = (() => {
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const index = y * width * 4 + x * 4;
                const beforeR = beforeImage.bitmap.data[index];
                const beforeG = beforeImage.bitmap.data[index + 1];
                const beforeB = beforeImage.bitmap.data[index + 2];
                // const beforeA = beforeImage.bitmap.data[index + 3] / 255;
                const afterR = afterImage.bitmap.data[index];
                const afterG = afterImage.bitmap.data[index + 1];
                const afterB = afterImage.bitmap.data[index + 2];
                // const afterA = afterImage.bitmap.data[index + 3] / 255;
                if (beforeR !== afterR || beforeG !== afterG || beforeB !== afterB) {
                    return x;
                }
            }
        }
    })();
    const bottom = (() => {
        for (let y = height - 1; y >= 0; y--) {
            for (let x = 0; x < width; x++) {
                const index = y * width * 4 + x * 4;
                const beforeR = beforeImage.bitmap.data[index];
                const beforeG = beforeImage.bitmap.data[index + 1];
                const beforeB = beforeImage.bitmap.data[index + 2];
                // const beforeA = beforeImage.bitmap.data[index + 3] / 255;
                const afterR = afterImage.bitmap.data[index];
                const afterG = afterImage.bitmap.data[index + 1];
                const afterB = afterImage.bitmap.data[index + 2];
                // const afterA = afterImage.bitmap.data[index + 3] / 255;
                if (beforeR !== afterR || beforeG !== afterG || beforeB !== afterB) {
                    return y;
                }
            }
        }
    })();
    const right = (() => {
        for (let x = left; x < width; x++) {
            let different = false;
            for (let y = 0; y < height; y++) {
                const index = y * width * 4 + x * 4;
                const beforeR = beforeImage.bitmap.data[index];
                const beforeG = beforeImage.bitmap.data[index + 1];
                const beforeB = beforeImage.bitmap.data[index + 2];
                // const beforeA = beforeImage.bitmap.data[index + 3] / 255;
                const afterR = afterImage.bitmap.data[index];
                const afterG = afterImage.bitmap.data[index + 1];
                const afterB = afterImage.bitmap.data[index + 2];
                // const afterA = afterImage.bitmap.data[index + 3] / 255;
                if (beforeR !== afterR || beforeG !== afterG || beforeB !== afterB) {
                    different = true;
                    break;
                }
            }
            if (!different) {
                return x;
            }
        }
    })();
    const startPixelData = [];
    const blockWidth = right - left;
    const blockHeight = bottom - top;
    for (let y = top; y < bottom; y++) {
        for (let x = left; x < right; x++) {
            const index = y * width * 4 + x * 4;
            const r = beforeImage.bitmap.data[index + 0];
            const g = beforeImage.bitmap.data[index + 1];
            const b = beforeImage.bitmap.data[index + 2];
            const a = beforeImage.bitmap.data[index + 3];
            startPixelData.push(r, g, b, a);
        }
    }
    const targetFinger = computeImgFinger(startPixelData);
    const compareArray = [];
    let moveArea;
    for (let x = right; x < width - blockWidth; x++) {
        moveArea = [];
        for (let y = top; y < bottom; y++) {
            for (i = 0; i < blockWidth; i++) {
                const index = y * width * 4 + (x + i) * 4;
                const r = beforeImage.bitmap.data[index + 0];
                const g = beforeImage.bitmap.data[index + 1];
                const b = beforeImage.bitmap.data[index + 2];
                const a = beforeImage.bitmap.data[index + 3];
                moveArea.push(r, g, b, 255);
            }
        }
        const finger = computeImgFinger(moveArea);
        const score = [...finger].reduce((x, y, i) => x + (y === targetFinger[i] ? 1 : -1), 0)
        compareArray.push({ x, score });
    }
    compareArray.sort((x, y) => y.score - x.score);
    return compareArray[0].x;
};