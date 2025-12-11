// src/full-text.ts

window.onload = () => {
    const contentEl = document.getElementById('content');

    // 从 URL 参数获取内容
    const urlParams = new URLSearchParams(window.location.search);
    let content = decodeURIComponent(urlParams.get('content') || '');

    // 彻底重构：先解析JSON，再逐节点构建高亮HTML（避免转义冲突）
    type JSONValue = string | number | boolean | null | JSONValue[] | { [key: string]: JSONValue };

    // 构建高亮HTML的核心函数（递归处理JSON节点）
    const buildHighlightedHTML = (value: JSONValue, indent = 0): string => {
        const indentStr = '  '.repeat(indent);
        const nextIndentStr = '  '.repeat(indent + 1);

        // 处理数组
        if (Array.isArray(value)) {
            if (value.length === 0) return '<span class="json-punctuation">[]</span>';

            // const items = value.map(item => `${nextIndentStr}${buildHighlightedHTML(item, indent + 1)}`);
            // 遍历数组元素，为每个元素添加逗号（最后一个元素除外）
            const items = value.map((item, index) => {
                const itemHtml = buildHighlightedHTML(item, indent + 1);
                // 非最后一个元素添加逗号
                const comma = index < value.length - 1 ? '<span class="json-punctuation">,</span>' : '';
                return `${nextIndentStr}${itemHtml}${comma}`;
            });
            return [
                '<span class="json-punctuation">[</span>',
                ...items,
                `${indentStr}<span class="json-punctuation">]</span>`
            ].join('\n');
        }

        // 处理对象
        if (typeof value === 'object' && value !== null) {
            const entries = Object.entries(value);
            if (entries.length === 0) return '<span class="json-punctuation">{}</span>';

            const items = entries.map(([key, val]) =>
                `${nextIndentStr}<span class="json-key">"${key}"</span><span class="json-punctuation">:</span> ${buildHighlightedHTML(val, indent + 1)}`
            );
            return [
                '<span class="json-punctuation">{</span>',
                ...items.map((item, i) => `${item}${i < entries.length - 1 ? '<span class="json-punctuation">,</span>' : ''}`),
                `${indentStr}<span class="json-punctuation">}</span>`
            ].join('\n');
        }

        // 处理字符串
        if (typeof value === 'string') {
            return `<span class="json-string">"${value}"</span>`;
        }

        // 处理数字
        if (typeof value === 'number') {
            return `<span class="json-number">${value}</span>`;
        }

        // 处理布尔值
        if (typeof value === 'boolean') {
            return `<span class="json-boolean">${value}</span>`;
        }

        // 处理null
        if (value === null) {
            return `<span class="json-null">null</span>`;
        }

        return '';
    };

    // 格式化并高亮 JSON（最终稳定版）
    const formatAndHighlight = (text: string): string => {
        if (!text.trim()) return '';

        let parsed: JSONValue;
        try {
            // 1. 清理可能的首尾引号（处理JSON字符串包裹的情况）
            let cleanText = text.trim();
            if (cleanText.startsWith('"') && cleanText.endsWith('"')) {
                cleanText = cleanText.slice(1, -1).replace(/\\"/g, '"');
            }
            // 2. 解析JSON（核心：先解析为JS对象，再重构HTML）
            parsed = JSON.parse(cleanText);
        } catch (err) {
            // 解析失败时返回转义后的原始文本
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
            return escapeHtml(text);
        }

        // 3. 构建高亮HTML（从JS对象重构，避免转义冲突）
        return buildHighlightedHTML(parsed);
    };

    if (contentEl) {
        contentEl.innerHTML = formatAndHighlight(content);
    }

    // ESC 键关闭
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            window.close();
        }
    });
};

