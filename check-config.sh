#!/bin/bash

# 客語隨拍即說 v2.0 - 配置檢查工具

echo "🔧 客語隨拍即說 v2.0 - 配置檢查"
echo "================================="

# 檢查文件是否存在
echo "📁 檢查檔案完整性..."

FILES=(
    "index.html"
    "index-modular.html"
    "config.js"
    "app.js"
    "style.css"
    "hakka-proxy-gas.js"
    "test-get-api.sh"
)

MISSING_FILES=()

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file (缺失)"
        MISSING_FILES+=("$file")
    fi
done

echo ""

# 檢查配置文件
echo "⚙️ 檢查配置設定..."

if [ -f "config.js" ]; then
    if grep -q "YOUR_GEMINI_API_KEY" config.js; then
        echo "⚠️  config.js: 請設定你的 Gemini API Key"
    else
        echo "✅ config.js: Gemini API Key 已設定"
    fi
    
    if grep -q "YOUR_GAS_API_URL" config.js; then
        echo "⚠️  config.js: 請設定你的 Google Apps Script URL"
    else
        echo "✅ config.js: Google Apps Script URL 已設定"
    fi
else
    echo "❌ config.js 不存在"
fi

echo ""

# 檢查瀏覽器兼容性工具
echo "🌐 檢查可用的本地服務器..."

SERVERS=()

if command -v python3 >/dev/null 2>&1; then
    SERVERS+=("Python 3")
fi

if command -v python >/dev/null 2>&1; then
    SERVERS+=("Python 2")
fi

if command -v php >/dev/null 2>&1; then
    SERVERS+=("PHP")
fi

if command -v npx >/dev/null 2>&1; then
    SERVERS+=("Node.js http-server")
fi

if [ ${#SERVERS[@]} -eq 0 ]; then
    echo "⚠️  沒有找到可用的 HTTP 服務器工具"
    echo "   建議安裝: brew install python3"
else
    echo "✅ 可用的服務器: ${SERVERS[*]}"
fi

echo ""

# 總結
echo "📋 檢查總結"
echo "==========="

if [ ${#MISSING_FILES[@]} -eq 0 ]; then
    echo "✅ 所有檔案完整"
else
    echo "❌ 缺失檔案: ${MISSING_FILES[*]}"
fi

echo ""
echo "🚀 快速開始："
echo "1. 編輯 config.js 設定 API Keys"
echo "2. 執行 ./start-server.sh 啟動本地服務器"
echo "3. 在瀏覽器開啟 http://localhost:8000/index-modular.html"
echo ""
echo "📋 或者直接開啟 index.html (單一檔案版本)"
