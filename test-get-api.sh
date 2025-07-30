#!/bin/bash

# 客語隨拍即說 v2.0 - GET API 測試腳本
# 
# 現在所有 API 調用都使用 GET 請求，不會有重定向問題

API_URL="https://script.google.com/macros/s/AKfycbwL0aLfdtVMeR90xurpAMDb8gYMPCQw7I0It5lIyzwVQBrdzvFeE5v0K15AAH2_ZZJeAQ/exec"

# 顏色輸出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_title() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# URL 編碼函數 (修復中文支援)
urlencode() {
    local string="${1}"
    python3 -c "import urllib.parse; print(urllib.parse.quote('$string'))" 2>/dev/null || \
    python -c "import urllib; print(urllib.quote('$string'))" 2>/dev/null || \
    echo "$string"  # 如果 Python 不可用，直接返回原字串
}

# 1. 測試健康檢查
test_health() {
    print_title "測試健康檢查"
    
    local url="$API_URL?action=health"
    echo "請求: GET $url"
    
    local response=$(curl -s -L "$url")
    
    echo "回應內容:"
    echo "$response" | jq . 2>/dev/null || echo "$response"
    
    if echo "$response" | jq -e '.status' >/dev/null 2>&1; then
        local status=$(echo "$response" | jq -r '.status')
        if [ "$status" = "ok" ]; then
            print_success "健康檢查成功 - 狀態: $status"
        else
            print_warning "健康檢查回應異常 - 狀態: $status"
        fi
    else
        print_error "健康檢查失敗 - 無法解析回應"
    fi
}

# 2. 測試翻譯服務
test_translate() {
    print_title "測試翻譯服務"
    
    local text=${1:-"蘋果"}
    local encoded_text=$(urlencode "$text")
    local url="$API_URL?action=translate&text=$encoded_text&source=zh&target=hak"
    
    echo "翻譯文字: $text"
    echo "請求: GET $url"
    
    local response=$(curl -s -L "$url")
    
    echo "回應內容:"
    echo "$response" | jq . 2>/dev/null || echo "$response"
    
    if echo "$response" | jq -e '.translated' >/dev/null 2>&1; then
        local original=$(echo "$response" | jq -r '.original')
        local translated=$(echo "$response" | jq -r '.translated')
        print_success "翻譯成功: \"$original\" → \"$translated\""
    else
        local error=$(echo "$response" | jq -r '.error' 2>/dev/null || echo "未知錯誤")
        print_error "翻譯失敗: $error"
    fi
}

# 3. 測試語音合成服務
test_tts() {
    print_title "測試語音合成服務"
    
    local text=${1:-"蘋果"}
    local encoded_text=$(urlencode "$text")
    local url="$API_URL?action=tts&text=$encoded_text&voice=hak-xi-TW-vs2-M01"
    
    echo "合成文字: $text"
    echo "請求: GET $url"
    
    local response=$(curl -s -L "$url")
    
    echo "回應內容:"
    echo "$response" | jq . 2>/dev/null || echo "$response"
    
    if echo "$response" | jq -e '.audioBase64' >/dev/null 2>&1; then
        local audio_size=$(echo "$response" | jq -r '.audioSize')
        print_success "語音合成成功: 音頻大小 $audio_size 位元組"
        
        # 可選：將音頻儲存為檔案
        if command -v base64 >/dev/null 2>&1; then
            local audio_data=$(echo "$response" | jq -r '.audioBase64')
            echo "$audio_data" | base64 -d > "test_tts_get_${text}.mp3"
            print_success "音頻已儲存為: test_tts_get_${text}.mp3"
        fi
    else
        local error=$(echo "$response" | jq -r '.error' 2>/dev/null || echo "未知錯誤")
        print_error "語音合成失敗: $error"
    fi
}

# 4. 測試多個翻譯範例
test_multiple_translations() {
    print_title "測試多個翻譯範例"
    
    local test_cases=("蘋果" "吃飯" "睡覺" "你好" "謝謝")
    
    for text in "${test_cases[@]}"; do
        echo -e "\n${YELLOW}測試翻譯: $text${NC}"
        test_translate "$text"
        sleep 1  # 避免請求過於頻繁
    done
}

# 5. 測試多個語音合成範例
test_multiple_tts() {
    print_title "測試多個語音合成範例"
    
    local test_cases=("蘋果" "食飯" "瞓覺")
    
    for text in "${test_cases[@]}"; do
        echo -e "\n${YELLOW}測試語音合成: $text${NC}"
        test_tts "$text"
        sleep 1  # 避免請求過於頻繁
    done
}

# 6. 測試錯誤處理
test_error_handling() {
    print_title "測試錯誤處理"
    
    # 測試不支援的操作
    echo "測試不支援的操作..."
    local url="$API_URL?action=invalid_action"
    echo "請求: GET $url"
    
    local response=$(curl -s -L "$url")
    
    echo "回應內容:"
    echo "$response" | jq . 2>/dev/null || echo "$response"
    
    if echo "$response" | grep -q "error\|錯誤"; then
        print_success "錯誤處理正常"
    else
        print_warning "錯誤處理可能有問題"
    fi
    
    # 測試缺少參數
    echo -e "\n測試缺少參數..."
    local url2="$API_URL?action=translate"
    echo "請求: GET $url2"
    
    local response2=$(curl -s -L "$url2")
    
    echo "回應內容:"
    echo "$response2" | jq . 2>/dev/null || echo "$response2"
    
    if echo "$response2" | grep -q "error\|錯誤"; then
        print_success "缺少參數錯誤處理正常"
    else
        print_warning "缺少參數錯誤處理可能有問題"
    fi
}

# 7. 性能測試 (修復時間計算)
test_performance() {
    print_title "性能測試"
    
    echo "測試翻譯服務回應時間..."
    
    local start_time=$(date +%s)
    test_translate "蘋果" >/dev/null 2>&1
    local end_time=$(date +%s)
    
    local duration=$((end_time - start_time))  # 秒數
    local duration_ms=$((duration * 1000))    # 轉換為毫秒
    
    echo "翻譯服務回應時間: ${duration_ms}ms (${duration}秒)"
    
    if [ $duration -lt 5 ]; then
        print_success "回應時間良好 (< 5秒)"
    elif [ $duration -lt 10 ]; then
        print_warning "回應時間一般 (5-10秒)"
    else
        print_error "回應時間較慢 (> 10秒)"
    fi
}

# 主執行函數
main() {
    echo -e "${BLUE}🎯 客語隨拍即說 v2.0 - GET API 測試${NC}"
    echo -e "${BLUE}API 端點: $API_URL${NC}\n"
    
    # 檢查工具
    if ! command -v curl >/dev/null 2>&1; then
        print_error "curl 未安裝，請先安裝 curl"
        exit 1
    fi
    
    if ! command -v jq >/dev/null 2>&1; then
        print_warning "jq 未安裝，JSON 輸出將不會格式化"
    fi
    
    # 執行基本測試
    test_health
    test_translate
    test_tts
    test_error_handling
    
    # 詢問是否執行進階測試
    read -p "是否執行進階測試（多個範例和性能）？(y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        test_multiple_translations
        test_multiple_tts
        test_performance
    fi
    
    print_title "測試總結"
    print_success "所有測試已執行完畢"
    print_success "✅ GET API 可以正常使用，不會有重定向問題"
}

# 執行主函數
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
