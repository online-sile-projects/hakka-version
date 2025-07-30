#!/bin/bash

# 客語隨拍即說 v2.0 - 本地測試服務器啟動腳本

echo "🎯 客語隨拍即說 v2.0 - 本地測試服務器"
echo "========================================="

# 檢查 Python 是否可用
if command -v python3 >/dev/null 2>&1; then
    PORT=8000
    echo "✅ 使用 Python3 啟動 HTTP 服務器"
    echo "📍 服務器地址: http://localhost:$PORT"
    echo ""
    echo "📱 請在瀏覽器中開啟以下任一頁面："
    echo "   • http://localhost:$PORT/index.html (單一檔案版本)"
    echo "   • http://localhost:$PORT/index-modular.html (模組化版本)"
    echo ""
    echo "⚠️  記得先在 config.js 中設定你的 Gemini API Key"
    echo ""
    echo "按 Ctrl+C 停止服務器"
    echo "========================================="
    echo ""
    
    python3 -m http.server $PORT
    
elif command -v python >/dev/null 2>&1; then
    PORT=8000
    echo "✅ 使用 Python2 啟動 HTTP 服務器"
    echo "📍 服務器地址: http://localhost:$PORT"
    echo ""
    echo "📱 請在瀏覽器中開啟以下任一頁面："
    echo "   • http://localhost:$PORT/index.html (單一檔案版本)"
    echo "   • http://localhost:$PORT/index-modular.html (模組化版本)"
    echo ""
    echo "⚠️  記得先在 config.js 中設定你的 Gemini API Key"
    echo ""
    echo "按 Ctrl+C 停止服務器"
    echo "========================================="
    echo ""
    
    python -m SimpleHTTPServer $PORT
    
elif command -v php >/dev/null 2>&1; then
    PORT=8000
    echo "✅ 使用 PHP 啟動 HTTP 服務器"
    echo "📍 服務器地址: http://localhost:$PORT"
    echo ""
    echo "📱 請在瀏覽器中開啟以下任一頁面："
    echo "   • http://localhost:$PORT/index.html (單一檔案版本)"
    echo "   • http://localhost:$PORT/index-modular.html (模組化版本)"
    echo ""
    echo "⚠️  記得先在 config.js 中設定你的 Gemini API Key"
    echo ""
    echo "按 Ctrl+C 停止服務器"
    echo "========================================="
    echo ""
    
    php -S localhost:$PORT
    
elif command -v npx >/dev/null 2>&1; then
    PORT=8080
    echo "✅ 使用 Node.js http-server 啟動 HTTP 服務器"
    echo "📍 服務器地址: http://localhost:$PORT"
    echo ""
    echo "📱 請在瀏覽器中開啟以下任一頁面："
    echo "   • http://localhost:$PORT/index.html (單一檔案版本)"
    echo "   • http://localhost:$PORT/index-modular.html (模組化版本)"
    echo ""
    echo "⚠️  記得先在 config.js 中設定你的 Gemini API Key"
    echo ""
    echo "按 Ctrl+C 停止服務器"
    echo "========================================="
    echo ""
    
    npx http-server -p $PORT
    
else
    echo "❌ 找不到可用的 HTTP 服務器"
    echo ""
    echo "請安裝以下任一工具："
    echo "   • Python 3: brew install python3"
    echo "   • Python 2: brew install python@2"
    echo "   • PHP: brew install php"
    echo "   • Node.js: brew install node"
    echo ""
    echo "或者直接開啟 index.html 檔案（某些功能可能受限）"
    exit 1
fi
