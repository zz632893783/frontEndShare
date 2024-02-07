const Jimp = require('jimp');
const fs = require('fs');

const computeImgFinger = buffer => {
    const average = buffer.reduce((x, y) => x + y, 0) / buffer.length;
    buffer = buffer.map(n => n >= average ? 1 : 0);
    return buffer.join('');
};

const computeTargetPosition = async (beforeImageData, afterImageData) => {
    const { width, height } = beforeImageData;
    beforeImageData = beforeImageData.data;
    afterImageData = afterImageData.data;
    const top = (() => {
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = y * width * 4 + x * 4;
                const beforeR = beforeImageData[index];
                const beforeG = beforeImageData[index + 1];
                const beforeB = beforeImageData[index + 2];
                // const beforeA = beforeImageData[index + 3] / 255;
                const afterR = afterImageData[index];
                const afterG = afterImageData[index + 1];
                const afterB = afterImageData[index + 2];
                // const afterA = afterImageData[index + 3] / 255;
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
                const beforeR = beforeImageData[index];
                const beforeG = beforeImageData[index + 1];
                const beforeB = beforeImageData[index + 2];
                // const beforeA = beforeImageData[index + 3] / 255;
                const afterR = afterImageData[index];
                const afterG = afterImageData[index + 1];
                const afterB = afterImageData[index + 2];
                // const afterA = afterImageData[index + 3] / 255;
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
                const beforeR = beforeImageData[index];
                const beforeG = beforeImageData[index + 1];
                const beforeB = beforeImageData[index + 2];
                // const beforeA = beforeImageData[index + 3] / 255;
                const afterR = afterImageData[index];
                const afterG = afterImageData[index + 1];
                const afterB = afterImageData[index + 2];
                // const afterA = afterImageData[index + 3] / 255;
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
                const beforeR = beforeImageData[index];
                const beforeG = beforeImageData[index + 1];
                const beforeB = beforeImageData[index + 2];
                // const beforeA = beforeImageData[index + 3] / 255;
                const afterR = afterImageData[index];
                const afterG = afterImageData[index + 1];
                const afterB = afterImageData[index + 2];
                // const afterA = afterImageData[index + 3] / 255;
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
            const r = beforeImageData[index + 0];
            const g = beforeImageData[index + 1];
            const b = beforeImageData[index + 2];
            const a = beforeImageData[index + 3];
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
                const r = beforeImageData[index + 0];
                const g = beforeImageData[index + 1];
                const b = beforeImageData[index + 2];
                const a = beforeImageData[index + 3];
                moveArea.push(r, g, b, 255);
            }
        }
        const finger = computeImgFinger(moveArea);
        const score = [...finger].reduce((x, y, i) => x + (y === targetFinger[i] ? 1 : -1), 0);
        compareArray.push({ x, score });
    }
    compareArray.sort((x, y) => y.score - x.score);
    return compareArray[0].x - left;
};

module.exports = {
	computeTargetPosition
};