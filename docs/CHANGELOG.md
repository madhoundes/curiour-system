# Changelog

All notable changes to the Parcego Courier Platform are documented here.

---

## 2026-03-01

### feat(admin): Enhance SuperAdminDashboard with new store alerts management
**Commit:** `341fb010` — 1 file changed, 203 insertions, 93 deletions

- Added `dismissedStoreAlerts` state (`Set<number>`) to track per-store dismissed alerts in the admin Shopify section
- Replaced merchant-facing "Store connection expired. Please reconnect your Shopify store." error message with admin-appropriate language ("OAuth token expired — merchant needs to reconnect their store")
- Alert colour changed from red to amber to reflect informational (not actionable by admin) context
- Added per-store dismiss (`×`) button so admins can ignore expired store warnings for the session
- Added "Expired" as a distinct filter option in the Connected Stores status dropdown
- Refactored `renderOverview()` to display recent merchants and shipment statistics:
  - Expanded stat cards from 3 to 5 (added Delivered and In Transit)
  - Added Shipment Status Breakdown panel with progress bars (Delivered, In Transit, In Warehouse, Undelivered, Cancelled)
  - Added Recently Joined Merchants panel showing last 5 merchants with status badge and "View all" link
- Updated card components for better styling consistency and responsiveness across screen sizes

---

### refactor(tabs): Simplify tab layout and improve styling consistency
**Commit:** `9b73e018` — 2 files changed, 5 insertions, 5 deletions

- Removed `grid grid-cols-2` from the admin Shopify `TabsList` — was conflicting with the base `inline-flex` layout and misaligning tab content
- Added `flex-1` to each `TabsTrigger` so Overview and Monitoring tabs share width equally
- Changed `overflow-x-auto` → `overflow-hidden` in `TabsList` base component to eliminate unnecessary horizontal scrollbar on tab bars with few items
- Removed `min-h-[2rem] sm:min-h-[2.5rem]` from `TabsTrigger` base — oversized minimum height was pushing the active pill beyond the container bounds, making the highlight appear too large

---

## 2026-02-23

### Fixed

#### Shopify Integration – Profile Page (`app/profile/page.tsx`)
- **200 response treated as error on Sync** — `handleShopifySync` was checking `response.data?.success` to decide success vs error. Since `apiClient` already throws for non-2xx responses, any response reaching the `try` block is guaranteed to be successful. Removed the `if/else` guard so the success message is always shown correctly in green instead of red.
- **200 response treated as error on Disconnect** — Same root cause as above. `handleShopifyDisconnect` also had a redundant `response.data?.success` check that caused the "disconnected successfully" message to render as a red error box. Fixed with the same pattern.
- **Tab navigation broken when arriving via `?tab=api` link** — The `<Tabs>` component was used in controlled mode (`value={activeTab}`) with no `onValueChange` handler. Clicking any tab had no effect because the controlled value never updated. Fixed by adding `onValueChange={(tab) => router.push(\`/profile?tab=\${tab}\`, { scroll: false })}` so tab clicks update the URL and the active tab reflects the change.

---

### Fixed

#### Admin – Shopify Integration Management (`app/admin/page.tsx`)
- **Merchant-facing error message shown to admins** — The "Store connection expired. Please reconnect your Shopify store." message is intended for merchants, not admins. Replaced with the admin-appropriate message: "OAuth token expired — merchant needs to reconnect their store". Other error types show a neutral "Integration issue detected: …" prefix.
- **No way to dismiss expired store alerts** — Added a per-store dismiss button (`×`) next to each alert. Dismissed alerts are tracked in `dismissedStoreAlerts` (a `Set<number>` of account IDs) and hidden for the session without affecting other stores.
- **Missing "Expired" filter option** — Added `expired` as a distinct option in the Connected Stores status filter dropdown alongside Active, Error, and Inactive.
- **Tab highlight pill too large** — The `TabsList` was using `grid grid-cols-2` which conflicted with the base `inline-flex` layout, causing the active pill to stretch and overflow the container. Fixed by removing the `grid` classes and adding `flex-1` to each `TabsTrigger` so they share space equally within the flex container.

---

### Improved

#### Admin – Overview Page (`app/admin/page.tsx`)
- **Empty white space below stat cards** — The Overview section only showed 3 stat cards with nothing below. Expanded to a full dashboard layout:
  - **5 stat cards** (was 3): Added "Delivered" and "In Transit" cards using already-loaded `adminStats` data.
  - **Shipment Status Breakdown** panel: Progress bars for Delivered, In Transit, In Warehouse, Undelivered, and Cancelled — each showing count and percentage of total.
  - **Recently Joined Merchants** panel: Last 5 merchants sorted by join date, showing avatar initial, business name, email, and status badge. Includes a "View all" link to the Merchants section.

---

### Fixed

#### UI Component – Tabs (`components/ui/tabs.tsx`)
- **Horizontal scrollbar appearing in tab bars** — The `TabsList` base class included `overflow-x-auto` which caused a visible scrollbar in tab bars with only 2 items (e.g., the admin Shopify Overview/Monitoring tabs). Changed to `overflow-hidden` since tabs that genuinely need horizontal scrolling can add the class as a local override.
- **Active tab pill oversized** — `TabsTrigger` had `min-h-[2rem] sm:min-h-[2.5rem]` which pushed the pill height beyond the `h-10` container after its `p-1` inset, making the highlight appear too large. Removed the `min-h` constraints so pill height is determined naturally by `py-1.5` padding + text line-height, fitting proportionally inside the container.

---

### Dependency

#### Security – Next.js CVE (`package.json`)
- **CVE-2025-66478 (CVSS 10.0)** — Upgraded Next.js from `15.4.5` to `15.4.8`, the minimum patched version for the `15.4.x` release line. This vulnerability affected React Server Components / App Router in all Next.js 15.x versions and could allow remote code execution. Vercel was blocking deployment until resolved.
