# GitHub Actions CI/CD Setup for Azure Deployment

This guide will help you set up GitHub Actions to automatically deploy your Agile Bot application to Azure.

## Prerequisites

- Azure resources already created (Resource Group, Container Registry, Web Apps)
- GitHub repository with your code
- Azure CLI installed locally

## Step 1: Create Azure Service Principal

Run this command to create a service principal with contributor access:

```bash
az ad sp create-for-rbac \
  --name "agilebot-github-actions" \
  --role contributor \
  --scopes /subscriptions/$(az account show --query id -o tsv)/resourceGroups/agilebot-rg \
  --sdk-auth
```

This will output JSON like:
```json
{
  "clientId": "xxx",
  "clientSecret": "xxx",
  "subscriptionId": "xxx",
  "tenantId": "xxx",
  ...
}
```

**Save this entire JSON output** - you'll need it for GitHub Secrets.

## Step 2: Get Azure Container Registry Credentials

```bash
# Get ACR username
az acr credential show --name agilebotacr2681 --query username -o tsv

# Get ACR password
az acr credential show --name agilebotacr2681 --query "passwords[0].value" -o tsv
```

## Step 3: Configure GitHub Secrets

Go to your GitHub repository:
1. Click **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add the following secrets:

### Required Secrets:

| Secret Name | Value | Description |
|------------|-------|-------------|
| `AZURE_CREDENTIALS` | The entire JSON output from Step 1 | Azure service principal credentials |
| `ACR_USERNAME` | Output from Step 2 (username) | Container Registry username |
| `ACR_PASSWORD` | Output from Step 2 (password) | Container Registry password |

## Step 4: Test the Workflow

### Option A: Automatic Deployment (on push)
Simply push to the `main` or `newDesgin` branch:
```bash
git add .
git commit -m "Setup CI/CD"
git push origin newDesgin
```

### Option B: Manual Deployment
1. Go to **Actions** tab in GitHub
2. Select **Manual Deploy to Azure**
3. Click **Run workflow**
4. Choose:
   - Environment: `production`
   - Component: `both` (or `backend`/`frontend`)
5. Click **Run workflow**

## Step 5: Monitor Deployment

1. Go to **Actions** tab in your GitHub repository
2. Click on the running workflow
3. Watch the logs in real-time
4. Check for any errors

## Workflows Included

### 1. `azure-deploy.yml` (Automatic)
- Triggers on push to `main` or `newDesgin` branches
- Builds and deploys both backend and frontend
- Runs health checks after deployment

### 2. `manual-deploy.yml` (Manual)
- Trigger manually from GitHub Actions UI
- Choose which component to deploy (backend, frontend, or both)
- Useful for hotfixes or selective deployments

## Troubleshooting

### Issue: "Authentication failed"
- Verify `AZURE_CREDENTIALS` secret is correct
- Check service principal has contributor role:
  ```bash
  az role assignment list --assignee <clientId> --resource-group agilebot-rg
  ```

### Issue: "Cannot pull image from registry"
- Verify `ACR_USERNAME` and `ACR_PASSWORD` are correct
- Test ACR login locally:
  ```bash
  docker login agilebotacr2681.azurecr.io -u <username> -p <password>
  ```

### Issue: "Deployment succeeded but app not responding"
- Check app logs:
  ```bash
  az webapp log tail --name agilebot-backend --resource-group agilebot-rg
  ```
- Verify environment variables in Azure Portal
- Check Key Vault secrets are accessible

## Quick Commands

### View workflow runs:
```bash
gh run list --workflow=azure-deploy.yml
```

### View logs of latest run:
```bash
gh run view --log
```

### Manually trigger deployment:
```bash
gh workflow run manual-deploy.yml -f component=both -f environment=production
```

## Application URLs

After successful deployment:
- **Frontend**: https://agilebot-frontend.azurewebsites.net
- **Backend**: https://agilebot-backend.azurewebsites.net
- **Admin**: https://agilebot-backend.azurewebsites.net/admin

## Security Best Practices

1. ✅ Never commit secrets to the repository
2. ✅ Use GitHub Secrets for all sensitive data
3. ✅ Rotate service principal credentials regularly
4. ✅ Use least-privilege access (contributor only on resource group)
5. ✅ Enable branch protection on `main` branch
6. ✅ Require pull request reviews before merging

## Next Steps

1. Set up staging environment
2. Add automated tests before deployment
3. Implement blue-green deployment
4. Add Slack/Discord notifications
5. Set up monitoring and alerts

## Support

For issues:
1. Check GitHub Actions logs
2. Check Azure App Service logs
3. Review this setup guide
4. Check Azure Portal for resource status
