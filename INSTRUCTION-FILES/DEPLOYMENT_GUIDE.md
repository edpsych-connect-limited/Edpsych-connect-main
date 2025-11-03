# EdPsych Connect World - Deployment & Launch Guide

**Production Deployment Checklist and Procedures**

---

## Pre-Deployment Checklist

### 1. Code Quality ✅
- [x] All TypeScript errors resolved
- [x] No console errors in production build
- [x] All tests passing
- [x] Code review completed
- [x] No TODO comments without owner/date

### 2. Environment Configuration
- [ ] All environment variables configured in Vercel
- [ ] Database connection string (production)
- [ ] JWT secrets generated
- [ ] Stripe keys (production)
- [ ] SendGrid API key
- [ ] NEXTAUTH_URL set to production domain
- [ ] NEXTAUTH_SECRET generated (random 32+ chars)

### 3. Database
- [ ] Production database created (PostgreSQL)
- [ ] All migrations run
- [ ] Seed scripts executed:
  - [ ] Admin user
  - [ ] Help center content
  - [ ] Blog content
  - [ ] ECCA framework
  - [ ] Interventions library
- [ ] Database backups configured
- [ ] Connection pooling configured

### 4. Third-Party Services
- [ ] Stripe account verified
- [ ] Products created in Stripe
- [ ] Webhooks configured in Stripe
- [ ] SendGrid account verified
- [ ] Email templates configured
- [ ] Domain verified for email sending
- [ ] Vercel account configured
- [ ] Custom domain added to Vercel

### 5. Security
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Encryption keys generated
- [ ] Secrets stored securely (not in code)
- [ ] No sensitive data in logs

### 6. Compliance
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] GDPR compliance verified
- [ ] Cookie policy (if using analytics)
- [ ] Data retention policies documented

---

## Environment Variables

### Required Variables

Create `.env.production` (DO NOT commit to git):

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/edpsych_production?schema=public"

# NextAuth
NEXTAUTH_URL="https://edpsychconnect.world"
NEXTAUTH_SECRET="[GENERATE: openssl rand -base64 32]"

# JWT
JWT_SECRET="[GENERATE: openssl rand -base64 32]"
JWT_REFRESH_SECRET="[GENERATE: openssl rand -base64 32]"

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_ID_FREE="price_..."
STRIPE_PRICE_ID_PROFESSIONAL="price_..."
STRIPE_PRICE_ID_INSTITUTIONAL="price_..."

# Email (SendGrid)
SENDGRID_API_KEY="SG...."
EMAIL_FROM="noreply@edpsychconnect.world"
SUPPORT_EMAIL="support@edpsychconnect.world"

# Encryption
ENCRYPTION_KEY="[GENERATE: openssl rand -hex 32]"
ENCRYPTION_IV_LENGTH="16"

# URLs
NEXT_PUBLIC_APP_URL="https://edpsychconnect.world"
NEXT_PUBLIC_API_URL="https://edpsychconnect.world/api"

# Feature Flags
ENABLE_ANALYTICS="true"
ENABLE_ERROR_TRACKING="true"

# Optional: Analytics
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"
SENTRY_DSN="https://..."
```

---

## Vercel Deployment

### Initial Setup

1. **Install Vercel CLI:**
```bash
npm i -g vercel
```

2. **Login to Vercel:**
```bash
vercel login
```

3. **Link Project:**
```bash
vercel link
```

### Configure Environment Variables in Vercel

```bash
# Database
vercel env add DATABASE_URL production
# Paste value when prompted

# NextAuth
vercel env add NEXTAUTH_URL production
vercel env add NEXTAUTH_SECRET production

# JWT
vercel env add JWT_SECRET production
vercel env add JWT_REFRESH_SECRET production

# Stripe
vercel env add STRIPE_SECRET_KEY production
vercel env add STRIPE_PUBLISHABLE_KEY production
vercel env add STRIPE_WEBHOOK_SECRET production

# Email
vercel env add SENDGRID_API_KEY production
vercel env add EMAIL_FROM production

# Encryption
vercel env add ENCRYPTION_KEY production
```

### Deploy to Production

```bash
# Build and test locally first
npm run build
npm start

# If build succeeds, deploy to production
vercel --prod
```

### Automatic Deployments

Configure in Vercel dashboard:
- **Production Branch:** `main`
- **Deploy on push:** Yes
- **Automatically deploy:** Yes
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

---

## Database Setup

### 1. Create Production Database

**Recommended:** Vercel Postgres or Supabase

#### Option A: Vercel Postgres
```bash
# In Vercel dashboard
1. Go to Storage tab
2. Click "Create Database"
3. Select "Postgres"
4. Choose region (closest to users)
5. Copy DATABASE_URL
```

#### Option B: Supabase
```bash
1. Go to https://supabase.com
2. Create new project
3. Go to Settings > Database
4. Copy connection string
5. Replace password placeholder
```

### 2. Run Migrations

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Or run migrations
npx prisma migrate deploy
```

### 3. Seed Database

```bash
# Seed admin user
npx tsx prisma/seed-admin.ts

# Seed help center
npx tsx prisma/seed-help-center.ts

# Seed blog
npx tsx prisma/seed-blog.ts
```

### 4. Configure Backups

**Vercel Postgres:**
- Automatic daily backups included
- Retention: 7 days

**Supabase:**
- Automatic daily backups
- Point-in-time recovery available

**Manual Backup Script:**
```bash
# backup-database.sh
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > backups/backup_$DATE.sql
echo "Backup created: backup_$DATE.sql"
```

---

## Stripe Configuration

### 1. Create Products

In Stripe Dashboard (https://dashboard.stripe.com):

**Free Tier:**
- Name: "EdPsych Connect - Free"
- Price: £0.00
- Billing: N/A

**Professional Tier:**
- Name: "EdPsych Connect - Professional"
- Price: £29.00
- Billing: Monthly
- Metadata:
  - `tier`: `professional`
  - `assessments`: `unlimited`
  - `interventions`: `full`

**Institutional Tier:**
- Name: "EdPsych Connect - Institutional"
- Price: Custom
- Billing: Annual
- Contact Sales: Yes

### 2. Configure Webhooks

Add webhook endpoint in Stripe:

**URL:** `https://edpsychconnect.world/api/webhooks/stripe`

**Events to listen for:**
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`

**Copy webhook signing secret** and add to environment variables.

### 3. Test Webhooks

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Test with test event
stripe trigger customer.subscription.created
```

---

## Email Configuration

### SendGrid Setup

1. **Create SendGrid Account:**
   - Go to https://sendgrid.com
   - Sign up (free tier: 100 emails/day)

2. **Verify Domain:**
   - Go to Settings > Sender Authentication
   - Verify your domain (edpsychconnect.world)
   - Add DNS records as instructed

3. **Create API Key:**
   - Go to Settings > API Keys
   - Create key with "Full Access"
   - Copy and save (shown once only)

4. **Create Email Templates:**

**Welcome Email:**
```html
<h1>Welcome to EdPsych Connect World!</h1>
<p>Hi {{name}},</p>
<p>Thank you for joining EdPsych Connect World...</p>
```

**Collaboration Invitation:**
```html
<h1>You've been invited to contribute</h1>
<p>Hi {{contributor_name}},</p>
<p>{{ep_name}} has invited you to contribute...</p>
<a href="{{invitation_url}}">Complete Your Input</a>
```

### Test Email Sending

```bash
# Test script
node -e "
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
  to: 'test@example.com',
  from: 'noreply@edpsychconnect.world',
  subject: 'Test Email',
  text: 'Test email content',
};

sgMail.send(msg)
  .then(() => console.log('Email sent'))
  .catch(error => console.error(error));
"
```

---

## Domain Configuration

### 1. Purchase Domain

- Register `edpsychconnect.world` (or .com, .co.uk)
- Recommended registrars: Namecheap, Google Domains, Cloudflare

### 2. Configure DNS

Add these DNS records:

**A Record:**
```
Type: A
Name: @
Value: 76.76.21.21 (Vercel IP)
TTL: Auto
```

**CNAME Record:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: Auto
```

**Email Records (for SendGrid):**
```
Type: CNAME
Name: em1234
Value: sendgrid.net
```

### 3. Add Domain to Vercel

1. Go to Vercel project settings
2. Go to Domains tab
3. Add `edpsychconnect.world`
4. Add `www.edpsychconnect.world`
5. Wait for DNS propagation (up to 48 hours)

### 4. SSL Certificate

- Vercel automatically provisions SSL certificate
- Usually within minutes
- Free (Let's Encrypt)
- Auto-renewal

---

## Security Configuration

### Security Headers

Configure in `next.config.js`:

```javascript
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

### Rate Limiting

Already implemented in code:
- Auth endpoints: 5 attempts per 15 minutes
- API endpoints: 100 requests per minute
- Write endpoints: 30 requests per minute

### HTTPS Redirect

Configure in Vercel:
- Settings > Domains
- Enable "Force HTTPS"

---

## Monitoring & Analytics

### 1. Vercel Analytics

Enable in Vercel dashboard:
- Go to Analytics tab
- Enable Web Analytics
- Add snippet to pages (automatically done in Next.js)

### 2. Error Tracking (Sentry)

```bash
# Install Sentry
npm install @sentry/nextjs

# Initialize
npx @sentry/wizard -i nextjs

# Configure in sentry.server.config.js
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: 'production',
});
```

### 3. Database Monitoring

**Prisma Insights:**
```bash
# Enable query logging
// In prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["metrics"]
}
```

### 4. Uptime Monitoring

**Options:**
- UptimeRobot (free, checks every 5 minutes)
- Pingdom
- StatusCake

Configure alerts for:
- Website down
- Response time > 3s
- SSL certificate expiring

---

## Launch Checklist

### Pre-Launch (1 Week Before)

#### Technical
- [ ] All code merged to main branch
- [ ] Production build successful
- [ ] All environment variables configured
- [ ] Database seeded with production data
- [ ] All integrations tested (Stripe, SendGrid)
- [ ] SSL certificate active
- [ ] Custom domain configured
- [ ] Backup system tested

#### Content
- [ ] All help articles published
- [ ] All blog posts published
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] Contact information updated
- [ ] About page completed

#### Testing
- [ ] Complete QA testing done
- [ ] All critical workflows tested
- [ ] Accessibility audit passed
- [ ] Security audit passed
- [ ] Performance optimization done
- [ ] Mobile testing completed
- [ ] Cross-browser testing done

### Launch Day

#### Morning (Before Announcement)
- [ ] Final production deployment
- [ ] Verify all features working
- [ ] Test payment flow
- [ ] Test email sending
- [ ] Check error logs (should be empty)
- [ ] Performance check (Lighthouse scores)
- [ ] Monitoring dashboards ready

#### Announcement
- [ ] Blog post published announcing launch
- [ ] Email sent to waiting list
- [ ] Social media posts scheduled
- [ ] Press release (if applicable)
- [ ] Update website with "Live" status

#### Afternoon (Monitoring)
- [ ] Monitor error rates
- [ ] Check sign-up flow
- [ ] Monitor server load
- [ ] Respond to support requests
- [ ] Check payment processing
- [ ] Monitor analytics

### Post-Launch (First Week)

#### Daily Tasks
- [ ] Check error logs
- [ ] Monitor sign-ups
- [ ] Respond to support emails
- [ ] Track user feedback
- [ ] Monitor performance metrics
- [ ] Check payment processing

#### Weekly Review
- [ ] Analyze usage patterns
- [ ] Review user feedback
- [ ] Prioritize bug fixes
- [ ] Plan feature improvements
- [ ] Review performance metrics
- [ ] Update documentation as needed

---

## Rollback Procedure

If critical issues occur:

### 1. Immediate Rollback
```bash
# In Vercel dashboard:
1. Go to Deployments
2. Find previous stable deployment
3. Click "..." menu
4. Click "Promote to Production"
5. Confirm

# Or via CLI:
vercel rollback
```

### 2. Investigate Issue
- Check error logs in Vercel
- Check Sentry for errors
- Review recent code changes
- Test locally with production environment variables

### 3. Fix and Re-deploy
- Fix issue in code
- Test thoroughly
- Deploy to staging first
- If stable, deploy to production

---

## Backup & Recovery

### Database Backups

**Automated (Daily):**
- Vercel Postgres: Automatic daily backups (7-day retention)
- Supabase: Automatic daily backups (7-day retention)

**Manual Backup:**
```bash
# Full database dump
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore from backup
psql $DATABASE_URL < backup_20251103.sql
```

**Backup Schedule:**
- Daily: Automated by hosting provider
- Weekly: Manual full backup to external storage
- Monthly: Archived backup kept for 1 year

### Code Backups

- Git repository (primary backup)
- GitHub (remote backup)
- Local clone on development machine

---

## Scaling Considerations

### When to Scale

Monitor these metrics:
- Response time > 500ms (p95)
- Database connections > 80% of limit
- Memory usage > 80%
- CPU usage > 70%

### Vertical Scaling (Increase Resources)

**Vercel:**
- Pro plan: $20/month (more bandwidth)
- Enterprise: Custom (dedicated resources)

**Database:**
- Upgrade to larger instance
- More connections
- More storage

### Horizontal Scaling

**Vercel handles automatically:**
- Serverless functions scale automatically
- Edge functions replicate globally
- CDN for static assets

**Database:**
- Read replicas for read-heavy operations
- Connection pooling (PgBouncer)
- Caching layer (Redis)

---

## Maintenance Windows

### Planned Maintenance

Schedule for low-traffic times:
- Sunday 2-4 AM GMT (lowest traffic)
- Announce 48 hours in advance
- Show maintenance page during downtime

**Maintenance Page:**
```html
<!-- public/maintenance.html -->
<!DOCTYPE html>
<html>
<head>
  <title>Scheduled Maintenance</title>
</head>
<body>
  <h1>We'll be right back!</h1>
  <p>EdPsych Connect World is undergoing scheduled maintenance.</p>
  <p>We'll be back online by 4:00 AM GMT.</p>
</body>
</html>
```

Enable in Vercel:
```bash
# In vercel.json
{
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/maintenance.html",
      "status": 503
    }
  ]
}
```

---

## Support & Incident Response

### Support Channels

**Email:** support@edpsychconnect.world
- Response time: 24 hours (weekdays)
- Critical issues: 4 hours

**Live Chat:** (if implemented)
- Availability: Mon-Fri 9am-5pm GMT

**Status Page:** status.edpsychconnect.world
- Real-time system status
- Incident history
- Scheduled maintenance

### Incident Response

**Severity Levels:**

**Critical (P0):**
- Site completely down
- Data loss
- Security breach
- **Response:** Immediate (< 15 min)

**High (P1):**
- Major feature broken
- Payment processing failing
- **Response:** 1 hour

**Medium (P2):**
- Minor feature issues
- Visual bugs
- **Response:** 4 hours

**Low (P3):**
- Feature requests
- Documentation updates
- **Response:** 24-48 hours

---

## Launch Announcement Template

### Blog Post

```markdown
# EdPsych Connect World is Live!

We're thrilled to announce that EdPsych Connect World is officially live and ready to transform educational psychology practice across the UK.

## What's Included

✅ **ECCA Framework** - Dynamic cognitive assessment
✅ **45+ Evidence-Based Interventions** - With effect sizes and implementation guides
✅ **EHCP Management** - Streamlined creation and annual reviews
✅ **Multi-Informant Input** - Secure collaboration with parents and teachers
✅ **Professional Reports** - LA-compliant PDF generation
✅ **CPD Courses** - BPS-approved training
✅ **Comprehensive Help Center** - Video tutorials and guides

## Get Started

1. Sign up at https://edpsychconnect.world
2. Complete the 5-minute onboarding
3. Create your first assessment
4. Explore the interventions library

## Special Launch Offer

Sign up in the first month and get:
- 30-day free trial of Professional tier
- Free ECCA Assessment Training course (£299 value)
- Lifetime 20% discount on annual plans

[Start Your Free Trial →](https://edpsychconnect.world/signup)

## Built by EPs, for EPs

EdPsych Connect World was created by Dr. Scott Ighavongbe-Patrick, an experienced educational psychologist who understands the challenges you face every day. Every feature is designed to save you time while improving outcomes for children.

Thank you for joining us on this journey to transform educational psychology practice!

---

Questions? Contact: support@edpsychconnect.world
```

---

## Post-Launch Roadmap

### Month 1
- Monitor stability and performance
- Fix critical bugs
- Gather user feedback
- Create additional help articles

### Month 2-3
- Implement most-requested features
- Expand intervention library
- Add more CPD courses
- Mobile app (if planned)

### Month 4-6
- API for third-party integrations
- Advanced analytics dashboard
- School/LA admin portal
- Outcome tracking system

---

## Success Metrics

### Key Performance Indicators (KPIs)

**User Acquisition:**
- Target: 100 sign-ups in month 1
- Target: 500 sign-ups in month 3
- Target: 1,000 sign-ups in month 6

**User Engagement:**
- Target: 70% of users complete onboarding
- Target: 60% create first assessment
- Target: 40% become paying customers

**Platform Performance:**
- Target: 99.9% uptime
- Target: < 1s page load time (p95)
- Target: < 1% error rate

**Customer Satisfaction:**
- Target: NPS score > 50
- Target: 4.5+ star rating
- Target: < 24h support response time

---

## Conclusion

You're ready to launch! 🚀

**Final Checklist:**
- [x] Code complete and tested
- [x] Documentation comprehensive
- [x] Video tutorials scripted
- [ ] Production environment configured
- [ ] Launch announcement prepared
- [ ] Support processes established

**Remember:** Launch is just the beginning. Continuous improvement and user feedback will drive the platform's evolution.

**Good luck with the launch!**

---

**Document Version:** 1.0.0
**Last Updated:** November 3, 2025
**For Deployment Support:** dev@edpsychconnect.world
