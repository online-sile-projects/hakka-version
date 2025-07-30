// 本地配置範例 - 請複製此檔案為 config-local.js 並填入你的實際 API Key
// 注意：config-local.js 已被加入 .gitignore，不會被提交到 Git

const LOCAL_CONFIG = {
    // 請在這裡填入你的實際 Gemini API Key
    GEMINI_API_KEY: 'YOUR_ACTUAL_GEMINI_API_KEY_HERE',
    
    // 如果你有自己的 Google Apps Script URL，也可以在這裡覆蓋
    // GAS_API_URL: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec'
};

// 如果在瀏覽器環境中使用
if (typeof window !== 'undefined') {
    window.LOCAL_CONFIG = LOCAL_CONFIG;
}

// 如果在 Node.js 環境中使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LOCAL_CONFIG;
}
