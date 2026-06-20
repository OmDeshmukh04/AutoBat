# AutoBat System Design

## 1. Requirements

### Functional

- Serialized battery lifecycle tracking
- Role- and territory-based access
- Dealer and distributor inventory transfers
- Customer sale and warranty registration
- Configurable warranty computation
- Digital warranty certificate
- Claim review and replacement linking
- Delivery proof and old-battery pickup
- Notifications and reminders
- Search, reports, audit logs, and data export
- Offline-first scanning for critical field workflows

### Non-Functional

- Android-first, with iOS support available through Expo
- Fast on low-cost devices and unreliable networks
- Idempotent scan, transfer, sale, and claim APIs
- Encryption in transit and at rest
- India data/privacy compliance and minimum necessary customer data
- Complete auditability of warranty-affecting changes
- Configurable retention for invoices and claim evidence
- Horizontally scalable API and worker services

## 2. Architecture

```text
Expo Mobile App              Next.js Admin Portal
       |                              |
       +---------- HTTPS/REST --------+
                      |
                 NestJS API
        +-------------+--------------+
        |             |              |
   PostgreSQL       Redis        Object Storage
    + Prisma       + BullMQ       invoices/photos
        |
   Reporting views

External integrations:
- WhatsApp/SMS provider
- Email provider
- ERP/accounting system
- Maps/geocoding provider
```

Start as a modular monolith. Split services only after load or ownership makes a
separation necessary.

## 3. Mobile Screens and User Flow

Detailed inventory: `03-app-screens-and-flows.md`.

Primary warranty flow:

```text
Login
-> Scan battery
-> Validate dealer ownership and sale eligibility
-> Add customer/application/invoice details
-> Customer OTP
-> Calculate warranty
-> Activate warranty
-> Generate certificate
-> Notify customer
```

Primary claim flow:

```text
Find warranty
-> Confirm coverage
-> Capture complaint and diagnostics
-> Upload evidence
-> Submit claim
-> Review/inspection
-> Approve replacement, pro-rata, repair, or reject
-> Link settlement and notify customer
```

## 4. Database Design

### Identity and Organization

- `users`: login identity, mobile, status, preferred language
- `roles`: dealer owner, dealer staff, distributor, driver, warranty reviewer, admin
- `user_roles`: scoped role assignments
- `organizations`: AutoBat, distributor, dealer, service point, recycler
- `organization_relationships`: distributor-to-dealer and territory relationships
- `locations`: billing, shipping, warehouse, shop, and service addresses
- `devices`: registered mobile devices and push tokens

### Product and Serialized Inventory

- `product_families`: automotive, motorcycle, inverter, solar, lithium, industrial
- `products`: SKU, model, voltage, capacity, application, status
- `warranty_policies`: effective dates and free/pro-rata rules
- `batteries`: serial number, QR value, product, manufacture date, current status
- `inventory_events`: immutable receipt, transfer, sale, return, claim, replacement events
- `stock_transfers`: source, destination, invoice, status, dispatch/receipt timestamps
- `stock_transfer_items`: batteries included in each transfer

### Customer Sales and Warranty

- `customers`: mobile, name, consent, minimal profile
- `customer_assets`: vehicle/inverter/equipment details
- `sales`: dealer, customer, invoice, purchase date, registration state
- `sale_items`: battery serials and pricing/exchange details
- `warranties`: activation, policy snapshot, period dates, status
- `warranty_events`: activation, correction, suspension, expiration, replacement
- `documents`: invoice, warranty certificate, photos, and metadata
- `otp_challenges`: hashed OTP, purpose, expiry, attempts, verification

### Claims and Delivery

- `claims`: complaint, reported date, status, decision, settlement
- `claim_diagnostics`: voltage, charging values, condition, test results
- `claim_evidence`: photos/videos/documents
- `claim_events`: immutable status history and reviewer notes
- `replacement_links`: original battery, replacement battery, inherited warranty
- `delivery_runs`: driver, vehicle, route, status
- `delivery_stops`: organization, sequence, arrival, completion
- `delivery_items`: delivered, rejected, damaged, or returned serials
- `proofs_of_delivery`: OTP/signature/photo/GPS
- `used_battery_pickups`: quantity, serial if known, weight, rebate, destination

### Platform

- `notifications`: template, channel, delivery status
- `audit_logs`: actor, action, entity, before/after hash, timestamp, IP/device
- `sync_operations`: mobile-generated operation ID and synchronization result
- `feature_flags`: controlled rollout by role, territory, or app version

### Important Constraints

- Unique `batteries.serial_number`
- Unique active warranty per battery
- Customer purchase date cannot precede dealer receipt without approved override
- Dealer can sell only stock currently assigned to that dealer
- Replacement battery cannot already be sold or assigned to another warranty
- Inventory and warranty history is append-only; corrections use compensating events
- Warranty records retain a snapshot of the policy used at activation

## 5. Warranty Engine

Inputs:

- Product and product family
- Customer purchase date
- Application and customer type
- Geography/state
- Registration date
- Invoice evidence
- Dealer receipt date
- Applicable policy effective dates
- Approved exception, when present

Outputs:

- Warranty start date
- Free-replacement end date
- Pro-rata start/end dates
- Overall expiry
- Current phase
- Days remaining
- Registration compliance status
- Explanation of every applied rule

Do not derive historical warranties from the latest policy. Save a versioned,
immutable policy snapshot and calculated result when the warranty activates.

## 6. API Design

Base path: `/api/v1`

### Authentication

- `POST /auth/request-otp`
- `POST /auth/verify-otp`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /me`

### Partners and Products

- `GET /organizations`
- `GET /organizations/:id`
- `GET /products`
- `GET /products/:id`
- `GET /warranty-policies`

### Batteries and Inventory

- `GET /batteries/:serial`
- `POST /batteries/resolve-code`
- `GET /inventory`
- `POST /stock-transfers`
- `POST /stock-transfers/:id/dispatch`
- `POST /stock-transfers/:id/receive`
- `POST /stock-transfers/:id/reconcile`

### Sales and Warranties

- `POST /sales/draft`
- `POST /sales/:id/verify-customer`
- `POST /sales/:id/activate`
- `GET /warranties/search`
- `GET /warranties/:id`
- `GET /warranties/:id/certificate`
- `POST /warranties/:id/correction-requests`
- `POST /warranties/preview`

### Claims

- `POST /claims`
- `GET /claims`
- `GET /claims/:id`
- `POST /claims/:id/evidence`
- `POST /claims/:id/submit`
- `POST /claims/:id/inspect`
- `POST /claims/:id/decision`
- `POST /claims/:id/settle`

### Delivery

- `GET /delivery-runs/assigned`
- `POST /delivery-runs/:id/start`
- `POST /delivery-stops/:id/arrive`
- `POST /delivery-stops/:id/complete`
- `POST /delivery-stops/:id/exceptions`

### Synchronization

- `POST /sync/batch`
- `GET /sync/changes?cursor=...`

Mutating endpoints accept:

- `Idempotency-Key`
- Device operation ID
- Client timestamp
- App version

## 7. Backend Modules

- `AuthModule`: OTP, sessions, device trust, tokens
- `IdentityModule`: users, roles, organizations, territories
- `CatalogModule`: product and warranty-policy administration
- `InventoryModule`: serial validation and movement ledger
- `SalesModule`: sale drafts, customer verification, activation
- `WarrantyModule`: calculation, lookup, certificates, corrections
- `ClaimsModule`: diagnostics, approval, settlement, replacement
- `DeliveryModule`: runs, stops, proof, exceptions, pickups
- `DocumentsModule`: secure upload and signed access
- `NotificationsModule`: WhatsApp, SMS, email, push
- `ReportingModule`: operational dashboards and exports
- `AuditModule`: immutable security and business audit trail
- `IntegrationModule`: ERP, accounting, maps, and import/export

Background jobs:

- Certificate generation
- Notification delivery and retries
- Warranty-expiry reminders
- Bulk serial/import processing
- Report exports
- ERP synchronization
- Virus scanning and media processing

## 8. Mobile Frontend

### Approach

- Expo Router with role-based route groups
- TanStack Query for server state
- Zustand for small local UI/session state
- React Hook Form + Zod for forms
- SQLite for offline cache and operation queue
- Expo Camera/Barcode Scanner for serial capture
- SecureStore for tokens and device secrets
- i18n-ready strings from the first release

### Offline Rules

- Product, policy, assigned inventory, and partner data are cached
- Scans and drafts can be saved offline
- Warranty activation requiring OTP remains pending until online
- Every queued mutation has a unique operation ID
- Conflicts are shown clearly and never silently overwrite server data
- The server remains authoritative for stock ownership and warranty dates

## 9. Admin Frontend

- Next.js App Router
- Server-rendered operational lists where useful
- TanStack Table for dense data views
- Role-aware navigation and actions
- Filters and export for serials, warranties, claims, and partners
- Accessible forms, keyboard navigation, and explicit destructive confirmations

## 10. Security and Privacy

- OTP-based login initially; optional password/SSO for company staff
- Short-lived access tokens and rotated refresh tokens
- Organization and territory checks in every business query
- Signed, expiring document URLs
- Rate limits for authentication, search, and uploads
- OTP values stored only as salted hashes
- Customer consent recorded for WhatsApp/SMS
- Sensitive fields encrypted where required
- Audit log for dates, policy overrides, claims, replacements, and exports
- Maker-checker approval for backdated registrations and warranty overrides
- Root/jailbreak and device-binding policy evaluated during discovery

## 11. Testing Strategy

### Unit Tests

- Warranty date calculations and boundary dates
- Policy selection and snapshot behavior
- Inventory transition rules
- Claim eligibility and settlement calculations
- Permissions and organization scoping

### API Integration Tests

- OTP/session flow
- Transfer dispatch/receipt/reconciliation
- Sale registration and duplicate prevention
- Claim and replacement lifecycle
- Idempotency and retry behavior
- Signed document access

### Database Tests

- Unique and check constraints
- Concurrent sale attempts for one serial
- Transaction rollback on partial transfer/activation failure
- Migration tests against production-like data volumes

### Mobile Tests

- Component and form tests
- Scanner success/failure/manual entry
- Offline draft and queued synchronization
- Role-specific navigation
- Slow network, expired token, and app-upgrade behavior

### End-to-End Tests

- Maestro: dealer sale and warranty activation
- Maestro: claim creation and evidence upload
- Web E2E: admin policy setup and claim approval
- Contract tests for external providers

### Non-Functional Tests

- Load test warranty search, batch sync, and bulk imports
- Security testing for tenant/territory isolation
- Upload malware and file-type validation
- Backup restoration and disaster recovery exercise
- Field testing on low-cost Android devices and 2G/3G-like networks

## 12. Release and Operations

- Environments: local, development, staging, production
- CI: lint, type-check, unit tests, integration tests, build, migration check
- Infrastructure as code before production
- Structured logs with request and operation IDs
- Metrics for API latency, sync failures, OTP delivery, notification failures, and claim SLA
- Error monitoring for API, admin, and mobile
- Daily database backups and tested point-in-time recovery
- Phased rollout by territory and partner cohort

