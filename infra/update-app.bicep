@description('Location for all resources')
param location string = resourceGroup().location
@description('Project short name')
param project string = 'tender'
@description('Container image tag for API')
param apiImage string

// Get existing Container App
resource existingApp 'Microsoft.App/containerApps@2023-05-01' existing = {
  name: '${project}-api'
}

// Update Container App with new image
resource apiApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: existingApp.name
  location: location
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    managedEnvironmentId: existingApp.properties.managedEnvironmentId
    configuration: {
      secrets: [
        {
          name: 'gemini-api-key'
          value: 'temp-value'
        }
        {
          name: 'storage-conn'
          value: 'DefaultEndpointsProtocol=https;AccountName=storage;AccountKey=placeholder;EndpointSuffix=core.windows.net'
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