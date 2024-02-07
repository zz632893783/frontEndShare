const robot = require('robotjs');

setTimeout(async () => {
	robot.moveMouse(415, 410);
	robot.mouseClick('left', true);
}, 2 * 1000);