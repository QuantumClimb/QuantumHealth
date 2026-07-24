# Security Setup Guide

## 🔐 Secure Configuration Setup

This guide helps you set up secure environment variables for your MCP configuration.

## Files Created

1. **`env.local.example`** - Template with your current tokens (COPY THESE VALUES)
2. **`mcp.config.secure.json`** - Secure MCP configuration using environment variables

## Setup Instructions

### Step 1: Create Environment File
```bash
# Copy the example file to create your local environment file
cp env.local.example .env.local
```

### Step 2: Verify .gitignore Protection
Your `.gitignore` already includes `*.local`, so `.env.local` will be protected from commits.

### Step 3: Replace Current MCP Config
```bash
# Backup your current config (optional)
cp .cursor/mcp.config.json .cursor/mcp.config.json.backup

# Replace with secure version
cp mcp.config.secure.json .cursor/mcp.config.json
```

### Step 4: Update Environment Variables
Edit `.env.local` and replace placeholder values:
```bash
# Update these with your actual Supabase project values
SUPABASE_URL=your-actual-supabase-url
SUPABASE_ANON_KEY=your-actual-supabase-anon-key
```

## 🔑 Token Security

### Current Tokens (from your config):
- **Supabase**: `sbp_[REDACTED_FOR_SECURITY]`
- **GitHub**: `ghp_[REDACTED_FOR_SECURITY]`
- **Vercel**: `vercel_[REDACTED_FOR_SECURITY]`

### ⚠️ IMPORTANT: Rotate These Tokens
Since these tokens were exposed in your config file, it's recommended to:

1. **GitHub**: Generate new personal access token at https://github.com/settings/tokens
2. **Vercel**: Generate new token at https://vercel.com/account/tokens  
3. **Supabase**: Generate new service role key in your Supabase dashboard

## 🚀 How It Works

The new secure config uses environment variable references:
```json
"--access-token",
"$SUPABASE_ACCESS_TOKEN"
```

This allows Cursor to read tokens from your `.env.local` file without exposing them in version control.

## ✅ Verification

After setup, verify your configuration:
1. Check that `.env.local` exists and contains your tokens
2. Verify `.cursor/mcp.config.json` uses `$VARIABLE_NAME` references
3. Test MCP server connections in Cursor
4. Confirm `.env.local` is not tracked by git: `git status`

## 🛡️ Best Practices

- Never commit `.env.local` to version control
- Rotate tokens regularly
- Use least-privilege tokens (minimal required scopes)
- Keep `env.local.example` updated for team members 