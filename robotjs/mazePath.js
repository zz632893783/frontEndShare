const robot = require('robotjs');
// 迷宫自动寻路
const unitSize = 32;
const lineWidth = 4;
// const cols = 114;sassddwd
// const rows = 54;
const cols = 30;
const rows = 20;
const screenX = 0;
// const screenY = 109;
const screenY = 88;
// const screenY = 129;
let visibileCache = { '0,0': true };
const startPoint = { x: 0, y: 0 };
let mazePhoto = robot.screen.capture(screenX, screenY, unitSize * cols, unitSize * rows).image;
let paths = [{ x: 0, y: 0 }];
robot.moveMouse(200, 200);
robot.mouseClick('left', false);
// function findPath () {
// 	const lastPoint = paths[paths.length - 1];
// 	const direction =
// }
// console.log(robot.getPixelColor(screenX + lineWidth + (unitSize - lineWidth) / 2, screenY + lineWidth + (unitSize - lineWidth) / 2));
function findDirection (point) {
	point.direction = [];
	if (point.x > 0 && !visibileCache[`${point.x - 1},${point.y}`]) {
		const xPixel = point.x * unitSize;
		const yPixel = point.y * unitSize + lineWidth + (unitSize - lineWidth) / 2;
		const index = yPixel * cols * unitSize * 4 + xPixel * 4;
		const color = [0, 1, 2].map(n => mazePhoto[index + n].toString(16).padStart(2, 0)).join('');
		if (color === 'ffffff') {
			point.direction.push('left');
			// visibileCache[`${point.x - 1},${point.y}`] = true;
		}
	}
	if (point.x < cols - 1 && !visibileCache[`${point.x + 1},${point.y}`]) {
		const xPixel = point.x * unitSize + unitSize + lineWidth / 2;
		const yPixel = point.y * unitSize + lineWidth + (unitSize - lineWidth) / 2;
		const index = yPixel * cols * unitSize * 4 + xPixel * 4;
		const color = [0, 1, 2].map(n => mazePhoto[index + n].toString(16).padStart(2, 0)).join('');
		if (color === 'ffffff') {
			point.direction.push('right');
			// visibileCache[`${point.x + 1},${point.y}`] = true;
		}
	}
	if (point.y > 0 && !visibileCache[`${point.x},${point.y - 1}`]) {
		const xPixel = point.x * unitSize + lineWidth + (unitSize - lineWidth) / 2;
		const yPixel = point.y * unitSize + lineWidth / 2;
		const index = yPixel * cols * unitSize * 4 + xPixel * 4;
		const color = [0, 1, 2].map(n => mazePhoto[index + n].toString(16).padStart(2, 0)).join('');
		if (color === 'ffffff') {
			point.direction.push('top');
			// visibileCache[`${point.x},${point.y - 1}`] = true;
		}
	}
	if (point.y < rows - 1 && !visibileCache[`${point.x},${point.y + 1}`]) {
		const xPixel = point.x * unitSize + lineWidth + (unitSize - lineWidth) / 2;
		const yPixel = point.y * unitSize + unitSize + lineWidth / 2;
		const index = yPixel * cols * unitSize * 4 + xPixel * 4;
		const color = [0, 1, 2].map(n => mazePhoto[index + n].toString(16).padStart(2, 0)).join('');
		if (color === 'ffffff') {
			point.direction.push('bottom');
			// visibileCache[`${point.x},${point.y + 1}`] = true;
		}
	}
	// console.log(visibileCache);
}
let timer = null;
function findPath () {
	const lastPoint = paths[paths.length - 1];
	if (lastPoint.x === cols - 1 && lastPoint.y === rows - 1) {
		const operates = [];
		for (let i = 1; i < paths.length; i++) {
			const prev = paths[i - 1];
			const next = paths[i];
			if (prev.y === next.y) {
				operates.push(next.x < prev.x ? 'a' : 'd');
			}
			if (prev.x === next.x) {
				operates.push(next.y < prev.y ? 'w' : 's');
			}
		}
		timer = setInterval(() => {
			const operate = operates.shift();
			robot.keyTap(operate);
			if (!operates.length) {
				clearInterval(timer);
				visibileCache = { '0,0': true };
				paths = [{ x: 0, y: 0 }];
				mazePhoto = robot.screen.capture(screenX, screenY, unitSize * cols, unitSize * rows).image;
				timer = setInterval(() => {
					const startPointColor = robot.getPixelColor(screenX + lineWidth + (unitSize - lineWidth) / 2, screenY + lineWidth + (unitSize - lineWidth) / 2);
					if (startPointColor === 'ff0000') {
						setTimeout(findPath, 0);
						clearInterval(timer);
					}
				}, 100)
			}
		}, 20);
		return false;
	}
	!lastPoint.direction && findDirection(lastPoint);
	if (lastPoint.direction.length) {
		const direction = lastPoint.direction.shift();
		let point;
		switch (direction) {
			case 'left':
				point = { x: lastPoint.x - 1, y: lastPoint.y };
				break;
			case 'right':
				point = { x: lastPoint.x + 1, y: lastPoint.y };
				break;
			case 'top':
				point = { x: lastPoint.x, y: lastPoint.y - 1 };
				break;
			case 'bottom':
				point = { x: lastPoint.x, y: lastPoint.y + 1 };
				break;
		}
		visibileCache[`${point.x},${point.y}`] = true;
		paths.push(point);
		findPath();
	} else {
		const tempArr = paths.filter(n => !!n.direction.length);
		const index = paths.findIndex(n => n === tempArr[tempArr.length - 1]);
		paths.splice(index + 1);
		findPath();
	}
};
setTimeout(findPath, 100);