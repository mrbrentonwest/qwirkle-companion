# Deployment Guide

This guide documents how to push code changes and deploy the Qwirkle Companion app.

---

## Prerequisites

- GitHub CLI (`gh`) installed and authenticated
- Access to Firebase Studio at https://studio.firebase.google.com

---

## Step 1: Commit Local Changes

```bash
# Check what files have changed
git status

# Stage all changes
git add .

# Commit with a descriptive message
git commit -m "Your commit message here"
```

---

## Step 2: Push to GitHub

```bash
git push origin main
```

### Troubleshooting Push Issues

**Authentication Error (wrong account):**
```bash
# Logout and login with correct account
gh auth logout
gh auth login
# Follow the device flow: enter code at https://github.com/login/device
```

**Large File Error (HTTP 400):**
If push fails with HTTP 400, check for large files:
```bash
# Find large files
find . -type f -size +1M -not -path "./.git/*"

# Add large directories to .gitignore
echo ".gemini-clipboard/" >> .gitignore

# Remove from git tracking
git rm -r --cached .gemini-clipboard/

# Amend the commit and retry
git add .gitignore
git commit --amend --no-edit
git push origin main
```

---

## Step 3: Sync Firebase Studio

1. Open Firebase Studio: https://studio.firebase.google.com
2. Select the **Qwirkle Companion** project
3. Open the **Terminal** (bottom panel)
4. Run:
   ```bash
   git pull origin main
   ```

---

## Step 4: Publish to Firebase

1. Click the **Publish** button (top right corner)
2. Follow the setup wizard if this is the first publish:
   - Create/select Firebase project
   - Link Google Cloud Billing account
   - Enable Firebase services
3. Wait for deployment to complete

---

## Quick Reference

| Action | Command/Location |
|--------|------------------|
| Commit changes | `git add . && git commit -m "message"` |
| Push to GitHub | `git push origin main` |
| Sync Firebase Studio | Run `git pull origin main` in Firebase Studio terminal |
| Deploy | Click **Publish** button in Firebase Studio |

---

## Repository Info

- **GitHub Repo:** https://github.com/mrbrentonwest/qwirkle-companion
- **Branch:** main
- **Firebase Studio:** https://studio.firebase.google.com

---

## Files to Ignore

The following are already in `.gitignore`:
- `.gemini-clipboard/` - Large clipboard images from Gemini
- `.next/` - Next.js build output
- `node_modules/` - Dependencies
- `.env*` - Environment variables

---

*Last updated: December 2024*
