# AutoBat Project Plan

## 1. Product Objective

Create one trusted record for every AutoBat battery and its movement:

`Manufactured -> Distributor -> Dealer -> Customer -> Claim -> Replacement -> Recycling`

The first business problem to solve is inaccurate or unavailable tracking of:

- Customer purchase date
- Warranty activation date
- Free-replacement period
- Pro-rata period
- Remaining warranty
- Battery ownership and channel movement
- Claims and replacement history

## 2. Users

### Dealer

- Receive serialized inventory
- Register customer sales
- Activate digital warranty
- Look up warranty balance
- Create and track warranty claims
- Record old-battery exchange

### Distributor

- Receive inventory from AutoBat
- Transfer inventory to dealers
- Monitor dealer stock and registration compliance
- Assist with warranty claims and returns
- Track delivery and old-battery collection

### Delivery Staff

- View assigned trips
- Scan loading and delivery inventory
- Capture dealer OTP/signature and proof of delivery
- Record shortages, damage, rejection, and used-battery pickup

### AutoBat Operations

- Manage products, serialized batteries, partners, territories, and warranty rules
- Approve exceptions and claims
- Track inventory movement and registration delays
- Audit changes and view operational reports

### Customer

The MVP does not require a customer app. Customers receive warranty details and
status through WhatsApp/SMS and a secure web link.

## 3. Core Product Principle

Each battery has a unique digital identity represented by its serial number and
QR/barcode. All events are appended to its lifecycle history. A serial number
cannot have two active customer warranties.

## 4. Warranty Dates

Store each date separately:

- Manufacturing date
- Company-to-distributor invoice date
- Distributor receipt date
- Distributor-to-dealer invoice date
- Dealer receipt date
- Customer purchase date
- Registration date
- Warranty activation date
- Free-replacement expiry
- Pro-rata expiry
- Overall warranty expiry
- Claim date
- Replacement date

Warranty rules must be configurable by product model, application, sale date,
state, and customer type. Replacement batteries stay linked to the original
warranty unless an authorized policy explicitly starts a new warranty.

## 5. MVP Scope

1. Partner and staff authentication
2. Dealer/distributor master data
3. Product and warranty policy management
4. Serialized battery import or factory creation
5. Stock transfer with QR/barcode scanning
6. Customer sale registration with invoice evidence and OTP
7. Automatic warranty calculation and digital certificate
8. Warranty lookup by serial, mobile, vehicle, or invoice
9. Claim creation, evidence, review, and settlement
10. Replacement serial linking
11. WhatsApp/SMS notifications
12. Admin dashboard, audit log, and basic reports
13. Offline scan queue for weak-network environments

## 6. Later Phases

- Dealer ordering and distributor replenishment
- Credit limits, ledger, collections, and payment integration
- Schemes, targets, incentives, and sales-versus-target dashboards
- Route optimization and live delivery tracking
- Technician service jobs and doorstep installation
- Old-battery weight, rebate, pickup, and recycler reconciliation
- Customer self-service application
- ERP/accounting integration
- Advanced fraud and demand analytics

## 7. Delivery Phases

### Phase 0: Discovery

- Interview management, warranty, sales, distributor, dealer, and dispatch teams
- Observe one real stock transfer, retail sale, and warranty claim
- Collect forms, invoices, warranty cards, spreadsheets, and policy documents
- Confirm ERP/accounting systems and integration options
- Finalize warranty date rules and exception authority

### Phase 1: Foundation

- Partner onboarding and role permissions
- Product, serial number, and warranty-policy masters
- Serialized inventory ledger
- Admin portal foundations

### Phase 2: Warranty MVP

- Dealer sale registration
- Customer OTP
- Invoice upload
- Warranty calculation and certificate
- Warranty search, balance, reminders, and audit trail

### Phase 3: Claims

- Claim intake and diagnostic evidence
- Approval workflow
- Replacement/pro-rata/rejection settlement
- Service battery and turnaround tracking

### Phase 4: Delivery and Returns

- Dispatch assignments
- Load/delivery scanning and proof of delivery
- Returns, rejected stock, and used-battery pickup

### Phase 5: Scale

- ERP integration
- Reporting and anomaly detection
- Performance tuning, rollout, training, and support

## 8. Discovery Questions Requiring AutoBat Approval

- Which date currently starts warranty for each product family?
- How many days may pass between retail sale and warranty registration?
- What happens when registration is late or the invoice is missing?
- Are free-replacement and pro-rata periods different by model?
- Does a replacement continue the original warranty or receive a new period?
- Who can approve backdated sales and policy overrides?
- Which claim tests and readings are mandatory?
- How are service/standby batteries tracked?
- How are dealer purchases, stock, and invoices stored today?
- Does AutoBat already print unique serials, QR codes, or barcodes?
- Which WhatsApp provider, SMS provider, and ERP should be integrated?
- Which Android versions and regional languages must be supported?

## 9. Success Metrics

- At least 95% of retail sales registered within the allowed window
- Warranty lookup completed in under 10 seconds
- No duplicate active warranties for a serial number
- Full movement history for at least 98% of serialized stock
- Reduced claim-processing turnaround time
- Reduced backdated or unverifiable registrations
- Dealer adoption and weekly active usage by territory

