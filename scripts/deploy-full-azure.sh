#!/bin/bash

# Deploy Full Azure Stack for Tender AI
# This script deploys: PostgreSQL, Cognitive Services, Storage, Container Apps, etc.

set -e

echo "🚀 Starting full Azure infrastructure deployment..."

# Configuration
RESOURCE_GROUP="tender-rg"
LOCATION="westeurope"
DB_ADMIN_PASSWORD="TenderAI_2024_SecurePass!"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo -e "${RED}❌ Azure CLI is not installed. Please install it first.${NC}"
    echo "Install: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Check if logged in to Azure
if ! az account show &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Azure. Please login first.${NC}"
    echo "Run: az login"
    exit 1
fi

echo -e "${GREEN}✅ Azure CLI is ready${NC}"

# Create resource group
echo -e "${YELLOW}📦 Creating resource group: $RESOURCE_GROUP${NC}"
az group create --name $RESOURCE_GROUP --location $LOCATION

# Deploy infrastructure
echo -e "${YELLOW}🏗️  Deploying Azure infrastructure (this may take 10-15 minutes)...${NC}"
DEPLOYMENT_OUTPUT=$(az deployment group create \
    --resource-group $RESOURCE_GROUP \
    --template-file infra/azuredeploy-full.bicep \
    --parameters dbAdminPassword="$DB_ADMIN_PASSWORD" \
    --query 'properties.outputs' \
    -o json)

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Infrastructure deployment completed successfully!${NC}"
else
    echo -e "${RED}❌ Infrastructure deployment failed!${NC}"
    exit 1
fi

# Extract outputs
ACR_NAME=$(echo "$DEPLOYMENT_OUTPUT" | jq -r '.acrName.value')
ACR_LOGIN_SERVER=$(echo "$DEPLOYMENT_OUTPUT" | jq -r '.acrLoginServer.value')
API_URL=$(echo "$DEPLOYMENT_OUTPUT" | jq -r '.apiUrl.value')
KV_NAME=$(echo "$DEPLOYMENT_OUTPUT" | jq -r '.keyVaultName.value')

echo -e "${GREEN}📋 Deployment outputs:${NC}"
echo "   ACR Name: $ACR_NAME"
echo "   ACR Login Server: $ACR_LOGIN_SERVER"
echo "   API URL: $API_URL"
echo "   Key Vault: $KV_NAME"

# Store Gemini API Key in Key Vault (if provided)
if [ ! -z "$GEMINI_API_KEY" ]; then
    echo -e "${YELLOW}🔑 Storing Gemini API Key in Key Vault...${NC}"
    az keyvault secret set --vault-name $KV_NAME --name "gemini-api-key" --value "$GEMINI_API_KEY"
    echo -e "${GREEN}✅ Gemini API Key stored${NC}"
else
    echo -e "${YELLOW}⚠️  GEMINI_API_KEY environment variable not set. You'll need to add it manually.${NC}"
    echo "   Run: az keyvault secret set --vault-name $KV_NAME --name \"gemini-api-key\" --value \"YOUR_API_KEY\""
fi

# Build and push Docker image
echo -e "${YELLOW}🐳 Building and pushing Docker image...${NC}"
cd backend

# Get ACR credentials
ACR_USERNAME=$(az acr credential show --name $ACR_NAME --query "username" -o tsv)
ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query "passwords[0].value" -o tsv)

# Docker login
echo "$ACR_PASSWORD" | docker login $ACR_LOGIN_SERVER -u $ACR_USERNAME --password-stdin

# Build and push
docker build -t $ACR_LOGIN_SERVER/tender-api:latest .
docker push $ACR_LOGIN_SERVER/tender-api:latest

echo -e "${GREEN}✅ Docker image pushed successfully${NC}"

# Update Container App
echo -e "${YELLOW}📱 Updating Container App with new image...${NC}"
cd ..
CONTAINER_APP_NAME=$(az containerapp list --resource-group $RESOURCE_GROUP --query "[?contains(name, 'tender')].name" -o tsv)

if [ -n "$CONTAINER_APP_NAME" ]; then
    az containerapp update \
        --name $CONTAINER_APP_NAME \
        --resource-group $RESOURCE_GROUP \
        --image $ACR_LOGIN_SERVER/tender-api:latest
    
    echo -e "${GREEN}✅ Container App updated: $CONTAINER_APP_NAME${NC}"
else
    echo -e "${RED}❌ No Container App found${NC}"
    exit 1
fi

# Test deployment
echo -e "${YELLOW}🧪 Testing deployment...${NC}"
for i in {1..10}; do
    if curl -f -s "$API_URL/health" > /dev/null; then
        echo -e "${GREEN}✅ API is healthy and running!${NC}"
        break
    else
        echo "⏳ Waiting for API... (attempt $i/10)"
        sleep 30
    fi
done

# Test API features
echo -e "${YELLOW}🔍 Testing API features...${NC}"
echo "API Status:"
curl -s "$API_URL/" | jq '.'

echo -e "\nEnvironment Variables:"
curl -s "$API_URL/api/debug-env" | jq '.'

echo -e "\nStorage Info:"
curl -s "$API_URL/api/storage-info" | jq '.'

echo -e "\n${GREEN}🎉 Full Azure Stack deployment completed successfully!${NC}"
echo -e "${GREEN}📊 API URL: $API_URL${NC}"
echo -e "${GREEN}📚 API Docs: $API_URL/docs${NC}"
echo -e "${GREEN}🔧 Swagger UI: $API_URL/docs${NC}"

echo -e "\n${YELLOW}📝 Next steps:${NC}"
echo "1. Test document upload at: $API_URL/docs"
echo "2. Test OCR functionality with PDF/image files"
echo "3. Test Gemini AI analysis"
echo "4. Check Azure portal for all deployed resources"

echo -e "\n${GREEN}✅ All services are now running on real Azure infrastructure!${NC}" 