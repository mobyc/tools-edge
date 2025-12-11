// src/url-decode.ts

window.onload = () => {
  const input = document.getElementById('urlInput') as HTMLTextAreaElement;
  const decodeBtn = document.getElementById('decodeBtn');
  const backBtn = document.getElementById('backBtn');
  const errorMsg = document.getElementById('errorMsg');
  const result = document.getElementById('result');

  const showError = (message: string) => {
    if (!errorMsg) return;
    errorMsg.textContent = message;
    errorMsg.classList.remove('hidden');
  };

  const hideError = () => {
    if (!errorMsg) return;
    errorMsg.textContent = '';
    errorMsg.classList.add('hidden');
  };

  // URL 解码并高亮显示被解码的部分
  const decodeAndHighlight = (url: string): string => {
    try {
      const decoded = decodeURIComponent(url);
      
      // 如果解码后和原 URL 相同，说明没有需要解码的部分
      if (decoded === url) {
        return escapeHtml(url);
      }

      // 使用正则表达式找出所有编码的部分（%XX 格式）
      const encodedPattern = /(%[0-9A-Fa-f]{2})+/g;
      let highlighted = '';
      let lastIndex = 0;
      let match;

      while ((match = encodedPattern.exec(url)) !== null) {
        // 添加编码前的部分（未编码）
        highlighted += escapeHtml(url.substring(lastIndex, match.index));
        
        // 解码编码的部分
        try {
          const encodedPart = match[0];
          const decodedPart = decodeURIComponent(encodedPart);
          // 高亮显示解码后的部分
          highlighted += `<span class="decoded-part">${escapeHtml(decodedPart)}</span>`;
        } catch (err) {
          // 如果解码失败，保持原样
          highlighted += escapeHtml(match[0]);
        }
        
        lastIndex = match.index + match[0].length;
      }

      // 添加剩余部分
      if (lastIndex < url.length) {
        highlighted += escapeHtml(url.substring(lastIndex));
      }

      return highlighted;
    } catch (err) {
      // 如果完全解码失败，尝试部分解码
      return decodePartial(url);
    }
  };

  // 部分解码：只解码能解码的部分
  const decodePartial = (url: string): string => {
    let highlighted = '';
    let i = 0;

    while (i < url.length) {
      if (url[i] === '%' && i + 2 < url.length) {
        const hex = url.substring(i + 1, i + 3);
        if (/^[0-9A-Fa-f]{2}$/.test(hex)) {
          try {
            const decoded = decodeURIComponent(url.substring(i, i + 3));
            highlighted += `<span class="decoded-part">${escapeHtml(decoded)}</span>`;
            i += 3;
          } catch (err) {
            highlighted += escapeHtml(url[i]);
            i++;
          }
        } else {
          highlighted += escapeHtml(url[i]);
          i++;
        }
      } else {
        highlighted += escapeHtml(url[i]);
        i++;
      }
    }

    return highlighted;
  };

  // 转义 HTML 特殊字符
  const escapeHtml = (str: string) => {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return str.replace(/[&<>"']/g, (m) => map[m]);
  };

  decodeBtn?.addEventListener('click', () => {
    if (!input || !result) return;
    const url = input.value.trim();
    if (!url) {
      showError('请输入 URL 地址');
      return;
    }

    try {
      const decoded = decodeURIComponent(url);
      const highlighted = decodeAndHighlight(url);
      result.innerHTML = highlighted;
      hideError();
    } catch (err) {
      // 如果完全解码失败，尝试部分解码
      const highlighted = decodePartial(url);
      result.innerHTML = highlighted;
      showError('部分 URL 编码无法解码，已显示可解码部分');
    }
  });

  // 输入时清除错误提示
  input?.addEventListener('input', () => {
    hideError();
    if (result) {
      result.innerHTML = '';
    }
  });

  backBtn?.addEventListener('click', () => {
    const url = (typeof chrome !== 'undefined' && chrome.runtime?.getURL)
      ? chrome.runtime.getURL('popup.html')
      : 'popup.html';
    window.location.href = url;
  });
};

