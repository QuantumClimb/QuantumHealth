# QuantumHealth Deployment Setup

## 🚀 Automated Deployment Overview

This project uses **GitHub Actions** to automatically:
- Deploy to Vercel on every push to `main`
- Set up environment variables in Vercel automatically
- Run database migrations
- Perform health checks
- Create preview deployments for PRs

## 🔑 Required GitHub Secrets

To enable automated deployment, you need to set up the following secrets in your GitHub repository:

### 1. Navigate to GitHub Secrets
1. Go to your repository: `https://github.com/QuantumClimb/QuantumHealth`
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** for each secret below

### 2. Vercel Integration Secrets

```bash
# Use these exact values for your GitHub secrets
VERCEL_TOKEN=your_vercel_token_here
VERCEL_ORG_ID=team_k7EJCN0NMrPqP50jQ53v6m8H  
VERCEL_PROJECT_ID=prj_hHWuTOuTQiTOml81kOQRBySjZMdP
```

**How to get Vercel secrets:**
1. **VERCEL_TOKEN**: You already have this - "QuantumVercel" token
2. **VERCEL_ORG_ID**: `team_k7EJCN0NMrPqP50jQ53v6m8H` (from your account)
3. **VERCEL_PROJECT_ID**: `prj_hHWuTOuTQiTOml81kOQRBySjZMdP` (auto-created)

### 3. Supabase Integration Secrets

```bash
# From your env.local.example file
VITE_SUPABASE_URL=https://fihfnzxcsmzhprwakhhr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET=mwVo9PTD/iCVbvxcLgxJPRCAslMAjT6YhmmVN...
SUPABASE_ACCESS_TOKEN=sbp_b5da85133f4397b65cab1ba24f89d2ac35ac383e
```

### 4. Complete Secrets List

Here's what you need to add to GitHub Secrets:

| Secret Name | Description | Exact Value |
|-------------|-------------|-------------|
| `VERCEL_TOKEN` | Vercel deployment token | Your "QuantumVercel" token |
| `VERCEL_ORG_ID` | Your Vercel organization ID | `team_k7EJCN0NMrPqP50jQ53v6m8H` |
| `VERCEL_PROJECT_ID` | Your Vercel project ID | `prj_hHWuTOuTQiTOml81kOQRBySjZMdP` |
| `VITE_SUPABASE_URL` | Public Supabase URL | Your env.local |
| `VITE_SUPABASE_ANON_KEY` | Public anon key | Your env.local |
| `SUPABASE_SERVICE_ROLE_KEY` | Private service role key | Your env.local |
| `SUPABASE_JWT_SECRET` | JWT secret for auth | Your env.local |
| `SUPABASE_ACCESS_TOKEN` | Supabase API token | Your env.local |

## 🔄 Deployment Workflow

### Automatic Triggers
- **Push to `main`** → Production deployment + env setup
- **Pull Request** → Preview deployment
- **Database changes** → Auto-migration on production
- **New repositories** → Auto-creates Vercel projects with proper naming

### 🆕 Automatic Project Creation
The workflow is smart enough to:
- **Auto-detect** if a Vercel project exists for your repo
- **Auto-create** a new project if none exists (using lowercase repo name)
- **Auto-link** to existing projects seamlessly
- **No manual setup** required for new repositories!

### What GitHub Actions Does Automatically

1. **🏗️ Build Process**
   - Installs dependencies
   - Builds the Vite React app
   - Runs tests (if configured)

2. **🌍 Environment Setup**
   - Automatically sets all environment variables in Vercel
   - Handles both public (`VITE_`) and private variables
   - Sets up both production and preview environments

3. **🚀 Deployment**
   - Deploys to Vercel using CLI
   - Links the project automatically
   - Creates preview URLs for PRs

4. **🗄️ Database Management**
   - Runs Supabase migrations on production deployments
   - Ensures database schema is always up-to-date

5. **📊 Health Checks**
   - Verifies deployment is working
   - Tests critical endpoints
   - Reports status in GitHub

## 🛠️ Manual Setup Steps

### 1. Set up Vercel Project (if not done)
```bash
# Install Vercel CLI locally
npm i -g vercel

# Link your project
vercel link

# This will give you the ORG_ID and PROJECT_ID for GitHub secrets
```

### 2. Copy Environment Variables
Use the values from your `env.local.example` file to populate GitHub secrets.

### 3. Test the Workflow
1. Push any change to `main` branch
2. Check the **Actions** tab in GitHub
3. Verify deployment succeeds
4. Check Vercel dashboard for environment variables

## 🔍 Troubleshooting

### Common Issues

**❌ "Project not found" error**
- Check `VERCEL_PROJECT_ID` is correct
- Ensure project exists in Vercel dashboard

**❌ "Environment variable already exists" warnings**
- This is normal - GitHub Actions uses `--force` flag
- Variables are updated, not duplicated

**❌ "Supabase migration failed"**
- Check `SUPABASE_ACCESS_TOKEN` is valid
- Ensure migration files are in `supabase/migrations/`

**❌ "Build failed" error**
- Check all `VITE_` environment variables are set
- Verify Supabase keys are valid

### Viewing Logs
1. Go to repository → **Actions** tab
2. Click on latest workflow run
3. Expand each step to see detailed logs

## 🎯 Next Steps

Once secrets are configured:

1. **Push to main** - This will trigger the first automated deployment
2. **Check Vercel dashboard** - Verify environment variables were set
3. **Create a PR** - Test preview deployments
4. **Monitor Actions** - Ensure everything works smoothly

## 🔐 Security Notes

- ✅ All secrets are encrypted in GitHub
- ✅ Private keys never exposed to client-side code
- ✅ Service role key only used server-side
- ✅ Environment variables properly scoped (production/preview)

Your deployment pipeline is now fully automated! 🎉 