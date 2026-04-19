# 🚀 Quick Start Guide - CPA System + CLI Proxy API

**Version:** 1.0.0 | **Date:** 2026-04-17

---

## 📋 Prerequisites

✅ VPS with root access  
✅ Internet connection  
✅ Basic terminal knowledge  

---

## 🎯 Setup Options

### Option 1: Automated Setup (Recommended)

**1. Connect to VPS:**
```bash
ssh root@your-vps-ip
```

**2. Run automated script:**
```bash
# Install script
curl -L https://raw.githubusercontent.com/router-for-me/CLIProxyAPI/main/setup-cpa-cliproxy.sh -o setup-cpa-cliproxy.sh
chmod +x setup-cpa-cliproxy.sh

# Run setup (sudo required)
sudo ./setup-cpa-cliproxy.sh
```

**3. Follow prompts:**
- Enter VPS IP
- Confirm setup
- Wait for completion

**4. Access dashboards:**
```
CLI Proxy:  http://<YOUR-VPS-IP>:8317/management.html
CPA System: http://<YOUR-VPS-IP>:3000
```

---

### Option 2: Manual Setup (Step-by-Step)

#### Step 1: Install Dependencies

```bash
# Update system
apt update

# Install Git
apt install git -y

# Install Docker
bash <(curl -fsSL https://get.docker.com)
systemctl start docker
systemctl enable docker

# Install PostgreSQL
apt install postgresql postgresql-contrib -y
systemctl start postgresql
systemctl enable postgresql

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install nodejs -y
```

#### Step 2: Setup CLI Proxy API

```bash
# Clone repository
cd /root
git clone https://github.com/router-for-me/CLIProxyAPI.git
cd CLIProxyAPI

# Copy config
cp config.example.yml config.yaml

# Edit config (use nano or vim)
nano config.yaml

# Change these lines:
allow-remote: true
secret-key: "your-secure-password-here"  # Replace with strong password

# Save: Ctrl+O, Enter, Ctrl+X

# Build
bash docker-build.sh

# Select Option 1 (Normal build)
```

#### Step 3: Setup CPA System

```bash
# Copy CPA files to VPS
# Option A: Via SCP
scp -r /root/.openclaw/workspace/cpa-system root@your-vps-ip:/root/

# Option B: If already on VPS, clone or copy manually
cd /root
mkdir cpa-system
# Copy files from workspace to cpa-system/

# Setup Node.js
cd /root/cpa-system
npm install

# Setup database
apt install postgresql -y

# Create database
sudo -u postgres psql
```

In PostgreSQL:
```sql
CREATE DATABASE cpa_db;
CREATE USER cpa_user WITH PASSWORD 'cpa_password';
GRANT ALL PRIVILEGES ON DATABASE cpa_db TO cpa_user;
\q
```

#### Step 4: Configure CPA System

```bash
cd /root/cpa-system

# Create .env file
cat > .env << EOF
DATABASE_URL="postgresql://cpa_user:cpa_password@localhost:5432/cpa_db"
JWT_SECRET="your-jwt-secret-key"
PORT=3000
EOF

# Install Prisma
npm install -g prisma

# Initialize Prisma
prisma init

# Add schema
cat schema.prisma >> prisma/schema.prisma

# Run migration
prisma migrate dev --name cpa_system

# Seed pricing data
node scripts/seed-cpa-pricing.js
```

#### Step 5: Start CPA System

```bash
# Install PM2
npm install -g pm2

# Start CPA System
pm2 start server.js --name cpa-system
pm2 save
pm2 startup

# Or run directly (development)
node server.js
```

#### Step 6: Configure Firewall (Optional)

```bash
# Install UFW
apt install ufw -y

# Allow ports
ufw allow 8317  # CLI Proxy
ufw allow 3000  # CPA System
ufw allow 22    # SSH

# Enable firewall
ufw enable
```

---

## 🎯 Access & Configuration

### CLI Proxy Dashboard

**URL:** `http://<YOUR-VPS-IP>:8317/management.html`

**Login:**
- Password: Enter the `secret-key` from config.yaml

**Tab: AI Providers**
- Add your LLM API keys:
  - xAI (Grok) API Key
  - OpenAI API Key
  - Anthropic API Key
  - Akash API Key
  - etc.

**Tab: OAuth Login** (Optional)
- Configure OAuth for user authentication
- Google, GitHub, etc.

---

### CPA System API

**Base URL:** `http://<YOUR-VPS-IP>:3000`

#### API Endpoints:

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/cpa/wallet` | ✅ | Get wallet balance |
| PUT | `/api/cpa/wallet/deposit` | ✅ | Add funds |
| GET | `/api/cpa/wallet/history` | ✅ | Transaction history |
| POST | `/api/cpa/calculate` | - | Estimate LLM cost |
| POST | `/api/cpa/charge` | ✅ | Charge for usage |
| GET | `/api/cpa/usage/stats` | ✅ | Usage statistics |
| GET | `/api/cpa/pricing` | - | View all prices |
| PUT | `/api/cpa/pricing` | admin | Update pricing |
| GET | `/api/admin/cpa/users` | admin | All users |
| GET | `/api/admin/cpa/reports` | admin | Revenue reports |

---

## 🧪 Testing

### 1. Test CPA System

```bash
# Get wallet balance (no auth needed for test user)
curl http://localhost:3000/api/cpa/wallet

# Deposit $10
curl -X PUT http://localhost:3000/api/cpa/wallet/deposit \
  -H "Content-Type: application/json" \
  -d '{"amount": 10, "currency": "USD"}'

# Calculate cost for Grok-4
curl -X POST http://localhost:3000/api/cpa/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "grok-4.20-0309-reasoning",
    "tokensIn": 1000,
    "tokensOut": 500
  }'

# Get all pricing
curl http://localhost:3000/api/cpa/pricing
```

### 2. Test CLI Proxy API

```bash
# Call LLM via proxy
curl http://localhost:8317/api/llm \
  -H "Authorization: Bearer YOUR_PROXY_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "grok-4",
    "messages": [{"role": "user", "content": "Hello, Grok!"}]
  }'
```

### 3. Test Integration

```bash
# Full flow: Deposit → Calculate → Charge → Call LLM

# Step 1: Deposit
curl -X PUT http://localhost:3000/api/cpa/wallet/deposit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"amount": 20, "currency": "USD"}'

# Step 2: Calculate cost
curl -X POST http://localhost:3000/api/cpa/calculate \
  -d '{"model":"grok-4","tokensIn":1000,"tokensOut":500}'

# Step 3: Charge usage
curl -X POST http://localhost:3000/api/cpa/charge \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"model":"grok-4","tokensIn":1000,"tokensOut":500}'

# Step 4: Call LLM via proxy
curl http://localhost:8317/api/llm \
  -H "Authorization: Bearer YOUR_PROXY_SECRET" \
  -d '{"model":"grok-4","messages":[{"role":"user","content":"Test"}]}'
```

---

## 📊 Monitoring

### CLI Proxy Logs

```bash
# View logs
tail -f /root/CLIProxyAPI/logs/main.log

# View with PM2 (if running in container)
docker logs CLIProxyAPI
```

### CPA System Logs

```bash
# View PM2 logs
pm2 logs cpa-system

# View directly
tail -f /root/cpa-system/logs/server.log

# Or via PM2
pm2 monit
```

### Database Queries

```bash
# Access PostgreSQL
sudo -u postgres psql -d cpa_db

# List tables
\dt

# Check user wallets
SELECT * FROM "UserWallet";

# Check LLM usage
SELECT * FROM "LLMUsage" ORDER BY "createdAt" DESC LIMIT 10;

# Check pricing
SELECT * FROM "LLMPriceConfig";

# Check transactions
SELECT * FROM "TransactionHistory" ORDER BY "createdAt" DESC;
```

---

## 🎯 Quick Commands Reference

### PM2 Commands

```bash
# Status
pm2 status

# Logs
pm2 logs cpa-system

# Restart
pm2 restart cpa-system

# Stop
pm2 stop cpa-system

# Start
pm2 start cpa-system

# Delete
pm2 delete cpa-system

# Monitor
pm2 monit
```

### Database Commands

```bash
# Backup database
pg_dump cpa_db > backup_$(date +%Y%m%d).sql

# Restore database
psql cpa_db < backup_20260417.sql

# Check database size
\du
\l+

# Vacuum analyze
VACUUM ANALYZE;
```

### Docker Commands (CLI Proxy)

```bash
# List containers
docker ps -a

# Restart container
docker restart CLIProxyAPI

# View logs
docker logs CLIProxyAPI

# Stop container
docker stop CLIProxyAPI

# Start container
docker start CLIProxyAPI
```

---

## 🔐 Security Checklist

- [ ] Change default passwords
- [ ] Enable firewall (UFW)
- [ ] Use strong API keys
- [ ] Configure HTTPS (optional)
- [ ] Set up rate limiting
- [ ] Monitor logs regularly
- [ ] Backup database regularly
- [ ] Update dependencies

---

## 📝 Troubleshooting

### Problem: "Permission denied" when running script

```bash
chmod +x setup-cpa-cliproxy.sh
sudo ./setup-cpa-cliproxy.sh
```

### Problem: Docker not running

```bash
systemctl start docker
systemctl enable docker
```

### Problem: Database connection failed

```bash
# Check PostgreSQL is running
systemctl status postgresql

# Check .env file has correct DATABASE_URL
cat /root/cpa-system/.env
```

### Problem: Port already in use

```bash
# Check what's using port 8317
netstat -tlnp | grep 8317

# Kill process or change port
```

### Problem: CPA System not starting

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs cpa-system

# Check errors in server.js
node server.js  # Run manually to see errors
```

---

## 🚀 Next Steps

1. ✅ Setup complete
2. ⚙️ Add LLM API keys to CLI Proxy dashboard
3. 🧪 Test API endpoints
4. 📊 Monitor usage and costs
5. 🔄 Configure OAuth for user authentication
6. 📈 Set up billing system
7. 🎨 Create user dashboard (optional)

---

## 📞 Support

- **CLI Proxy Docs:** https://github.com/router-for-me/CLIProxyAPI
- **CPA System Docs:** `/root/.openclaw/workspace/cpa-system/README.md`
- **Quick Reference:** `/root/.openclaw/workspace/cpa-system/SUMMARY.md`

---

**Happy coding! 🚀**
