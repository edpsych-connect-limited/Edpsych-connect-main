# EdPsych Connect World - Complete Backend Setup Guide
## Get Your Platform Running in Production

**Status:** Platform is built but NOT connected to backend services
**Problem:** Only landing page works because other pages require database/authentication
**Solution:** Follow this guide to connect all services

---

## 🚨 Current Issue

Your platform builds successfully but **nothing works** because:
- ❌ No database connected (PostgreSQL)
- ❌ No authentication configured (NextAuth)
- ❌ No payment processing (Stripe)
- ❌ No email service configured
- ❌ Environment variables not set in Vercel

**Result:** Only the landing page loads. All other pages fail.

---

## 📋 Required Services & Costs

| Service | Purpose | Cost | Setup Time |
|---------|---------|------|------------|
| **PostgreSQL Database** | Store all data | £0-25/month | 15 mins |
| **NextAuth** | User authentication | £0 | 10 mins |
| **Stripe** | Payment processing | £0 (fees only) | 20 mins |
| **Email Service** | Send emails | £0-10/month | 15 mins |
| **Vercel** | Hosting (you have) | £0-20/month | 5 mins |

**Total Setup Time:** ~65 minutes
**Total Monthly Cost:** £0-55

---

## 🗄️ Step 1: Set Up PostgreSQL Database (15 minutes)

### Option A: Vercel Postgres (RECOMMENDED - Easiest)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Click on your project: `edpsych-connect-limited`

2. **Create Database**
   - Click "Storage" tab
   - Click "Create Database"
   - Select "Postgres"
   - Choose "Hobby" plan (£0/month, 256MB)
   - Click "Create"

3. **Get Connection String**
   - Vercel will show you: `POSTGRES_URL`
   - Copy the entire connection string
   - It looks like: `postgresql://user:pass@host:5432/dbname`

4. **Add to Environment Variables**
   - In Vercel project settings
   - Go to "Settings" → "Environment Variables"
   - Add: `DATABASE_URL` = (paste connection string)
   - Select: Production, Preview, Development
   - Click "Save"

**Cost:** £0/month (Hobby tier)

### Option B: Supabase (Alternative - More Features)

1. **Create Account**
   - Visit: https://supabase.com
   - Sign up (free)

2. **Create Project**
   - Click "New Project"
   - Name: "edpsych-connect"
   - Set a strong password
   - Region: Choose closest to you
   - Wait 2 minutes for setup

3. **Get Connection String**
   - Click "Settings" (gear icon)
   - Click "Database"
   - Find "Connection string" section
   - Copy "Connection pooling" string
   - Replace `[YOUR-PASSWORD]` with your actual password

4. **Add to Vercel**
   - In Vercel: Settings → Environment Variables
   - Add: `DATABASE_URL` = (paste connection string)

**Cost:** £0/month (Free tier: 500MB)

### Option C: Railway (Alternative - Simple)

1. **Create Account**
   - Visit: https://railway.app
   - Sign up with GitHub

2. **Create Project**
   - Click "New Project"
   - Click "Provision PostgreSQL"
   - Wait 30 seconds

3. **Get Connection String**
   - Click on the Postgres service
   - Click "Connect"
   - Copy "Postgres Connection URL"

4. **Add to Vercel**
   - Same as above options

**Cost:** £0/month (Free tier: $5 credit monthly)

---

## 🔐 Step 2: Set Up NextAuth (10 minutes)

### 1. Generate Secret Key

In your terminal:
```bash
# Generate a secure random secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output (it will look like: `a1b2c3d4e5f6...`)

### 2. Add to Vercel Environment Variables

Go to Vercel → Settings → Environment Variables:

| Variable | Value | Environments |
|----------|-------|--------------|
| `NEXTAUTH_URL` | `https://your-domain.vercel.app` | Production |
| `NEXTAUTH_URL` | `https://your-preview.vercel.app` | Preview |
| `NEXTAUTH_URL` | `http://localhost:3000` | Development |
| `NEXTAUTH_SECRET` | (paste generated secret) | All |

**Replace `your-domain.vercel.app` with your actual Vercel URL**

### 3. Configure OAuth Providers (Optional but Recommended)

#### Google OAuth:
1. Visit: https://console.cloud.google.com
2. Create new project: "EdPsych Connect"
3. Enable "Google+ API"
4. Create OAuth consent screen
5. Create credentials → OAuth 2.0 Client ID
6. Authorized redirect URI: `https://your-domain.vercel.app/api/auth/callback/google`
7. Copy Client ID and Secret

Add to Vercel:
- `GOOGLE_CLIENT_ID` = (your client ID)
- `GOOGLE_CLIENT_SECRET` = (your client secret)

---

## 💳 Step 3: Set Up Stripe (20 minutes)

### 1. Create Stripe Account
- Visit: https://stripe.com
- Sign up
- Complete business verification (can test without this)

### 2. Get API Keys
- Go to: https://dashboard.stripe.com/apikeys
- Copy "Publishable key" (starts with `pk_test_`)
- Reveal and copy "Secret key" (starts with `sk_test_`)

### 3. Set Up Webhook
1. Go to: https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://your-domain.vercel.app/api/webhooks/stripe`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy "Signing secret" (starts with `whsec_`)

### 4. Add to Vercel Environment Variables

| Variable | Value |
|----------|-------|
| `STRIPE_PUBLISHABLE_KEY` | pk_test_... |
| `STRIPE_SECRET_KEY` | sk_test_... |
| `STRIPE_WEBHOOK_SECRET` | whsec_... |

### 5. Create Products in Stripe
1. Go to: https://dashboard.stripe.com/products
2. Create products for each tier:
   - **Professional**: £29.99/month
   - **Institutional**: £499.99/month per user
   - **Enterprise**: Custom

3. Copy each "Price ID" (starts with `price_`)
4. Update your code or add to env vars

---

## 📧 Step 4: Set Up Email Service (15 minutes)

### Option A: Resend (RECOMMENDED - Easiest)

1. **Create Account**
   - Visit: https://resend.com
   - Sign up (free)

2. **Get API Key**
   - Go to "API Keys"
   - Click "Create API Key"
   - Name: "EdPsych Production"
   - Copy the key (starts with `re_`)

3. **Verify Domain** (Optional but recommended)
   - Go to "Domains"
   - Add your domain
   - Add DNS records
   - Verify

4. **Add to Vercel**
   - `EMAIL_SERVER` = `smtp://resend:YOUR_API_KEY@smtp.resend.com:587`
   - `EMAIL_FROM` = `noreply@your-domain.com`

**Cost:** £0/month (Free tier: 100 emails/day)

### Option B: SendGrid (Alternative)

1. Create account at https://sendgrid.com
2. Create API key
3. Add to Vercel:
   - `SENDGRID_API_KEY` = (your key)
   - `EMAIL_FROM` = `noreply@your-domain.com`

**Cost:** £0/month (Free tier: 100 emails/day)

---

## 🔧 Step 5: Initialize Database (10 minutes)

### 1. Set Up Prisma

In your local project:

```bash
cd C:\Users\scott\Desktop\package

# Generate Prisma client
npx prisma generate

# Push schema to database (creates tables)
npx prisma db push

# Optional: Open Prisma Studio to view database
npx prisma studio
```

### 2. Seed Initial Data (Optional)

If you want demo data:

```bash
# Run seed script
npx prisma db seed
```

### 3. Verify Database Connection

```bash
# Test connection
npx prisma db pull
```

If successful, you'll see: "✓ Introspection completed"

---

## ☁️ Step 6: Deploy to Vercel (5 minutes)

### 1. Check Environment Variables

Go to Vercel → Your Project → Settings → Environment Variables

**Minimum Required:**
```
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-generated-secret
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
EMAIL_SERVER=smtp://...
EMAIL_FROM=noreply@your-domain.com
```

**Recommended Additional:**
```
GOOGLE_CLIENT_ID=your-google-id
GOOGLE_CLIENT_SECRET=your-google-secret
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NODE_ENV=production
```

### 2. Redeploy

```bash
# Trigger new deployment with env vars
git commit --allow-empty -m "chore: trigger deployment with env vars"
git push origin main
```

Or in Vercel Dashboard:
- Go to "Deployments"
- Click "Redeploy" on latest
- Check "Use existing build cache" = NO
- Click "Redeploy"

### 3. Wait for Deployment
- Watch deployment logs
- Should complete in 2-3 minutes
- Check for errors in logs

---

## ✅ Step 7: Verify Everything Works

### 1. Test Landing Page
- Visit: `https://your-domain.vercel.app`
- Should load ✅

### 2. Test Login
- Click "Login"
- Should show login form ✅
- Try signing up with email
- Check email for verification

### 3. Test Dashboard
- After login, go to `/admin`
- Should load admin dashboard ✅
- No errors in console

### 4. Test Database
- Create a test EHCP
- Should save to database ✅
- Reload page - data persists ✅

### 5. Test Subscriptions (If Stripe set up)
- Go to `/pricing`
- Click "Subscribe"
- Should redirect to Stripe checkout ✅

### 6. Check Error Logs
- Vercel Dashboard → Your Project → Logs
- Look for errors
- Fix any issues

---

## 🐛 Common Issues & Fixes

### Issue: "Database connection failed"
**Solution:**
1. Check `DATABASE_URL` is set in Vercel
2. Verify connection string format: `postgresql://user:pass@host:5432/dbname`
3. Make sure database exists and is accessible
4. Check firewall rules allow Vercel IPs

### Issue: "NextAuth configuration error"
**Solution:**
1. Verify `NEXTAUTH_URL` matches your actual URL
2. Check `NEXTAUTH_SECRET` is set
3. Ensure secret is at least 32 characters
4. Redeploy after setting

### Issue: "Stripe webhook failed"
**Solution:**
1. Check webhook URL matches exactly
2. Verify `STRIPE_WEBHOOK_SECRET` is correct
3. Test webhook in Stripe dashboard
4. Check logs for error details

### Issue: "Email not sending"
**Solution:**
1. Verify `EMAIL_SERVER` format is correct
2. Check `EMAIL_FROM` is verified domain
3. Test email API key in service dashboard
4. Check spam folder

### Issue: "Pages still not loading"
**Solution:**
1. Clear browser cache (Ctrl+Shift+R)
2. Check browser console for errors (F12)
3. Verify deployment completed successfully
4. Check Vercel function logs for errors
5. Try incognito mode

---

## 📝 Complete Environment Variables Checklist

Copy this to a file and fill in your values:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# NextAuth
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="your-32-character-secret"

# Stripe
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email
EMAIL_SERVER="smtp://resend:YOUR_API_KEY@smtp.resend.com:587"
EMAIL_FROM="noreply@your-domain.com"

# Optional: OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-secret"

# Optional: App Config
NEXT_PUBLIC_APP_URL="https://your-domain.vercel.app"
NODE_ENV="production"
```

---

## 🚀 Quick Start (Minimum to Get Running)

If you want to get running FAST (15 minutes):

### 1. Database (5 mins)
- Go to Vercel → Storage → Create Postgres
- Copy connection string
- Add as `DATABASE_URL` env var

### 2. Auth (5 mins)
- Generate secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Add `NEXTAUTH_SECRET` env var
- Add `NEXTAUTH_URL` env var with your domain

### 3. Initialize DB (3 mins)
```bash
npx prisma generate
npx prisma db push
```

### 4. Redeploy (2 mins)
```bash
git commit --allow-empty -m "feat: connect backend services"
git push origin main
```

### 5. Test
- Visit your site
- Try logging in
- Everything should work! ✅

---

## 💰 Monthly Costs Summary

### Free Tier (Good for Development)
- Vercel: £0 (Hobby tier)
- PostgreSQL: £0 (Vercel Postgres 256MB)
- Stripe: £0 (test mode)
- Email: £0 (100/day limit)
- **Total: £0/month**

### Production Ready
- Vercel: £20/month (Pro tier)
- PostgreSQL: £25/month (1GB, recommended)
- Stripe: 1.5% + 20p per transaction
- Email: £10/month (1000/day)
- **Total: ~£55/month + transaction fees**

### High Volume
- Vercel: £20-40/month
- PostgreSQL: £50-100/month (larger DB)
- Stripe: Same
- Email: £30/month (10,000/day)
- **Total: ~£100-170/month + transaction fees**

---

## 📞 Need Help?

### If Stuck:
1. Check Vercel deployment logs
2. Check browser console (F12)
3. Verify all env vars are set
4. Try clearing cache and redeploying
5. Check this guide step-by-step

### Getting Errors:
- Copy the full error message
- Check which service is failing
- Verify credentials for that service
- Test service independently

---

## ✅ Final Verification Checklist

Before considering setup complete:

- [ ] Landing page loads
- [ ] Login page loads
- [ ] Can create account
- [ ] Can log in
- [ ] Dashboard loads after login
- [ ] Can create EHCP
- [ ] Data persists after reload
- [ ] Subscriptions page works
- [ ] Admin dashboard accessible
- [ ] No console errors
- [ ] All environment variables set
- [ ] Database initialized
- [ ] Prisma client generated
- [ ] Stripe webhook configured
- [ ] Email service tested

---

**Once all checkboxes are complete, your platform is FULLY OPERATIONAL! 🎉**

---

*This guide covers everything needed to connect your platform to backend services and make it fully functional in production.*

*Generated with Claude Code - https://claude.com/claude-code*
