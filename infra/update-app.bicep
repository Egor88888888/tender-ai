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
  identity: existingApp.identity
  properties: {
    managedEnvironmentId: existingApp.properties.managedEnvironmentId
    configuration: existingApp.properties.configuration
    template: {
      containers: [
        {
          name: 'api'
          image: apiImage
          env: existingApp.properties.template.containers[0].env
        }
      ]
      scale: existingApp.properties.template.scale
    }
  }
} 