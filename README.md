## Edge JSON 工具插件

面向 Edge/Chrome 浏览器的 Manifest V3 插件，提供 JSON 格式化、全文查看、WebSocket 调试、URL 解码等常用工具。代码基于 TypeScript + Gulp 构建。

### 功能
- JSON 格式化：支持处理帶轉義引號的字符串，保持字符串內部換行/制表符不再二次轉義。
- 全文查看：在新窗口顯示格式化後的 JSON，方便長文閱讀。
- WebSocket 調試：連接、收發消息，顯示狀態與日誌。
- URL 解碼：高亮顯示被解碼的片段，支持部分解碼。
- 插件入口：`popup` 菜單快速切換工具頁面。

### 目錄結構
- `src/`：各工具的 TypeScript 入口（`popup.ts`、`json-formatter.ts`、`websocket.ts`、`url-decode.ts`、`full-text.ts`）。
- `static/`：HTML/CSS/SVG/manifest 等靜態資源，打包時原樣拷貝。
- `dist/`：編譯後輸出（`npm run build` 生成，可直接作為已解壓擴展加載）。
- `gulpfile.mjs`：構建與開發任務，包含 `build`、`watch` 流程。
- `tsconfig.json`：TypeScript 編譯配置。

### 開發準備
- Node.js 18+（推薦），npm。
- 安裝依賴：`npm install`

### 開發與調試
1) 啟動開發模式（編譯並監聽 TS/靜態文件變化）：
   ```bash
   npm run dev
   ```
2) 或手動構建一次：
   ```bash
   npm run build
   ```
   生成的內容位於 `dist/`。

### 在 Edge/Chrome 中加載
1) 打開擴展管理頁，開啟「開發者模式」。
2) 選擇「加載已解壓的擴展」，指向項目根目錄下的 `dist/`。
3) 點擊工具欄圖標打開 `popup`，進入各工具頁面。

### 常見問題
- 首次使用請先 `npm install`，否則 `gulp` 相關指令無法運行。
- 構建前會自動清理 `dist/`，如需保留歷史包，可提前備份。
- `manifest.json` 僅申請了 `windows` 權限，用於新窗口打開全文頁。

<img width="306" height="264" alt="image" src="https://github.com/user-attachments/assets/97ed10cc-1a4b-4ebc-9a38-38ad1b09665b" />
