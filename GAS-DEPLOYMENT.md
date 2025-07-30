# Google Apps Script 部署指南

## 🔐 安全設定

為了保護您的認證資訊，請按照以下步驟安全地部署 Google Apps Script：

### 1. 複製程式碼

1. 開啟 [Google Apps Script](https://script.google.com/)
2. 建立新專案
3. 將 `hakka-proxy-gas.js` 的內容複製到編輯器中

### 2. 設定 Script Properties（重要！）

⚠️ **絕對不要**在程式碼中直接寫入帳號密碼！

請在 Google Apps Script 中設定環境變數：

1. 在 Google Apps Script 編輯器中，點擊左側的「屬性」(Properties)
2. 選擇「指令碼屬性」(Script properties)
3. 點擊「新增指令碼屬性」
4. 分別添加以下屬性：

| 屬性名稱 | 說明 | 範例值 |
|---------|------|--------|
| `TTS_USERNAME` | TTS 服務用戶名 | `your_tts_username` |
| `TTS_PASSWORD` | TTS 服務密碼 | `your_tts_password` |
| `TRANSLATE_USERNAME` | 翻譯服務用戶名 | `your_translate_username` |
| `TRANSLATE_PASSWORD` | 翻譯服務密碼 | `your_translate_password` |

### 3. 測試設定

1. 在 Google Apps Script 編輯器中，選擇函數 `setupScriptProperties`
2. 點擊「執行」按鈕
3. 檢查執行記錄，確認所有屬性都已正確設定

### 4. 部署為 Web App

1. 點擊右上角的「部署」按鈕
2. 選擇「新增部署作業」
3. 類型選擇「網頁應用程式」
4. 設定：
   - **執行身分**: 我
   - **誰可以存取**: 任何人
5. 點擊「部署」
6. 複製部署後的 URL

### 5. 更新前端配置

將取得的 Google Apps Script URL 更新到前端專案的 `config.js` 中：

```javascript
const CONFIG = {
    GAS_API_URL: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec',
    // ...其他設定
};
```

## 🧪 測試服務

部署完成後，可以通過以下方式測試：

1. **直接訪問 URL**: 開啟部署的 URL，會看到測試介面
2. **健康檢查**: `https://your-script-url?action=health`
3. **翻譯測試**: `https://your-script-url?action=translate&text=蘋果`
4. **語音合成測試**: `https://your-script-url?action=tts&text=蘋果`

## 🔧 故障排除

### 常見問題

1. **403 錯誤**
   - 檢查部署權限是否設為「任何人」
   - 確認 Script Properties 中的認證資訊正確

2. **500 錯誤**
   - 檢查執行記錄中的錯誤訊息
   - 確認所有必要的 Script Properties 都已設定

3. **認證失敗**
   - 重新檢查 Script Properties 中的用戶名和密碼
   - 執行 `clearTokenCache()` 函數清除快取

### 檢查設定

執行以下函數來檢查服務狀態：

- `setupScriptProperties()` - 檢查環境變數設定
- `checkServiceHealth()` - 完整的服務健康檢查
- `testTranslateService()` - 測試翻譯服務
- `testTTSService()` - 測試語音合成服務

## 📝 更新部署

當程式碼有更新時：

1. 更新 Google Apps Script 中的程式碼
2. 點擊「部署」→「管理部署作業」
3. 點擊版本旁的編輯圖示
4. 更新新版本
5. 點擊「部署」

## 🔒 安全最佳實踐

1. **定期更換密碼**: 定期更新 Script Properties 中的認證資訊
2. **監控使用量**: 定期檢查 Google Apps Script 的執行記錄
3. **限制存取**: 如果可能，設定 IP 白名單或其他存取限制
4. **備份設定**: 記住備份你的 Script Properties 設定（不包含密碼）

---

**注意**: 此文件本身不包含任何敏感資訊，可以安全地提交到版本控制系統中。
