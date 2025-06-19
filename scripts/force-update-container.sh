#!/bin/bash

# ПРИНУДИТЕЛЬНОЕ ОБНОВЛЕНИЕ CONTAINER APP
# Этот скрипт принудительно обновит Container App с правильными переменными

set -e

echo "🚨 ПРИНУДИТЕЛЬНОЕ ОБНОВЛЕНИЕ CONTAINER APP"
echo "=========================================="

RESOURCE_GROUP="tender-rg"
CONTAINER_APP_NAME="tender-api"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🔍 Проверяем существующие ресурсы Azure...${NC}"

# Function to get or create PostgreSQL
get_database_url() {
    echo "📋 Поиск PostgreSQL серверов..."
    POSTGRES_SERVERS=($(az postgres flexible-server list --resource-group $RESOURCE_GROUP --query "[].name" -o tsv 2>/dev/null || echo ""))
    
    if [ ${#POSTGRES_SERVERS[@]} -gt 0 ]; then
        POSTGRES_SERVER=${POSTGRES_SERVERS[0]}
        POSTGRES_HOST=$(az postgres flexible-server show --name $POSTGRES_SERVER --resource-group $RESOURCE_GROUP --query "fullyQualifiedDomainName" -o tsv)
        echo -e "${GREEN}✅ PostgreSQL найден: $POSTGRES_SERVER${NC}"
        echo "postgresql://tenderadmin:TenderAI_2024_SecurePass!@${POSTGRES_HOST}:5432/tenderdb?sslmode=require"
    else
        echo -e "${RED}❌ PostgreSQL не найден, создаем...${NC}"
        
        # Create PostgreSQL server
        POSTGRES_SERVER="tender-db-$(date +%s)"
        az postgres flexible-server create \
            --resource-group $RESOURCE_GROUP \
            --name $POSTGRES_SERVER \
            --location westeurope \
            --admin-user tenderadmin \
            --admin-password "TenderAI_2024_SecurePass!" \
            --sku-name Standard_B1ms \
            --tier Burstable \
            --version 15 \
            --storage-size 32 \
            --public-access 0.0.0.0 \
            --yes
            
        # Create database
        az postgres flexible-server db create \
            --resource-group $RESOURCE_GROUP \
            --server-name $POSTGRES_SERVER \
            --database-name tenderdb
            
        POSTGRES_HOST=$(az postgres flexible-server show --name $POSTGRES_SERVER --resource-group $RESOURCE_GROUP --query "fullyQualifiedDomainName" -o tsv)
        echo -e "${GREEN}✅ PostgreSQL создан: $POSTGRES_SERVER${NC}"
        echo "postgresql://tenderadmin:TenderAI_2024_SecurePass!@${POSTGRES_HOST}:5432/tenderdb?sslmode=require"
    fi
}

# Function to get or create Cognitive Services
get_cognitive_services() {
    echo "🧠 Поиск Cognitive Services..."
    COGNITIVE_SERVICES=($(az cognitiveservices account list --resource-group $RESOURCE_GROUP --query "[].name" -o tsv 2>/dev/null || echo ""))
    
    if [ ${#COGNITIVE_SERVICES[@]} -gt 0 ]; then
        COGNITIVE_SERVICE=${COGNITIVE_SERVICES[0]}
        echo -e "${GREEN}✅ Cognitive Services найден: $COGNITIVE_SERVICE${NC}"
    else
        echo -e "${RED}❌ Cognitive Services не найден, создаем...${NC}"
        
        # Create Cognitive Services
        COGNITIVE_SERVICE="tender-cognitive-$(date +%s)"
        az cognitiveservices account create \
            --resource-group $RESOURCE_GROUP \
            --name $COGNITIVE_SERVICE \
            --location westeurope \
            --kind CognitiveServices \
            --sku S0 \
            --yes
            
        echo -e "${GREEN}✅ Cognitive Services создан: $COGNITIVE_SERVICE${NC}"
    fi
    
    COGNITIVE_ENDPOINT=$(az cognitiveservices account show --name $COGNITIVE_SERVICE --resource-group $RESOURCE_GROUP --query "properties.endpoint" -o tsv)
    COGNITIVE_KEY=$(az cognitiveservices account keys list --name $COGNITIVE_SERVICE --resource-group $RESOURCE_GROUP --query "key1" -o tsv)
    
    echo "ENDPOINT: $COGNITIVE_ENDPOINT"
    echo "KEY: ${COGNITIVE_KEY:0:10}..."
}

# Get Storage connection
get_storage_connection() {
    echo "💾 Поиск Storage Account..."
    STORAGE_ACCOUNTS=($(az storage account list --resource-group $RESOURCE_GROUP --query "[].name" -o tsv))
    
    if [ ${#STORAGE_ACCOUNTS[@]} -gt 0 ]; then
        STORAGE_ACCOUNT=${STORAGE_ACCOUNTS[0]}
        STORAGE_KEY=$(az storage account keys list --account-name $STORAGE_ACCOUNT --resource-group $RESOURCE_GROUP --query "[0].value" -o tsv)
        echo -e "${GREEN}✅ Storage найден: $STORAGE_ACCOUNT${NC}"
        echo "DefaultEndpointsProtocol=https;AccountName=${STORAGE_ACCOUNT};AccountKey=${STORAGE_KEY};EndpointSuffix=core.windows.net"
    else
        echo -e "${RED}❌ Storage Account не найден${NC}"
        echo ""
    fi
}

echo -e "${YELLOW}📋 Собираем информацию о ресурсах...${NC}"

# Get all connection strings
DATABASE_URL=$(get_database_url)
get_cognitive_services
STORAGE_CONN=$(get_storage_connection)

echo -e "${YELLOW}🔧 Принудительно обновляем Container App...${NC}"

# Force update Container App with all environment variables
az containerapp update \
    --name $CONTAINER_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --set-env-vars \
        DATABASE_URL="$DATABASE_URL" \
        COGNITIVE_SERVICES_KEY="$COGNITIVE_KEY" \
        COGNITIVE_SERVICES_ENDPOINT="$COGNITIVE_ENDPOINT" \
        AZURE_STORAGE_CONNECTION_STRING="$STORAGE_CONN" \
        GEMINI_API_KEY="$(az containerapp show --name $CONTAINER_APP_NAME --resource-group $RESOURCE_GROUP --query 'properties.template.containers[0].env[?name==`GEMINI_API_KEY`].value' -o tsv 2>/dev/null || echo '')"

echo -e "${GREEN}✅ Container App принудительно обновлен!${NC}"

echo -e "${YELLOW}🔄 Принудительно перезапускаем Container App...${NC}"

# Force restart by updating image tag with timestamp
CURRENT_IMAGE=$(az containerapp show --name $CONTAINER_APP_NAME --resource-group $RESOURCE_GROUP --query 'properties.template.containers[0].image' -o tsv)
BASE_IMAGE=${CURRENT_IMAGE%:*}
NEW_TAG="force-update-$(date +%s)"

# Update with new tag to force restart
az containerapp update \
    --name $CONTAINER_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --image "${BASE_IMAGE}:latest"

echo -e "${GREEN}✅ Container App перезапущен!${NC}"

echo -e "${YELLOW}⏳ Ожидаем перезапуск (60 секунд)...${NC}"
sleep 60

# Test the API
API_URL="https://$(az containerapp show --name $CONTAINER_APP_NAME --resource-group $RESOURCE_GROUP --query 'properties.configuration.ingress.fqdn' -o tsv)"

echo -e "${YELLOW}🧪 Тестируем API после обновления...${NC}"

echo "📊 API Status:"
curl -s "$API_URL/" | python3 -m json.tool 2>/dev/null || curl -s "$API_URL/"

echo -e "\n📋 Environment Variables:"
curl -s "$API_URL/api/debug-env" | python3 -m json.tool 2>/dev/null || curl -s "$API_URL/api/debug-env"

echo -e "\n${GREEN}🎉 ПРИНУДИТЕЛЬНОЕ ОБНОВЛЕНИЕ ЗАВЕРШЕНО!${NC}"
echo -e "${GREEN}📊 API URL: $API_URL${NC}"
echo -e "${GREEN}🧪 Тестирование: http://127.0.0.1:8080/test-full-features.html${NC}"
echo "" 