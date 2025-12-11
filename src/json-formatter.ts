// src/json-formatter.ts

window.onload = () => {
  const input = document.getElementById('jsonInput') as HTMLTextAreaElement;
  const formatBtn = document.getElementById('formatBtn');
  const fullTextBtn = document.getElementById('fullTextBtn');
  const backBtn = document.getElementById('backBtn');
  const errorMsg = document.getElementById('errorMsg');

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

  // 自定义 JSON 序列化，去除字符串值中的转义符
  const stringifyWithoutEscapes = (obj: any, indent: number = 0): string => {
    const indentStr = ' '.repeat(indent);
    const nextIndent = indent + 2;
    const nextIndentStr = ' '.repeat(nextIndent);

    if (obj === null) {
      return 'null';
    }

    if (typeof obj === 'string') {
      // 转义引号和反斜杠，但保持其他字符不变（不转义 \n, \t 等）
      const escaped = obj
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"');
      return `"${escaped}"`;
    }

    if (typeof obj === 'number' || typeof obj === 'boolean') {
      return String(obj);
    }

    if (Array.isArray(obj)) {
      if (obj.length === 0) {
        return '[]';
      }
      const items = obj.map(item => 
        `${nextIndentStr}${stringifyWithoutEscapes(item, nextIndent)}`
      ).join(',\n');
      return `[\n${items}\n${indentStr}]`;
    }

    if (typeof obj === 'object') {
      const keys = Object.keys(obj);
      if (keys.length === 0) {
        return '{}';
      }
      const items = keys.map(key => {
        const value = stringifyWithoutEscapes(obj[key], nextIndent);
        const escapedKey = key.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        return `${nextIndentStr}"${escapedKey}": ${value}`;
      }).join(',\n');
      return `{\n${items}\n${indentStr}}`;
    }

    return 'null';
  };

  formatBtn?.addEventListener('click', () => {
    if (!input) return;
    let raw = input.value.trim();
    if (!raw) {
      showError('请输入 JSON 文本');
      return;
    }

    let parsed: any;

    try {
      // 首先尝试直接解析
      parsed = JSON.parse(raw);
    } catch (err) {
      // 如果直接解析失败，尝试处理带转义引号的 JSON 字符串
      try {
        // 检查是否包含转义引号 \"
        if (raw.includes('\\"')) {
          // 将转义的引号 \" 替换为普通引号 "
          // 但需要小心：如果整个字符串被引号包裹（JSON 字符串格式），先去除外层引号
          let processed = raw;
          
          // 如果整个字符串被双引号包裹，去除外层引号
          if (processed.startsWith('"') && processed.endsWith('"') && 
              processed.length > 1 && processed[1] !== '"' && processed[processed.length - 2] !== '\\') {
            processed = processed.slice(1, -1);
          }
          
          // 将转义的引号 \" 替换为普通引号 "
          processed = processed.replace(/\\"/g, '"');
          
          // 再次尝试解析
          parsed = JSON.parse(processed);
        } else {
          // 没有转义引号，但解析失败，抛出原始错误
          throw err;
        }
      } catch (err2) {
        showError('解析失败，请检查 JSON 格式');
        return;
      }
    }

    try {
      // 使用自定义序列化，去除字符串值中的转义符
      input.value = stringifyWithoutEscapes(parsed, 0);
      hideError();
    } catch (err) {
      showError('格式化失败，请检查 JSON 格式');
    }
  });

  // 输入时清除错误提示
  input?.addEventListener('input', () => {
    hideError();
  });

  // 全文按钮点击事件 - 打开新窗口
  fullTextBtn?.addEventListener('click', () => {
    if (!input) return;
    const content = input.value.trim();
    if (!content) {
      showError('请输入 JSON 文本');
      return;
    }
    
    // 使用 Chrome Extension API 打开新窗口
    if (typeof chrome !== 'undefined' && chrome.windows) {
      const screenWidth = window.screen.width;
      const screenHeight = window.screen.height;
      const windowWidth = Math.floor(screenWidth / 2);
      const windowHeight = Math.floor(screenHeight * 0.95);
      
      const url = chrome.runtime.getURL(`full-text.html?content=${encodeURIComponent(content)}`);
      
      chrome.windows.create({
        url: url,
        type: 'popup',
        width: windowWidth,
        height: windowHeight,
        left: Math.floor((screenWidth - windowWidth) / 2),
        top: Math.floor((screenHeight - windowHeight) / 2)
      });
    } else {
      // 降级方案：使用 window.open
      const url = `full-text.html?content=${encodeURIComponent(content)}`;
      const screenWidth = window.screen.width;
      const screenHeight = window.screen.height;
      const windowWidth = Math.floor(screenWidth / 2);
      const windowHeight = Math.floor(screenHeight * 0.95);
      const left = Math.floor((screenWidth - windowWidth) / 2);
      const top = Math.floor((screenHeight - windowHeight) / 2);
      
      window.open(
        url,
        'fullText',
        `width=${windowWidth},height=${windowHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`
      );
    }
  });

  backBtn?.addEventListener('click', () => {
    const url = (typeof chrome !== 'undefined' && chrome.runtime?.getURL)
      ? chrome.runtime.getURL('popup.html')
      : 'popup.html';
    window.location.href = url;
  });
};

