# 🧹 Tutorial: Hapus CPA System dari Akirareads Repository

**Date:** 2026-04-18  
**Version:** 1.0.0

---

## 🎯 Tujuan

Menghapus semua file CPA (Cost Per Action) dari repository Akirareads karena sudah dipisah ke repository baru `sirwhy/Clieproxy`.

---

## 📁 File CPA yang Akan Dihapus

Dari hasil scan GitHub, berikut file-file CPA yang ada di Akirareads:

### **Root Directory:**
- ❌ `SECURITY-UPDATES.md` ← File ini ada!

### **docs/ Folder:**
- ❌ `CPA_SYSTEM.md`
- ❌ `CPA_API.md`
- ❌ `CPA_SETUP.md`

### **Other Files:**
- ❌ Files related to CPA in server/

---

## 🚀 **Cara 1: Manual via GitHub Website** (Recommended)

### **Step 1: Buka GitHub**

1. Buka: https://github.com/sirwhy/Akirareads
2. Login ke GitHub

### **Step 2: Hapus File Satu per Satu**

**File 1: SECURITY-UPDATES.md**

1. Klik file: `SECURITY-UPDATES.md`
2. Klik icon **trash** 🗑️ di atas kanan (Delete file)
3. Ketik commit message: `Remove CPA system files`
4. Klik **"Commit changes"**

**File 2: docs/CPA_SYSTEM.md**

1. Navigate ke folder: `docs/`
2. Klik file: `CPA_SYSTEM.md`
3. Klik icon **trash** 🗑️
4. Klik **"Commit changes"**

**File 3: docs/CPA_API.md**

1. Navigate ke: `docs/`
2. Delete: `CPA_API.md`
3. Commit

**File 4: docs/CPA_SETUP.md**

1. Navigate ke: `docs/`
2. Delete: `CPA_SETUP.md`
3. Commit

---

### **Step 3: Verify**

1. Refresh halaman
2. Pastikan tidak ada file CPA lagi
3. Check `docs/` folder - should be empty or only has original docs

---

## 🚀 **Cara 2: via Terminal** (Faster)

### **Step 1: Clone Repository**

```bash
# Clone if not already
git clone https://github.com/sirwhy/Akirareads.git
cd Akirareads
```

### **Step 2: Remove CPA Files**

```bash
# Remove security updates (contains CPA info)
rm SECURITY-UPDATES.md

# Remove CPA docs
rm -rf docs/CPA_SYSTEM.md
rm -rf docs/CPA_API.md
rm -rf docs/CPA_SETUP.md

# Remove any CPA-related files in server/
rm -rf server/routes/cpa.js
rm -rf server/middleware/cpaCheck.js
```

### **Step 3: Commit & Push**

```bash
# Check status
git status

# Add all changes
git add -A

# Commit
git commit -m "chore: remove CPA system files

Remove all CPA (Cost Per Action) related files from repository.
CPA system has been moved to separate repository: sirwhy/Clieproxy

Files removed:
- SECURITY-UPDATES.md
- docs/CPA_SYSTEM.md
- docs/CPA_API.md
- docs/CPA_SETUP.md
- server/routes/cpa.js (if exists)
- server/middleware/cpaCheck.js (if exists)
"

# Push to GitHub
git push origin main
```

---

## 🚀 **Cara 3: Gunakan Script** (Easiest)

### **Step 1: Create Script**

Script sudah saya buatkan! Copy ke lokal:

```bash
# On your local machine
cd ~/projects
mkdir remove-cpa
cd remove-cpa

# Copy script from workspace
cp /root/.openclaw/workspace/cpa-system/remove-cpa-from-akirareads.sh .
chmod +x remove-cpa-from-akirareads.sh
```

### **Step 2: Run Script**

```bash
# Go to Akirareads repo
cd /path/to/Akirareads

# Run script
bash /root/.openclaw/workspace/cpa-system/remove-cpa-from-akirareads.sh
```

**Or just run manually:**

```bash
# Delete CPA files
rm SECURITY-UPDATES.md
rm -rf docs/CPA_SYSTEM.md docs/CPA_API.md docs/CPA_SETUP.md

# Commit & push
git add -A
git commit -m "Remove CPA system files"
git push origin main
```

---

## ✅ **Verification Checklist**

After deletion, verify:

- [ ] `SECURITY-UPDATES.md` is gone from root
- [ ] `docs/CPA_SYSTEM.md` is gone
- [ ] `docs/CPA_API.md` is gone
- [ ] `docs/CPA_SETUP.md` is gone
- [ ] No CPA-related files in `server/`
- [ ] Git history shows deletion commit
- [ ] README.md doesn't mention CPA system anymore

---

## 📝 **Commit Message Template**

Use this for your commit:

```
chore: remove CPA system files

Remove all CPA (Cost Per Action) related files from Akirareads repository.
CPA system has been moved to separate repository: sirwhy/Clieproxy

Files removed:
- SECURITY-UPDATES.md
- docs/CPA_SYSTEM.md
- docs/CPA_API.md
- docs/CPA_SETUP.md
```

---

## 🔍 **Quick Check Commands**

### Check if CPA files still exist:

```bash
# Check root
ls SECURITY-UPDATES.md 2>/dev/null || echo "SECURITY-UPDATES.md - Not found ✅"

# Check docs
ls docs/CPA_SYSTEM.md 2>/dev/null || echo "CPA_SYSTEM.md - Not found ✅"
ls docs/CPA_API.md 2>/dev/null || echo "CPA_API.md - Not found ✅"
ls docs/CPA_SETUP.md 2>/dev/null || echo "CPA_SETUP.md - Not found ✅"
```

### Check Git log:

```bash
git log --oneline | head -5
```

Should see your deletion commit at the top.

---

## 🎯 **After Cleanup**

Your Akirareads repository should now:

✅ **No CPA files** - All removed  
✅ **Clean structure** - Original Akirareads files only  
✅ **Git history** - Shows deletion commit  
✅ **Ready to continue** - Can continue development  

---

## 📞 **Need Help?**

If you encounter issues:

1. **Can't delete via web:** Use terminal method
2. **Merge conflicts:** `git checkout --theirs` then commit
3. **Permission error:** Make sure you own the repository
4. **Network issues:** Retry push command

---

## 🚀 **Summary**

| Method | Time | Difficulty | Recommended |
|--------|------|------------|-------------|
| **GitHub Website** | 5-10 min | Easy | ✅ For beginners |
| **Terminal** | 2-3 min | Medium | ✅ For developers |
| **Script** | 1-2 min | Easy | ✅ For automation |

---

**Pilih cara yang paling mudah untuk kamu!** 🎉

**Happy cleaning! 🧹**

---

## 📋 **Quick Commands**

```bash
# One-liner to remove all CPA files
rm SECURITY-UPDATES.md && \
rm -rf docs/CPA_SYSTEM.md docs/CPA_API.md docs/CPA_SETUP.md && \
git add -A && \
git commit -m "chore: remove CPA system files" && \
git push origin main
```

**Run this in Akirareads repo root!** 🚀
