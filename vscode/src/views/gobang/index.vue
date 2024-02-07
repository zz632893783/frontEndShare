<template>
    <canvas
        ref="myCanvas"
        :width="canvasSize.rowCount * gap"
        :height="canvasSize.colCount * gap"
        @mousemove="setMovePosition($event)"
        @mouseenter="cursor.enable = true"
        @mouseleave="cursor.enable = false"
        @mousedown="computeChessPosition($event)"
    ></canvas>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { ElMessageBox } from 'element-plus'

const myCanvas = ref()

let ctx = null;
const gap = 40
const canvasSize = { rowCount: 15, colCount: 15 }
let cursor = { rowNum: 0, colNum: 0, enable: false }
let lastChess = { rowNum: 0, colNum: 0, enable: false }
let chessList = []
let gameOver = false
let role = 0
let aiRole = 1

const init = () => {
    chessList = []
    cursor = { rowNum: 0, colNum: 0, enable: false }
    lastChess = { rowNum: 0, colNum: 0, enable: false }
    role = 0
    gameOver = false
    ctx = myCanvas.value.getContext('2d')
    draw()
}

const drawChessBoard = () => {
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)'
    for (let i = 0; i <= canvasSize.colCount; i++) {
        ctx.beginPath()
        ctx.moveTo(i * gap + gap / 2, 0 + gap / 2)
        ctx.lineTo(i * gap + gap / 2, canvasSize.rowCount * gap - gap / 2)
        ctx.lineWidth = 1
        ctx.stroke()
        ctx.closePath()
    }
    for (let i = 0; i <= canvasSize.rowCount; i++) {
        ctx.beginPath()
        ctx.moveTo(0 + gap / 2, i * gap + gap / 2)
        ctx.lineTo(canvasSize.rowCount * gap - gap / 2, i * gap + gap / 2)
        ctx.lineWidth = 1
        ctx.stroke()
        ctx.closePath()
    }
    ctx.fillStyle = 'rgba(0, 0, 0, 1)'
    const list = [{ x: 3, y: 3 }, { x: 11, y: 3 }, { x: 3, y: 11 }, { x: 11, y: 11 }, { x: 7, y: 7 }]
    list.forEach(item => {
        ctx.beginPath()
        ctx.arc(item.x * gap + gap / 2, item.y * gap + gap / 2, 5, 0, 2 * Math.PI)
        ctx.closePath()
        ctx.fill()
    })
}

const setMovePosition = event => {
    cursor.enable = true
    cursor.rowNum = parseInt(event.offsetX / gap)
    cursor.colNum = parseInt(event.offsetY / gap)
    draw()
}

const drawCursor = (x, y) => {
    const centerX = x * gap + gap / 2
    const centerY = y * gap + gap / 2
    ctx.strokeStyle = 'rgba(0, 0, 0, 1)'
    // 左上角
    ctx.beginPath()
    ctx.moveTo(centerX - gap / 2, centerY - gap * 0.2)
    ctx.lineTo(centerX - gap / 2, centerY - gap / 2)
    ctx.lineTo(centerX - gap * 0.2, centerY - gap / 2)
    ctx.stroke()
    ctx.closePath()
    // 右上角
    ctx.beginPath()
    ctx.moveTo(centerX + gap * 0.2, centerY - gap / 2)
    ctx.lineTo(centerX + gap / 2, centerY - gap / 2)
    ctx.lineTo(centerX + gap / 2, centerY - gap * 0.2)
    ctx.stroke()
    ctx.closePath()
    // 右下角
    ctx.beginPath()
    ctx.moveTo(centerX + gap / 2, centerY + gap * 0.2)
    ctx.lineTo(centerX + gap / 2, centerY + gap / 2)
    ctx.lineTo(centerX + gap * 0.2, centerY + gap / 2)
    ctx.stroke()
    ctx.closePath()
    // 左下角
    ctx.beginPath()
    ctx.moveTo(centerX - gap * 0.2, centerY + gap / 2)
    ctx.lineTo(centerX - gap / 2, centerY + gap / 2)
    ctx.lineTo(centerX - gap / 2, centerY + gap * 0.2)
    ctx.stroke()
    ctx.closePath()
}

const draw = () => {
    ctx.clearRect(0, 0, canvasSize.rowCount * gap, canvasSize.colCount * gap)
    drawChessBoard()
    cursor.enable && drawCursor(cursor.rowNum, cursor.colNum)
    lastChess.enable && drawCursor(lastChess.rowNum, lastChess.colNum)
    drawChess()
}

const computeChessPosition = event => {
    if (gameOver) {
        return false
    }
    const x = parseInt(event.offsetX / gap)
    const y = parseInt(event.offsetY / gap)
    const temp = chessList.find(item => item.x === x && item.y === y)
    if (temp) {
        return false
    }
    chessList.push({ x, y, role })
    role = (role + 1) % 2
    lastChess.rowNum = x
    lastChess.colNum = y
    lastChess.enable = true
    draw()
    Promise.resolve().then(judgeVictoryOrDefeat)
    computeHighestScoreChess()
    draw()
}

const drawChess = () => {
    chessList.forEach(item => {
        ctx.beginPath()
        ctx.arc(item.x * gap + gap / 2, item.y * gap + gap / 2, gap / 2 * 0.7, 0, 2 * Math.PI)
        ctx.closePath()
        ctx.fillStyle = item.role ? 'black' : 'white'
        ctx.strokeStyle = 'black'
        ctx.fill()
        ctx.stroke()
    })
}

const judgeVictoryOrDefeat = () => {
    // 横向
    for (let i = 0; i <= canvasSize.rowCount; i++) {
        for (let j = 0; j <= canvasSize.colCount - 5; j++) {
            const temp = chessList.find(item => item.x === j && item.y === i)
            if (temp) {
                const filterList = chessList.filter(filterItem => (filterItem.x >= temp.x) && (filterItem.x <= temp.x + 4) && (filterItem.y === temp.y) && (filterItem.role === temp.role))
                if (filterList.length >= 5) {
                    gameOver = true
                    return ElMessageBox.confirm(`${temp.role ? '黑' : '白'}子获胜`, '是否重新开始').then(init)
                }
            }
        }
    }
    // 纵向
    for (let i = 0; i <= canvasSize.colCount; i++) {
        for (let j = 0; j <= canvasSize.rowCount - 5; j++) {
            const temp = chessList.find(item => item.x === i && item.y === j)
            if (temp) {
                const filterList = chessList.filter(filterItem => (filterItem.y >= temp.y) && (filterItem.y <= temp.y + 4) && (filterItem.x === temp.x) && (filterItem.role === temp.role))
                if (filterList.length >= 5) {
                    gameOver = true
                    return ElMessageBox.confirm(`${temp.role ? '黑' : '白'}子获胜`, '是否重新开始').then(init)
                }
            }
        }
    }
    // 左上到右下
    for (let i = 0; i <= canvasSize.colCount - 5; i++) {
        for (let j = 0; j <= canvasSize.rowCount - 5; j++) {
            const temp = chessList.find(item => item.x === i && item.y === j)
            if (temp) {
                const filterList = chessList.filter(filterItem => (filterItem.x - temp.x === filterItem.y - temp.y) && (filterItem.x - temp.x >= 0) && (filterItem.x - temp.x <= 4) && (filterItem.role === temp.role))
                if (filterList.length >= 5) {
                    gameOver = true
                    return ElMessageBox.confirm(`${temp.role ? '黑' : '白'}子获胜`, '是否重新开始').then(init)
                }
            }
        }
    }
    // 右上到左下
    for (let i = 4; i <= canvasSize.colCount; i++) {
        for (let j = 0; j <= canvasSize.rowCount - 5; j++) {
            const temp = chessList.find(item => item.x === i && item.y === j)
            if (temp) {
                const filterList = chessList.filter(filterItem => (filterItem.x - temp.x === temp.y - filterItem.y) && (temp.x - filterItem.x >= 0) && (temp.x - filterItem.x <= 4) && (filterItem.role === temp.role))
                if (filterList.length >= 5) {
                    gameOver = true
                    return ElMessageBox.confirm(`${temp.role ? '黑' : '白'}子获胜`, '是否重新开始').then(init)
                }
            }
        }
    }
}

const computeHighestScoreChess = () => {
    if (gameOver) {
        return false
    }
    let maxScore = 0
    let maxScorePositionList = []
    for (let i = 0; i < canvasSize.colCount; i++) {
        for (let j = 0; j < canvasSize.rowCount; j++) {
            let tempScore = 0
            // 如果这个位置已经有棋子了，评分为0
            if (chessList.find(item => (item.x === i && item.y === j))) {
                continue
            }
            // 横方向
            for (let m = 4; m >= 0; m--) {
                // 如果这个五个棋子的下标超出了边界，跳过
                if (i - m < 0 || i - m + 4 > canvasSize.colCount) {
                    break
                }
                const tempList = chessList.filter(item => item.y === j && item.x >= (i - m) && item.x <= (i - m + 4))
                // 如果这五个棋子包含了两种颜色，则评分为0
                if (tempList.find(item => item.role === 0) && tempList.find(item => item.role === 1)) {
                    break
                }
                if (tempList.find(item => item.role !== aiRole)) {
                    tempScore = tempScore + [7, 35, 800, 15000, 8000000][tempList.filter(item => item.role !== aiRole).length]
                } else {
                    tempScore = tempScore + [0, 15, 400, 1800, 100000][tempList.filter(item => item.role === aiRole).length]
                }
            }
            // 竖方向
            for (let m = 4; m >= 0; m--) {
                // 如果这个五个棋子的下标超出了边界，跳过
                if (i - m < 0 || i - m + 4 > canvasSize.rowCount) {
                    break
                }
                const tempList = chessList.filter(item => item.x === i && item.y >= (j - m) && item.y <= (j - m + 4))
                // 如果这五个棋子包含了两种颜色，则评分为0
                if (tempList.find(item => item.role === 0) && tempList.find(item => item.role === 1)) {
                    break
                }
                if (tempList.find(item => item.role !== aiRole)) {
                    tempScore = tempScore + [7, 35, 800, 15000, 8000000][tempList.filter(item => item.role !== aiRole).length]
                } else {
                    tempScore = tempScore + [0, 15, 400, 1800, 100000][tempList.filter(item => item.role === aiRole).length]
                }
            }
            // 捺方向
            for (let m = 4; m >= 0; m--) {
                // 如果这个五个棋子的下标超出了边界，跳过
                if (i - m < 0 || i - m + 4 > canvasSize.colCount || j - m < 0 || j - m + 4 > canvasSize.rowCount) {
                    break
                }
                const tempList = chessList.filter(item => (item.y === item.x + (j - i)) && item.x >= (i - m) && item.x <= (i - m + 4))
                // 如果这五个棋子包含了两种颜色，则评分为0
                if (tempList.find(item => item.role === 0) && tempList.find(item => item.role === 1)) {
                    break
                }
                if (tempList.find(item => item.role !== aiRole)) {
                    tempScore = tempScore + [7, 35, 800, 15000, 8000000][tempList.filter(item => item.role !== aiRole).length]
                } else {
                    tempScore = tempScore + [0, 15, 400, 1800, 100000][tempList.filter(item => item.role === aiRole).length]
                }
            }
            // 撇方向
            for (let m = 4; m >= 0; m--) {
                // 如果这个五个棋子的下标超出了边界，跳过
                if (i - m < 0 || i - m + 4 > canvasSize.colCount || j - m < 0 || j - m + 4 > canvasSize.rowCount) {
                    break
                }
                const tempList = chessList.filter(item => (item.y === -item.x + (j + i)) && item.x >= (i - m) && item.x <= (i - m + 4))
                // 如果这五个棋子包含了两种颜色，则评分为0
                if (tempList.find(item => item.role === 0) && tempList.find(item => item.role === 1)) {
                    break
                }
                if (tempList.find(item => item.role !== aiRole)) {
                    tempScore = tempScore + [7, 35, 800, 15000, 8000000][tempList.filter(item => item.role !== aiRole).length]
                } else {
                    tempScore = tempScore + [0, 15, 400, 1800, 100000][tempList.filter(item => item.role === aiRole).length]
                }
            }
            if (tempScore > maxScore) {
                maxScore = tempScore
                maxScorePositionList = [{ x: i, y: j }]
            } else if (tempScore === maxScore) {
                maxScorePositionList.push({ x: i, y: j })
            }
        }
    }
    const random = maxScorePositionList[Math.floor(Math.random() * maxScorePositionList.length)]
    chessList.push({  x: random.x, y: random.y, role: aiRole })
    role = (role + 1) % 2
    judgeVictoryOrDefeat()
}

onMounted(init)

</script>
<style lang="scss">
canvas {
    cursor: pointer;
}
</style>
