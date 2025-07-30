// 配置檔案 - 請在這裡設定你的 API 金鑰和端點
const CONFIG = {
    // Google Apps Script API URL (請替換為你的實際部署 URL)
    GAS_API_URL: 'https://script.google.com/macros/s/AKfycbwL0aLfdtVMeR90xurpAMDb8gYMPCQw7I0It5lIyzwVQBrdzvFeE5v0K15AAH2_ZZJeAQ/exec',
    
    // Gemini API 配置
    GEMINI_API_KEY: 'YOUR_GEMINI_API_KEY', // 請在這裡填入你的 Gemini API Key
    GEMINI_MODEL: 'gemini-2.5-pro',
    
    // 圖片壓縮設定
    MAX_IMAGE_SIZE: 1024, // 最大寬度或高度 (像素)
    IMAGE_QUALITY: 0.8,   // JPEG 品質 (0.1-1.0)
    
    // API 端點測試
    TEST_ENDPOINTS: true, // 是否在載入時測試 API 端點
};

// 導出配置 (如果在 Node.js 環境中使用)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
