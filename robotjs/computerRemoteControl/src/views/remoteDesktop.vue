<template>
    <div class="remote-desktop" @click="initStreamDesktop" @contextmenu.prevent @keydown="keydownFunc" contenteditable="true" @mousedown="mousedownFunc" @mousemove="mousemoveFunc">
        <!-- <canvas ref="canvasRef" :width="canvasSize.width" :height="canvasSize.height"></canvas> -->
        <video ref="videoRef" controls src="http://10.10.4.53:8090/live/desktopLive.flv" autoplay></video>
    </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import flvjs from 'flv.js';
const videoRef = ref();
let state = 'stop';
let ws = null;
// let ctx = null;
// let loadImage = null;
// const canvasRef = ref();
// 视频流方式
// 需要将 video 的 src 属性设置为 http://localhost:8090/live/desktopLive.flv
const initStreamDesktop = () => {
    if (state === 'stop') {
        state = 'play';
        if (window.innerWidth / 1920 * 1080 > window.innerHeight) {
            videoRef.value.height = window.innerHeight;
            videoRef.value.width = window.innerHeight / 1080 * 1920;
        } else {
            videoRef.value.width = window.innerWidth;
            videoRef.value.height = window.innerWidth / 1920 * 1080;
        }
        videoRef.value.play();
        const flvPlayer = flvjs.createPlayer({
            type: 'flv',
            url: 'http://10.10.4.53:8090/live/desktopLive.flv'
        });
        flvPlayer.attachMediaElement(videoRef.value);
        flvPlayer.load();
        flvPlayer.play();
    }
};

const keydownFunc = async e => {
    ws.send(JSON.stringify({ operate: 'keydown', key: e.key }));
    await Promise.resolve();
    ws.send(JSON.stringify({ operate: 'keyup', key: e.key }));
};

const mousedownFunc = e => {
    if (Number(e.which) === 1) {
        // 点击了左键
        ws.send(JSON.stringify({ operate: 'mouseClick', keyType: 'left' }));
    } else if (Number(e.which) === 3) {
        // 点击了右键
        ws.send(JSON.stringify({ operate: 'mouseClick', keyType: 'right' }));
    }
};

const mousemoveFunc = e => {
    if (state === 'play') {
        const { offsetX, offsetY } = e;
        const x = offsetX / videoRef.value.width * 1920;
        const y = offsetY / videoRef.value.height * 1080;
        ws.send(JSON.stringify({ operate: 'mouseMove', x, y }));
    }
};

onMounted(() => {
    ws = new WebSocket('ws://10.10.4.53:3000');
});
</script>
<style lang="scss" scoped>
.remote-desktop {
    background-color: black;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    video {
        pointer-events: none;
        // position: fixed;
        // top: 50%;
        // left: 50%;
        // transform: translate(-50%, -50%);
        border: 1px solid red;
    }
}
</style>