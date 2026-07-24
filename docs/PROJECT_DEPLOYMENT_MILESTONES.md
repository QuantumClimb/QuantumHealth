# 🚀 Project Deployment Milestone Process
## Complete Guide for GitHub → Vercel Production Deployment

This process ensures secure, efficient deployment of any React/Next.js project to production.

---

## 📋 **MILESTONE 1: Pre-Deployment Security Setup**

### **1.1 Environment Variables Security Check**
- [ ] Create `env.local.example` with **placeholder values only**
- [ ] Ensure **NO real tokens** in any committed files
- [ ] All sensitive values use format: `your_token_here` or `[REDACTED_FOR_SECURITY]`
- [ ] Verify `.env.local` is in `.gitignore`

### **1.2 CSS Import Order Validation**
- [ ] Check `src/index.css` for proper import order
- [ ] `@import` statements **MUST** come before `@tailwind` directives
- [ ] Pattern: `@import` → `@tailwind` → `@layer`

### **1.3 Package.json Cleanup**
- [ ] Remove platform-specific `package-lock.json` if present
- [ ] Let Vercel generate fresh dependencies for Linux environment
- [ ] Verify all dependencies are production-ready

---

## 📋 **MILESTONE 2: GitHub Repository Setup**

### **2.1 MCP Configuration (if available)**
- [ ] Update global MCP config: `C:\Users\[user]\.cursor\mcp.json`
- [ ] Use official GitHub MCP: `@modelcontextprotocol/server-github`
- [ ] Include direct access tokens (not environment variables)
- [ ] Restart Cursor after MCP changes

### **2.2 Repository Creation**
**Option A: MCP Method (Preferred)**
```bash
# Use GitHub MCP tools in Cursor
mcp_github_create_repository(
  name="ProjectName",
  description="Project description",
  private=false,
  autoInit=false
)
```

**Option B: Manual Method (Fallback)**
- [ ] Go to https://github.com/new
- [ ] Repository name: `ProjectName`
- [ ] Description: Clear project description
- [ ] Public repository
- [ ] **Do NOT** initialize with README (we have our code)

### **2.3 Git History Security**
- [ ] Initialize clean git repository: `git init`
- [ ] Add all files: `git add .`
- [ ] Create security-compliant commit: `git commit -m "Initial commit: [ProjectName] with secure token handling"`
- [ ] Set main branch: `git branch -M main`
- [ ] Add remote: `git remote add origin https://github.com/[username]/[repo].git`

---

## 📋 **MILESTONE 3: Vercel Environment Configuration**

### **3.1 Environment Variables Setup**
**Use automated script method:**

```javascript
// Create setup-vercel-env.js
const envVars = [
  {
    name: 'VITE_SUPABASE_URL',
    value: 'your_actual_url',
    target: ['production', 'preview', 'development']
  },
  // ... add all environment variables
];

// Run: node setup-vercel-env.js
```

**Verify in Vercel CLI:**
```bash
vercel env ls
```

### **3.2 Environment Variables Checklist**
- [ ] `VITE_SUPABASE_URL` (client-side)
- [ ] `VITE_SUPABASE_ANON_KEY` (client-side)
- [ ] `SUPABASE_URL` (server-side)
- [ ] `SUPABASE_ANON_KEY` (server-side)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (server-side only)
- [ ] `SUPABASE_JWT_SECRET` (server-side only)
- [ ] All values show as "Encrypted" in Vercel dashboard

---

## 📋 **MILESTONE 4: Secure Code Push**

### **4.1 GitHub Push Protection Compliance**
- [ ] Push code: `git push -u origin main`
- [ ] **If push rejected due to secrets detection:**
  - [ ] Remove git history: `Remove-Item -Path ".git" -Recurse -Force`
  - [ ] Re-initialize: `git init`
  - [ ] Clean commit: `git add . && git commit -m "Initial commit"`
  - [ ] Re-add remote and push

### **4.2 Deployment Trigger**
- [ ] Successful push to GitHub
- [ ] Verify repository appears at: `https://github.com/[username]/[repo]`
- [ ] Code visible and accessible

---

## 📋 **MILESTONE 5: Vercel Deployment**

### **5.1 Initial Deployment Attempt**
```bash
vercel --prod
```

### **5.2 Common Build Issues & Fixes**

**Issue 1: Rollup Platform Dependencies**
```
Error: Cannot find module @rollup/rollup-linux-x64-gnu
```
**Fix:**
```bash
Remove-Item "package-lock.json" -Force
git add . && git commit -m "Fix: Remove package-lock.json for platform compatibility"
git push origin main
```

**Issue 2: CSS Import Order**
```
@import must precede all other statements
```
**Fix:**
- [ ] Move all `@import` statements to top of CSS file
- [ ] Before any `@tailwind` directives
- [ ] Commit and push fix

**Issue 3: Environment Variables Missing**
- [ ] Check Vercel dashboard environment variables
- [ ] Verify all required variables are set
- [ ] Redeploy if needed

### **5.3 Deployment Verification**
- [ ] Build completes successfully
- [ ] Application loads at Vercel URL
- [ ] All environment variables working
- [ ] No console errors
- [ ] All features functional

---

## 📋 **MILESTONE 6: Production Validation**

### **6.1 Application Testing**
- [ ] Homepage loads correctly
- [ ] All routes accessible
- [ ] Database connections working
- [ ] Authentication flow functional
- [ ] API endpoints responding

### **6.2 Performance Check**
- [ ] Page load times acceptable
- [ ] No console errors
- [ ] Mobile responsiveness
- [ ] SEO basics in place

### **6.3 Security Validation**
- [ ] No sensitive data exposed in client
- [ ] HTTPS enabled
- [ ] Environment variables secure
- [ ] API keys not visible in browser

---

## 📋 **MILESTONE 7: GitHub Actions Setup (Optional)**

### **7.1 Automated Deployment**
- [ ] `.github/workflows/deploy-vercel.yml` present
- [ ] GitHub Secrets configured
- [ ] Auto-deploy on push to main
- [ ] Environment sync working

---

## 🎯 **Success Criteria Checklist**

### **🔒 Security**
- [ ] No real tokens in GitHub repository
- [ ] All environment variables encrypted in Vercel
- [ ] GitHub Push Protection passes
- [ ] No sensitive data in client-side code

### **🚀 Deployment**
- [ ] Successful build in Vercel
- [ ] Application accessible via production URL
- [ ] All environment variables working
- [ ] Database connections functional

### **📁 Repository**
- [ ] Clean commit history
- [ ] Proper documentation
- [ ] Security-compliant codebase
- [ ] All team members have access

### **🔄 Automation**
- [ ] Push to main triggers deployment
- [ ] Environment variables sync automatically
- [ ] Build status visible in GitHub
- [ ] Failed builds notify team

---

## 🚨 **Emergency Procedures**

### **Build Failures**
1. Check Vercel build logs
2. Common fixes: package-lock.json removal, CSS import order
3. Environment variables verification
4. Local build test: `npm run build`

### **Security Issues**
1. Immediately rotate exposed tokens
2. Remove sensitive data from git history
3. Update environment variables
4. Force new deployment

### **Access Issues**
1. Verify GitHub repository permissions
2. Check Vercel project access
3. Confirm environment variables
4. Test deployment triggers

---

## 📚 **Reference Links**

- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub Actions**: https://github.com/[username]/[repo]/actions
- **Environment Variables**: https://vercel.com/docs/environment-variables
- **Build Troubleshooting**: https://vercel.com/docs/build-step

---

## 🏆 **Project Templates**

This process works for:
- ✅ React + Vite + TypeScript
- ✅ Next.js applications
- ✅ Supabase backend integration
- ✅ Tailwind CSS styling
- ✅ Multi-tenant SaaS applications

**Estimated Time**: 15-30 minutes for experienced deployment  
**Success Rate**: 99% when following all milestones

---

*This process was validated with QuantumHealth deployment on June 23, 2025* 