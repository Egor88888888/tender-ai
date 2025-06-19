# Azure Deployment Guide (Dev)

This directory contains a Bicep template (`azuredeploy.bicep`) that provisions the minimal Azure resources required for Tender AI MVP:

- Azure Container Registry (ACR) – stores container images
- Azure Storage Account (Blob) – stores documents (replaces MinIO)
- Azure Key Vault – secrets (Gemini key, storage connstring, etc.)
- Azure Container Apps Environment + Container App for API (Worker similar)

> PostgreSQL Flexible and Azure Cache for Redis are **not** yet included for brevity – add later.

## Prerequisites

1. Azure CLI ≥ 2.50 + [Bicep CLI](https://learn.microsoft.com/azure/azure-resource-manager/bicep/install#azure-cli).
2. Logged in: `az login`.
3. An existing **resource group**:
   ```bash
   az group create -n tender-rg -l westeurope
   ```

## Deploy

```bash
az deployment group create \
  --resource-group tender-rg \
  --template-file azuredeploy.bicep \
  --parameters apiImage=tenderacr.azurecr.io/tender-api:latest \
               workerImage=tenderacr.azurecr.io/tender-worker:latest
```

After deployment:

1. Push images to ACR: `docker push ...`.
2. Update Key Vault secret `GEMINI-API-KEY` with your actual key.
3. Restart the Container App:
   ```bash
   az containerapp restart -n tender-api -g tender-rg
   ```

## GitHub Actions

See `.github/workflows/deploy.yml` for an automated pipeline.
