/**
 * CPA System - Auth (register/login) + OAuth + Third-Party LLM Routes
 */
const router  = require('express').Router();
const prisma  = require('../lib/prisma');
const { authMiddleware, generateToken } = require('../lib/auth');
const bcrypt  = require('bcryptjs');
const crypto  = require('crypto');
const axios   = require('axios');

// ─── Encryption (FIX: use AES-256 not HMAC which is one-way!) ─────────────────
const ALGO = 'aes-256-cbc';

function encryptApiKey(text) {
  const key = Buffer.from(
    (process.env.ENCRYPTION_KEY || 'clieproxy-enc-key-change-me-32ch').padEnd(32, '0').slice(0, 32)
  );
  const iv  = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decryptApiKey(encryptedText) {
  const key = Buffer.from(
    (process.env.ENCRYPTION_KEY || 'clieproxy-enc-key-change-me-32ch').padEnd(32, '0').slice(0, 32)
  );
  const [ivHex, encHex] = encryptedText.split(':');
  if (!ivHex || !encHex) return encryptedText; // fallback for unencrypted
  const decipher = crypto.createDecipheriv(ALGO, key, Buffer.from(ivHex, 'hex'));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(encHex, 'hex')), decipher.final()]);
  return decrypted.toString('utf8');
}

// ─── OAuth Provider Config ────────────────────────────────────────────────────
const OAUTH_PROVIDERS = {
  google: {
    authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    profileUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
    scopes: ['openid', 'email', 'profile'],
  },
  github: {
    authorizationUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    profileUrl: 'https://api.github.com/user',
    scopes: ['user:email'],
  },
};

// ─── Standard Register/Login ──────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { email, username, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email dan password wajib' });

    if (await prisma.user.findUnique({ where: { email } }))
      return res.status(400).json({ error: 'Email sudah terdaftar' });

    const user = await prisma.user.create({
      data: {
        email,
        username: username || email.split('@')[0],
        password: await bcrypt.hash(password, 12),
        role: 'USER',
        emailVerified: new Date(),
        wallet: { create: { balance: 0, currency: 'USD' } },
      },
    });
    res.status(201).json({ message: 'Registrasi berhasil', token: generateToken(user), user: { id: user.id, email: user.email, username: user.username, role: user.role } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email dan password wajib' });
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ error: 'Email atau password salah' });
    res.json({ message: 'Login berhasil', token: generateToken(user), user: { id: user.id, email: user.email, username: user.username, role: user.role } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── OAuth Routes ─────────────────────────────────────────────────────────────
router.get('/oauth/:provider', async (req, res) => {
  try {
    const { provider } = req.params;
    const cfg = OAUTH_PROVIDERS[provider];
    if (!cfg) return res.status(404).json({ error: 'Provider tidak ditemukan' });

    const state = crypto.randomBytes(32).toString('hex');
    req.session.oauthState = state;

    const authUrl = cfg.authorizationUrl + '?' + new URLSearchParams({
      client_id: process.env[`OAUTH_${provider.toUpperCase()}_CLIENT_ID`] || '',
      redirect_uri: `${process.env.BASE_URL || 'http://localhost:3000'}/api/auth/oauth/callback/${provider}`,
      response_type: 'code',
      scope: cfg.scopes.join(' '),
      state,
    });
    res.redirect(authUrl);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/oauth/callback/:provider', async (req, res) => {
  try {
    const { provider } = req.params;
    const { code, state } = req.query;

    if (req.session.oauthState !== state)
      return res.status(400).json({ error: 'Invalid state - CSRF protection' });

    const cfg = OAUTH_PROVIDERS[provider];
    if (!cfg) return res.status(404).json({ error: 'Provider tidak ditemukan' });

    // Exchange code for token
    const tokenRes = await axios.post(cfg.tokenUrl, new URLSearchParams({
      client_id:     process.env[`OAUTH_${provider.toUpperCase()}_CLIENT_ID`] || '',
      client_secret: process.env[`OAUTH_${provider.toUpperCase()}_CLIENT_SECRET`] || '',
      code,
      grant_type: 'authorization_code',
      redirect_uri: `${process.env.BASE_URL || 'http://localhost:3000'}/api/auth/oauth/callback/${provider}`,
    }), { headers: { Accept: 'application/json' } });

    const access_token = tokenRes.data.access_token;

    // Get profile
    const profileRes = await axios.get(cfg.profileUrl, {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const profile = profileRes.data;

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email: profile.email?.toLowerCase() } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: profile.email?.toLowerCase(),
          username: profile.name || `${provider}_${crypto.randomBytes(4).toString('hex')}`,
          avatar: profile.picture || profile.avatar_url,
          emailVerified: new Date(),
          accounts: { create: { provider, providerAccountId: String(profile.id), type: 'oauth', access_token } },
          wallet: { create: { balance: 0, currency: 'USD' } },
        },
      });
    }

    const token = generateToken(user);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    res.redirect(`${frontendUrl}/callback?token=${token}`);
  } catch (e) {
    console.error('OAuth callback error:', e.message);
    res.status(500).json({ error: 'OAuth callback gagal', detail: e.message });
  }
});

// ─── LLM Providers List ───────────────────────────────────────────────────────
router.get('/llm/providers', authMiddleware, async (req, res) => {
  try {
    const pricing = await prisma.lLMPriceConfig.findMany({
      where: { isActive: true },
      orderBy: { modelName: 'asc' },
    });
    const grouped = {};
    pricing.forEach(p => {
      const prov = p.provider || 'direct';
      if (!grouped[prov]) grouped[prov] = { name: prov, models: [] };
      grouped[prov].models.push({ model: p.modelName, priceIn: p.pricePerTokenIn, priceOut: p.pricePerTokenOut });
    });
    res.json({ success: true, providers: Object.values(grouped) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── LLM Integrations CRUD ───────────────────────────────────────────────────
router.post('/llm/integrate/:provider', authMiddleware, async (req, res) => {
  try {
    const { provider } = req.params;
    const { name, apiKey, apiSecret, metadata } = req.body;
    const userId = req.user.id;
    const validProviders = ['kilo_kiro', 'antigravity', 'chatgpt_plus', 'openrouter', 'openai', 'anthropic', 'deepseek'];
    if (!validProviders.includes(provider))
      return res.status(400).json({ error: 'Provider tidak valid. Pilih: ' + validProviders.join(', ') });
    if (!apiKey) return res.status(400).json({ error: 'API key wajib diisi' });

    const config = await prisma.apiKeyConfig.create({
      data: {
        userId, name: name || provider, provider,
        apiKey: encryptApiKey(apiKey),
        apiSecret: apiSecret ? encryptApiKey(apiSecret) : null,
        metadata: metadata ? JSON.stringify(metadata) : null,
        isActive: true,
      },
    });
    res.json({ success: true, config: { id: config.id, name: config.name, provider: config.provider, isActive: config.isActive } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/llm/integrations', authMiddleware, async (req, res) => {
  try {
    const configs = await prisma.apiKeyConfig.findMany({
      where: { userId: req.user.id },
      select: { id: true, name: true, provider: true, isActive: true, createdAt: true, metadata: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, integrations: configs.map(c => ({ ...c, metadata: c.metadata ? JSON.parse(c.metadata) : null })) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/llm/integrations/:id', authMiddleware, async (req, res) => {
  try {
    const config = await prisma.apiKeyConfig.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!config) return res.status(404).json({ error: 'Integration tidak ditemukan' });
    const { name, apiKey, metadata } = req.body;
    const data = {};
    if (name) data.name = name;
    if (apiKey) data.apiKey = encryptApiKey(apiKey);
    if (metadata) data.metadata = JSON.stringify(metadata);
    const updated = await prisma.apiKeyConfig.update({ where: { id: req.params.id }, data });
    res.json({ success: true, config: { id: updated.id, name: updated.name, provider: updated.provider } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/llm/integrations/:id', authMiddleware, async (req, res) => {
  try {
    const config = await prisma.apiKeyConfig.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!config) return res.status(404).json({ error: 'Integration tidak ditemukan' });
    await prisma.apiKeyConfig.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Integration dihapus' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── LLM Chat Proxy ───────────────────────────────────────────────────────────
router.post('/llm/chat/:provider', authMiddleware, async (req, res) => {
  try {
    const { provider } = req.params;
    const { messages, model, configId } = req.body;
    const userId = req.user.id;

    // Get config
    const config = await prisma.apiKeyConfig.findFirst({
      where: configId ? { id: configId, userId } : { userId, provider, isActive: true },
    });
    if (!config) return res.status(404).json({ error: 'API key config tidak ditemukan. Tambah integration dulu.' });

    const apiKey = decryptApiKey(config.apiKey);
    let response;

    const PROVIDER_URLS = {
      kilo_kiro:    'https://kilok.io/api/v1/chat/completions',
      antigravity:  'https://api.antigravity.dev/v1/chat/completions',
      chatgpt_plus: 'https://chatgpt-plus.com/api/v1/chat/completions',
      openrouter:   'https://openrouter.ai/api/v1/chat/completions',
      openai:       'https://api.openai.com/v1/chat/completions',
      anthropic:    'https://api.anthropic.com/v1/messages',
      deepseek:     'https://api.deepseek.com/chat/completions',
    };

    const url = PROVIDER_URLS[provider];
    if (!url) return res.status(400).json({ error: 'Provider tidak didukung' });

    const headers = { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' };
    if (provider === 'openrouter') {
      headers['HTTP-Referer'] = process.env.BASE_URL || 'http://localhost:3000';
    }

    const apiResponse = await axios.post(url, { model, messages, temperature: 0.7 }, { headers });
    response = apiResponse.data;

    // Track usage (FIX: use correct field name 'cost' not 'totalCost')
    const usage = response.usage || { prompt_tokens: 0, completion_tokens: 0 };
    await prisma.lLMUsage.create({
      data: { userId, model: model || provider, provider, tokensIn: usage.prompt_tokens || 0, tokensOut: usage.completion_tokens || 0, cost: 0 },
    });

    res.json(response);
  } catch (e) {
    res.status(500).json({ error: 'LLM call gagal', detail: e.message });
  }
});

module.exports = router;
