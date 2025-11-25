# Marketplace & Compliance Architecture

**Status:** Schema Implemented (Phase 1 Complete)
**Date:** 2025-05-20

## 1. Compliance & Vetting (The "Gatekeeper")

Before an EP can list services, they must pass the checks in the `ProfessionalCompliance` table.

| Requirement | Database Field | Validation Logic |
| :--- | :--- | :--- |
| **HCPC Registration** | `hcpc_number`, `hcpc_status` | API check against HCPC register (or manual admin verify). |
| **Enhanced DBS** | `dbs_number`, `dbs_update_service_id` | Must be on the Update Service for real-time checking. |
| **Insurance** | `insurance_policy_no`, `insurance_doc_url` | Admin verifies the uploaded PDF and expiry date. |

**Workflow:**
1. EP signs up -> `users` record created.
2. EP submits details -> `ProfessionalCompliance` record created (Status: `pending`).
3. Admin/API verifies -> Status changes to `verified`.
4. Only `verified` EPs can create `ServiceListing` records.

## 2. Financial Flow (Escrow & Commission)

We use a "Service Contract" model to handle the money. The `ServiceContract` table is the single source of truth for the transaction.

**The Money Journey:**

1.  **Booking (Draft)**: School requests a service. `ServiceContract` created (Status: `draft`).
2.  **Agreement (Signed)**: EP accepts. Contract is `signed`.
3.  **Escrow (Funded)**:
    *   School pays **£500** (Total).
    *   Stripe Payment Intent succeeds.
    *   Money is held in Stripe Connect Platform Account.
    *   `escrow_status` -> `held`.
4.  **Delivery**: EP delivers the service (e.g., uploads report).
5.  **Release (Payout)**:
    *   School approves the work (or auto-approve after 7 days).
    *   System calculates split:
        *   **Platform Fee (15%)**: £75 (Kept by EdPsych Connect).
        *   **EP Payout (85%)**: £425.
    *   System triggers Stripe Transfer to EP's Connect Account (`stripe_transfer_id`).
    *   `escrow_status` -> `released`.

## 3. Database Structure

### `ProfessionalCompliance`
Stores the sensitive vetting data. Linked 1:1 with `User`.

### `ServiceListing`
The "Menu" of services (e.g., "Cognitive Assessment - £600").

### `ServiceContract`
The "Transaction". Links `Tenant` (School) and `User` (EP).
*   `total_amount`: What the school paid.
*   `platform_fee`: Our revenue.
*   `ep_payout`: What the EP receives.
*   `escrow_status`: The safety lock.

## 4. Next Steps
1.  **Run Migration**: Apply these changes to the production database.
2.  **Build UI**: Create the "Compliance Dashboard" for EPs to upload docs.
3.  **Connect Stripe**: Implement the `stripe-institution-service.ts` logic to actually move the money based on `ServiceContract` status.
