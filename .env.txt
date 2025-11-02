# ==============================================================================
# EDPSYCH CONNECT WORLD - PRODUCTION ENVIRONMENT CONFIGURATION
# ==============================================================================
# Location: C:\Users\scott\Desktop\package\.env
# Last Updated: October 31, 2025
# Status: READY FOR DEPLOYMENT
# ==============================================================================

# ------------------------------------------------------------------------------
# DATABASE CONNECTIONS (Railway)
# ------------------------------------------------------------------------------

# PostgreSQL (Primary Database)
DATABASE_URL="postgresql://postgres:LIeFibdBmBEVtrOaAkmUMbFzTbmLLAPy@postgres.railway.internal:5432/railway"

# MongoDB (Document Storage)
MONGODB_URI="mongodb://mongo:WyFZWpMXUKdycSTkQrIvOJgROYtclotG@mongodb.railway.internal:27017"

# Redis (Caching & Sessions)
REDIS_URL="redis://default:wEvdnwhivvZnLWCJORmlvMDTfnhgntWG@redis-pgdr.railway.internal:6379"

# Neo4j (Graph Database - for future relationship mapping)
NEO4J_URI="neo4j+s://20c03c25.databases.neo4j.io"
NEO4J_PASSWORD="C1BF40ISMj-HB6Y9hnnhqnSpkBUNdp4HG_CVo1J1XHM"

# ------------------------------------------------------------------------------
# AI API KEYS
# ------------------------------------------------------------------------------

# Claude API (Anthropic)
CLAUDE_API_KEY="sk-ant-api03-JS8w5KUn4KfQqQm0IEXXuL_HkJRMIrTqF4OOv_zQPHmBTDTHDjDw3SgWxn0SdE46yQ-wEyAAAAB_QrCuAA"

# OpenAI API
OPENAI_API_KEY="sk-Qz8Wm5Lp9TnXvJyHrEcFbA3Dk7Gt6UiVoSbPq2OwZ1YcX4"

# Legacy environment variable (for compatibility)
ANTHROPIC_API_KEY="sk-ant-api03-JS8w5KUn4KfQqQm0IEXXuL_HkJRMIrTqF4OOv_zQPHmBTDTHDjDw3SgWxn0SdE46yQ-wEyAAAAB_QrCuAA"

# ------------------------------------------------------------------------------
# NEXT.JS CONFIGURATION
# ------------------------------------------------------------------------------

# Application Environment
NODE_ENV="production"
NEXT_PUBLIC_APP_ENV="production"

# Application URLs
NEXT_PUBLIC_APP_URL="https://edpsych-connect-limited.vercel.app"
NEXTAUTH_URL="https://edpsych-connect-limited.vercel.app"

# NextAuth Secret (Generate new for production!)
# Run: openssl rand -base64 32
NEXTAUTH_SECRET="K7mP9nQ2tR5vX8zA3bC6dE1fH4jL0wY"

# ------------------------------------------------------------------------------
# STRIPE PAYMENT CONFIGURATION
# ------------------------------------------------------------------------------

# Stripe Keys (Test Mode - Replace with Live when ready)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_51R5bbqBz14LFoqP29ItewuPByklBLdTHLPasfhnZVXD1fV2wncGKmDd7YJ3OfX4GEvXFwwkXLsW9VxY5tPFXGOPc00wsj8yerh"
STRIPE_SECRET_KEY="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"
# Stripe Webhook Secret (Configure in Stripe Dashboard)
STRIPE_WEBHOOK_SECRET="whsec_HPnizmObI5oaQvOW05iY4w2yEWWB66Ph"

# ------------------------------------------------------------------------------
# EMAIL CONFIGURATION (Optional - Add when ready)
# ------------------------------------------------------------------------------

# SendGrid (Recommended)
# SENDGRID_API_KEY="SG.edpsych-connect-sendgrid-key-5f4e3d2c1b0a"
# SENDGRID_FROM_EMAIL="noreply@edpsychconnect.com"



# ------------------------------------------------------------------------------
# MONITORING & LOGGING
# ------------------------------------------------------------------------------

# Sentry (Error Monitoring)
NEXT_PUBLIC_SENTRY_DSN="https://1739f1ab3c214b6600646650f89e2643@o4509879738826752.ingest.de.sentry.io/4509879781883984"
SENTRY_AUTH_TOKEN="https://1739f1ab3c214b6600646650f89e2643@o4509879738826752.ingest.de.sentry.io/4509879781883984"

# Vercel Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID="auto"

# ------------------------------------------------------------------------------
# SECURITY & COMPLIANCE
# ------------------------------------------------------------------------------

# GDPR Compliance
ENABLE_GDPR_MODE="true"
DATA_RETENTION_DAYS="2555"  # 7 years for UK education records

# Session Configuration
SESSION_MAX_AGE="2592000"  # 30 days
SESSION_UPDATE_AGE="86400"  # 1 day

# ------------------------------------------------------------------------------
# FEATURE FLAGS
# ------------------------------------------------------------------------------

# Beta Features
ENABLE_BETA_FEATURES="true"
ENABLE_BATTLE_ROYALE="true"
ENABLE_AI_FEATURES="true"
ENABLE_RESEARCH_PORTAL="true"

# Development Features
ENABLE_DEBUG_MODE="false"
ENABLE_PERFORMANCE_MONITORING="true"

# ------------------------------------------------------------------------------
# RATE LIMITING & SECURITY
# ------------------------------------------------------------------------------

# API Rate Limits
API_RATE_LIMIT_MAX="100"
API_RATE_LIMIT_WINDOW="900000"  # 15 minutes in ms

# Security Headers
ENABLE_SECURITY_HEADERS="true"
ENABLE_CORS="false"

# ------------------------------------------------------------------------------
# CLOUDFLARE CONFIGURATION (If using)
# ------------------------------------------------------------------------------

# CLOUDFLARE_ACCOUNT_ID="your_account_id"
# CLOUDFLARE_API_TOKEN="your_api_token"

# ------------------------------------------------------------------------------
# MISCELLANEOUS
# ------------------------------------------------------------------------------

# Time Zone
TZ="Europe/London"

# Logging Level
LOG_LEVEL="info"

# Enable Source Maps in Production (for debugging)
GENERATE_SOURCEMAP="false"

# ==============================================================================
# END OF CONFIGURATION
# ==============================================================================