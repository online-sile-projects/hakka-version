// 客語隨拍即說 v2.0 - 主要應用程式邏輯

let currentImageData = null;
let audioBase64 = null;

// 頁面加載完成後的初始化
document.addEventListener('DOMContentLoaded', function() {
    // 檢查 API 配置
    if (CONFIG.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY') {
        showError('請先在 config.js 中設定你的 Gemini API Key');
        return;
    }
    
    // 測試 API 端點（可選）
    if (CONFIG.TEST_ENDPOINTS) {
        testAPIEndpoints();
    }
});

// 測試 API 端點
async function testAPIEndpoints() {
    try {
        const response = await fetch(`${CONFIG.GAS_API_URL}?action=health`);
        if (response.ok) {
            console.log('✅ Google Apps Script API 連線正常');
        } else {
            console.warn('⚠️ Google Apps Script API 連線異常');
        }
    } catch (error) {
        console.error('❌ Google Apps Script API 測試失敗:', error);
    }
}

// 開啟相機
async function openCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'environment' // 使用後鏡頭
            } 
        });
        
        const video = document.getElementById('camera');
        video.srcObject = stream;
        video.classList.remove('hidden');
        
        // 添加拍照按鈕
        if (!document.getElementById('captureBtn')) {
            const captureBtn = document.createElement('button');
            captureBtn.id = 'captureBtn';
            captureBtn.className = 'btn btn-primary';
            captureBtn.textContent = '📸 拍照';
            captureBtn.onclick = capturePhoto;
            captureBtn.style.marginTop = '15px';
            video.parentNode.appendChild(captureBtn);
        }
    } catch (error) {
        showError('無法開啟相機：' + error.message);
    }
}

// 拍照
function capturePhoto() {
    const video = document.getElementById('camera');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    
    // 停止相機
    const stream = video.srcObject;
    const tracks = stream.getTracks();
    tracks.forEach(track => track.stop());
    video.classList.add('hidden');
    
    // 移除拍照按鈕
    const captureBtn = document.getElementById('captureBtn');
    if (captureBtn) {
        captureBtn.remove();
    }
    
    // 顯示預覽
    canvas.toBlob(blob => {
        const reader = new FileReader();
        reader.onload = e => {
            showImagePreview(e.target.result);
            processImage(e.target.result);
        };
        reader.readAsDataURL(blob);
    }, 'image/jpeg', CONFIG.IMAGE_QUALITY);
}

// 選擇圖片
function selectImage() {
    document.getElementById('fileInput').click();
}

// 處理圖片選擇
function handleImageSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = e => {
            showImagePreview(e.target.result);
            processImage(e.target.result);
        };
        reader.readAsDataURL(file);
    }
}

// 顯示圖片預覽
function showImagePreview(dataUrl) {
    const preview = document.getElementById('imagePreview');
    preview.src = dataUrl;
    preview.classList.remove('hidden');
    hideCamera();
}

// 隱藏相機
function hideCamera() {
    const video = document.getElementById('camera');
    const captureBtn = document.getElementById('captureBtn');
    
    if (video.srcObject) {
        const tracks = video.srcObject.getTracks();
        tracks.forEach(track => track.stop());
    }
    
    video.classList.add('hidden');
    if (captureBtn) {
        captureBtn.remove();
    }
}

// 壓縮圖片
function compressImage(dataUrl) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // 計算新的尺寸
            let { width, height } = img;
            const maxSize = CONFIG.MAX_IMAGE_SIZE;
            
            if (width > height) {
                if (width > maxSize) {
                    height = height * (maxSize / width);
                    width = maxSize;
                }
            } else {
                if (height > maxSize) {
                    width = width * (maxSize / height);
                    height = maxSize;
                }
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // 繪製壓縮後的圖片
            ctx.drawImage(img, 0, 0, width, height);
            
            // 轉換為 base64
            const compressedDataUrl = canvas.toDataURL('image/jpeg', CONFIG.IMAGE_QUALITY);
            resolve(compressedDataUrl);
        };
        img.src = dataUrl;
    });
}

// 處理圖片
async function processImage(dataUrl) {
    try {
        showProgress();
        updateProgress(10, '壓縮圖片中...');
        
        // 壓縮圖片
        const compressedDataUrl = await compressImage(dataUrl);
        currentImageData = compressedDataUrl.split(',')[1]; // 去掉 data:image/jpeg;base64, 前綴
        
        updateProgress(30, '辨識圖片中...');
        
        // 調用 Gemini API 辨識圖片
        const chineseName = await recognizeImage(currentImageData);
        
        updateProgress(60, '翻譯成客語中...');
        
        // 翻譯成客語
        const hakkaName = await translateToHakka(chineseName);
        
        updateProgress(80, '生成語音中...');
        
        // 生成語音
        await generateAudio(hakkaName);
        
        updateProgress(100, '完成！');
        
        // 顯示結果
        setTimeout(() => {
            showResult(chineseName, hakkaName);
        }, 500);
        
    } catch (error) {
        hideProgress();
        showError('處理過程中發生錯誤：' + error.message);
        console.error('處理錯誤:', error);
    }
}

// 調用 Gemini API 辨識圖片
async function recognizeImage(imageBase64) {
    const requestBody = {
        contents: [{
            role: "user",
            parts: [{
                inlineData: {
                    mimeType: "image/jpeg",
                    data: imageBase64
                }
            }, {
                text: "請辨識這張圖片中的主要物品或食物，只回答物品的中文名稱，例如：蘋果、香蕉、汽車等。請只回答一個最主要的物品名稱，不要包含其他說明文字。"
            }]
        }],
        generationConfig: {
            responseMimeType: "text/plain"
        }
    };

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.GEMINI_MODEL}:generateContent?key=${CONFIG.GEMINI_API_KEY}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API 錯誤響應:', errorText);
        throw new Error(`Gemini API 錯誤: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Gemini API 響應:', data);
    
    if (data.candidates && data.candidates.length > 0) {
        const text = data.candidates[0].content.parts[0].text.trim();
        return text;
    } else {
        throw new Error('無法辨識圖片內容');
    }
}

// 翻譯成客語
async function translateToHakka(chineseName) {
    const url = `${CONFIG.GAS_API_URL}?action=translate&text=${encodeURIComponent(chineseName)}&source=zh&target=hak`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error(`翻譯 API 錯誤: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('翻譯 API 響應:', data);
    
    if (data.error) {
        throw new Error(data.error);
    }
    
    return data.translated || chineseName;
}

// 生成語音
async function generateAudio(hakkaText) {
    const url = `${CONFIG.GAS_API_URL}?action=tts&text=${encodeURIComponent(hakkaText)}&voice=hak-xi-TW-vs2-M01`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error(`語音合成 API 錯誤: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('語音合成 API 響應:', data);
    
    if (data.error) {
        throw new Error(data.error);
    }
    
    audioBase64 = data.audioBase64;
}

// 播放音頻
function playAudio() {
    if (audioBase64) {
        const audioPlayer = document.getElementById('audioPlayer');
        audioPlayer.src = `data:audio/mp3;base64,${audioBase64}`;
        audioPlayer.classList.remove('hidden');
        audioPlayer.play().catch(error => {
            console.error('播放音頻失敗:', error);
            showError('播放音頻失敗: ' + error.message);
        });
    }
}

// 顯示進度
function showProgress() {
    document.getElementById('progressStep').classList.remove('hidden');
    hideError();
}

// 更新進度
function updateProgress(percent, text) {
    document.getElementById('progressFill').style.width = percent + '%';
    document.getElementById('progressText').textContent = text;
}

// 隱藏進度
function hideProgress() {
    document.getElementById('progressStep').classList.add('hidden');
}

// 顯示結果
function showResult(chineseName, hakkaName) {
    document.getElementById('chineseName').textContent = chineseName;
    document.getElementById('hakkaName').textContent = hakkaName;
    document.getElementById('playAudioBtn').disabled = !audioBase64;
    
    hideProgress();
    document.getElementById('resultStep').classList.remove('hidden');
}

// 顯示錯誤
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
}

// 隱藏錯誤
function hideError() {
    document.getElementById('errorMessage').classList.add('hidden');
}

// 重置應用
function resetApp() {
    // 重置所有狀態
    currentImageData = null;
    audioBase64 = null;
    
    // 隱藏所有步驟和錯誤
    document.getElementById('progressStep').classList.add('hidden');
    document.getElementById('resultStep').classList.add('hidden');
    document.getElementById('errorMessage').classList.add('hidden');
    
    // 隱藏圖片預覽
    document.getElementById('imagePreview').classList.add('hidden');
    hideCamera();
    
    // 重置音頻播放器
    const audioPlayer = document.getElementById('audioPlayer');
    audioPlayer.classList.add('hidden');
    audioPlayer.src = '';
    
    // 重置文件輸入
    document.getElementById('fileInput').value = '';
}
