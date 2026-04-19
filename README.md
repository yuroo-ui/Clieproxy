# 🎉 CPA System - Universal for ALL LLMs

**Version:** 2.1.0  
**Date:** 2026-04-18  
**Purpose:** Universal billing system for tracking & monetizing LLM usage

> 🆕 **New:** OAuth Login + Third-Party LLM Integrations!

---

## 🚀 Quick Links

- **GitHub Repo:** https://github.com/sirwhy/Clieproxy
- **Deploy to Railway:** [![Deploy](https://railway.app/button.svg)](https://railway.app/template/Clieproxy)
- **Deploy to Vercel:** [![Deploy](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/sirwhy/Clieproxy)
- **Full README:** [GITHUB_README.md](./GITHUB_README.md)
- **Deployment Guide:** [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 📦 Quick Start

```bash
# 1. Clone repo
git clone https://github.com/sirwhy/Clieproxy.git
cd Clieproxy

# 2. Install dependencies
npm install

# 3. Setup database
npx prisma migrate dev

# 4. Seed pricing data
node scripts/seed-cpa-pricing.js

# 5. Start server
node server.js
```

---

## 🆕 Latest Features (v2.1.0)

### 🔐 OAuth Login
- ✅ **Google** - Continue with Google
- ✅ **GitHub** - Continue with GitHub  
- ✅ **Twitter** - Continue with Twitter
- ✅ Secure session management
- ✅ Automatic user creation

### 🌐 Third-Party LLM Integration
- ✅ **Kilo Kiro** - Multiple LLMs via proxy
- ✅ **Antigravity** - Advanced AI platform
- ✅ **ChatGPT Plus** - GPT-4 subscription access
- ✅ **OpenRouter** - Multi-provider aggregator
- ✅ Encrypted API key storage
- ✅ Auto-usage tracking & billing

---

## 📋 Features

### Backend (API)
- ✅ **25+ LLM Models** - Grok, Claude, Qwen, DeepSeek, Llama, GPT, Gemini, Mistral
- ✅ **User Wallets** - Balance, deposits, transactions
- ✅ **Usage Tracking** - Token counting, cost calculation
- ✅ **Admin Dashboard** - Manage users, pricing, revenue
- ✅ **OAuth Support** - Google, GitHub, Twitter
- ✅ **Third-Party LLM** - Kilo Kiro, Antigravity, ChatGPT Plus, OpenRouter
- ✅ **Railway Ready** - Automatic PostgreSQL + Node.js
- ✅ **Vercel Ready** - Serverless deployment option

### Frontend (Dashboard)
- ✅ **User Dashboard** - View balance, transactions, quick actions
- ✅ **OAuth Login** - Google, GitHub, Twitter buttons
- ✅ **API Key Management** - Add/manage LLM API keys
- ✅ **Integrations Manager** - Add Kilo Kiro, Antigravity, etc.
- ✅ **Cost Calculator** - Estimate LLM costs before calling
- ✅ **Responsive Design** - Works on desktop & mobile
- ✅ **Modern UI** - Dark mode, Tailwind CSS, Lucide icons

---

## 💰 Pricing Examples

| Model | Input | Output |
|-------|-------|--------|
| Grok-4 | $0.50 | $1.00 |
| Claude-3.5-Sonnet | $3.00 | $15.00 |
| Qwen-35B | $0.30 | $0.60 |
| DeepSeek-Chat | $0.14 | $0.28 |

**Formula:** `(tokensIn × priceIn + tokensOut × priceOut) / 1000`

---

## 📚 Documentation

### 🚀 Deployment (No Terminal Needed!)
- **[RAILWAY_TUTORIAL_WEB.md](./RAILWAY_TUTORIAL_WEB.md)** - **🆕 Web-only Railway guide (NO CLI!)**
- **[DEPLOYMENT_RAILWAY.md](./DEPLOYMENT_RAILWAY.md)** - Railway deployment guide (with CLI)
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - General deployment guide
- **[DEPLOYMENT_COMPLETE.md](./DEPLOYMENT_COMPLETE.md)** - Ready to deploy!

### 📖 Features & Setup
- **[OAUTH_GUIDE.md](./OAUTH_GUIDE.md)** - **🆕 OAuth & Third-Party LLM guide**
- **[QUICK_START.md](./QUICK_START.md)** - Quick reference
- **[CPA_SYSTEM.md](./CPA_SYSTEM.md)** - Full documentation

### 📁 Complete Guides
- **[GITHUB_README.md](./GITHUB_README.md)** - Complete README

---

## 🚀 Quick Deploy to Railway

**No CLI Needed! Follow the guide:**  
📖 **[RAILWAY_TUTORIAL_WEB.md](./RAILWAY_TUTORIAL_WEB.md)** - **100% web-based (no terminal!)**

**Steps:**
1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Select: `sirwhy/Clieproxy`
4. Add PostgreSQL database
5. Copy DATABASE_URL from database
6. Set variables in backend service
7. Create frontend service
8. Run migrations in Railway Shell
9. Done!

---

**Status:** ✅ Production Ready  
**Version:** 2.1.0  
**Last Updated:** 2026-04-18

**Made with ❤️ for all LLM developers!**
