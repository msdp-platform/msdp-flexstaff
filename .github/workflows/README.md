# FlexStaff CI/CD Pipeline

This directory contains documentation for the FlexStaff build and deployment process.

## Overview

The FlexStaff platform consists of three main components:
- **Backend** - Node.js/Express API service
- **Frontend** - React user-facing application
- **Admin** - React administration portal

## Build Pipeline Location

**IMPORTANT**: The FlexStaff build pipeline runs from the centralized DevOps infrastructure repository, not from this repository.

**Pipeline Location**: [msdp-platform/msdp-devops-infrastructure](https://github.com/msdp-platform/msdp-devops-infrastructure)
**Workflow File**: `.github/workflows/flexstaff-build-sync.yaml`

This approach follows the same pattern as other platform services (e.g., Backstage) and provides:
- ✅ Centralized build configuration
- ✅ Shared Azure credentials (no per-repo secrets needed)
- ✅ Consistent build processes across all platform services
- ✅ Centralized monitoring and maintenance

## No Repository Secrets Required

Unlike traditional CI/CD setups, this approach **does not require** any secrets to be configured in this repository:

- ✅ No `AZURE_CLIENT_ID` needed
- ✅ No `AZURE_TENANT_ID` needed
- ✅ No `AZURE_SUBSCRIPTION_ID` needed

All Azure credentials are managed centrally in the `msdp-devops-infrastructure` repository using organization-level secrets and GitHub App authentication.

## Triggering Builds

### Manual Trigger (GitHub UI)

1. Go to the [msdp-devops-infrastructure Actions page](https://github.com/msdp-platform/msdp-devops-infrastructure/actions)
2. Select **FlexStaff Build & Sync** workflow
3. Click **Run workflow**
4. Configure the build:
   - **Branch**: Select FlexStaff branch to build (default: `main`)
   - **Components**: Choose what to build:
     - `all` - Build all components (backend, frontend, admin)
     - `backend` - Build only backend
     - `frontend` - Build only frontend
     - `admin` - Build only admin
     - Or comma-separated: `backend,frontend`
   - **Image Tag**: Optional custom tag (auto-generated if blank)
   - **Environment**: Target environment (dev/staging/production)
5. Click **Run workflow**

### Repository Dispatch (API/CLI)

Trigger builds programmatically:

```bash
# Using GitHub CLI
gh workflow run flexstaff-build-sync.yaml \
  --repo msdp-platform/msdp-devops-infrastructure \
  --ref main \
  --field flexstaff_ref=main \
  --field components=all \
  --field environment=dev

# Or trigger specific components
gh workflow run flexstaff-build-sync.yaml \
  --repo msdp-platform/msdp-devops-infrastructure \
  --ref main \
  --field flexstaff_ref=develop \
  --field components=backend,frontend \
  --field environment=staging
```

### Using GitHub API

```bash
curl -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  https://api.github.com/repos/msdp-platform/msdp-devops-infrastructure/actions/workflows/flexstaff-build-sync.yaml/dispatches \
  -d '{
    "ref": "main",
    "inputs": {
      "flexstaff_ref": "main",
      "components": "all",
      "environment": "dev"
    }
  }'
```

## Image Tagging Strategy

Images are automatically tagged with:
- **Environment + Timestamp** - e.g., `dev-20250107-143022`
- **latest** - Always points to the most recent build
- **Custom tag** - If specified in workflow inputs

## Image Locations

Built images are published to Azure Container Registry:

```
{ACR_NAME}.azurecr.io/platform/flexstaff-backend:{tag}
{ACR_NAME}.azurecr.io/platform/flexstaff-frontend:{tag}
{ACR_NAME}.azurecr.io/platform/flexstaff-admin:{tag}
```

Example (default ACR):
```
msdpc.azurecr.io/platform/flexstaff-backend:dev-20250107-143022
msdpc.azurecr.io/platform/flexstaff-backend:latest
```

## Pulling Images

```bash
# Login to ACR
az acr login --name msdpc

# Pull images
docker pull msdpc.azurecr.io/platform/flexstaff-backend:latest
docker pull msdpc.azurecr.io/platform/flexstaff-frontend:latest
docker pull msdpc.azurecr.io/platform/flexstaff-admin:latest

# Or pull specific version
docker pull msdpc.azurecr.io/platform/flexstaff-backend:dev-20250107-143022
```

## Dockerfile Details

All Dockerfiles are located in this repository:

### Backend (`backend/Dockerfile`)

Multi-stage build:
- **Builder stage**: Compiles TypeScript to JavaScript
- **Production stage**:
  - Minimal Node.js Alpine image
  - Production dependencies only
  - Non-root user (nodejs:1001)
  - Health check on `/health` endpoint
  - Exposes port 3000

### Frontend & Admin (`frontend/Dockerfile`, `admin/Dockerfile`)

Multi-stage build:
- **Builder stage**: Builds React application with Vite
- **Production stage**:
  - Nginx Alpine image
  - Custom nginx.conf for SPA routing
  - Security headers configured
  - Gzip compression enabled
  - Non-root user (nginx-user:1001)
  - Health check on `/health` endpoint
  - Exposes port 8080

## Build Process

When you trigger the workflow, it:

1. **Determines components** - Based on input selection
2. **Checks out FlexStaff repository** - Using GitHub App token
3. **Azure authentication** - Uses organization-level OIDC credentials
4. **Builds Docker images** - For selected components
5. **Pushes to ACR** - With versioned and latest tags
6. **Cleans up old images** - Keeps last 5 versions per component
7. **Generates summary** - With image locations and pull commands

## Monitoring Builds

### GitHub Actions UI

View build status:
1. Go to [msdp-devops-infrastructure Actions](https://github.com/msdp-platform/msdp-devops-infrastructure/actions)
2. Select **FlexStaff Build & Sync**
3. View recent runs and detailed logs

### Build Summary

Each workflow run creates a summary showing:
- Build configuration (branch, environment, tag)
- Build status for each component
- Published image locations
- Pull commands for downloading images

## Local Development

For local development, use the dev Dockerfiles:

```bash
# Start all services with Docker Compose
docker-compose up

# Or build individual components
docker build -f backend/Dockerfile.dev -t flexstaff-backend:dev backend/
docker build -f frontend/Dockerfile.dev -t flexstaff-frontend:dev frontend/
docker build -f admin/Dockerfile.dev -t flexstaff-admin:dev admin/
```

## Testing Production Builds Locally

Test production Dockerfiles before triggering builds:

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

# Run and test
docker run -p 3000:3000 flexstaff-backend:test
docker run -p 8080:8080 flexstaff-frontend:test
docker run -p 8081:8080 flexstaff-admin:test
```

## Troubleshooting

### Build Failures

**Issue**: Workflow not found
- Ensure you're triggering from `msdp-devops-infrastructure` repo, not this repo
- Check workflow file exists in devops infrastructure repo

**Issue**: Permission denied
- Check you have permissions to run workflows in the devops infrastructure repo
- Contact DevOps team if needed

**Issue**: Docker build failed
- Check Dockerfile syntax in this repository
- Verify all required files exist (nginx.conf, etc.)
- Review build logs in GitHub Actions

**Issue**: Image not found in ACR
- Verify build completed successfully
- Check ACR name matches organization configuration
- Ensure you're logged into ACR: `az acr login --name msdpc`

## Common Use Cases

### Deploy to Development

```bash
gh workflow run flexstaff-build-sync.yaml \
  --repo msdp-platform/msdp-devops-infrastructure \
  --ref main \
  --field flexstaff_ref=develop \
  --field components=all \
  --field environment=dev
```

### Deploy to Staging

```bash
gh workflow run flexstaff-build-sync.yaml \
  --repo msdp-platform/msdp-devops-infrastructure \
  --ref main \
  --field flexstaff_ref=release/v1.0 \
  --field components=all \
  --field environment=staging
```

### Deploy to Production

```bash
gh workflow run flexstaff-build-sync.yaml \
  --repo msdp-platform/msdp-devops-infrastructure \
  --ref main \
  --field flexstaff_ref=main \
  --field components=all \
  --field environment=production \
  --field image_tag=v1.0.0
```

### Build Only Backend (Hotfix)

```bash
gh workflow run flexstaff-build-sync.yaml \
  --repo msdp-platform/msdp-devops-infrastructure \
  --ref main \
  --field flexstaff_ref=hotfix/api-fix \
  --field components=backend \
  --field environment=production
```

## Security & Best Practices

1. **Centralized Credentials**: All Azure credentials managed in devops repo
2. **GitHub App Authentication**: Secure cross-repository access
3. **OIDC Authentication**: Passwordless authentication with Azure
4. **Non-root Containers**: All images run as non-root users
5. **Minimal Images**: Alpine Linux base for smaller attack surface
6. **Image Cleanup**: Automatic cleanup of old images (keeps last 5)
7. **Health Checks**: All containers include health check endpoints
8. **Multi-stage Builds**: Optimized for smaller final image sizes

## Workflow Architecture

The centralized build approach uses:
- **GitHub App** (`MSDP_APP_ID`, `MSDP_APP_PRIVATE_KEY`) - For cross-repo checkout
- **Azure OIDC** (`AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`) - For ACR access
- **Organization Secrets** - Shared across all platform repositories

This eliminates the need for per-repository secret management.

## Support

For issues or questions:
- **Build Issues**: Create issue in [msdp-devops-infrastructure](https://github.com/msdp-platform/msdp-devops-infrastructure/issues)
- **Application Issues**: Create issue in [this repository](https://github.com/msdp-platform/msdp-flexstaff/issues)
- **DevOps Team**: Contact platform team for access or permission issues

## Related Documentation

- [msdp-devops-infrastructure README](https://github.com/msdp-platform/msdp-devops-infrastructure/blob/main/README.md)
- [Backstage Build & Sync](https://github.com/msdp-platform/msdp-devops-infrastructure/blob/main/.github/workflows/backstage-build-sync.yaml) - Similar workflow pattern
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
