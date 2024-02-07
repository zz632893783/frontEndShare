const robot = require('robotjs');

setTimeout(async () => {
	robot.moveMouse(400, 400);
	robot.mouseClick('left', true);
	await new Promise(resolve => setTimeout(resolve, 3000));
    robot.keyTap('a',['control']);
    const inputStr = [...'Hello World'];
    for (let i = 0; i < inputStr.length; i++) {
    	if (inputStr[i] === ' ') {
    		robot.keyTap(' ');
    	}
		await new Promise(resolve => setTimeout(resolve, 200));
    	robot.keyTap(inputStr[i]);
    }
	robot.keyTap(' ');
}, 2 * 1000);