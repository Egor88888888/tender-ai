#!/bin/bash

# Web-based Azure deployment without installing Azure CLI
echo "🚀 Web-based Azure Stack Deployment"
echo "======================================="

# Check if we're running in GitHub Codespaces or similar
if command -v code &> /dev/null; then
    echo "✅ Running in development environment"
else
    echo "💻 Running on local machine"
fi

echo ""
echo "🎯 ПРОСТЕЙШИЕ ВАРИАНТЫ РАЗВЕРТЫВАНИЯ:"
echo ""

echo "1️⃣  GITHUB ACTIONS (рекомендуется):"
echo "   → Откройте: https://github.com/Egor88888888/tender-ai/actions"
echo "   → Найдите 'Deploy Full Azure Stack'"
echo "   → Нажмите 'Run workflow'"
echo "   → Поставьте галочку 'Deploy new infrastructure'"
echo "   → Нажмите зеленую кнопку 'Run workflow'"
echo ""

echo "2️⃣  AZURE PORTAL (ручной способ):"
echo "   → Откройте: https://portal.azure.com"
echo "   → Template specs → Create → Custom deployment"
echo "   → Загрузите файл: infra/azuredeploy-full.bicep"
echo "   → Заполните параметры и создайте"
echo ""

echo "3️⃣  AZURE CLOUD SHELL (без установки):"
echo "   → Откройте: https://shell.azure.com"
echo "   → Склонируйте репозиторий: git clone https://github.com/Egor88888888/tender-ai.git"
echo "   → Запустите: cd tender-ai && ./scripts/deploy-full-azure.sh"
echo ""

echo "📋 CURRENT STATUS:"
echo "=================="

# Test current API status
API_URL="https://tender-api.bravesmoke-248b9fb5.westeurope.azurecontainerapps.io"

echo "Testing API at: $API_URL"
echo ""

if curl -f -s "$API_URL/health" > /dev/null; then
    echo "✅ API is running"
    
    echo "Current features:"
    curl -s "$API_URL/" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    features = data.get('features', {})
    for name, status in features.items():
        icon = '✅' if status else '❌'
        print(f'   {icon} {name}: {status}')
except:
    print('   ❌ Could not parse API response')
"
    
    echo ""
    echo "🧪 TEST LINKS:"
    echo "   📊 API Status: $API_URL/"
    echo "   📚 API Docs: $API_URL/docs"
    echo "   🔧 Debug Info: $API_URL/api/debug-env"
    
else
    echo "❌ API is not responding"
fi

echo ""
echo "💡 WHAT YOU NEED:"
echo "=================="
echo "After deployment, you'll have:"
echo "   🗄️  PostgreSQL Database"
echo "   🧠 Computer Vision OCR"
echo "   📄 Form Recognizer"
echo "   💾 Blob Storage"
echo "   🤖 Gemini AI (already working)"
echo "   🎨 React Frontend"
echo ""

echo "💰 ESTIMATED COST: $50-150/month"
echo ""

echo "🚀 NEXT STEPS:"
echo "=============="
echo "1. Choose deployment method above"
echo "2. Wait 10-15 minutes for completion"
echo "3. Test all features at $API_URL/docs"
echo "4. Upload documents and test OCR"
echo "5. Try AI analysis features"
echo ""

echo "🆘 NEED HELP?"
echo "=============="
echo "If anything breaks, just ask me and I'll fix it immediately!"
echo "" 