<template>
    <el-container class="root">
        <!-- 左侧文件目录区域 -->
        <el-aside width="300px">
            <h4 class="project-title">文件目录</h4>
            <el-scrollbar class="menu">
                <!-- 文件目录树-懒加载方式 -->
                <el-tree :data="fileDirectory" :props="{ label: 'name' }" @node-click="clickNode">
                    <template #default="{ node, data }">
                        <div class="tree-node">
                            <div class="prev"><i v-if="data.type === 'directory'" :class="['expand-btn', node.expanded && 'expand']"></i></div>
                            <h4>{{ node.label }}</h4>
                        </div>
                    </template>
                </el-tree>
                <div class="import"><el-button type="primary" @click="importFile">导入</el-button></div>
            </el-scrollbar>
        </el-aside>
        <el-container class="root">
            <!-- 代码编辑区域 -->
            <el-main>
                <Codemirror v-model:value="code" :options="{ mode: 'text/x-vue' }" border ref="cmRef" @keydown="codeKeydown"></Codemirror>
            </el-main>
            <!-- 控制台部分 -->
            <el-footer>
                <div class="history-cmd">
                    <div class="history-cmd-item" v-for="(n, i) in cmdHistory" :key="i" v-html="n"></div>
                </div>
                <textarea class="input-cmd" v-model="cmd" @keydown.enter="cmdEnter" @keydown="cmdInput"></textarea>
            </el-footer>
        </el-container>
    </el-container>
</template>
<script setup>
const { ipcRenderer } = require('electron');
import { computed, onMounted, ref } from 'vue'
import { routes } from '@/router/index.js'
import 'codemirror/mode/vue/vue.js'
import Codemirror from 'codemirror-editor-vue3'

const currentFile = ref(null);
const currentDirectory  = ref(null);
// 文件目录
const fileDirectory = ref([]);
// 文件代码内容
const code = ref('');
// cmd 控制台
const cmd = ref('');
const cmdHistory = ref([]);
// 导入文件
const importFile = () => ipcRenderer.send('open-folder');
// 服务端读取文件目录后，由 folder-content 接受
ipcRenderer.on('folder-content', (event, directory) => {
    fileDirectory.value.push(directory);
});

ipcRenderer.on('read-directory-folder-files', (event, folderFiles) => {
    if (currentDirectory.value) {
        currentDirectory.value.data.children = folderFiles;
    }
});
// 单击选择左侧某个文件
const clickNode = (file, node) => {
    if (file.type === 'file') {
        ipcRenderer.send('read-file-content', file.fullPath);
        currentFile.value = node;
    }
    if (file.type === 'directory') {
        ipcRenderer.send('read-directory-folder-files', file.fullPath);
        currentDirectory.value = node;
    }
};
// 服务端读取文件内容后，由 read-file-content 接受
ipcRenderer.on('read-file-content', (event, fileContent) => (code.value = fileContent));

const cmdInput = e => {
    if (e.key.toUpperCase() === 'C' && e.ctrlKey) {
        console.log('stoppppppp')
        ipcRenderer.send('execute-command-stop', '');
    }
};
const cmdEnter = v => {
    ipcRenderer.send('execute-command', cmd.value, currentFile.value.data.fullPath);
    cmdHistory.value.push(cmd.value);
    cmd.value = '';
};

ipcRenderer.on('execute-command-reply', (...args) => {
});

ipcRenderer.on('execute-command-stdout', (event, stdoutList) => {
    stdoutList.forEach(stdout => {
        stdout = stdout.replace(/\x1B\[\d{1,2}[a-z]{1}/g, '');
        cmdHistory.value.push(...stdout.split('\n').filter(n => !!n));
    });
});

const codeKeydown = e => {
    if (e.key === 's' && e.ctrlKey) {
        ipcRenderer.send('save-file', currentFile.value?.data.fullPath, code.value);
    }
};

const loadNode = (node, resolve) => {
    // resolve(node?.data[0]);
};

onMounted(() => {
    // ipcRenderer.send('execute-command', 'npm run dev');
    // const editor = CodeMirror.fromTextArea(editorRef.value, {
    //     lineNumbers: true,
    //     mode: 'javascript', // 或者 'vue' 如果你想要编辑 Vue 代码
    //     theme: 'monokai'
    // });
});

</script>
<style lang="scss" scoped>
.root {
    width: 100vw;
    height: 100vh;
    background-color: rgb(40, 41, 35);
    .el-aside {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        grid-template-rows: minmax(0, 56px) minmax(0, 1fr);
        // background-color: rgba(238, 242, 254, 1);
        border-right: 1px solid rgba(white, 0.25);
        background-color: rgb(235, 236, 237);
        .import {
            text-align: center;
            margin-top: 32px;
        }
        .project-title {
            align-self: center;
            justify-self: center;
            font-size: 20px;
            font-weight: 600;
            color: #333
        }
        .menu {
            :deep(.el-scrollbar__view) {
                padding: 0 12px;
                .menu-item {
                    line-height: 40px;
                    padding: 0 12px;
                    display: block;
                    font-size: 14px;
                    cursor: pointer;
                    &.active {
                        background-color: rgba(66, 99, 254, 0.1);
                    }
                }
            }
        }
        .el-tree {
            background-color: transparent;
        }
        :deep(.el-tree-node) {
            background-color: transparent;
            // background-color: red;
        }
    }
    .el-main {
        padding: 0;
        font-size: 0;
    }
    .el-footer {
        height: 140px;
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        grid-template-rows: auto minmax(40px, 1fr);
        padding: 0;
        .history-cmd {
            overflow-x: hidden;
            overflow-y: auto;
            .history-cmd-item {
                line-height: 24px;
                color: white;
                font-size: 14px;
            }
        }
        .input-cmd {
            padding: 12px;
            background-color: rgb(40, 41, 35);;
            outline: none;
            color: white;
            border: none;
            border-top: 1px double rgba(white, 0.25);
        }
    }
    .tree-node {
        display: grid;
        grid-template-columns: 20px minmax(0, 1fr);
        .prev {
            position: relative;
            .expand-btn {
                position: absolute;
                width: 0;
                height: 0;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                border-top: 4px solid transparent;
                border-right: 0 solid;
                border-bottom: 4px solid transparent;
                border-left: 6px solid rgb(164, 165, 167);
                &.expand {
                    transform: translate(-50%, -50%) rotate(90deg);
                }
            }
        }
    }
    .el-tree-node__expand-icon {
        display: none !important;
    }
    :deep(.el-tree-node__expand-icon) {
        display: none !important;
    }
}
:deep {
    .cm-gutters, .cm-gutter, .cm-gutterElement, .cm-content, .cm-activeLine {
        background-color: rgb(40, 41, 35);
    }
}

:deep(.codemirror-container) {
    border: none !important;
    .cm-tag {
        color: rgb(249, 36, 114);
    }
    .cm-bracket {
        color: rgb(248, 248, 242);
    }
    .cm-s-default {
        background-color: rgb(40, 41, 35);
        color: rgb(248, 248, 242);
    }
    .cm-attribute {
        color: rgb(166, 226, 43);
    }
    .cm-string {
        color: red;
    }
    .cm-string {
        color: rgb(231, 219, 116);
    }
    .cm-keyword {
        color: rgb(249, 36, 114);
    }
    .cm-def {
        color: rgb(248, 248, 242);
    }
    .cm-number {
        color: rgb(172, 128, 255);
    }
    .cm-qualifier {
        color: rgb(166, 226, 43);
    }
    .cm-atom {
        color: rgb(103, 216, 239);
    }
    .cm-meta, .cm-mustache {
        color: rgb(248, 248, 242);
    }
    .cm-property {
        color: rgb(103, 216, 239);
    }
    .cm-variable {
        color: rgb(103, 216, 239);
    }
    .CodeMirror-gutter-elt {
        color: rgb(114, 115, 139);
        background-color: rgb(40, 41, 35);
    }
    .CodeMirror-gutters {
        background-color: rgb(40, 41, 35);
        border-right: none;
    }
    .CodeMirror-cursor {
        border-left: 1px solid rgb(248, 248, 242);
    }
}
</style>