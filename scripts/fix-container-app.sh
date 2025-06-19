#!/bin/bash

# Quick fix script to update Container App with all required environment variables
# This will manually configure Database, OCR, and Computer Vision

set -e

echo "🔧 БЫСТРОЕ ИСПРАВЛЕНИЕ CONTAINER APP"
echo "=================================="

RESOURCE_GROUP="tender-rg"
CONTAINER_APP_NAME="tender-api"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}1. Получаем информацию о ресурсах...${NC}"

# Get PostgreSQL info
echo "📋 Получаем данные PostgreSQL..."
POSTGRES_SERVERS=($(az postgres flexible-server list --resource-group $RESOURCE_GROUP --query "[].name" -o tsv))
if [ ${#POSTGRES_SERVERS[@]} -gt 0 ]; then
    POSTGRES_SERVER=${POSTGRES_SERVERS[0]}
    POSTGRES_HOST=$(az postgres flexible-server show --name $POSTGRES_SERVER --resource-group $RESOURCE_GROUP --query "fullyQualifiedDomainName" -o tsv)
    DATABASE_URL="postgresql://tenderadmin:TenderAI_2024_SecurePass!@${POSTGRES_HOST}:5432/tenderdb?sslmode=require"
    echo -e "${GREEN}✅ PostgreSQL найден: $POSTGRES_SERVER${NC}"
else
    echo -e "${RED}❌ PostgreSQL сервер не найден${NC}"
    DATABASE_URL=""
fi

# Get Cognitive Services info  
echo "🧠 Получаем данные Cognitive Services..."
COGNITIVE_SERVICES=($(az cognitiveservices account list --resource-group $RESOURCE_GROUP --query "[].name" -o tsv))
if [ ${#COGNITIVE_SERVICES[@]} -gt 0 ]; then
    COGNITIVE_SERVICE=${COGNITIVE_SERVICES[0]}
    COGNITIVE_ENDPOINT=$(az cognitiveservices account show --name $COGNITIVE_SERVICE --resource-group $RESOURCE_GROUP --query "properties.endpoint" -o tsv)
    COGNITIVE_KEY=$(az cognitiveservices account keys list --name $COGNITIVE_SERVICE --resource-group $RESOURCE_GROUP --query "key1" -o tsv)
    echo -e "${GREEN}✅ Cognitive Services найден: $COGNITIVE_SERVICE${NC}"
else
    echo -e "${RED}❌ Cognitive Services не найден${NC}"
    COGNITIVE_ENDPOINT=""
    COGNITIVE_KEY=""
fi

# Get Storage info
echo "💾 Получаем данные Storage..."
STORAGE_ACCOUNTS=($(az storage account list --resource-group $RESOURCE_GROUP --query "[].name" -o tsv))
if [ ${#STORAGE_ACCOUNTS[@]} -gt 0 ]; then
    STORAGE_ACCOUNT=${STORAGE_ACCOUNTS[0]}
    STORAGE_KEY=$(az storage account keys list --account-name $STORAGE_ACCOUNT --resource-group $RESOURCE_GROUP --query "[0].value" -o tsv)
    STORAGE_CONN="DefaultEndpointsProtocol=https;AccountName=${STORAGE_ACCOUNT};AccountKey=${STORAGE_KEY};EndpointSuffix=core.windows.net"
    echo -e "${GREEN}✅ Storage найден: $STORAGE_ACCOUNT${NC}"
else
    echo -e "${RED}❌ Storage Account не найден${NC}"
    STORAGE_CONN=""
fi

echo -e "${YELLOW}2. Обновляем переменные окружения Container App...${NC}"

# Update Container App environment variables
ENV_VARS=""

if [ ! -z "$DATABASE_URL" ]; then
    ENV_VARS="$ENV_VARS DATABASE_URL=\"$DATABASE_URL\""
fi

if [ ! -z "$COGNITIVE_KEY" ]; then
    ENV_VARS="$ENV_VARS COGNITIVE_SERVICES_KEY=\"$COGNITIVE_KEY\""
fi

if [ ! -z "$COGNITIVE_ENDPOINT" ]; then
    ENV_VARS="$ENV_VARS COGNITIVE_SERVICES_ENDPOINT=\"$COGNITIVE_ENDPOINT\""
fi

if [ ! -z "$STORAGE_CONN" ]; then
    ENV_VARS="$ENV_VARS AZURE_STORAGE_CONNECTION_STRING=\"$STORAGE_CONN\""
fi

# Gemini API Key (keep existing if set)
ENV_VARS="$ENV_VARS GEMINI_API_KEY=\"$(az containerapp show --name $CONTAINER_APP_NAME --resource-group $RESOURCE_GROUP --query 'properties.template.containers[0].env[?name==`GEMINI_API_KEY`].value' -o tsv)\""

echo "📝 Применяем переменные окружения..."

# Apply environment variables to Container App
az containerapp update \
    --name $CONTAINER_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --set-env-vars $ENV_VARS

echo -e "${GREEN}✅ Container App обновлен!${NC}"

echo -e "${YELLOW}3. Проверяем результат...${NC}"

# Wait for restart
sleep 30

# Test API
API_URL="https://$(az containerapp show --name $CONTAINER_APP_NAME --resource-group $RESOURCE_GROUP --query 'properties.configuration.ingress.fqdn' -o tsv)"

echo "🧪 Тестируем API..."
curl -s "$API_URL/" | grep -q "database.*true" && echo -e "${GREEN}✅ База данных подключена${NC}" || echo -e "${RED}❌ База данных не подключена${NC}"
curl -s "$API_URL/" | grep -q "computer_vision.*true" && echo -e "${GREEN}✅ Computer Vision настроен${NC}" || echo -e "${RED}❌ Computer Vision не настроен${NC}"

echo ""
echo -e "${GREEN}🎉 ИСПРАВЛЕНИЕ ЗАВЕРШЕНО!${NC}"
echo ""
echo "📊 Проверьте статус API: $API_URL"
echo "🧪 Полное тестирование: http://127.0.0.1:8080/test-full-features.html"
echo "" 