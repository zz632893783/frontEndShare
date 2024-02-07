const robot = require('robotjs');

setTimeout(async () => {
	robot.moveMouse(400, 400);
	robot.mouseClick('right', false);
	robot.moveMouse(460, 360);
	await new Promise(resolve => setTimeout(resolve, 1000));
	robot.mouseClick('left', false);
	robot.moveMouse(1000, 100);
	robot.mouseClick('right', false);
	await new Promise(resolve => setTimeout(resolve, 1000));
	robot.moveMouse(1020, 120);
	robot.mouseClick('left', false);
}, 2 * 1000);