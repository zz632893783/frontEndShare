const robot = require('robotjs');

setTimeout(async () => {
	robot.moveMouse(600, 500);
	robot.mouseClick('left', false);
	await new Promise(resolve => setTimeout(resolve, 200));
	robot.mouseToggle('down');
	await new Promise(resolve => setTimeout(resolve, 200));
	robot.dragMouse(600, 500);
	for (let i = 0; i < 400; i = i + 2) {
		const v = Math.sin(i / 400 * Math.PI * 2) * 100;
		robot.dragMouse(600 + i, 500 + v);
	}
	robot.mouseToggle('up');
	await new Promise(resolve => setTimeout(resolve, 500));
	const circleCenterX = 660;
	const circleCenterY = 500;
	const radius = 100;
	for (let angle = 0; angle <= 360; angle = angle + 1) {
		const x = circleCenterX + Math.cos(angle / 180 * Math.PI) * radius;
		const y = circleCenterY + Math.sin(angle / 180 * Math.PI) * radius;
		angle === 0 && robot.mouseToggle('down');
		robot.moveMouse(x, y);
		angle === 360 && robot.mouseToggle('up');
	}
}, 2 * 1000);
