# 🔍 Which Services Need Public URLs?

## ❌ INTERNAL URLs (Won't Work from Vercel)

These use Railway's **private network** (`.railway.internal`) and need PUBLIC URLs:

### 1. PostgreSQL (Railway)
```
❌ CURRENT INTERNAL:
postgresql://user:password@postgres.railway.internal:5432/dbname

✅ NEEDS PUBLIC:
postgresql://user:password@containers-us-west-xxx.railway.app:5432/dbname
```

### 2. MongoDB (Railway)
```
❌ CURRENT INTERNAL:
mongodb://user:password@mongodb.railway.internal:27017/dbname

✅ NEEDS PUBLIC:
mongodb://user:password@containers-us-west-xxx.railway.app:27017/dbname
```

### 3. Redis (Railway)
```
❌ CURRENT INTERNAL:
redis://default:password@redis-pgdr.railway.internal:6379

✅ NEEDS PUBLIC:
redis://default:password@containers-us-west-xxx.railway.app:6379
```

---

## ✅ ALREADY PUBLIC (Use As-Is)

### 4. Neo4j
```
✅ ALREADY PUBLIC - NO CHANGE NEEDED:
neo4j+s://20c03c25.databases.neo4j.io
```
This uses `databases.neo4j.io` which is already publicly accessible on the internet!

---

## 🎯 How to Get Railway Public URLs

### Option 1: Railway Dashboard (Easiest)

1. Go to: https://railway.app/dashboard
2. Click on your project
3. For **each service** (PostgreSQL, MongoDB, Redis):

   **Step A:** Click the service

   **Step B:** Click **"Settings"** tab

   **Step C:** Scroll to **"Networking"** section

   **Step D:** Look for:
   - **"Public Domain"** or
   - **"TCP Proxy"** section

   **Step E:** Enable public networking if not enabled:
   - Click **"Generate Domain"** or **"Enable TCP Proxy"**
   - Copy the public URL shown

   **Step F:** The format will be:
   - `service-name.railway.app` or
   - `containers-us-west-xxx.railway.app:PORT`

### Option 2: Railway CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Get variables (shows public URLs)
railway variables
```

---

## 📋 Checklist

After getting public URLs from Railway, you'll have:

- [ ] PostgreSQL public URL (replace `.railway.internal` with public domain)
- [ ] MongoDB public URL (replace `.railway.internal` with public domain)
- [ ] Redis public URL (replace `.railway.internal` with public domain)
- [ ] Neo4j URL (no change - already public ✅)

Then add ALL to Vercel environment variables!

---

## ⚠️ Important Notes

**Why Internal URLs Don't Work:**
- `.railway.internal` URLs only work INSIDE Railway's private network
- Vercel is OUTSIDE Railway's network
- Public URLs allow Vercel to connect over the internet

**Security:**
- Railway public URLs are still secure (username/password required)
- Use SSL/TLS for encrypted connections
- Railway uses firewall rules to protect your services

**Cost:**
- Public networking is FREE on Railway
- No additional charges for external connections

---

## 🆘 If You Can't Find Public Networking in Railway

Some Railway services might need public networking enabled first:

1. Go to service settings
2. Look for "Networking" section
3. If you see "Public Networking: Disabled"
4. Click "Enable" or "Generate Domain"
5. Railway will assign a public URL
6. Copy that URL

**Format Examples:**
```
PostgreSQL:  postgresql://user:pass@containers-us-west-123.railway.app:5432/dbname
MongoDB:     mongodb://user:pass@containers-us-west-456.railway.app:27017
Redis:       redis://user:pass@containers-us-west-789.railway.app:6379
```

---

## ✅ Summary

| Service | Current Status | Action Needed |
|---------|---------------|---------------|
| PostgreSQL | ❌ Internal URL | ✅ Get public URL from Railway |
| MongoDB | ❌ Internal URL | ✅ Get public URL from Railway |
| Redis | ❌ Internal URL | ✅ Get public URL from Railway |
| Neo4j | ✅ Already public | ✅ Use as-is (no change) |

**Total URLs to update: 3 (PostgreSQL, MongoDB, Redis)**

Generated: 2025-11-03
