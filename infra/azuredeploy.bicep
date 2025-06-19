// Bicep template to deploy Tender AI dev stack
// Resources: Resource Group assumed, ACR, Storage, KeyVault, Container Apps Env, Container Apps, Postgres Flexible, Redis
@description('Location for all resources')
param location string = resourceGroup().location
@description('Project short name')
param project string = 'tender'

@description('Container image tag for API')
param apiImage string = 'mcr.microsoft.com/azuredocs/containerapps-helloworld:latest'
var acrName = '${project}acr${uniqueString(resourceGroup().id)}'
var saName = uniqueString('${project}sa')
var kvName = '${project}-kv-${uniqueString(resourceGroup().id)}'
var envName = '${project}-ca-env'

resource acr 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: acrName
  location: location
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: true
  }
}

// Storage Account for documents
resource sa 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: saName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    accessTier: 'Hot'
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: false
  }
}

// Key Vault for secrets
resource kv 'Microsoft.KeyVault/vaults@2023-02-01' = {
  name: kvName
  location: location
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: subscription().tenantId
    enableSoftDelete: true
    accessPolicies: []
  }
}

// Note: Gemini API Key to be set manually in Key Vault post-deploy

// Container Apps environment
resource cae 'Microsoft.App/managedEnvironments@2023-05-01' = {
  name: envName
  location: location
  properties: {}
}

// Container App: API
resource apiApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: '${project}-api'
  location: location
  properties: {
    managedEnvironmentId: cae.id
    configuration: {
      secrets: [
        {
          name: 'gemini-api-key'
          value: 'TO-BE-SET-MANUALLY'
        }
        {
          name: 'storage-conn'
          value: 'DefaultEndpointsProtocol=https;AccountName=${sa.name};AccountKey=${sa.listKeys().keys[0].value};EndpointSuffix=core.windows.net'
        }
      ]
      ingress: {
        external: true
        targetPort: 8000
      }
    }
    template: {
      containers: [
        {
          name: 'api'
          image: apiImage
          env: [
            {
              name: 'GEMINI_API_KEY'
              secretRef: 'gemini-api-key'
            }
            {
              name: 'AZURE_STORAGE_CONNECTION_STRING'
              secretRef: 'storage-conn'
            }
          ]
        }
      ]
      scale: {
        minReplicas: 0
        maxReplicas: 2
      }
    }
  }
} 

// Outputs
output acrLoginServer string = acr.properties.loginServer
output acrName string = acr.name