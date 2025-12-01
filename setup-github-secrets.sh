#!/bin/bash

# ============================================
# GitHub Secrets Setup Helper
# ============================================
# This script helps you get the values needed for GitHub Secrets

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

RESOURCE_GROUP="agilebot-rg"
CONTAINER_REGISTRY="agilebotacr2681"

print_header "GitHub Actions Secrets Setup"

# Check if logged in
if ! az account show &>/dev/null; then
    print_warning "Not logged in to Azure. Running az login..."
    az login
fi

SUBSCRIPTION_ID=$(az account show --query id -o tsv)
print_success "Using subscription: $SUBSCRIPTION_ID"

# Step 1: Create Service Principal
print_header "Step 1: Creating Azure Service Principal"

print_info "Creating service principal for GitHub Actions..."

SP_OUTPUT=$(az ad sp create-for-rbac \
  --name "agilebot-github-actions-$(date +%s)" \
  --role contributor \
  --scopes /subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP \
  --sdk-auth)

print_success "Service principal created!"

# Step 2: Get ACR Credentials
print_header "Step 2: Getting Container Registry Credentials"

ACR_USERNAME=$(az acr credential show --name $CONTAINER_REGISTRY --query username -o tsv)
ACR_PASSWORD=$(az acr credential show --name $CONTAINER_REGISTRY --query "passwords[0].value" -o tsv)

print_success "Container registry credentials retrieved"

# Step 3: Display secrets
print_header "Step 3: GitHub Secrets Configuration"

echo -e "${YELLOW}Copy these values to your GitHub repository secrets:${NC}"
echo -e "${BLUE}Go to: Settings → Secrets and variables → Actions → New repository secret${NC}\n"

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Secret Name:${NC} AZURE_CREDENTIALS"
echo -e "${YELLOW}Value:${NC}"
echo "$SP_OUTPUT"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Secret Name:${NC} ACR_USERNAME"
echo -e "${YELLOW}Value:${NC} $ACR_USERNAME"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Secret Name:${NC} ACR_PASSWORD"
echo -e "${YELLOW}Value:${NC} $ACR_PASSWORD"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Save to file
SECRETS_FILE="github-secrets-$(date +%Y%m%d-%H%M%S).txt"
cat > $SECRETS_FILE << EOF
GitHub Secrets Configuration
Generated: $(date)

===========================================
Secret: AZURE_CREDENTIALS
===========================================
$SP_OUTPUT

===========================================
Secret: ACR_USERNAME
===========================================
$ACR_USERNAME

===========================================
Secret: ACR_PASSWORD
===========================================
$ACR_PASSWORD

===========================================
IMPORTANT: Delete this file after adding secrets to GitHub!
===========================================
EOF

print_success "Secrets saved to: $SECRETS_FILE"
print_warning "Delete this file after configuring GitHub secrets!"

# Step 4: Instructions
print_header "Step 4: Next Steps"

echo -e "${BLUE}1.${NC} Go to your GitHub repository"
echo -e "${BLUE}2.${NC} Navigate to: ${YELLOW}Settings → Secrets and variables → Actions${NC}"
echo -e "${BLUE}3.${NC} Click ${YELLOW}New repository secret${NC}"
echo -e "${BLUE}4.${NC} Add each secret from above (or from file: ${YELLOW}$SECRETS_FILE${NC})"
echo -e "${BLUE}5.${NC} Commit and push the workflow files:"
echo -e "   ${YELLOW}git add .github/workflows/${NC}"
echo -e "   ${YELLOW}git commit -m 'Add CI/CD workflows'${NC}"
echo -e "   ${YELLOW}git push${NC}"
echo -e "${BLUE}6.${NC} Go to ${YELLOW}Actions${NC} tab to see the deployment"
echo -e "${BLUE}7.${NC} Delete the secrets file: ${YELLOW}rm $SECRETS_FILE${NC}"

print_header "Setup Complete!"

echo -e "${GREEN}Your CI/CD pipeline is ready to use!${NC}\n"
