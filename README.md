# 客語隨拍即說 v2.0 - 網頁版

這是一個結合圖片辨識、翻譯和語音合成的客語學習工具網頁應用。

## 功能特色

1. **📸 拍照或選圖片** - 支援相機拍照或從設備選擇圖片
2. **🔍 圖片辨識** - 使用 Google Gemini API 辨識圖片中的物品
3. **🌐 中文轉客語翻譯** - 透過客語翻譯 API 將中文轉換為客語
4. **🔊 客語語音合成** - 生成客語發音並可播放
5. **📱 響應式設計** - 支援手機和桌面設備

## 文件結構

```
hakka-version/
├── index.html              # 完整單一檔案版本（推薦快速測試）
├── index-modular.html      # 模組化版本（推薦正式使用）
├── config.js              # 配置檔案
├── config-local.example.js # 本地配置範例檔案
├── app.js                 # 主要應用邏輯
├── style.css              # 樣式檔案
├── hakka-proxy-gas.js     # Google Apps Script 代理服務
├── GAS-DEPLOYMENT.md      # Google Apps Script 部署指南
└── test-get-api.sh        # API 測試腳本
```

## 使用方法

### 1. 配置 API 金鑰

**方法一：直接修改配置檔案（不推薦公開專案使用）**

在 `config.js` 中設定你的 Gemini API Key：

```javascript
const CONFIG = {
    // 請替換為你的實際 Gemini API Key
    GEMINI_API_KEY: 'YOUR_ACTUAL_GEMINI_API_KEY',
    
    // 其他配置...
};
```

**方法二：使用本地配置檔案（推薦）**

1. 複製 `config-local.example.js` 為 `config-local.js`
2. 在 `config-local.js` 中填入你的實際 API Key
3. 本地配置檔案不會被提交到 Git，確保 API Key 安全

```bash
cp config-local.example.js config-local.js
# 然後編輯 config-local.js 填入你的 API Key
```

⚠️ **安全提醒**：請勿將真實的 API Key 提交到公開的 Git 倉庫中！

### 2. 部署 Google Apps Script

⚠️ **安全提醒**: 請勿在程式碼中直接寫入帳號密碼！

1. 將 `hakka-proxy-gas.js` 複製到 Google Apps Script 專案
2. **重要**: 在 Script Properties 中手動設定認證資訊（詳見 `GAS-DEPLOYMENT.md`）
3. 執行 `setupScriptProperties()` 函數檢查設定
4. 部署為 Web App，權限設為 "Anyone"
5. 將部署後的 URL 更新到 `config.js` 的 `GAS_API_URL`

📖 **詳細部署指南**: 請參閱 [`GAS-DEPLOYMENT.md`](./GAS-DEPLOYMENT.md)

### 3. 開啟網頁

選擇以下任一方式：

- **快速測試**：直接開啟 `index.html`
- **正式使用**：開啟 `index-modular.html`（需要支援本地檔案載入的瀏覽器或 HTTP 服務器）

### 4. 使用流程

1. 點擊「📷 拍照」或「🖼️ 選擇圖片」
2. 等待系統自動處理：
   - 壓縮圖片
   - Gemini API 辨識物品
   - 翻譯成客語
   - 生成語音
3. 查看結果並點擊「🔊 播放客語發音」

## API 接口

### Gemini API
- **模型**: gemini-2.5-pro
- **功能**: 圖片內容辨識
- **輸入**: JPEG 圖片 (base64)
- **輸出**: 物品中文名稱

### 翻譯 API (via Google Apps Script)
- **端點**: `?action=translate&text=文字&source=zh&target=hak`
- **功能**: 中文轉客語翻譯

### 語音合成 API (via Google Apps Script)
- **端點**: `?action=tts&text=客語文字&voice=hak-xi-TW-vs2-M01`
- **功能**: 客語文字轉語音

## 技術特性

- **前端壓縮**: 自動壓縮圖片以提升傳輸效率
- **響應式設計**: 支援手機和桌面設備
- **錯誤處理**: 完整的錯誤提示和處理機制
- **進度顯示**: 實時顯示處理進度
- **無需後端**: 純前端實現，部署簡單

## 瀏覽器支援

- Chrome 80+
- Firefox 78+
- Safari 14+
- Edge 80+

## 線上體驗

🌐 **GitHub Pages 部署版本**: https://online-sile-projects.github.io/hakka-version/

直接訪問線上版本，無需本地設置！

## 開發模式

如果需要在本地開發，建議使用 HTTP 服務器：

```bash
# 使用 Python
python3 -m http.server 8000

# 使用 Node.js http-server
npx http-server

# 使用 PHP
php -S localhost:8000
```

然後訪問 `http://localhost:8000/index-modular.html`

## API 測試

可以使用提供的測試腳本來驗證 API 功能：

```bash
chmod +x test-get-api.sh
./test-get-api.sh
```

## 故障排除

### 1. Gemini API 錯誤
- 檢查 API Key 是否正確設定
- 確認 API Key 有圖片辨識權限
- 檢查網路連線

### 2. 翻譯/語音合成錯誤
- 檢查 Google Apps Script 是否正確部署
- 確認 Script Properties 中的認證資訊
- 測試 GAS API 端點是否可訪問

### 3. 相機無法開啟
- 檢查瀏覽器權限設定
- 確認使用 HTTPS 或 localhost
- 嘗試使用不同瀏覽器

### 4. 音頻無法播放
- 檢查瀏覽器音頻支援
- 確認網路連線穩定
- 檢查音頻格式相容性

## 授權

MIT License

## 更新日誌

### v2.0
- 新增圖片辨識功能
- 整合 Gemini API
- 改善使用者介面
- 新增進度顯示
- 優化錯誤處理
- 🚀 **部署到 GitHub Pages**
