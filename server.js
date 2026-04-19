require('dotenv').config();
const express      = require('express');
const cors         = require('cors');
const session      = require('express-session');
const memoryStore  = require('memorystore')(session);

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.FRONTEND_URL || '').split(',').map(s => s.trim().replace(/\/+$/, '')).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => cb(null, true), // allow all - adjust in production
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));
app.options('*', cors());

// ─── Body Parser ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ─── Session (for OAuth state) ────────────────────────────────────────────────
app.use(session({
  secret: process.env.SESSION_SECRET || 'clieproxy-session-secret',
  resave: false,
  saveUninitialized: false,
  store: new memoryStore({ checkPeriod: 86400000 }),
  cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 24 * 60 * 60 * 1000 },
}));

// ─── Routes ───────────────────────────────────────────────────────────────────
const cpaRoutes   = require('./routes/cpa');
const oauthRoutes = require('./routes/auth-oauth');

app.use('/api/cpa',  cpaRoutes);
app.use('/api/auth', oauthRoutes);  // register, login, oauth
app.use('/api/llm',  oauthRoutes);  // llm providers, chat

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', app: 'Clieproxy CPA System', version: '1.0.0', timestamp: new Date().toISOString(), env: process.env.NODE_ENV || 'development' });
});

// ─── 404 & Error Handlers ─────────────────────────────────────────────────────
app.use('/api/*', (req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error', message: process.env.NODE_ENV === 'development' ? err.message : undefined });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Clieproxy CPA System running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💾 Database: ${process.env.DATABASE_URL ? '✅ Configured' : '❌ Not configured!'}`);
});

process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT',  () => process.exit(0));

module.exports = app;
