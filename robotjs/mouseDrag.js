const robot = require('robotjs');

setTimeout(async () => {
	robot.moveMouse(0, 0);
	robot.mouseToggle('down');
	robot.dragMouse(416, 410);
}, 2 * 1000);
