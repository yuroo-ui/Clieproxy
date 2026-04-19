# 📤 GitHub Push Instructions

**Repository:** https://github.com/sirwhy/Clieproxy  
**Branch:** main

---

## 🚀 Quick Push (Copy & Paste)

```bash
cd /root/.openclaw/workspace/cpa-system
git push origin main
```

---

## 🔐 If You Need GitHub Token

### Step 1: Get GitHub Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token (classic)"**
3. Select scopes: `repo`, `workflow`
4. Generate token
5. **Copy the token** (you can't see it again!)

### Step 2: Push with Token

```bash
cd /root/.openclaw/workspace/cpa-system

# Method 1: Use token in URL
git remote set-url origin https://YOUR_TOKEN@github.com/sirwhy/Clieproxy.git
git push -u origin main

# Method 2: Git credential helper
echo "https://YOUR_TOKEN@github.com" > ~/.git-credentials
git config --global credential.helper store
git push -u origin main
```

---

## 🎯 Alternative: Push from Local Machine

If you have the code locally:

```bash
cd /path/to/cpa-system
git init
git add .
git commit -m "Initial CPA System"
git remote add origin https://github.com/sirwhy/Clieproxy.git
git push -u origin main
```

---

## ✅ What's in the Repo

**17 Files | ~4KB**

| File | Purpose |
|------|---------|
| `server.js` | Main entry point |
| `routes/cpa.js` | CPA API (25+ LLMs) |
| `middleware/cpaCheck.js` | Balance middleware |
| `schema.prisma` | Database schema |
| `scripts/seed-cpa-pricing.js` | Seed pricing |
| `railway.json` | Railway config |
| `vercel.json` | Vercel config |
| `Procfile` | Deployment config |
| `DEPLOYMENT.md` | Deploy guide |
| `QUICK_START.md` | Quick guide |

---

## 📊 Next Steps After Push

### 1. Deploy to Railway

1. Go to https://railway.app
2. **"New Project"** → **"Deploy from GitHub repo"**
3. Select `sirwhy/Clieproxy`
4. Add PostgreSQL database
5. Set `DATABASE_URL` environment variable
6. Deploy!

**Railway Dashboard:** https://railway.app

### 2. Deploy to Vercel

1. Go to https://vercel.com
2. **"Add New Project"** → Import from GitHub
3. Select `sirwhy/Clieproxy`
4. Configure environment variables
5. Deploy!

**Vercel Dashboard:** https://vercel.com/dashboard

---

## 📝 Environment Variables

After deployment, set these in your platform:

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
JWT_SECRET="your-secret-key-here"
PORT=3000
NODE_ENV=production
```

---

## 🔧 Post-Deployment

### Run Database Migrations

```bash
# Railway CLI
railway variable get DATABASE_URL > .env
npx prisma migrate deploy

# Or via Railway dashboard
# Settings → Variables → DATABASE_URL
```

### Seed Pricing Data

```bash
node scripts/seed-cpa-pricing.js
```

### Test API

```bash
# Health check
curl https://your-app.railway.app/api/health

# Get pricing
curl https://your-app.railway.app/api/cpa/pricing

# Check wallet
curl https://your-app.railway.app/api/cpa/wallet
```

---

## 💡 Railway Quick Deploy

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
cd /root/.openclaw/workspace/cpa-system
railway up

# View logs
railway logs
```

---

## 🎉 Ready to Deploy!

After pushing to GitHub:
1. ✅ Connect to Railway
2. ✅ Add PostgreSQL
3. ✅ Set DATABASE_URL
4. ✅ Deploy!

**Repo ready at:** https://github.com/sirwhy/Clieproxy

---

**Happy deploying! 🚀**
