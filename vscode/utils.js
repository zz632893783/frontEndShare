const fs = require('fs').promises;
const path = require('path');

const readDirectoryTree = async dirPath => {
    // 存储树形结构数据的数组
    const tree = [];

    try {
        // 读取目录内容
        const entries = await fs.readdir(dirPath);
        
        for (const entry of entries) {
            const entryPath = path.join(dirPath, entry);
            // 获取文件或文件夹的状态
            const stats = await fs.stat(entryPath);

            if (stats.isDirectory()) {
                // 如果是文件夹，递归调用函数
                const subTree = await readDirectoryTree(entryPath);
                tree.push({
                    name: entry,
                    type: 'directory',
                    children: subTree,
                    fullPath: entryPath
                });
            } else {
                // 如果是文件，添加到树形结构
                tree.push({
                    name: entry,
                    type: 'file',
                    fullPath: entryPath
                });
            }
        }
    } catch (error) {
        console.error(`Error reading directory tree: ${error}`);
    }

    return tree;
};

module.exports = {
    readDirectoryTree
}
// 使用示例
// const dirPath = 'C:/Users/Administrator/Desktop/壁纸'; // 替换为你想要遍历的目录路径
// readDirectoryTree(dirPath)
//     .then(tree => console.log(JSON.stringify(tree, null, 2))) // 打印格式化的树形结构
//     .catch(error => console.error(error));
