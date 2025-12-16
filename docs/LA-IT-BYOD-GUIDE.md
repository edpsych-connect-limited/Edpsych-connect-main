# 🛡️ Local Authority IT Guide: Data Sovereignty & BYOD Setup

**Version:** 1.0.0  
**Date:** November 23, 2025  
**Audience:** LA IT Directors, Network Administrators, Data Protection Officers (DPOs)

---

## 1. Executive Summary

EdPsych Connect offers a **Hybrid Cloud Architecture** designed for UK Local Authorities.

Where a Local Authority requires stronger control over *data at rest*, we can support an architecture where the LA provisions and owns the database.

**Note:** This document describes the *target enterprise architecture* and the operational controls expected in an LA deployment. Exact capabilities depend on the deployed configuration and contract.

We support a **"Bring Your Own Database" (BYOD)** model in enterprise deployments, where the application connects to a PostgreSQL instance hosted within your infrastructure (or your private cloud), reducing exposure to shared multi-tenant storage.

---

## 2. Architecture Overview

### Standard SaaS (Default)
- **App Logic**: AWS London (eu-west-2)
- **Database**: AWS RDS (Encrypted at rest)
- **Data Residency**: UK Only

### Enterprise Hybrid (BYOD)
- **App Logic**: AWS London (eu-west-2)
- **Database**: **Your Private Infrastructure** (On-Premise or Private Cloud)
- **Connection**: Secure private connectivity (e.g., VPN/PrivateLink/peering) and TLS-in-transit

In a BYOD deployment, the Local Authority controls the database where student records are stored at rest.

**Important clarification:** The application may still process personal data in memory to provide features, and operational logs/telemetry may exist depending on configuration. "No PII is persisted" is only true if the deployment is explicitly configured to avoid writing PII to any EdPsych Connect-managed storage (including logs). This must be validated as part of onboarding.

---

## 3. Technical Requirements

To implement the BYOD model, your IT team must provision the following:

### 3.1 Database Specification
- **Engine**: PostgreSQL 15.x or higher
- **Extensions Required**: `pgvector` (for AI search), `uuid-ossp`
- **Storage**: Minimum 100GB SSD recommended
- **RAM**: Minimum 16GB recommended

### 3.2 Network Configuration
- **Inbound Allow**: Port 5432 (PostgreSQL) from EdPsych Connect Static IPs (List provided upon contract signing)
- **Encryption**: TLS-in-transit is required. (TLS version/cipher policy is agreed during onboarding.)

### 3.3 Authentication
- **SSO:** SSO integration (SAML/OIDC) is available in enterprise deployments where configured.
- Compatibility depends on the chosen IdP and the final integration approach.

---

## 4. Implementation Steps

### Step 1: Provisioning
1. Spin up the PostgreSQL instance.
2. Create a dedicated user `edpsych_app` with `CREATEDB` permissions (for initial schema migration).
3. Whitelist our IP range in your firewall.

### Step 2: Connection Handshake
1. Provide the connection string to your Dedicated Success Manager:
   `postgres://edpsych_app:PASSWORD@your-gateway.gov.uk:5432/edpsych_db?sslmode=verify-full`
2. We will run a connectivity test script.

### Step 3: Schema Migration
1. Our deployment pipeline will push the Prisma Schema to your database.
2. **Note**: You have full read access to this schema and can audit it at any time.

### Step 4: Data Migration (If applicable)
1. If migrating from an existing system, we provide CSV import tools mapped to the new schema.

---

## 5. Security & Compliance

### 5.1 Encryption
- **Transit**: TLS-in-transit is required.
- **Rest**: Data is encrypted on your disks using your keys.

### 5.2 Access Control
- **Just-in-Time Access**: Our support staff have NO access to your database unless you explicitly grant a temporary session for troubleshooting.
- **Audit Logs**: All queries executed by the application are logged. You can configure your Postgres instance to log all queries for your own audit trail.

### 5.3 AI Processing
- When using AI features (e.g., Report Drafting), data is sent to the LLM provider (Azure OpenAI UK South) **statelessly**.
- **Zero Retention**: We have a BAA (Business Associate Agreement) ensuring no data is used for model training.

---

## 6. Maintenance & Updates

- **Schema Updates**: Handled automatically by our migration engine during maintenance windows (typically Sunday 2 AM - 4 AM GMT).
- **Backups**: **You are responsible for database backups.** We recommend Point-in-Time Recovery (PITR) retention of 30 days.

---

## 7. Support

For technical assistance during setup:
- **Email**: enterprise-support@edpsychconnect.world
- **Emergency Phone**: +44 (0) 20 7123 4567 (24/7 for Enterprise)
