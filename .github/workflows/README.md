# FlexStaff CI/CD Pipeline

This directory contains GitHub Actions workflows for building and deploying the FlexStaff platform.

## Overview

The FlexStaff platform consists of three main components:
- **Backend** - Node.js/Express API service
- **Frontend** - React user-facing application
- **Admin** - React administration portal

## Workflows

### `flexstaff-build-deploy.yml`

Main build and deployment pipeline that:
- Detects changes in backend, frontend, or admin directories
- Builds Docker images for changed components
- Pushes images to Azure Container Registry (ACR)
- Supports manual triggers with component selection

#### Triggers

1. **Automatic (Push to branches)**
   - `main` - Production builds
   - `develop` - Development builds
   - `release/**` - Release candidate builds

2. **Pull Requests**
   - Builds images without pushing (validation only)

3. **Manual Dispatch**
   - Allows selection of target environment
   - Allows selection of specific components to build

#### Image Tagging Strategy

Images are tagged with:
- **Branch name** - e.g., `main`, `develop`
- **Git SHA** - e.g., `main-abc1234`
- **Semantic version** - e.g., `1.2.3`, `1.2` (if tagged)
- **latest** - Only for the default branch (main)

## Setup Instructions

### 1. Azure Container Registry

Create an Azure Container Registry if you don't have one:

```bash
# Create resource group
az group create --name flexstaff-rg --location uksouth

# Create ACR
az acr create \
  --resource-group flexstaff-rg \
  --name msdpacr \
  --sku Basic
```

### 2. Azure Service Principal (for OIDC)

Create a service principal with access to ACR:

```bash
# Get ACR resource ID
ACR_ID=$(az acr show --name msdpacr --query id --output tsv)

# Get subscription ID
SUBSCRIPTION_ID=$(az account show --query id --output tsv)

# Create service principal
az ad sp create-for-rbac \
  --name "github-flexstaff-sp" \
  --role "AcrPush" \
  --scopes $ACR_ID \
  --sdk-auth
```

Save the output JSON - you'll need these values for GitHub secrets.

### 3. Configure Federated Credentials (OIDC)

Set up OIDC federation for passwordless authentication:

```bash
# Get the application ID from the service principal
APP_ID=$(az ad sp list --display-name "github-flexstaff-sp" --query [0].appId --output tsv)

# Create federated credential for main branch
az ad app federated-credential create \
  --id $APP_ID \
  --parameters '{
    "name": "github-flexstaff-main",
    "issuer": "https://token.actions.githubusercontent.com",
    "subject": "repo:msdp-platform/msdp-flexstaff:ref:refs/heads/main",
    "audiences": ["api://AzureADTokenExchange"]
  }'

# Create federated credential for develop branch
az ad app federated-credential create \
  --id $APP_ID \
  --parameters '{
    "name": "github-flexstaff-develop",
    "issuer": "https://token.actions.githubusercontent.com",
    "subject": "repo:msdp-platform/msdp-flexstaff:ref:refs/heads/develop",
    "audiences": ["api://AzureADTokenExchange"]
  }'

# Create federated credential for pull requests
az ad app federated-credential create \
  --id $APP_ID \
  --parameters '{
    "name": "github-flexstaff-pr",
    "issuer": "https://token.actions.githubusercontent.com",
    "subject": "repo:msdp-platform/msdp-flexstaff:pull_request",
    "audiences": ["api://AzureADTokenExchange"]
  }'
```

### 4. GitHub Repository Secrets

Add the following secrets to your GitHub repository:

Go to: **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Required secrets:

| Secret Name | Description | How to Get |
|------------|-------------|------------|
| `AZURE_CLIENT_ID` | Service Principal Application (client) ID | From step 2 output: `clientId` |
| `AZURE_TENANT_ID` | Azure AD Tenant ID | From step 2 output: `tenantId` |
| `AZURE_SUBSCRIPTION_ID` | Azure Subscription ID | From step 2 output: `subscriptionId` |

### 5. Update Workflow Variables

Edit `.github/workflows/flexstaff-build-deploy.yml` and update:

```yaml
env:
  ACR_NAME: msdpacr  # Your ACR name
  ACR_REGISTRY: msdpacr.azurecr.io  # Your ACR URL
```

## Usage

### Automatic Builds

Push code to `main`, `develop`, or `release/*` branches:

```bash
git add .
git commit -m "Update backend API"
git push origin main
```

The workflow will automatically:
1. Detect which components changed
2. Build Docker images for changed components
3. Push images to ACR with appropriate tags

### Manual Builds

Trigger manually via GitHub UI:

1. Go to **Actions** → **FlexStaff Build and Deploy to ACR**
2. Click **Run workflow**
3. Select:
   - Target environment (dev/staging/production)
   - Components to build (all, or specific ones)
4. Click **Run workflow**

### Pull Request Validation

When you create a pull request:
- All changed components are built
- Images are NOT pushed to ACR (validation only)
- Build status is reported on the PR

## Image Locations

Built images are available at:

```
msdpacr.azurecr.io/flexstaff/backend:<tag>
msdpacr.azurecr.io/flexstaff/frontend:<tag>
msdpacr.azurecr.io/flexstaff/admin:<tag>
```

### Pulling Images

```bash
# Login to ACR
az acr login --name msdpacr

# Pull images
docker pull msdpacr.azurecr.io/flexstaff/backend:latest
docker pull msdpacr.azurecr.io/flexstaff/frontend:latest
docker pull msdpacr.azurecr.io/flexstaff/admin:latest
```

## Dockerfile Details

### Backend (`backend/Dockerfile`)

Multi-stage build:
- **Builder stage**: Builds TypeScript to JavaScript
- **Production stage**:
  - Minimal Node.js Alpine image
  - Production dependencies only
  - Non-root user execution
  - Health check endpoint
  - Exposes port 3000

### Frontend & Admin (`frontend/Dockerfile`, `admin/Dockerfile`)

Multi-stage build:
- **Builder stage**: Builds React application
- **Production stage**:
  - Nginx Alpine image
  - Custom nginx.conf for SPA routing
  - Non-root user execution
  - Health check endpoint
  - Exposes port 8080

## Monitoring Builds

### GitHub Actions UI

View build status:
1. Go to **Actions** tab in GitHub
2. Select **FlexStaff Build and Deploy to ACR**
3. View recent runs and logs

### Build Summary

Each workflow run creates a summary showing:
- Trigger type and branch
- Build status for each component
- Image locations

### Notifications

Configure GitHub notifications for workflow failures:
1. Go to **Settings** → **Notifications**
2. Enable **Actions** notifications

## Troubleshooting

### Build Failures

**Issue**: "Failed to login to ACR"
- Check AZURE_CLIENT_ID, AZURE_TENANT_ID, AZURE_SUBSCRIPTION_ID secrets
- Verify federated credentials are configured correctly
- Ensure service principal has AcrPush role

**Issue**: "Docker build failed"
- Check Dockerfile syntax
- Verify all required files exist in context
- Review build logs for specific errors

**Issue**: "Image not found in ACR"
- Images are only pushed on push events (not PRs)
- Check if build completed successfully
- Verify ACR name in workflow matches actual ACR

### Manual Validation

Test Dockerfiles locally:

```bash
# Build backend
cd backend
docker build -t flexstaff-backend:test .

# Build frontend
cd frontend
docker build -t flexstaff-frontend:test .

# Build admin
cd admin
docker build -t flexstaff-admin:test .
```

## Security Best Practices

1. **OIDC Authentication**: Uses Azure AD federated credentials (no passwords stored)
2. **Non-root Users**: All containers run as non-root users
3. **Minimal Images**: Alpine-based images for smaller attack surface
4. **Health Checks**: All images include health check endpoints
5. **Cache Layers**: GitHub Actions cache for faster builds
6. **Dependency Scanning**: Consider adding Trivy or Snyk scanning

## Next Steps

1. **ArgoCD Integration**: Deploy images from ACR to Kubernetes
2. **Environment Promotion**: Automatic promotion from dev → staging → production
3. **Database Migrations**: Add migration steps to deployment
4. **Smoke Tests**: Add post-deployment validation
5. **Rollback Strategy**: Implement automatic rollback on failures

## Support

For issues or questions:
- Create an issue in the repository
- Contact the DevOps team
- Check existing workflow runs for examples
