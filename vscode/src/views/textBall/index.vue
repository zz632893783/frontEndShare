<template>
    <div class="page">
        <div
            class="three-d-ball"
            :style="`width: ${containerSize.width}px; height: ${containerSize.height}px;`"
            @mousedown="mousedownFunc($event)"
            @mousemove="mousemoveFunc($event)"
            @mouseup="moveData.enable = false"
            @mouseleave="moveData.enable = false"
            @mousewheel="mousewheelFunc($event)"
        >
            <div class="point" v-for="(item, index) in pointList" :key="index" :style="computePointStyle(item)">
                <div class="container" v-bind:style="item.style">{{item.content}}</div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

let animation
const distance = 1000
const ballRadius =  170
const containerSize = {  width: 400, height: 400 }
const latitudeLine = [
    {
        count: 1,
        angleOffset: 10
    },
    {
        count: 4,
        angleOffset: 20
    },
    {
        count: 8,
        angleOffset: 30
    },
    {
        count: 12,
        angleOffset: 40
    },
    {
        count: 14,
        angleOffset: 50
    },
    {
        count: 16,
        angleOffset: 60
    },
    {
        count: 14,
        angleOffset: 70
    },
    {
        count: 12,
        angleOffset: 80
    },
    {
        count: 8,
        angleOffset: 90
    },
    {
        count: 4,
        angleOffset: 100
    },
    {
        count: 1,
        angleOffset: 0
    }
]

const pointList = ref([])
const moveData = ref({ enable: false, clientX: 0, clientY: 0 })
const autoRotateSpeed = ref({ x: 1, y: 1, z: 1 })
const opacityStops = [
    {
        offset: 0,
        opacity: 1
    },
    {
        offset: 0.5,
        opacity: 0
    },
    {
        offset: 1,
        opacity: 0.25
    }
]
let timer = null
// const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722']
const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFC107', '#FF9800', '#FF5722']
const words = ['明华花园', '五水共治', '消防安全', '城管执法', '市政绿化', '市场监管', '宁东北苑', '二桥村桥园路', '王伟', '李云龙', '楚云飞', '刘琳琳', '范丞丞', '秦水生', '垃圾分类', '社保']

const mousewheelFunc = event => {
    if (event.wheelDeltaY < 0) {
        rotate('z', -5 / 180 * Math.PI)
        autoRotateSpeed.value.z = -1
    } else if (event.wheelDeltaY > 0) {
        rotate('z', 5 / 180 * Math.PI)
        autoRotateSpeed.value.z = 1
    }
}
const mousedownFunc = event => {
    moveData.value.enable = true
    moveData.value.clientX = event.clientX
    moveData.value.clientY = event.clientY
}
const mousemoveFunc = event => {
    if (moveData.value.enable) {
        const x = event.clientX - moveData.value.clientX
        if (x > 0) {
            autoRotateSpeed.value.y = 1
        } else if (x < 0) {
            autoRotateSpeed.value.y = -1
        }
        rotate('y', x / 180 / 2 * Math.PI)
        const y = event.clientY - moveData.value.clientY
        if (y > 0) {
            autoRotateSpeed.value.x = 1
        } else if (y < 0) {
            autoRotateSpeed.value.x = -1
        }
        rotate('x', y / 180 / 2 * Math.PI)
        moveData.value.clientX = event.clientX
        moveData.value.clientY = event.clientY
    }
}
const createPoint = () => {
    pointList.value = [{
        x: 0,
        y: ballRadius,
        z: 0
    }]
    for (let i = 1; i < latitudeLine.length - 1; i++) {
        let angle = 180 / (latitudeLine.length - 1) * i
        const radius = Math.sin(angle / 180 * Math.PI) * ballRadius
        const y = Math.cos(angle / 180 * Math.PI) * ballRadius
        for (let j = 0; j < latitudeLine[i].count; j++) {
            angle = 360 / latitudeLine[i].count * j + latitudeLine[i].angleOffset
            const x = Math.cos(angle / 180 * Math.PI) * radius
            const z = Math.sin(angle / 180 * Math.PI) * radius
            pointList.value.push({ x, y, z })
        }
    }
    pointList.value.push({
        x: 0,
        y: -ballRadius,
        z: 0
    })
}
const computePointStyle = item => {
    const xA = 0
    const yA = 0
    const zA = distance
    const xG = item.x
    const yG = item.y
    const zG = item.z
    const x = (xG - xA) * zA / (zA - zG)
    const y = (yG - yA) * zA / (zA - zG)
    const progress = (ballRadius - item.z) / (ballRadius * 2)
    let index = 0
    for (let i = 0; i < opacityStops.length - 1; i++) {
        if (opacityStops[i].offset <= progress && opacityStops[i + 1].offset >= progress) {
            index = i
            break
        }
    }
    const opacity = opacityStops[index].opacity - (progress - opacityStops[index].offset) / (opacityStops[index + 1].offset - opacityStops[index].offset) * (opacityStops[index].opacity - opacityStops[index + 1].opacity)
    return {
        left: `${x + containerSize.width / 2}px`,
        top: `${(containerSize.height - y) - containerSize.height / 2}px`,
        transform: `scale(${distance / (distance - item.z)}) translateZ(0)`,
        opacity
    }
}
const rotate = (type, rotateAngle) => {
    switch (type) {
        case 'x':
            pointList.value.forEach(item => {
                let angle
                const radius = Math.pow(Math.pow(item.y, 2) + Math.pow(item.z, 2), 1 / 2)
                if (radius === 0) {
                    return false
                }
                if (item.z >= 0 && item.y >= 0) {
                    angle = Math.asin(Math.abs(item.y / radius))
                } else if (item.z <= 0 && item.y >= 0) {
                    angle = Math.PI - Math.asin(Math.abs(item.y / radius))
                } else if (item.z <= 0 && item.y <= 0) {
                    angle = Math.PI + Math.asin(Math.abs(item.y / radius))
                } else {
                    angle = 2 * Math.PI - Math.asin(Math.abs(item.y / radius))
                }
                item.y = Math.sin(angle - rotateAngle) * radius
                item.z = Math.cos(angle - rotateAngle) * radius
            })
            break
        case 'y':
            pointList.value.forEach(item => {
                let angle
                const radius = Math.pow(Math.pow(item.x, 2) + Math.pow(item.z, 2), 1 / 2)
                if (radius === 0) {
                    return false
                }
                if (item.x >= 0 && item.z >= 0) {
                    angle = Math.asin(Math.abs(item.z / radius))
                } else if (item.x <= 0 && item.z >= 0) {
                    angle = Math.PI - Math.asin(Math.abs(item.z / radius))
                } else if (item.x <= 0 && item.z <= 0) {
                    angle = Math.PI + Math.asin(Math.abs(item.z / radius))
                } else {
                    angle = 2 * Math.PI - Math.asin(Math.abs(item.z / radius))
                }
                item.z = Math.sin(angle - rotateAngle) * radius
                item.x = Math.cos(angle - rotateAngle) * radius
            })
            break
        case 'z':
            pointList.value.forEach(item => {
                let angle
                const radius = Math.pow(Math.pow(item.x, 2) + Math.pow(item.y, 2), 1 / 2)
                if (radius === 0) {
                    return false
                }
                if (item.x >= 0 && item.y >= 0) {
                    angle = Math.asin(Math.abs(item.y / radius))
                } else if (item.x <= 0 && item.y >= 0) {
                    angle = Math.PI - Math.asin(Math.abs(item.y / radius))
                } else if (item.x <= 0 && item.y <= 0) {
                    angle = Math.PI + Math.asin(Math.abs(item.y / radius))
                } else {
                    angle = 2 * Math.PI - Math.asin(Math.abs(item.y / radius))
                }
                item.y = Math.sin(angle + rotateAngle) * radius
                item.x = Math.cos(angle + rotateAngle) * radius
            })
            break
    }
}

const computeContent = () => {
    pointList.value.forEach(item => {
        item.content = words[parseInt(Math.random() * words.length)]
        item.style = {
            color: colors[parseInt(colors.length * Math.random())]
            // fontSize: `${12 + Math.round(Math.random() * 16)}px`
            // fontSize: `${12 + Math.round(Math.random() * 12)}px`
        }
    })
}

const setAnimation = () => {
    animation = window.requestAnimationFrame(setAnimation)
    if (!moveData.value.enable) {
        rotate('x', autoRotateSpeed.value.x / 180 / 8 * Math.PI)
        rotate('y', autoRotateSpeed.value.y / 180 / 8 * Math.PI)
        rotate('z', autoRotateSpeed.value.z / 180 / 8 * Math.PI)
    }
}

onMounted(() => {
    createPoint()
    computeContent()
    window.cancelAnimationFrame(animation)
    setAnimation()
})

onBeforeUnmount(() => window.cancelAnimationFrame(animation))
</script>
<style lang="scss" scoped>
.page {
    width: 100%;
    height: 100%;
    display: grid;
    align-items: center;
    justify-items: center;
    background-color: rgba(0, 0, 0, 0.1);
}
.three-d-ball {
    position: relative;

    .point {
        position: absolute;
        user-select: none;

        .container {
            white-space: nowrap;
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            // transform: translate(-50%, calc(-50% + 1px)) rotate(0.1deg);
        }
    }

    .control {
        position: fixed;
        left: 100px;
        bottom: 100px;
    }
}
</style>