# AutoBat App Screens and User Flows

## 1. Shared Mobile Screens

- Splash and app update check
- Language selection
- Mobile number login and OTP
- Organization/role selection when multiple assignments exist
- Home dashboard
- Global serial/QR scanner
- Search
- Notifications
- Offline queue and synchronization status
- Profile, device, support, privacy, and logout

## 2. Dealer Screens

### Dashboard

- Register sale
- Check warranty
- Create claim
- Stock on hand
- Pending registrations
- Pending claims
- Expiring warranties

### Receive Stock

`Transfer list -> Scan/confirm batteries -> Report mismatch -> Accept receipt`

### Register Sale

`Scan serial -> Product validation -> Customer -> Application/vehicle -> Purchase and invoice -> Old battery exchange -> Warranty preview -> OTP -> Success/certificate`

### Warranty Detail

- Product and serial
- Customer/application
- Dealer and distributor
- Purchase, activation, free-replacement, and expiry dates
- Current warranty phase and days remaining
- Invoice and certificate
- Battery movement timeline
- Claim/replacement history

### Claim

`Find warranty -> Eligibility -> Complaint -> Diagnostics -> Evidence -> Customer acknowledgement -> Submit -> Track`

## 3. Distributor Screens

- Dashboard and alerts
- Company receipts
- Distributor inventory
- Create dealer transfer
- Dealer transfer history
- Dealer stock and pending registration report
- Claims requiring distributor action
- Returns and replacement stock
- Used-battery pickups
- Dealer directory

## 4. Delivery Screens

- Assigned runs
- Run summary and load checklist
- Battery scan during loading
- Route/stop list
- Navigation handoff
- Arrive at stop
- Delivery scan
- Dealer OTP/signature/photo
- Damage, shortage, rejection, or partial delivery
- Used-battery pickup
- Complete stop
- End-run reconciliation

## 5. AutoBat Admin Portal

- Operational dashboard
- Users, roles, devices, and permissions
- Distributors, dealers, territories, and locations
- Product catalog and warranty policies
- Serialized battery import and lookup
- Inventory movement explorer
- Sales and warranty registrations
- Backdate/correction approval queue
- Claims workbench
- Delivery and return monitoring
- Old-battery collection and recycler reports
- Notifications and templates
- Reports and exports
- Audit log
- Integration and feature-flag settings

## 6. UX Rules

- Scanner is always available from the primary navigation
- Show serial number and product after every scan before committing an action
- Dates must use an unambiguous format such as `18 Jun 2026`
- Warranty balance shows phase, exact end date, and remaining days
- Destructive or irreversible operations require clear confirmation
- Offline/pending state must be visible at all times
- Do not allow hidden automatic date corrections
- Support manual serial entry when labels are damaged
- Keep common field workflows usable with one hand on small Android screens

