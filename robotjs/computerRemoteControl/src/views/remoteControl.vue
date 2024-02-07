<template>
    <div class="control">
        <div class="direction">
            <i class="center" draggable="true" @touchstart="touchstartFunc" @touchmove="touchmoveFunc" @touchend="touchendFunc">触摸板</i>
        </div>
        <div class="mouse-key">
            <button class="mouse-btn left" @click="mouseClick('left')">左键</button>
            <button class="mouse-btn right" @click="mouseClick('right')">右键</button>
        </div>
        <div class="keyboard">
            <div class="keyboard-row">
                <button v-for="c in 'qwertyuiop'.toUpperCase()" @touchstart="keydown(c)" @touchend="keyup(c)">{{ c }}</button>
            </div>
            <div class="keyboard-row">
                <button v-for="c in 'asdfghjkl'.toUpperCase()" @touchstart="keydown(c)" @touchend="keyup(c)">{{ c }}</button>
            </div>
            <div class="keyboard-row">
                <button v-for="c in 'zxcvbnm'.toUpperCase()" @touchstart="keydown(c)" @touchend="keyup(c)">{{ c }}</button>
                <button @touchstart="keydown('backspace')" @touchend="keyup('backspace')">←</button>
            </div>
        </div>
    </div>
</template>
<script setup>
// import io from 'socket.io-client';
import { ref, onMounted, onUnmounted } from 'vue';
// const socket = io('http://localhost:3000', { withCredentials: true });
let ws = null;

const shiftEnable = ref(false);

const touchData = {
    enable: false,
    mouseStartX: 0,
    mouseStartY: 0,
    screenX: 0,
    screenY: 0,
    prevTouchendTime: 0
};
const touchstartFunc = e => {
    e?.preventDefault();
    const { screenX, screenY } = e.touches[0];
    touchData.screenX = screenX;
    touchData.screenY = screenY;
    touchData.enable = true;
    ws.send(JSON.stringify({ operate: 'getMousePosition' }));
};
const touchmoveFunc = e => {
    e?.preventDefault();
    if (touchData.enable) {
        const { screenX, screenY } = e.touches[0];
        const x = touchData.mouseStartX + (screenX - touchData.screenX) * 1.5;
        const y = touchData.mouseStartY + (screenY - touchData.screenY) * 1.5;
        ws.send(JSON.stringify({ operate: 'mouseMove', x, y }));
    }
};
const touchendFunc = e => {
    e?.preventDefault();
    touchData.enable = false;
    const now = new Date().getTime();
    now - touchData.prevTouchendTime < 300 && mouseClick('left');
    touchData.prevTouchendTime = new Date().getTime();
};

const mouseClick = keyType => ws.send(JSON.stringify({ operate: 'mouseClick', keyType }));

const keydown = key => ws.send(JSON.stringify({ operate: 'keydown', key }));

const keyup = key => ws.send(JSON.stringify({ operate: 'keyup', key }));

onMounted(() => {
    ws = new WebSocket('ws://10.10.4.53:3000');
    ws.addEventListener('message', e => {
        const sendData = JSON.parse(e.data);
        if (sendData.operate === 'getMousePosition') {
            touchData.mouseStartX = sendData.x;
            touchData.mouseStartY = sendData.y;
        }
    });
});

</script>
<style lang="scss" scoped>
.control {
    height: 100vh;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: minmax(0, 100vw) min-content minmax(0, 1fr);
    .direction {
        position: relative;
        .center {
            position: absolute;
            // width: 60vw;
            // height: 60vw;
            width: 100%;
            height: 100%;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            margin: auto;
            font-size: 7.5vw;
            cursor: move;
            display: grid;
            align-items: center;
            justify-items: center;
            font-style: normal;
        }
    }
    .mouse-key {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        height: 15vw;
        .mouse-btn {
            border: 1px solid;
            font-size: 5vw;
        }
    }
    .keyboard {
        margin-top: 2vw;
        .keyboard-row {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(0, min-content));
            // grid-column-gap: 1vw;
            justify-content: center;
            margin-bottom: 1vw;
        }
        button {
            font-size: 4vw;
            width: 8vw;
            line-height: 10vw;
            margin: 0 0.5vw;
            // text-align: center;
            &.shift {
                font-size: 2vw;
                display: grid;
                line-height: 0;
                align-items: center;
                &.enable {
                    font-size: 2vw;
                    color: white;
                    background-color: #409EFF;
                }
            }
        }
    }
}
</style>
