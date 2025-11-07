# Research Foundation - Azure Deployment Plan

**Date**: 2025-11-04
**Platform**: EdPsych Connect World
**Purpose**: Deploy Research Foundation infrastructure using Microsoft Azure

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Azure Services Required](#azure-services-required)
3. [Cost Estimates](#cost-estimates)
4. [Implementation Phases](#implementation-phases)
5. [Security & Compliance](#security--compliance)
6. [Deployment Steps](#deployment-steps)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│               EdPsych Connect Platform (Vercel)             │
│                    Next.js 14 App Router                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│            AZURE RESEARCH FOUNDATION SERVICES               │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Azure Blob Storage (Data Lake)                     │  │
│  │  • Bronze Container: Raw anonymized data            │  │
│  │  • Silver Container: Cleansed data                  │  │
│  │  • Gold Container: Aggregated insights              │  │
│  │  • Lifecycle Management: Auto-archive after 1 year  │  │
│  │  • Cost: ~£20-50/month for 100GB-1TB                │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Azure Data Factory                                 │  │
│  │  • ETL pipelines: Platform → Bronze → Silver → Gold│  │
│  │  • Scheduled anonymization jobs                     │  │
│  │  • Data quality validation                          │  │
│  │  • Cost: ~£5-15/month (consumption-based)           │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Azure Databricks (Optional - Advanced Analytics)  │  │
│  │  • Large-scale data processing                      │  │
│  │  • ML model training                                │  │
│  │  • Statistical analysis                             │  │
│  │  • Cost: ~£100-500/month (if used)                  │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Azure Functions                                    │  │
│  │  • Anonymization service                            │  │
│  │  • Export service (CSV/JSON/SPSS/Stata)             │  │
│  │  • License validation                               │  │
│  │  • Cost: ~£5-10/month (consumption)                 │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Azure Key Vault                                    │  │
│  │  • API keys & secrets                               │  │
│  │  • Encryption keys                                  │  │
│  │  • License keys                                     │  │
│  │  • Cost: ~£2-5/month                                │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Azure Monitor + Application Insights               │  │
│  │  • Data access logging                              │  │
│  │  • API usage tracking                               │  │
│  │  • Security audit trails                            │  │
│  │  • Cost: ~£5-15/month                               │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Azure API Management                               │  │
│  │  • Research API gateway                             │  │
│  │  • Rate limiting per license tier                   │  │
│  │  • API documentation portal                         │  │
│  │  • Cost: ~£40-100/month (Developer tier)            │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Azure Services Required

### 1. **Azure Blob Storage** (CRITICAL - Phase 1)

**Purpose**: Data Lake medallion architecture (Bronze/Silver/Gold layers)

**Configuration**:
- **Storage Account**: General Purpose v2
- **Performance Tier**: Hot (for active research data)
- **Replication**: LRS (Locally Redundant) or GRS (Geo-Redundant for production)
- **Containers**:
  - `bronze-layer` - Raw anonymized data
  - `silver-layer` - Cleansed & validated data
  - `gold-layer` - Aggregated research insights
  - `exports` - Temporary storage for dataset exports

**Features to Enable**:
- ✅ Hierarchical namespace (for efficient data lake operations)
- ✅ Versioning (for data lineage tracking)
- ✅ Soft delete (30-day retention for recovery)
- ✅ Lifecycle management (auto-archive cold data)
- ✅ Encryption at rest (Microsoft-managed keys)

**Estimated Cost** (UK South region):
- 100GB: £2-3/month
- 1TB: £20-25/month
- 10TB: £200-250/month

**NPM Packages Required**:
```json
{
  "@azure/storage-blob": "^12.17.0",
  "@azure/identity": "^4.0.0"
}
```

---

### 2. **Azure Data Factory** (Phase 2)

**Purpose**: ETL pipelines for data anonymization and processing

**Pipelines to Create**:
1. **Platform-to-Bronze**: Extract data from PostgreSQL → Anonymize → Store in Bronze
2. **Bronze-to-Silver**: Validate & cleanse → Apply data quality checks → Store in Silver
3. **Silver-to-Gold**: Aggregate & analyze → Generate insights → Store in Gold
4. **Export Pipeline**: Generate CSV/JSON/SPSS/Stata exports on demand

**Triggers**:
- Daily: Platform → Bronze (01:00 UTC)
- Daily: Bronze → Silver (03:00 UTC)
- Weekly: Silver → Gold (Sunday 05:00 UTC)
- On-demand: Export requests

**Estimated Cost**:
- Pipeline runs: £0.001 per run
- Data movement: £0.10 per GB
- ~£5-15/month for typical usage

---

### 3. **Azure Functions** (Phase 1)

**Purpose**: Serverless compute for anonymization and API operations

**Functions to Create**:

1. **AnonymizeDataFunction** (HTTP Trigger)
   - Input: Raw student/assessment data
   - Process: Apply k-anonymity, differential privacy, suppression
   - Output: Anonymized records to Blob Storage

2. **ExportDatasetFunction** (HTTP Trigger)
   - Input: Dataset ID, format (CSV/JSON/SPSS/Stata), license verification
   - Process: Query data lake, format data, apply license filters
   - Output: Signed URL to download export

3. **LicenseValidationFunction** (HTTP Trigger)
   - Input: License key, requested resource
   - Process: Verify license tier, check quotas, log access
   - Output: Access token or denial

4. **DataAccessLogFunction** (Blob Trigger)
   - Input: New data access event
   - Process: Log to Application Insights, check for anomalies
   - Output: Audit trail entry

**Runtime**: Node.js 18 LTS

**Estimated Cost**:
- First 1M executions/month: FREE
- Additional executions: £0.17 per 1M
- ~£5-10/month with moderate usage

**NPM Packages Required**:
```json
{
  "@azure/functions": "^4.0.0"
}
```

---

### 4. **Azure Key Vault** (Phase 1)

**Purpose**: Secure secrets, keys, and certificates management

**Secrets to Store**:
- `AZURE-STORAGE-CONNECTION-STRING`
- `RESEARCH-API-SECRET-KEY`
- `DATABASE-ENCRYPTION-KEY`
- `LICENSE-SIGNING-KEY`
- `NHS-DIGITAL-API-KEY` (when implemented)
- `STRIPE-RESEARCH-LICENSE-KEY`

**Features**:
- ✅ Soft delete (90-day recovery)
- ✅ Purge protection
- ✅ RBAC for access control
- ✅ Audit logging

**Estimated Cost**:
- Secrets: £0.03 per 10,000 operations
- ~£2-5/month

**NPM Packages Required**:
```json
{
  "@azure/keyvault-secrets": "^4.7.0"
}
```

---

### 5. **Azure Monitor + Application Insights** (Phase 2)

**Purpose**: Comprehensive logging, monitoring, and alerting

**What to Monitor**:
- Data access patterns (who, what, when)
- API usage by license tier
- Anonymization pipeline success/failure
- Storage costs & trends
- Security incidents
- License quota violations

**Alerts to Configure**:
- Unusual data access patterns
- Failed anonymization jobs
- Storage quota approaching limit
- API rate limit violations
- License expiration warnings

**Estimated Cost**:
- First 5GB/month: FREE
- Additional data: £1.84 per GB
- ~£5-15/month for typical usage

---

### 6. **Azure API Management** (Phase 3 - Optional)

**Purpose**: Enterprise API gateway for research platform

**Features**:
- Unified API portal for researchers
- Rate limiting per license tier (1K-1M requests/day)
- API versioning
- Developer portal with documentation
- OAuth 2.0 authentication
- Request/response transformation

**Pricing Tiers**:
- **Developer**: £40/month (good for testing)
- **Basic**: £120/month (production-ready)
- **Standard**: £550/month (high-volume)

**Alternative**: Can implement rate limiting in Next.js API routes initially to save costs.

---

## Cost Estimates

### Phase 1: Core Infrastructure (MVP)

| Service | Monthly Cost | Annual Cost |
|---------|--------------|-------------|
| Azure Blob Storage (1TB) | £25 | £300 |
| Azure Functions | £10 | £120 |
| Azure Key Vault | £5 | £60 |
| **TOTAL** | **£40** | **£480** |

### Phase 2: Production-Ready

| Service | Monthly Cost | Annual Cost |
|---------|--------------|-------------|
| Azure Blob Storage (5TB) | £100 | £1,200 |
| Azure Data Factory | £15 | £180 |
| Azure Functions | £15 | £180 |
| Azure Key Vault | £5 | £60 |
| Azure Monitor | £15 | £180 |
| **TOTAL** | **£150** | **£1,800** |

### Phase 3: Enterprise Scale

| Service | Monthly Cost | Annual Cost |
|---------|--------------|-------------|
| Azure Blob Storage (50TB) | £1,000 | £12,000 |
| Azure Databricks (8 hours/week) | £300 | £3,600 |
| Azure Data Factory | £50 | £600 |
| Azure Functions | £30 | £360 |
| Azure Key Vault | £10 | £120 |
| Azure Monitor | £50 | £600 |
| Azure API Management (Basic) | £120 | £1,440 |
| **TOTAL** | **£1,560** | **£18,720** |

**Revenue Potential** (to offset costs):
- 10 Research Standard licenses (£7,999 each): £79,990/year
- 5 Research Premium licenses (£19,999 each): £99,995/year
- 20 Academic licenses (FREE): £0/year (but builds reputation)

**Profit Margin**: Very high (97-99% gross margin after infrastructure costs)

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)

**Goal**: Basic data lake + anonymization + API access

**Tasks**:
1. ✅ Create Azure Resource Group
2. ✅ Deploy Azure Blob Storage with 3 containers
3. ✅ Deploy Azure Key Vault
4. ✅ Install Azure SDK packages
5. ✅ Implement Azure Blob Storage service wrapper
6. ✅ Create anonymization pipeline (basic k-anonymity)
7. ✅ Build data export API (`/api/research/export`)
8. ✅ Test with synthetic data

**Deliverables**:
- Working data lake (bronze/silver/gold)
- Basic anonymization service
- CSV/JSON export functionality
- Environment variables configured

---

### Phase 2: Automation (Week 3-4)

**Goal**: Automated ETL pipelines + monitoring

**Tasks**:
1. ✅ Deploy Azure Data Factory
2. ✅ Create ETL pipelines (Platform → Bronze → Silver → Gold)
3. ✅ Schedule daily/weekly data processing
4. ✅ Deploy Azure Functions for on-demand operations
5. ✅ Set up Azure Monitor + Application Insights
6. ✅ Configure audit logging
7. ✅ Test end-to-end pipeline

**Deliverables**:
- Automated data ingestion
- Scheduled anonymization
- Real-time monitoring dashboard
- Audit trails for all data access

---

### Phase 3: Research Portal (Week 5-8)

**Goal**: Public-facing research platform + license management

**Tasks**:
1. ✅ Build researcher dashboard UI
2. ✅ Implement license purchase flow (Stripe)
3. ✅ Create API documentation portal
4. ✅ Build dataset browser interface
5. ✅ Add license verification middleware
6. ✅ Implement rate limiting per tier
7. ✅ Deploy Azure API Management (optional)
8. ✅ Create public research landing page

**Deliverables**:
- Researcher self-service portal
- License management system
- API key generation
- Public research showcase

---

### Phase 4: Advanced Features (Week 9-12)

**Goal**: Enterprise features (federated ML, NHS integration, etc.)

**Tasks**:
1. ✅ Deploy Azure Databricks for large-scale analytics
2. ✅ Implement federated learning framework
3. ✅ Add NHS Digital FHIR integration
4. ✅ Deploy quantum-resistant encryption
5. ✅ Build double-blind study management
6. ✅ Create grant proposal system
7. ✅ Implement citation tracking
8. ✅ Add synthetic data generation

**Deliverables**:
- Full Research Foundation feature set
- Enterprise-grade security
- Healthcare integration
- Advanced analytics capabilities

---

## Security & Compliance

### Data Protection

**GDPR Compliance**:
- ✅ Data minimization (only collect necessary data)
- ✅ Purpose limitation (research use only)
- ✅ Storage limitation (auto-delete after retention period)
- ✅ Right to erasure (participant withdrawal process)
- ✅ Data portability (export in common formats)

**Anonymization Standards**:
- K-anonymity: k ≥ 5 (minimum 5 individuals per group)
- Differential privacy: ε ≤ 1.0 (strong privacy guarantee)
- Quasi-identifier suppression
- Generalization & perturbation

**Encryption**:
- At rest: AES-256 (Azure Storage default)
- In transit: TLS 1.3
- Quantum-resistant: CRYSTALS-Kyber (future)

### Access Control

**Azure RBAC Roles**:
- `Research.Admin` - Full access (EdPsych Connect team)
- `Research.Analyst` - Read access to gold layer
- `Research.DataEngineer` - Write access to pipelines
- `Research.Auditor` - Read-only audit logs

**License-Based Access**:
- Academic: Read-only, gold layer, 1,000 subjects
- Research Standard: Read-only, silver+gold, 5,000 subjects
- Research Premium: Read+write, all layers, 50,000 subjects
- Commercial: Full access, custom quotas

### Audit Requirements

**What to Log**:
- Every data access (who, what, when, why)
- License verification attempts
- Export requests
- API calls with parameters
- Anonymization pipeline runs
- Failed authentication attempts

**Retention**:
- Active logs: 90 days in Application Insights
- Archived logs: 7 years in cold storage (compliance requirement)

---

## Deployment Steps

### Step 1: Create Azure Resources (30 minutes)

```bash
# Login to Azure CLI
az login

# Create resource group
az group create \
  --name edpsych-research-foundation-rg \
  --location uksouth

# Create storage account for data lake
az storage account create \
  --name edpsychresearchdatalake \
  --resource-group edpsych-research-foundation-rg \
  --location uksouth \
  --sku Standard_LRS \
  --kind StorageV2 \
  --hierarchical-namespace true \
  --enable-large-file-share

# Create containers
az storage container create --name bronze-layer --account-name edpsychresearchdatalake
az storage container create --name silver-layer --account-name edpsychresearchdatalake
az storage container create --name gold-layer --account-name edpsychresearchdatalake
az storage container create --name exports --account-name edpsychresearchdatalake

# Create Key Vault
az keyvault create \
  --name edpsych-research-kv \
  --resource-group edpsych-research-foundation-rg \
  --location uksouth \
  --enable-rbac-authorization false \
  --enable-soft-delete true \
  --soft-delete-retention-days 90

# Get storage connection string
az storage account show-connection-string \
  --name edpsychresearchdatalake \
  --resource-group edpsych-research-foundation-rg

# Store connection string in Key Vault
az keyvault secret set \
  --vault-name edpsych-research-kv \
  --name "AZURE-STORAGE-CONNECTION-STRING" \
  --value "<connection-string-from-above>"
```

---

### Step 2: Install Azure SDK Packages (5 minutes)

```bash
npm install @azure/storage-blob @azure/identity @azure/keyvault-secrets
```

---

### Step 3: Configure Environment Variables (5 minutes)

Add to `.env.local`:

```env
# Azure Research Foundation
AZURE_STORAGE_ACCOUNT_NAME=edpsychresearchdatalake
AZURE_STORAGE_CONNECTION_STRING=<from-keyvault>
AZURE_KEY_VAULT_NAME=edpsych-research-kv
AZURE_TENANT_ID=<your-azure-tenant-id>
AZURE_CLIENT_ID=<your-app-registration-client-id>
AZURE_CLIENT_SECRET=<your-app-registration-secret>

# Research Foundation Settings
RESEARCH_FOUNDATION_ENABLED=true
RESEARCH_DATA_RETENTION_DAYS=730
RESEARCH_ANONYMIZATION_K_VALUE=5
RESEARCH_DIFFERENTIAL_PRIVACY_EPSILON=1.0
```

---

### Step 4: Implement Azure Blob Service (Next section)

We'll create `src/lib/azure/blob-storage-service.ts` with production implementation.

---

### Step 5: Deploy Azure Functions (Future)

Create Function App and deploy serverless functions for anonymization.

---

### Step 6: Configure Monitoring (Future)

Set up Application Insights and configure alerts.

---

## Next Steps

1. **Create Azure account resources** (if not already created)
2. **Install Azure SDK packages**
3. **Implement Azure Blob Storage service wrapper**
4. **Update data-lake-service.ts to use real Azure storage**
5. **Test with synthetic data**
6. **Create anonymization pipeline**
7. **Build research API endpoints**

---

## Support & Resources

**Azure Documentation**:
- [Blob Storage Docs](https://learn.microsoft.com/en-us/azure/storage/blobs/)
- [Data Factory Docs](https://learn.microsoft.com/en-us/azure/data-factory/)
- [Azure Functions Docs](https://learn.microsoft.com/en-us/azure/azure-functions/)

**EdPsych Research Foundation**:
- Architecture: `src/research/foundation/`
- License Types: `src/research/foundation/licensing/models/license-types.ts`
- Data Lake Service: `src/research/foundation/data-lake/services/data-lake-service.ts`

**Cost Calculator**:
- [Azure Pricing Calculator](https://azure.microsoft.com/en-gb/pricing/calculator/)

---

**Document Version**: 1.0
**Last Updated**: 2025-11-04
**Author**: EdPsych Connect Development Team
