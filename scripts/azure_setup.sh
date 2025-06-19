#!/usr/bin/env bash
# Usage: ./scripts/azure_setup.sh <resource-group> <location> <acr-name> <container-app-env>
# Example: ./scripts/azure_setup.sh tender-rg westeurope tenderacr tender-ca-env
# Requires: az CLI logged-in OR AZURE_SUBSCRIPTION_ID env var + service principal (az login --service-principal ...)
set -euo pipefail

if [ "$#" -lt 4 ]; then
  echo "Usage: $0 <resource-group> <location> <acr-name> <container-app-env>"
  exit 1
fi

RG="$1"
LOC="$2"
ACR_NAME="$3"
CA_ENV="$4"
PROJECT="tender"

# 1. Create resource group
az group create -n "$RG" -l "$LOC"

# 2. Create ACR (Basic)
az acr create -n "$ACR_NAME" -g "$RG" --sku Basic --admin-enabled true
ACR_LOGIN_SERVER=$(az acr show -n "$ACR_NAME" --query loginServer -o tsv)

# 3. Build & push API image
az acr build -r "$ACR_NAME" -t tender-api:latest -f backend/Dockerfile .

# 4. Deploy Bicep template (infra/azuredeploy.bicep)
az deployment group create \
  -g "$RG" \
  -f infra/azuredeploy.bicep \
  -p apiImage="$ACR_LOGIN_SERVER/tender-api:latest" workerImage="$ACR_LOGIN_SERVER/tender-api:latest" project="$PROJECT" location="$LOC"

echo "Deployment complete. Configure Gemini API Key in Key Vault and restart Container App:"
echo "  az keyvault secret set --vault-name ${PROJECT}-kv -n GEMINI-API-KEY --value <KEY>"
echo "  az containerapp restart -n ${PROJECT}-api -g $RG" 