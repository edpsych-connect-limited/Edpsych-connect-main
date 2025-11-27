# Stripe Payment Testing Guide

This document outlines the Stripe test mode configuration and testing procedures for EdPsych Connect.

## Test Mode Configuration

EdPsych Connect uses Stripe **test mode** keys during beta testing. This ensures:
- No real payments are processed
- All transactions are sandboxed
- Full testing capability without financial risk

### Environment Variables

```env
# Test mode keys (safe to use in development and beta)
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

**⚠️ IMPORTANT:** Never use `sk_live_` keys in development or beta environments.

## Test Card Numbers

Use these test card numbers in the Stripe payment form:

### Successful Payments

| Card Number | Brand | CVC | Expiry | Description |
|-------------|-------|-----|--------|-------------|
| `4242 4242 4242 4242` | Visa | Any 3 digits | Any future date | Successful payment |
| `5555 5555 5555 4444` | Mastercard | Any 3 digits | Any future date | Successful payment |
| `3782 822463 10005` | American Express | Any 4 digits | Any future date | Successful payment |
| `4000 0582 6000 0005` | Visa | Any 3 digits | Any future date | Visa (debit) |

### Payment Declined

| Card Number | Brand | Description |
|-------------|-------|-------------|
| `4000 0000 0000 0002` | Visa | Card declined |
| `4000 0000 0000 9995` | Visa | Insufficient funds |
| `4000 0000 0000 0069` | Visa | Expired card |
| `4000 0000 0000 0127` | Visa | Incorrect CVC |
| `4000 0000 0000 0119` | Visa | Processing error |

### 3D Secure Testing

| Card Number | Description |
|-------------|-------------|
| `4000 0025 0000 3155` | Requires 3D Secure authentication (always succeeds) |
| `4000 0000 0000 3220` | 3D Secure 2 - authentication required |
| `4000 0000 0000 3063` | 3D Secure 2 - fails authentication |

## Testing Workflows

### 1. Subscription Setup

1. Navigate to `/pricing`
2. Select a subscription tier
3. Enter test card `4242 4242 4242 4242`
4. Use any future expiry date
5. Use any 3-digit CVC
6. Complete checkout

**Expected Result:** Subscription created successfully, user upgraded to selected tier.

### 2. Payment Failure

1. Navigate to `/pricing`
2. Select a subscription tier
3. Enter test card `4000 0000 0000 0002`
4. Attempt checkout

**Expected Result:** Payment declined message displayed, user not charged.

### 3. Webhook Testing

Test webhooks using Stripe CLI:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Trigger test events
stripe trigger payment_intent.succeeded
stripe trigger customer.subscription.created
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted
stripe trigger invoice.payment_succeeded
stripe trigger invoice.payment_failed
```

## Webhook Events

EdPsych Connect handles these webhook events:

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Create/update subscription |
| `customer.subscription.created` | Activate subscription |
| `customer.subscription.updated` | Update subscription tier |
| `customer.subscription.deleted` | Downgrade to free tier |
| `invoice.payment_succeeded` | Record payment |
| `invoice.payment_failed` | Notify user, grace period |

## Subscription Tiers

| Tier | Price (GBP) | Features |
|------|-------------|----------|
| Free | £0/month | Basic access, limited assessments |
| Starter | £19/month | Full assessments, basic AI |
| Professional | £49/month | All features, advanced AI |
| Enterprise | Custom | Multi-tenant, dedicated support |

## Testing Checklist

### Pre-Release Testing

- [ ] Test successful payment with `4242 4242 4242 4242`
- [ ] Test declined payment with `4000 0000 0000 0002`
- [ ] Test 3D Secure with `4000 0025 0000 3155`
- [ ] Verify subscription created in Stripe Dashboard
- [ ] Verify user tier updated in database
- [ ] Test subscription cancellation
- [ ] Test tier upgrade
- [ ] Test tier downgrade
- [ ] Verify webhook delivery in Stripe Dashboard
- [ ] Test invoice email delivery

### Webhook Testing

- [ ] `checkout.session.completed` - creates subscription
- [ ] `customer.subscription.updated` - updates tier
- [ ] `customer.subscription.deleted` - removes access
- [ ] `invoice.payment_failed` - sends notification

## Stripe Dashboard

Access the Stripe test dashboard at:
[https://dashboard.stripe.com/test/dashboard](https://dashboard.stripe.com/test/dashboard)

View test transactions, subscriptions, and webhook logs.

## Moving to Production

When ready for production:

1. **Never** commit live keys to git
2. Update Vercel environment variables with live keys
3. Update webhook endpoint to production URL
4. Configure webhook signing secret
5. Test with small real transaction
6. Monitor for errors in Sentry

## Support

For payment issues during beta:
- Email: help@edpsychconnect.com
- Use feedback widget in app
- Report to beta testing channel

---

*Last updated: November 2025*
