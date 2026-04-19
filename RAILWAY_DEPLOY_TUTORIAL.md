# 🚂 Tutorial Deploy ke Railway — Clieproxy CPA System
## (Lengkap via Website Railway, tanpa CLI)

---

## 📋 Yang Dibutuhkan
- Akun [Railway.app](https://railway.app)
- Akun [GitHub](https://github.com) (project harus di-push ke GitHub dulu)

---

## LANGKAH 0 — Push ke GitHub

Sebelum deploy, project harus ada di GitHub:

1. Buat repo baru di github.com → New Repository → nama: `clieproxy`
2. Di folder project kamu, jalankan:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/USERNAME/clieproxy.git
git push -u origin main
```

---

## LANGKAH 1 — Buat Project di Railway

1. Buka https://railway.app → Login
2. Klik tombol **"+ New Project"** (pojok kanan atas)
3. Pilih **"Empty Project"**
4. Project kosong akan terbuat

---

## LANGKAH 2 — Tambah Database PostgreSQL

1. Di halaman project, klik **"+ Add Service"**
2. Pilih **"Database"** → **"PostgreSQL"**
3. Tunggu beberapa detik hingga database siap (muncul warna hijau)
4. Klik service **Postgres** yang baru dibuat
5. Buka tab **"Variables"**
6. Cari variabel **`DATABASE_URL`** → klik ikon mata 👁 untuk lihat nilainya
7. **Salin nilai DATABASE_URL** — akan dipakai di langkah berikutnya
   - Format: `postgresql://postgres:XXXXX@postgres.railway.internal:5432/railway`

---

## LANGKAH 3 — Deploy Backend

1. Di project Railway, klik **"+ Add Service"**
2. Pilih **"GitHub Repo"**
3. Klik **"Connect GitHub"** → authorize Railway → pilih repo `clieproxy`
4. Railway akan mendeteksi project

### ⚙️ Settings Backend

Klik service yang baru dibuat → buka tab **"Settings"**:

| Setting | Nilai |
|---------|-------|
| **Root Directory** | *(kosongkan / biarkan default)* |
| **Build Command** | `npm install && npx prisma generate` |
| **Start Command** | `npx prisma db push && node scripts/seed-cpa-pricing.js && node server.js` |
| **Watch Paths** | *(kosongkan)* |

### 🔑 Variables Backend

Klik tab **"Variables"** → klik **"Raw Editor"** → paste ini (ganti nilai yang perlu):

```
DATABASE_URL=postgresql://postgres:XXXXX@postgres.railway.internal:5432/railway
JWT_SECRET=clieproxy-jwt-ganti-ini-dengan-string-random-panjang-min-32-karakter
SESSION_SECRET=clieproxy-session-ganti-ini-random
ENCRYPTION_KEY=clieproxy-enc-key-32charexact!!!!
PORT=3000
NODE_ENV=production
BASE_URL=https://NANTI_ISI_SETELAH_DEPLOY.up.railway.app
FRONTEND_URL=https://NANTI_ISI_SETELAH_FRONTEND_DEPLOY.up.railway.app
```

> ⚠️ `DATABASE_URL` = salin dari service Postgres di Langkah 2
> ⚠️ `ENCRYPTION_KEY` = **tepat 32 karakter** (penting untuk enkripsi API keys user)

5. Klik **"Deploy"** → tunggu 2-5 menit
6. Setelah deploy selesai, lihat **domain backend** di bagian atas (misal: `clieproxy-production-abc123.up.railway.app`)
7. Update variable `BASE_URL` dengan domain tersebut → Railway akan auto-redeploy
8. **Test**: buka `https://[backend-domain]/api/health` di browser → harus muncul `{"status":"OK"}`

---

## LANGKAH 4 — Deploy Frontend (Next.js)

1. Di project Railway yang sama, klik **"+ Add Service"** lagi
2. Pilih **"GitHub Repo"** → pilih repo yang sama (`clieproxy`)
3. Klik service frontend yang baru dibuat

### ⚙️ Settings Frontend

Tab **"Settings"**:

| Setting | Nilai |
|---------|-------|
| **Root Directory** | `frontend` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |

### 🔑 Variables Frontend

Tab **"Variables"** → **"Raw Editor"**:

```
NEXT_PUBLIC_API_URL=https://[backend-domain]/api
NODE_ENV=production
```

Ganti `[backend-domain]` dengan domain backend dari Langkah 3.

4. Klik **"Deploy"** → tunggu 3-5 menit
5. Salin domain frontend (misal: `clieproxy-frontend-xyz789.up.railway.app`)

---

## LANGKAH 5 — Update CORS Backend

1. Kembali ke service **backend**
2. Tab **"Variables"**
3. Update `FRONTEND_URL` dengan domain frontend:
   ```
   FRONTEND_URL=https://clieproxy-frontend-xyz789.up.railway.app
   ```
4. Railway auto-redeploy backend

---

## LANGKAH 6 — Verifikasi

Buka domain frontend di browser → harus tampil halaman login.

Test API:
```bash
# Health check
curl https://[backend]/api/health

# Register user baru
curl -X POST https://[backend]/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","username":"testuser","password":"test123456"}'

# Login
curl -X POST https://[backend]/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123456"}'

# Lihat pricing LLM
curl https://[backend]/api/cpa/pricing
```

---

## 🔑 Ringkasan Variables

### Backend Variables
| Variable | Contoh Nilai | Keterangan |
|----------|-------------|-----------|
| `DATABASE_URL` | `postgresql://postgres:xxx@postgres.railway.internal:5432/railway` | Copy dari service Postgres |
| `JWT_SECRET` | `string-random-min-32-karakter-xxxxxxxxxx` | Untuk sign JWT token |
| `SESSION_SECRET` | `session-secret-random` | Untuk OAuth session |
| `ENCRYPTION_KEY` | `exactly-32-characters-here!!!!` | **Harus tepat 32 karakter!** |
| `PORT` | `3000` | Port server |
| `NODE_ENV` | `production` | Environment |
| `BASE_URL` | `https://backend.up.railway.app` | URL backend (tanpa slash) |
| `FRONTEND_URL` | `https://frontend.up.railway.app` | URL frontend (tanpa slash) |
| `OAUTH_GOOGLE_CLIENT_ID` | `xxxx.apps.googleusercontent.com` | Opsional - untuk OAuth Google |
| `OAUTH_GOOGLE_CLIENT_SECRET` | `GOCSPX-xxxx` | Opsional |
| `OAUTH_GITHUB_CLIENT_ID` | `Iv1.xxxx` | Opsional - untuk OAuth GitHub |
| `OAUTH_GITHUB_CLIENT_SECRET` | `xxxx` | Opsional |

### Frontend Variables
| Variable | Contoh Nilai | Keterangan |
|----------|-------------|-----------|
| `NEXT_PUBLIC_API_URL` | `https://backend.up.railway.app/api` | URL backend + /api |
| `NODE_ENV` | `production` | Environment |

---

## 🔧 Troubleshooting

### Backend crash saat start
Cek **Logs** di Railway → service backend → tab Deployments → klik deployment → lihat logs.

Penyebab umum:
- `DATABASE_URL` salah atau kosong
- `ENCRYPTION_KEY` tidak tepat 32 karakter
- Prisma migrate gagal (cek log untuk error detail)

### "Cannot find module '../lib/prisma'"
Pastikan build command menggunakan: `npm install && npx prisma generate`
Jika tidak ada `generate`, Prisma Client tidak ter-generate.

### Frontend tidak bisa connect ke backend
- Pastikan `NEXT_PUBLIC_API_URL` diakhiri `/api`
- Pastikan tidak ada trailing slash: `https://backend.railway.app/api` ✅ bukan `https://backend.railway.app/api/` ❌

### "P2002: Unique constraint failed" saat seed
Normal — artinya data sudah ada. Seed pakai `upsert` jadi aman dijalankan berkali-kali.

---

## 📡 API Endpoints Utama

### Auth
```
POST /api/auth/register   - Daftar user baru
POST /api/auth/login      - Login → dapat JWT token
GET  /api/auth/oauth/google  - Login dengan Google (redirect)
GET  /api/auth/oauth/github  - Login dengan GitHub (redirect)
```

### Wallet (butuh JWT token di header)
```
GET  /api/cpa/wallet              - Lihat saldo
PUT  /api/cpa/wallet/deposit      - Top up saldo
GET  /api/cpa/wallet/history      - Riwayat transaksi
```

### LLM Usage
```
POST /api/cpa/calculate   - Hitung estimasi biaya
POST /api/cpa/charge      - Charge biaya pemakaian
GET  /api/cpa/usage/stats - Statistik penggunaan
GET  /api/cpa/pricing     - Lihat harga semua model
```

### LLM Integration
```
GET  /api/llm/integrations           - List integrasi user
POST /api/llm/integrate/:provider    - Tambah API key
PUT  /api/llm/integrations/:id       - Update integrasi
DELETE /api/llm/integrations/:id     - Hapus integrasi
POST /api/llm/chat/:provider         - Chat via proxy
```

### Admin (butuh role ADMIN)
```
GET  /api/cpa/admin/users     - List semua user + balance
GET  /api/cpa/admin/reports   - Laporan revenue
POST /api/cpa/admin/adjust-balance - Adjust saldo user manual
PUT  /api/cpa/pricing         - Update harga model
```

### Cara pakai token:
```bash
# Setelah login, tambahkan token di header:
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" https://[backend]/api/cpa/wallet
```

---

## 🔐 Cara Buat Admin User

Setelah register user biasa, update role via database:
```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'emailkamu@gmail.com';
```

Akses via Railway → service Postgres → tab **"Data"** → tabel `users` → edit record.
