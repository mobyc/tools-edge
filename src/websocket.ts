let socket: WebSocket | null = null;
let isConnecting = false;

// 初始化
window.onload = () => {
  const urlInput = document.getElementById('wsInput') as HTMLInputElement | null;
  const connectBtn = document.getElementById('connectBtn');
  const disconnectBtn = document.getElementById('disconnectBtn');
  const clearLogBtn = document.getElementById('clearLogBtn');
  const backBtn = document.getElementById('backBtn');
  const statusBadge = document.getElementById('statusBadge');
  const messageList = document.getElementById('messageList');

  const updateStatus = (text: string, state: 'idle' | 'connecting' | 'open' | 'closed' | 'error') => {
    if (!statusBadge) return;
    statusBadge.textContent = text;
    statusBadge.dataset.state = state;
  };

  const setControls = (state: 'idle' | 'connecting' | 'open') => {
    if (connectBtn instanceof HTMLButtonElement) {
      connectBtn.disabled = state === 'connecting' || state === 'open';
    }
    if (disconnectBtn instanceof HTMLButtonElement) {
      disconnectBtn.disabled = state !== 'open' && state !== 'connecting';
    }
    if (urlInput) {
      urlInput.disabled = state === 'connecting' || state === 'open';
    }
  };

  const appendMessage = (tag: 'info' | 'msg' | 'error', content: string) => {
    if (!messageList) return;
    const item = document.createElement('div');
    item.className = `message message-${tag}`;

    const badge = document.createElement('span');
    badge.className = 'message-tag';
    badge.textContent = tag === 'info' ? '状态' : tag === 'error' ? '错误' : '消息';

    const text = document.createElement('div');
    text.className = 'message-content';
    text.textContent = content;

    item.appendChild(badge);
    item.appendChild(text);
    messageList.appendChild(item);
    messageList.scrollTop = messageList.scrollHeight;
  };

  const closeCurrentSocket = (code = 1000, reason = '手动关闭') => {
    if (socket) {
      socket.close(code, reason);
      socket = null;
    }
  };

  const toDisplayText = (data: MessageEvent['data']): string => {
    if (typeof data === 'string') return data;
    if (data instanceof Blob) return '[Binary Blob ' + data.size + ' bytes]';
    if (data instanceof ArrayBuffer) return '[ArrayBuffer ' + data.byteLength + ' bytes]';
    return String(data);
  };

  const startConnect = () => {
    if (!urlInput) return;
    const url = urlInput.value.trim();
    if (!url) {
      appendMessage('error', '请输入 WebSocket 地址');
      return;
    }

    try {
      closeCurrentSocket();
      isConnecting = true;
      updateStatus('连接中…', 'connecting');
      setControls('connecting');

      socket = new WebSocket(url);

      socket.addEventListener('open', () => {
        isConnecting = false;
        updateStatus('已连接', 'open');
        setControls('open');
        appendMessage('info', `已连接到 ${url}`);
      });

      socket.addEventListener('message', (event) => {
        appendMessage('msg', toDisplayText(event.data));
      });

      socket.addEventListener('error', () => {
        appendMessage('error', '连接出现错误，请检查地址或服务端状态');
      });

      socket.addEventListener('close', (event) => {
        socket = null;
        isConnecting = false;
        updateStatus(event.wasClean ? '已断开' : '已断开（异常）', event.wasClean ? 'closed' : 'error');
        setControls('idle');
        appendMessage('info', `连接关闭，code=${event.code} reason=${event.reason || '无'}`);
      });
    } catch (err) {
      isConnecting = false;
      setControls('idle');
      updateStatus('连接失败', 'error');
      appendMessage('error', err instanceof Error ? err.message : '无法创建 WebSocket 连接');
    }
  };

  connectBtn?.addEventListener('click', () => {
    if (isConnecting) return;
    startConnect();
  });

  disconnectBtn?.addEventListener('click', () => {
    closeCurrentSocket(1000, '用户手动断开');
  });

  clearLogBtn?.addEventListener('click', () => {
    if (messageList) {
      messageList.innerHTML = '';
    }
  });

  backBtn?.addEventListener('click', () => {
    const url = (typeof chrome !== 'undefined' && chrome.runtime?.getURL)
      ? chrome.runtime.getURL('popup.html')
      : 'popup.html';
    window.location.href = url;
  });

  updateStatus('未连接', 'idle');
  setControls('idle');
};

