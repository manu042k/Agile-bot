#!/bin/bash

# ============================================
# Deploy Celery Worker to Azure
# ============================================

set -e

# Configuration
RESOURCE_GROUP="agilebot-rg"
LOCATION="centralus"
APP_NAME="agilebot"
KEYVAULT_NAME="agilebot-kv-1764550960"
CONTAINER_REGISTRY="agilebotacr2681"
APP_SERVICE_PLAN="agilebot-plan"
CELERY_APP="${APP_NAME}-celery"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_header() {
    echo -e "\n${BLUE}============================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}============================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_header "Deploying Celery Worker to Azure"

# Get ACR credentials
ACR_USERNAME=$(az acr credential show --name $CONTAINER_REGISTRY --query username -o tsv)
ACR_PASSWORD=$(az acr credential show --name $CONTAINER_REGISTRY --query "passwords[0].value" -o tsv)
ACR_LOGIN_SERVER=$(az acr show --name $CONTAINER_REGISTRY --query loginServer -o tsv)

# Login to ACR
echo "$ACR_PASSWORD" | docker login $ACR_LOGIN_SERVER --username $ACR_USERNAME --password-stdin
print_success "Logged in to Container Registry"

# Build and push Celery image
print_header "Building Celery Worker Image"

print_info "Building celery worker image..."
docker build -f Backend/Dockerfile.celery -t ${ACR_LOGIN_SERVER}/agilebot-celery:latest ./Backend
docker push ${ACR_LOGIN_SERVER}/agilebot-celery:latest
print_success "Celery image pushed to registry"

# Check if Celery app exists
print_header "Deploying Celery Web App"

if az webapp show --name $CELERY_APP --resource-group $RESOURCE_GROUP &>/dev/null; then
    print_info "Celery app already exists, updating..."
else
    print_info "Creating new Celery app..."
    az webapp create \
        --name $CELERY_APP \
        --resource-group $RESOURCE_GROUP \
        --plan $APP_SERVICE_PLAN \
        --deployment-container-image-name ${ACR_LOGIN_SERVER}/agilebot-celery:latest
fi

# Configure container
az webapp config container set \
    --name $CELERY_APP \
    --resource-group $RESOURCE_GROUP \
    --docker-custom-image-name ${ACR_LOGIN_SERVER}/agilebot-celery:latest \
    --docker-registry-server-url https://${ACR_LOGIN_SERVER} \
    --docker-registry-server-user $ACR_USERNAME \
    --docker-registry-server-password "$ACR_PASSWORD"

# Enable managed identity
az webapp identity assign --name $CELERY_APP --resource-group $RESOURCE_GROUP
CELERY_IDENTITY=$(az webapp identity show --name $CELERY_APP --resource-group $RESOURCE_GROUP --query principalId -o tsv)

# Grant Key Vault access
az keyvault set-policy \
    --name $KEYVAULT_NAME \
    --object-id $CELERY_IDENTITY \
    --secret-permissions get list

print_success "Celery app configured with Key Vault access"

# Configure app settings (same as backend but for Celery)
print_info "Configuring Celery app settings..."

az webapp config appsettings set \
    --name $CELERY_APP \
    --resource-group $RESOURCE_GROUP \
    --settings \
        SECRET_KEY="@Microsoft.KeyVault(SecretUri=https://${KEYVAULT_NAME}.vault.azure.net/secrets/DJANGO-SECRET-KEY/)" \
        DEBUG="False" \
        USE_POSTGRESQL="False" \
        USE_REDIS_CACHE="False" \
        USE_AZURE_STORAGE="True" \
        AZURE_ACCOUNT_NAME="@Microsoft.KeyVault(SecretUri=https://${KEYVAULT_NAME}.vault.azure.net/secrets/AZURE-STORAGE-ACCOUNT-NAME/)" \
        AZURE_ACCOUNT_KEY="@Microsoft.KeyVault(SecretUri=https://${KEYVAULT_NAME}.vault.azure.net/secrets/AZURE-STORAGE-ACCOUNT-KEY/)" \
        AZURE_CONTAINER_NAME="media" \
        COHERE_API_KEY="@Microsoft.KeyVault(SecretUri=https://${KEYVAULT_NAME}.vault.azure.net/secrets/COHERE-API-KEY/)" \
        GROQ_API_KEY="@Microsoft.KeyVault(SecretUri=https://${KEYVAULT_NAME}.vault.azure.net/secrets/GROQ-API-KEY/)" \
        GEMINI_API_KEY="@Microsoft.KeyVault(SecretUri=https://${KEYVAULT_NAME}.vault.azure.net/secrets/GEMINI-API-KEY/)" \
        REDIS_URI="redis://localhost:6379" \
        WEBSITES_CONTAINER_START_TIME_LIMIT="600" \
        DOCKER_REGISTRY_SERVER_PASSWORD="$ACR_PASSWORD"

print_success "Celery app settings configured"

# Note: Azure App Service doesn't have built-in Redis, so we need to use Azure Redis Cache
# or configure REDIS_URI to point to an external Redis instance

print_header "Deployment Complete!"

echo -e "${GREEN}Celery worker deployed successfully!${NC}"
echo -e "${BLUE}App Name:${NC} $CELERY_APP"
echo -e "${BLUE}URL:${NC} https://${CELERY_APP}.azurewebsites.net"
echo -e ""
echo -e "${YELLOW}Note: Celery needs Redis. Make sure REDIS_URI is configured correctly.${NC}"
echo -e "${YELLOW}For production, use Azure Cache for Redis.${NC}"
