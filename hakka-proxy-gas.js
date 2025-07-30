/**
 * 客語隨拍即說 v2.0 - Google Apps Script 版本
 * 
 * 此腳本為客語翻譯和語音合成的 Google Apps Script 代理服務，
 * 提供 Web API 端點供前端應用程式調用。
 * 
 * ⚠️ 安全注意事項：
 * 請勿在程式碼中直接寫入認證資訊！
 * 所有敏感資訊應存放在 Google Apps Script 的 Script Properties 中。
 * 
 * 部署說明：
 * 1. 將此代碼複製到 Google Apps Script 專案中
 * 2. 在 Script Properties 中手動設定認證資訊：
 *    - TTS_USERNAME: 你的 TTS 服務用戶名
 *    - TTS_PASSWORD: 你的 TTS 服務密碼  
 *    - TRANSLATE_USERNAME: 你的翻譯服務用戶名
 *    - TRANSLATE_PASSWORD: 你的翻譯服務密碼
 * 3. 執行 setupScriptProperties() 函數檢查設定
 * 4. 部署為 Web App，權限設為 "Anyone"
 */

/**
 * 配置設定
 * 認證資訊請在 Google Apps Script 的 Script Properties 中設定：
 * - TTS_USERNAME
 * - TTS_PASSWORD  
 * - TRANSLATE_USERNAME
 * - TRANSLATE_PASSWORD
 */
const CONFIG = {
    // API URLs
    TRANSLATE_API_URL: 'https://hktrans.bronci.com.tw/MT/translate/hakka_zh_hk',
    TTS_API_URL: 'https://hktts.bronci.com.tw/api/v1/tts/synthesize',
    TRANSLATE_LOGIN_URL: 'https://hktrans.bronci.com.tw/api/v1/tts/login',
    TTS_LOGIN_URL: 'https://hktts.bronci.com.tw/api/v1/login',
    
    // Token 有效期 (毫秒)
    TOKEN_EXPIRY_DURATION: 60 * 60 * 1000 // 1 小時
};

/**
 * Google Apps Script 入口點 - 處理 GET 請求
 * @param {GoogleAppsScript.Events.DoGet} e - GET 請求事件
 * @returns {GoogleAppsScript.HTML.HtmlOutput} HTML 回應
 */
function doGet(e) {
    try {
        const action = e.parameter.action;
        
        // 健康檢查端點
        if (action === 'health') {
            const result = {
                status: 'ok',
                timestamp: new Date().toISOString(),
                environment: 'google-apps-script',
                version: '2.0'
            };
            
            return ContentService
                .createTextOutput(JSON.stringify(result))
                .setMimeType(ContentService.MimeType.JSON);
        }
        
        // 翻譯端點
        if (action === 'translate') {
            const text = e.parameter.text;
            const source = e.parameter.source || 'zh';
            const target = e.parameter.target || 'hak';
            
            if (!text) {
                throw new Error('缺少必要參數: text');
            }
            
            const result = handleTranslate(text, source, target);
            
            return ContentService
                .createTextOutput(JSON.stringify(result))
                .setMimeType(ContentService.MimeType.JSON);
        }
        
        // TTS 端點
        if (action === 'tts') {
            const text = e.parameter.text;
            const voice = e.parameter.voice || 'hak-xi-TW-vs2-M01';
            
            if (!text) {
                throw new Error('缺少必要參數: text');
            }
            
            const result = handleTTS(text, voice);
            
            return ContentService
                .createTextOutput(JSON.stringify(result))
                .setMimeType(ContentService.MimeType.JSON);
        }
        
        // 返回 API 說明頁面
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>客語隨拍即說 v2.0 - Google Apps Script API</title>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { 
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                        max-width: 900px; 
                        margin: 0 auto; 
                        padding: 20px; 
                        line-height: 1.6;
                        background-color: #f5f5f5;
                    }
                    .container {
                        background: white;
                        padding: 30px;
                        border-radius: 10px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    }
                    .status { 
                        color: #28a745; 
                        font-weight: bold; 
                        font-size: 1.2em;
                    }
                    .endpoint { 
                        background: #f8f9fa; 
                        padding: 15px; 
                        margin: 15px 0; 
                        border-radius: 8px; 
                        border-left: 4px solid #007bff;
                    }
                    .test-form { 
                        border: 1px solid #dee2e6; 
                        padding: 25px; 
                        margin: 20px 0; 
                        border-radius: 8px; 
                        background: #fdfdfd;
                    }
                    input[type="text"] {
                        padding: 10px;
                        border: 1px solid #ced4da;
                        border-radius: 4px;
                        font-size: 14px;
                    }
                    button {
                        background: #007bff;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 14px;
                    }
                    button:hover {
                        background: #0056b3;
                    }
                    pre {
                        background: #f8f9fa;
                        padding: 15px;
                        border-radius: 4px;
                        overflow-x: auto;
                        border: 1px solid #e9ecef;
                    }
                    .error {
                        color: #dc3545;
                        font-weight: bold;
                    }
                    .success {
                        color: #28a745;
                    }
                    h1 { color: #343a40; }
                    h2 { color: #495057; border-bottom: 2px solid #e9ecef; padding-bottom: 10px; }
                    h3 { color: #6c757d; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>🎯 客語隨拍即說 v2.0</h1>
                    <h2>Google Apps Script API 服務</h2>
                    
                    <p class="status">✅ 狀態: 正常運行</p>
                    <p><strong>時間:</strong> ${new Date().toISOString()}</p>
                    <p><strong>版本:</strong> 2.0</p>
                    <p><strong>環境:</strong> Google Apps Script</p>
                    
                    <h2>📋 支援的操作</h2>
                    <div class="endpoint">
                        <strong>GET ${ScriptApp.getService().getUrl()}</strong>
                        <ul>
                            <li><code>?action=translate&text=蘋果</code> - 中文翻譯為客語</li>
                            <li><code>?action=tts&text=蘋果</code> - 客語文字轉語音</li>
                            <li><code>?action=health</code> - 服務健康檢查</li>
                        </ul>
                    </div>
                    
                    <div class="test-form">
                        <h3>🈯 測試翻譯服務</h3>
                        <p>將中文文字翻譯為客語</p>
                        <input type="text" id="translateText" placeholder="輸入要翻譯的中文文字" value="蘋果" style="width: 300px; margin-right: 10px;">
                        <button onclick="testTranslate()">開始翻譯</button>
                        <div id="translateResult"></div>
                    </div>
                    
                    <div class="test-form">
                        <h3>🎵 測試語音合成服務</h3>
                        <p>將客語文字轉換為語音</p>
                        <input type="text" id="ttsText" placeholder="輸入要合成語音的客語文字" value="蘋果" style="width: 300px; margin-right: 10px;">
                        <button onclick="testTTS()">合成語音</button>
                        <div id="ttsResult"></div>
                    </div>
                    
                    <div class="test-form">
                        <h3>❤️ 健康檢查</h3>
                        <button onclick="testHealth()">檢查服務狀態</button>
                        <div id="healthResult"></div>
                    </div>
                </div>
                
                <script>
                    const API_URL = '${ScriptApp.getService().getUrl()}';
                    
                    async function makeRequest(params) {
                        try {
                            const url = API_URL + '?' + new URLSearchParams(params).toString();
                            const response = await fetch(url, {
                                method: 'GET'
                            });
                            return await response.json();
                        } catch (error) {
                            throw new Error('網路請求失敗: ' + error.message);
                        }
                    }
                    
                    async function testTranslate() {
                        const text = document.getElementById('translateText').value || '蘋果';
                        const resultDiv = document.getElementById('translateResult');
                        
                        resultDiv.innerHTML = '<p>🔄 翻譯中...</p>';
                        
                        try {
                            const result = await makeRequest({
                                action: 'translate',
                                text: text,
                                source: 'zh',
                                target: 'hak'
                            });
                            
                            if (result.error) {
                                resultDiv.innerHTML = '<p class="error">❌ 錯誤: ' + result.error + '</p>';
                            } else {
                                resultDiv.innerHTML = 
                                    '<div class="success">' +
                                    '<p>✅ 翻譯成功!</p>' +
                                    '<p><strong>原文:</strong> ' + result.original + '</p>' +
                                    '<p><strong>譯文:</strong> ' + result.translated + '</p>' +
                                    '</div>' +
                                    '<pre>' + JSON.stringify(result, null, 2) + '</pre>';
                            }
                        } catch (error) {
                            resultDiv.innerHTML = '<p class="error">❌ 錯誤: ' + error.message + '</p>';
                        }
                    }
                    
                    async function testTTS() {
                        const text = document.getElementById('ttsText').value || '蘋果';
                        const resultDiv = document.getElementById('ttsResult');
                        
                        resultDiv.innerHTML = '<p>🔄 合成語音中...</p>';
                        
                        try {
                            const result = await makeRequest({
                                action: 'tts',
                                text: text,
                                voice: 'hak-xi-TW-vs2-M01'
                            });
                            
                            if (result.error) {
                                resultDiv.innerHTML = '<p class="error">❌ 錯誤: ' + result.error + '</p>';
                            } else {
                                resultDiv.innerHTML = 
                                    '<div class="success">' +
                                    '<p>✅ 語音合成成功!</p>' +
                                    '<p><strong>文字:</strong> ' + result.text + '</p>' +
                                    '<p><strong>語音:</strong> ' + result.voice + '</p>' +
                                    (result.audioBase64 ? 
                                        '<p>🎵 <a href="data:audio/wav;base64,' + result.audioBase64 + '" download="hakka-tts.wav">下載音頻檔案</a></p>' : 
                                        '') +
                                    '</div>' +
                                    '<pre>' + JSON.stringify(result, null, 2) + '</pre>';
                            }
                        } catch (error) {
                            resultDiv.innerHTML = '<p class="error">❌ 錯誤: ' + error.message + '</p>';
                        }
                    }
                    
                    async function testHealth() {
                        const resultDiv = document.getElementById('healthResult');
                        
                        resultDiv.innerHTML = '<p>🔄 檢查中...</p>';
                        
                        try {
                            const result = await makeRequest({
                                action: 'health'
                            });
                            
                            resultDiv.innerHTML = 
                                '<div class="success">' +
                                '<p>✅ 服務正常!</p>' +
                                '</div>' +
                                '<pre>' + JSON.stringify(result, null, 2) + '</pre>';
                        } catch (error) {
                            resultDiv.innerHTML = '<p class="error">❌ 錯誤: ' + error.message + '</p>';
                        }
                    }
                </script>
            </body>
            </html>
        `;
        
        return HtmlService.createHtmlOutput(html)
            .setTitle('客語隨拍即說 v2.0 API')
            .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
            
    } catch (error) {
        Logger.log('doGet 錯誤: ' + error.toString());
        
        return ContentService
            .createTextOutput(JSON.stringify({ 
                error: error.message,
                timestamp: new Date().toISOString()
            }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

/**
 * Google Apps Script 入口點 - 處理 POST 請求 (已棄用，改用 GET)
 * 保留此函數以提供向下相容性
 */
function doPost(e) {
    return ContentService
        .createTextOutput(JSON.stringify({ 
            error: 'POST 請求已棄用，請使用 GET 請求',
            message: '請使用 GET 請求格式: ?action=translate&text=蘋果',
            timestamp: new Date().toISOString()
        }))
        .setMimeType(ContentService.MimeType.JSON);
}

/**
 * 處理翻譯請求
 * @param {string} text - 要翻譯的文字
 * @param {string} source - 來源語言代碼
 * @param {string} target - 目標語言代碼
 * @returns {Object} 翻譯結果
 */
function handleTranslate(text, source = 'zh', target = 'hak') {
    try {
        Logger.log('開始翻譯: ' + text);
        
        // 取得 token
        const token = getTranslateToken();
        
        // 建立請求
        const payload = {
            input: text
        };
        
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            payload: JSON.stringify(payload),
            validateHttpsCertificates: false  // 忽略 SSL 證書驗證
        };
        
        // 發送請求
        const response = UrlFetchApp.fetch(CONFIG.TRANSLATE_API_URL, options);
        
        if (response.getResponseCode() !== 200) {
            throw new Error('翻譯 API 回應錯誤: ' + response.getResponseCode() + ' - ' + response.getContentText());
        }
        
        const result = JSON.parse(response.getContentText());
        Logger.log('翻譯 API 回應: ' + JSON.stringify(result));
        
        // 返回標準化結果
        const translatedText = result.output || result.translation || result.result;
        
        const finalResult = {
            original: text,
            translated: translatedText,
            source: source,
            target: target,
            timestamp: new Date().toISOString()
        };
        
        Logger.log('翻譯結果: ' + JSON.stringify(finalResult));
        return finalResult;
        
    } catch (error) {
        Logger.log('翻譯失敗: ' + error.toString());
        throw new Error('翻譯服務錯誤: ' + error.message);
    }
}

/**
 * 處理文字轉語音請求
 * @param {string} text - 要合成語音的文字
 * @param {string} voice - 語音代碼
 * @returns {Object} TTS 結果
 */
function handleTTS(text, voice = 'hak-xi-TW-vs2-M01') {
    try {
        Logger.log('開始 TTS: ' + text);
        
        // 取得 token
        const token = getTTSToken();
        
        // 建立請求
        const payload = {
            input: {
                text: text,
                textType: 'common'
            },
            voice: {
                languageCode: 'hak-xi-TW',
                name: voice
            },
            audioConfig: {
                speakingRate: 1,
                audioEncoding: 'MP3'
            }
        };
        
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            payload: JSON.stringify(payload),
            validateHttpsCertificates: false  // 忽略 SSL 證書驗證
        };
        
        // 發送請求
        const response = UrlFetchApp.fetch(CONFIG.TTS_API_URL, options);
        
        if (response.getResponseCode() !== 200) {
            throw new Error('TTS API 回應錯誤: ' + response.getResponseCode() + ' - ' + response.getContentText());
        }
        
        // TTS API 回應的是音頻檔案
        const audioBlob = response.getBlob();
        const audioBase64 = Utilities.base64Encode(audioBlob.getBytes());
        
        Logger.log('TTS 音頻檔案大小: ' + audioBlob.getBytes().length + ' 位元組');
        
        // 返回標準化結果
        const result = {
            text: text,
            voice: voice,
            audioBase64: audioBase64,
            audioSize: audioBlob.getBytes().length,
            timestamp: new Date().toISOString()
        };
        
        Logger.log('TTS 完成');
        return result;
        
    } catch (error) {
        Logger.log('TTS 失敗: ' + error.toString());
        throw new Error('語音合成服務錯誤: ' + error.message);
    }
}

/**
 * 取得翻譯服務 token
 * @returns {string} 認證 token
 */
function getTranslateToken() {
    try {
        const cacheKey = 'TRANSLATE_TOKEN';
        const expiryKey = 'TRANSLATE_TOKEN_EXPIRY';
        
        // 檢查快取
        const cache = CacheService.getScriptCache();
        const cachedToken = cache.get(cacheKey);
        const cachedExpiry = cache.get(expiryKey);
        
        if (cachedToken && cachedExpiry && parseInt(cachedExpiry) > Date.now()) {
            Logger.log('使用快取的翻譯 token');
            return cachedToken;
        }
        
        Logger.log('登入翻譯服務...');
        
        // 從 Script Properties 取得認證資訊
        const properties = PropertiesService.getScriptProperties();
        const username = properties.getProperty('TRANSLATE_USERNAME');
        const password = properties.getProperty('TRANSLATE_PASSWORD');
        
        if (!username || !password) {
            throw new Error('請在 Script Properties 中設定 TRANSLATE_USERNAME 和 TRANSLATE_PASSWORD');
        }
        
        const payload = {
            username: username,
            password: password,
            rememberMe: 0
        };
        
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            payload: JSON.stringify(payload),
            validateHttpsCertificates: false  // 忽略 SSL 證書驗證
        };
        
        const response = UrlFetchApp.fetch(CONFIG.TRANSLATE_LOGIN_URL, options);
        
        if (response.getResponseCode() !== 200) {
            Logger.log('翻譯服務登入失敗回應: ' + response.getContentText());
            throw new Error('翻譯服務登入失敗: ' + response.getResponseCode());
        }
        
        const result = JSON.parse(response.getContentText());
        Logger.log('翻譯服務登入回應: ' + JSON.stringify(result));
        
        if (!result.token && !result.access_token) {
            throw new Error('登入回應中未包含 token');
        }
        
        const token = result.token || result.access_token;
        
        // 快取 token
        const expiry = Date.now() + CONFIG.TOKEN_EXPIRY_DURATION;
        cache.put(cacheKey, token, 3600); // 快取 1 小時
        cache.put(expiryKey, expiry.toString(), 3600);
        
        Logger.log('翻譯服務登入成功');
        return token;
        
    } catch (error) {
        Logger.log('翻譯服務登入失敗: ' + error.toString());
        throw new Error('翻譯服務認證失敗: ' + error.message);
    }
}

/**
 * 取得 TTS 服務 token
 * @returns {string} 認證 token
 */
function getTTSToken() {
    try {
        const cacheKey = 'TTS_TOKEN';
        const expiryKey = 'TTS_TOKEN_EXPIRY';
        
        // 檢查快取
        const cache = CacheService.getScriptCache();
        const cachedToken = cache.get(cacheKey);
        const cachedExpiry = cache.get(expiryKey);
        
        if (cachedToken && cachedExpiry && parseInt(cachedExpiry) > Date.now()) {
            Logger.log('使用快取的 TTS token');
            return cachedToken;
        }
        
        Logger.log('登入 TTS 服務...');
        
        // 從 Script Properties 取得認證資訊
        const properties = PropertiesService.getScriptProperties();
        const username = properties.getProperty('TTS_USERNAME');
        const password = properties.getProperty('TTS_PASSWORD');
        
        if (!username || !password) {
            throw new Error('請在 Script Properties 中設定 TTS_USERNAME 和 TTS_PASSWORD');
        }
        
        const payload = {
            username: username,
            password: password
        };
        
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            payload: JSON.stringify(payload),
            validateHttpsCertificates: false  // 忽略 SSL 證書驗證
        };
        
        const response = UrlFetchApp.fetch(CONFIG.TTS_LOGIN_URL, options);
        
        if (response.getResponseCode() !== 200) {
            Logger.log('TTS 登入失敗回應: ' + response.getContentText());
            throw new Error('TTS 登入失敗: ' + response.getResponseCode());
        }
        
        const result = JSON.parse(response.getContentText());
        Logger.log('TTS 登入回應: ' + JSON.stringify(result));
        
        if (!result.token && !result.access_token) {
            throw new Error('登入回應中未包含 token');
        }
        
        const token = result.token || result.access_token;
        
        // 快取 token
        const expiry = Date.now() + CONFIG.TOKEN_EXPIRY_DURATION;
        cache.put(cacheKey, token, 3600); // 快取 1 小時
        cache.put(expiryKey, expiry.toString(), 3600);
        
        Logger.log('TTS 服務登入成功');
        return token;
        
    } catch (error) {
        Logger.log('TTS 登入失敗: ' + error.toString());
        throw new Error('TTS 認證失敗: ' + error.message);
    }
}

/**
 * 測試翻譯服務
 * 此函數可在 Google Apps Script 編輯器中手動執行以測試翻譯功能
 */
function testTranslateService() {
    try {
        Logger.log('開始測試翻譯服務...');
        const result = handleTranslate('蘋果', 'zh', 'hak');
        Logger.log('翻譯測試結果: ' + JSON.stringify(result));
        return result;
    } catch (error) {
        Logger.log('翻譯測試失敗: ' + error.toString());
        throw error;
    }
}

/**
 * 測試 TTS 服務
 * 此函數可在 Google Apps Script 編輯器中手動執行以測試 TTS 功能
 */
function testTTSService() {
    try {
        Logger.log('開始測試 TTS 服務...');
        const result = handleTTS('蘋果');
        Logger.log('TTS 測試結果: 音頻大小 ' + result.audioSize + ' 位元組');
        return result;
    } catch (error) {
        Logger.log('TTS 測試失敗: ' + error.toString());
        throw error;
    }
}

/**
 * 設定 Script Properties
 * 此函數用於初始化必要的認證資訊
 * 請在 Google Apps Script 編輯器中執行此函數一次來設定認證資訊
 * 
 * ⚠️ 安全提醒：請手動在 Google Apps Script 的 Script Properties 中設定以下屬性：
 * - TTS_USERNAME: 你的 TTS 服務用戶名
 * - TTS_PASSWORD: 你的 TTS 服務密碼
 * - TRANSLATE_USERNAME: 你的翻譯服務用戶名
 * - TRANSLATE_PASSWORD: 你的翻譯服務密碼
 */
function setupScriptProperties() {
    const properties = PropertiesService.getScriptProperties();
    
    // 檢查是否已設定必要的屬性
    const requiredProperties = ['TTS_USERNAME', 'TTS_PASSWORD', 'TRANSLATE_USERNAME', 'TRANSLATE_PASSWORD'];
    const existingProperties = properties.getProperties();
    const missingProperties = requiredProperties.filter(prop => !existingProperties[prop]);
    
    if (missingProperties.length > 0) {
        Logger.log('⚠️ 缺少以下 Script Properties，請手動設定：');
        missingProperties.forEach(prop => {
            Logger.log('- ' + prop);
        });
        Logger.log('');
        Logger.log('設定方法：');
        Logger.log('1. 在 Google Apps Script 編輯器中，點擊左側的「屬性」(Properties)');
        Logger.log('2. 點擊「新增指令碼屬性」');
        Logger.log('3. 分別添加上述屬性名稱和對應的值');
        
        throw new Error('請先在 Script Properties 中設定認證資訊');
    }
    
    Logger.log('✅ Script Properties 檢查完成');
    Logger.log('已設定的屬性: ' + Object.keys(existingProperties).join(', '));
}

/**
 * 清除快取的 tokens
 * 此函數可用於強制重新登入服務
 */
function clearTokenCache() {
    const cache = CacheService.getScriptCache();
    cache.removeAll(['TRANSLATE_TOKEN', 'TRANSLATE_TOKEN_EXPIRY', 'TTS_TOKEN', 'TTS_TOKEN_EXPIRY']);
    Logger.log('Token 快取已清除');
}

/**
 * 檢查服務狀態
 * 此函數會測試所有服務是否正常運行
 */
function checkServiceHealth() {
    try {
        Logger.log('開始健康檢查...');
        
        // 測試翻譯服務
        Logger.log('測試翻譯服務...');
        const translateResult = testTranslateService();
        
        // 測試 TTS 服務
        Logger.log('測試 TTS 服務...');
        const ttsResult = testTTSService();
        
        const healthReport = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            services: {
                translate: {
                    status: 'ok',
                    lastTest: translateResult.timestamp
                },
                tts: {
                    status: 'ok',
                    lastTest: ttsResult.timestamp,
                    audioSize: ttsResult.audioSize
                }
            }
        };
        
        Logger.log('健康檢查完成: ' + JSON.stringify(healthReport));
        return healthReport;
        
    } catch (error) {
        Logger.log('健康檢查失敗: ' + error.toString());
        return {
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error.message
        };
    }
}
