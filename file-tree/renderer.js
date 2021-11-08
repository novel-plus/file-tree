function renderDirectoryTreeRec(treeData) {
    const dirNode = document.createElement('li');
    dirNode.innerText = treeData.name;
    if (treeData.items === []) return dirList;
    const subList = document.createElement('ul');
    for (const treeDataItem of treeData.items) {
        if (treeDataItem.items === null) {
            const subNode = document.createElement('li');
            subNode.innerText = treeDataItem.name;
            subList.appendChild(subNode);
        } else {
            const subTree = renderDirectoryTreeRec(treeDataItem);
            subList.appendChild(subTree);
        }
    }
    dirNode.appendChild(subList);
    return dirNode;
}

function renderDirectoryTree(treeData) {
    const rootList = document.createElement('ul');
    const tree = renderDirectoryTreeRec(treeData);
    rootList.appendChild(tree);
    return rootList;
}

const directoryTreeRootElement = document.getElementById('dir-tree-root');
const openDirectoryElement = document.getElementById('open-directory-button');

openDirectoryElement.addEventListener('click', () => {
    fileApi.openDirectory().then((data) => {
        if (data.canceled) return;
        const tree = renderDirectoryTree(data.content);
        directoryTreeRootElement.replaceChild(tree, directoryTreeRootElement.lastChild);
    });
})

