# Changelog

---

## v2.1.0 — April 27, 2026

### 🆕 New Features

#### Keep-Alive System
- **Server-side auto-ping** (`server/chat-server.js`): Pings `https://xxxxxxxxxxx.onrender.com` every 4 minutes via `setInterval` to prevent Render free-tier spin-down. Runs 24/7 with no browser required.
- **Keep-Alive Monitor** in Admin Dashboard: Shows live status (green pulsing indicator), last ping result, response time, and a log table of recent pings.
- **"Ping Now" button**: Manual ping from the admin panel for instant testing.
- **Supabase logging**: Ping results are stored in `keep_alive_logs` table with status, response time, and errors.
- **Setup guide**: Dashboard shows inline SQL + setup instructions when the table doesn't exist yet.
- New hook: `src/hooks/useKeepAlive.ts` — reads logs from Supabase, auto-refreshes every 60s.
- New env var: `KEEP_ALIVE_URL` (optional, defaults to the Render URL).

#### Listing Management Page (`/admin/listings`)
- Full admin page for managing ALL listings (approved, pending, rejected).
- **Owner info**: Shows owner name + email for each listing (email fetched via `admin_get_all_users` RPC).
- **Table columns**: Image, Name, Category, Price, Owner (name + email), Status, Active, Views, Created, Actions.
- **Search**: By name, category, PIN code, listing ID, owner name, or owner email.
- **Filter**: By status (all/approved/pending/rejected) with count badges.
- **Sort**: By name, price, views, or date (ascending/descending).
- **Pagination**: Configurable page size (25/50/100).
- **Individual actions**: Approve, Reject, Activate, Deactivate, Delete, View listing.
- **Bulk actions**: Select multiple listings → approve/reject/deactivate with confirmation dialog.
- **"All Listings" button** added to Admin Dashboard management tools grid.

### 🐛 Bug Fixes

#### Admin Dashboard Stats
- **Revenue**: Fixed from hardcoded `verifiedCount × ₹10` to sum of actual `final_price` from payment-verified listings.
- **Total Users**: Fixed from `profiles` table count (missed users without profiles) to `admin_get_all_users` RPC with fallback.
- **Pending Revenue**: Now sums `final_price` from pending-status listings.

#### Property/Rental Mode with Location
- **Bug**: When location was enabled, property listings appeared in rental mode, and property mode showed no results.
- **Root Cause**: Nearby listings fetched via `get_nearby_listings` RPC were not passed through `parseListing()`, so embedded categories (`__cat:category__description`) weren't extracted. The `isProperty` check failed for all nearby listings.
- **Fix**: Added `parseListing()` to the RPC result mapping in `Listings.tsx`.

#### WebSocket Reconnection Flood
- **Bug**: "New WebSocket connection attempt" flooding Render logs every second.
- **Root Cause**: Three compounding issues:
  1. No duplicate connection guard — `connect()` could open multiple sockets simultaneously.
  2. Effect cleanup closed socket → `onclose` fired → reconnect scheduled → cascade of ghost connections.
  3. `useEffect` re-ran on every session token refresh → closed old socket + opened new one.
- **Fix** (`src/hooks/useChat.ts`):
  - Added `isConnectingRef` lock to prevent duplicate connections.
  - Added `intentionalCloseRef` flag — cleanup sets it `true` so `onclose` skips reconnect.
  - Added `readyState` check in `useEffect` — only connects if socket is closed/missing.
  - Exponential backoff: 3s → 6s → 12s → 24s → 48s → 60s (max), stops after 10 attempts.
  - Counter resets to 0 on successful connection.

### 📁 Files Changed

| File | Change |
|------|--------|
| `src/hooks/useKeepAlive.ts` | **NEW** — Keep-alive log reader for admin dashboard |
| `src/pages/ListingManagement.tsx` | **NEW** — Admin listing management page |
| `server/chat-server.js` | Added server-side keep-alive ping (4 min interval) |
| `src/pages/AdminDashboard.tsx` | Added Keep-Alive Monitor section + All Listings button |
| `src/hooks/useAdminStats.ts` | Fixed revenue calculation + user count |
| `src/hooks/useChat.ts` | Fixed WebSocket reconnection flood |
| `src/pages/Listings.tsx` | Fixed property mode with location enabled |
| `src/App.tsx` | Added `/admin/listings` route |
| `README.md` | Updated with new features and project structure |

---

## v2.0.0 — Performance Optimization

### Summary
Optimized AllRentr for Speed, SEO, and Core Web Vitals (LCP, FCP).

## Changes

### 1. Build Optimization (`vite.config.ts`)
- **Action**: Implemented `manualChunks` in Rollup options.
- **Why**: Splits the large JavaScript bundle into smaller chunks (`vendor`, `ui`, `animations`). This improves browser caching (libraries don't change often) and parallel loading, reducing main thread blocking time.

### 2. Code Splitting & Lazy Loading (`src/App.tsx`)
- **Action**: Converted all page imports to `React.lazy` imports wrapped in a global `Suspense` boundary with a lightweight loading spinner.
- **Why**: Drastically reduces the "Initial Bundle Size" loaded on the first visit. Users now only download the code for the page they are viewing (e.g., Homepage), instead of the entire Admin/Dashboard/Profile code. This significantly improves FCP and LCP.

### 3. Server Caching (`vercel.json`)
- **Action**: Added `Cache-Control` headers for static assets (images, fonts, js, css).
- **Why**: Tells browsers and CDNs to cache these files for 1 year (`max-age=31536000`). This makes repeat visits instant and reduces server load.

### 4. Font Optimization (`index.html`)
- **Action**: Switched Google Fonts loading to `preload` method with `onload` swap.
- **Why**: Prevents "Render Blocking". The browser can render the text immediately instead of waiting for the font file to download, improving "First Contentful Paint".

### 5. Image Optimization
- **Action**: Created `scripts/optimize-images.js`.
- **Instruction**: Run `npm run optimize-assets` to convert large PNG/JPGs in `src/assets` to highly compressed WebP format.
- **Why**: Reduces image size by 50-80% without visible quality loss. **You must run this script locally and commit the new .webp files.**

### 6. SEO Updates (`sitemap.xml`)
- **Action**: Added main routes (`/about`, `/listings`, `/blog`, etc.) to the sitemap.
- **Why**: Helps Google index deeper pages of your site, not just the homepage.

## Verification
1. Run `npm run optimize-assets` to generate WebP images.
2. Build the app: `npm run build`.
3. Preview: `npm run preview`.
4. Run Lighthouse: `npx lighthouse http://localhost:4173 --view`.

## Next Steps for Developer
- Update `src/components/HeroSection.tsx` and `src/pages/AboutPage.tsx` to use the generated `.webp` images (e.g., `<img src={heroImageWebP} />`).
- Consider using `<picture>` tags for fallback support if strictly needed (though most modern browsers support WebP).
