# CI/CD Quick Start Guide

## 🚀 Setup in 3 Steps

### Step 1: Run the Setup Script
```bash
./setup-github-secrets.sh
```

This will:
- Create an Azure service principal for GitHub Actions
- Get your Container Registry credentials
- Display all the secrets you need
- Save them to a file for easy copying

### Step 2: Add Secrets to GitHub

1. Go to your GitHub repository
2. Click: **Settings** → **Secrets and variables** → **Actions**
3. Click: **New repository secret**
4. Add these 3 secrets (values from Step 1):
   - `AZURE_CREDENTIALS`
   - `ACR_USERNAME`
   - `ACR_PASSWORD`

### Step 3: Push and Deploy

```bash
git add .github/
git commit -m "Add CI/CD workflows"
git push origin newDesgin
```

The deployment will start automatically! 🎉

## 📋 What Gets Deployed

- **Backend**: Django API + Admin Panel
- **Frontend**: Next.js Application
- **Images**: Stored in Azure Container Registry
- **Hosting**: Azure App Service

## 🔄 Deployment Options

### Automatic Deployment
Pushes to `main` or `newDesgin` branches trigger automatic deployment.

### Manual Deployment
1. Go to **Actions** tab in GitHub
2. Select **Manual Deploy to Azure**
3. Click **Run workflow**
4. Choose what to deploy (backend, frontend, or both)

## 📊 Monitor Deployment

### In GitHub:
- Go to **Actions** tab
- Click on the running workflow
- Watch real-time logs

### In Azure:
```bash
# Backend logs
az webapp log tail --name agilebot-backend --resource-group agilebot-rg

# Frontend logs
az webapp log tail --name agilebot-frontend --resource-group agilebot-rg
```

## 🌐 Your Application URLs

After deployment:
- **Frontend**: https://agilebot-frontend.azurewebsites.net
- **Backend**: https://agilebot-backend.azurewebsites.net
- **Admin**: https://agilebot-backend.azurewebsites.net/admin

## 🔧 Troubleshooting

### Deployment fails with "Authentication failed"
- Re-run `./setup-github-secrets.sh`
- Update the `AZURE_CREDENTIALS` secret in GitHub

### Container can't be pulled
- Verify `ACR_USERNAME` and `ACR_PASSWORD` in GitHub secrets
- Check Container Registry is accessible

### App deployed but not responding
- Check logs: `az webapp log tail --name agilebot-backend --resource-group agilebot-rg`
- Verify environment variables in Azure Portal
- Check Key Vault secrets

## 📚 Full Documentation

See [.github/CICD_SETUP.md](.github/CICD_SETUP.md) for detailed documentation.

## 🎯 Quick Commands

```bash
# View recent workflow runs
gh run list

# View logs of latest run
gh run view --log

# Manually trigger deployment
gh workflow run manual-deploy.yml -f component=both

# Check app status
az webapp show --name agilebot-backend --resource-group agilebot-rg --query state
```

## ⚠️ Important Notes

1. **Delete the secrets file** after adding to GitHub:
   ```bash
   rm github-secrets-*.txt
   ```

2. **Never commit secrets** to the repository

3. **Test in a branch** before deploying to production

4. **Monitor costs** in Azure Portal

## 🎉 That's It!

Your CI/CD pipeline is ready. Every push will now automatically deploy your application to Azure!
