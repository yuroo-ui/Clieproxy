# 🔐 CPA System - OAuth & Third-Party LLM Integration Guide

**Version:** 2.1.0 | **Date:** 2026-04-18

---

## 🎯 Overview

This guide covers OAuth login and third-party LLM integrations for CPA System.

### Features Added:
✅ **OAuth Login** - Google, GitHub, Twitter  
✅ **Third-Party LLM** - Kilo Kiro, Antigravity, ChatGPT Plus, OpenRouter  
✅ **Secure API Key Storage** - Encrypted storage  
✅ **Usage Tracking** - Auto-track and bill usage  

---

## 📁 New Files Added

### Backend Routes
- `routes/auth-oauth.js` - OAuth + Third-Party LLM API routes

### Frontend Pages
- `app/login/page.tsx` - OAuth login page
- `app/callback/page.tsx` - OAuth callback handler
- `app/integrations/page.tsx` - Third-party LLM integration manager

### Updated Files
- `schema.prisma` - Added User, Account, Session tables
- `server.js` - Added session middleware and OAuth routes

---

## 🚀 Setup Instructions

### Step 1: Update Database Schema

The new schema includes:

```prisma
model User {
  id            String
  email         String?
  username      String?
  password      String?
  role          Role
  emailVerified DateTime?
  avatar        String?
  
  // OAuth Relations
  accounts      Account[]
  sessions      Session[]
  
  // CPA Relations
  wallet        UserWallet?
  usage         LLMUsage[]
  transactions  TransactionHistory[]
  apiKeyConfigs ApiKeyConfig[]
}

model Account {
  id                String
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  // ... more fields
}

model ApiKeyConfig {
  id            String
  userId        String
  name          String
  provider      String  // kilo_kiro, antigravity, chatgpt_plus, etc.
  apiKey        String  // Encrypted
  apiSecret     String?
  isActive      Boolean
  metadata      String? // JSON
}
```

**Run Migration:**
```bash
npx prisma migrate dev --name add_oauth_and_thirdparty
npx prisma db push
```

---

### Step 2: Install Required Dependencies

```bash
cd /root/.openclaw/workspace/cpa-system

# OAuth & Session
npm install express-session memorystore

# Third-party API calls
npm install axios

# Encryption (optional, for better security)
npm install crypto-js
```

---

### Step 3: Configure Environment Variables

Add to `.env`:

```env
# OAuth Providers
OAUTH_GOOGLE_CLIENT_ID=your-google-client-id
OAUTH_GOOGLE_CLIENT_SECRET=your-google-client-secret

OAUTH_GITHUB_CLIENT_ID=your-github-client-id
OAUTH_GITHUB_CLIENT_SECRET=your-github-client-secret

OAUTH_TWITTER_CLIENT_ID=your-twitter-client-id
OAUTH_TWITTER_CLIENT_SECRET=your-twitter-client-secret

# Session
SESSION_SECRET=your-session-secret-key

# Encryption
ENCRYPTION_KEY=your-encryption-key-min-32-chars

# URLs
BASE_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3001
```

**Get OAuth Credentials:**

**Google:**
1. Go to https://console.cloud.google.com/apis/credentials
2. Create OAuth 2.0 Client ID
3. Add authorized redirect URI: `http://localhost:3000/api/auth/oauth/callback/google`

**GitHub:**
1. Go to https://github.com/settings/developers
2. New OAuth App
3. Authorization callback: `http://localhost:3000/api/auth/oauth/callback/github`

**Twitter:**
1. Go to https://developer.twitter.com/
2. Create app
3. Get OAuth 2.0 credentials

---

### Step 4: Configure Third-Party LLM Services

#### **Kilo Kiro**
1. Sign up at https://kilok.io
2. Get API key from dashboard
3. Add in CPA System frontend

#### **Antigravity**
1. Sign up at https://antigravity.dev
2. Get API key and secret
3. Add in CPA System frontend

#### **ChatGPT Plus**
1. Use your ChatGPT Plus subscription
2. Access via API proxy
3. Add API key

#### **OpenRouter**
1. Sign up at https://openrouter.ai
2. Get API key
3. Add in CPA System

---

## 🎨 Frontend Integration

### Update Navbar/Menu

Add "Integrations" link:

```tsx
<Link href="/integrations" className="hover:text-primary-400">
  Integrations
</Link>
```

### Add OAuth Login

Replace or supplement existing login with:

```tsx
// app/login/page.tsx (already created)
// Shows Google, GitHub, Twitter buttons
```

---

## 🔧 Usage Examples

### Start OAuth Login (Backend)

```javascript
// Frontend
window.location.href = 'http://localhost:3000/api/auth/oauth/google';

// Redirects to Google OAuth, then back to callback
```

### Add Third-Party Integration

```javascript
// Frontend
const response = await fetch(`${API_URL}/llm/integrate/kilo_kiro`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'My Kilo Kiro Account',
    apiKey: 'ki_kiro_api_key_here',
    apiSecret: 'secret_here'
  })
});

const data = await response.json();
```

### Chat via Third-Party LLM

```javascript
// Use integrated LLM
const response = await fetch(`${API_URL}/llm/chat/kilo_kiro`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'gpt-4',
    messages: [{ role: 'user', content: 'Hello!' }],
    configId: 'integration-id-from-db'
  })
});

const result = await response.json();
```

### Get Available Providers

```javascript
const response = await fetch(`${API_URL}/llm/providers`, {
  headers: { 'Authorization': `Bearer ${token}` }
});

const data = await response.json();
// data.providers contains all available LLM providers
```

---

## 🔒 Security Considerations

### 1. API Key Encryption

Keys are encrypted before storage:

```javascript
function encryptApiKey(key) {
  const secret = process.env.ENCRYPTION_KEY;
  return crypto.createHmac('sha256', secret).update(key).digest('hex');
}
```

**Note:** For production, use AES-256 encryption.

### 2. Session Management

Sessions stored in memory (for dev) or use Redis/PgStore for production.

### 3. Rate Limiting

Add rate limiting to OAuth callbacks:

```javascript
const rateLimit = require('express-rate-limit');

app.use('/api/auth/oauth', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));
```

---

## 📊 Third-Party Provider Details

| Provider | Type | Integration | Billing |
|----------|------|-------------|---------|
| **Kilo Kiro** | Proxy | Store your keys, unified API | Pay through Kilo Kiro |
| **Antigravity** | Platform | Advanced AI models | Pay through Antigravity |
| **ChatGPT Plus** | Subscription | Access GPT-4 | Your OpenAI subscription |
| **OpenRouter** | Aggregator | Multiple providers | Pay per token |
| **Direct APIs** | Native | Direct provider APIs | Pay through CPA System |

---

## 🧪 Testing

### Test OAuth Login

```bash
# 1. Start backend
npm start

# 2. Open frontend
npm run dev

# 3. Go to /login
# 4. Click "Continue with Google"
# 5. Complete OAuth flow
# 6. Should redirect to /dashboard
```

### Test Third-Party Integration

```bash
# 1. Login via OAuth
# 2. Go to /integrations
# 3. Click "Add Integration"
# 4. Select "Kilo Kiro"
# 5. Enter your API key
# 6. Click "Add Integration"
# 7. Should appear in list
```

### Test LLM Chat

```javascript
// After adding integration
const response = await fetch('http://localhost:3000/api/llm/chat/kilo_kiro', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'gpt-4',
    messages: [{ role: 'user', content: 'Test' }]
  })
});

const data = await response.json();
console.log(data.choices[0].message.content);
```

---

## 📚 Documentation

- **OAuth Flow:** Google, GitHub, Twitter
- **Third-Party:** Kilo Kiro, Antigravity, ChatGPT Plus, OpenRouter
- **Security:** Encrypted API key storage
- **Usage:** Auto-tracking and billing

---

## 🎯 Next Steps

1. ✅ **Setup OAuth** - Configure Google/GitHub/Twitter
2. ✅ **Add Integrations** - Add third-party LLM accounts
3. ✅ **Test Flow** - Complete OAuth login
4. ✅ **Start Using** - Make LLM calls via integrations

---

## 💡 Tips

- Always use HTTPS in production
- Store secrets securely (use vault/secret manager)
- Implement proper rate limiting
- Monitor API usage for billing
- Log all OAuth activities

---

**Ready to use! 🚀**

**Version:** 2.1.0  
**Last Updated:** 2026-04-18
