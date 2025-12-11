// src/popup.ts

// 初始化
window.onload = () => {
  const toolList = document.getElementById('toolList');

  toolList?.addEventListener('click', (evt) => {
    const target = (evt.target as HTMLElement).closest<HTMLElement>('.tool-item');
    if (!target) return;

    const action = target.dataset.action;
    switch (action) {
      case 'json-format':
        openJsonFormatter();
        break;
      case 'websocket':
        openWebSocketTool();
        break;
      case 'url-decode':
        openUrlDecoder();
        break;
      default:
        alert('功能开发中');
    }
  });
};

// 在当前窗口进入 JSON 格式化页面
const openJsonFormatter = () => {
  const url = 'json-formatter.html';
  window.location.href = url;
};

// 在当前窗口进入 WebSocket 工具页面
const openWebSocketTool = () => {
  const url = 'websocket.html';
  window.location.href = url;
};

// 在当前窗口进入 URL 解码页面
const openUrlDecoder = () => {
  const url = 'url-decode.html';
  window.location.href = url;
};
