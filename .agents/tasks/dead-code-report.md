# Dead Code Report — gaming-dashboard

## Summary

The project has two entirely orphaned chart components that import data that doesn't exist, one dead-end sidebar nav entry with no corresponding route, one `Section` helper component that is defined but never rendered, two unused icon imports across two files, and an empty leftover `<div>` in one page. The `src/data/mockData.js` file itself is dead — only its two non-existent exports are referenced, making the whole module effectively unused. The rest of the codebase is clean.

---

## Findings

### 1. `src/components/charts/SalesChart.jsx` — entire component is dead

**Lines 1–55 (entire file)**

- `SalesChart` is never imported in any other file. No page or layout renders it.
- Line 2 imports `salesByPlatform` from `../../data/mockData` — that export does not exist in `mockData.js`. The import would throw at runtime.

**Why it is dead:** Zero call sites anywhere in the project. The component is unreachable.

---

### 2. `src/components/charts/SpendingChart.jsx` — entire component is dead

**Lines 1–47 (entire file)**

- `SpendingChart` is never imported in any other file.
- Line 2 imports `monthlySpending` from `../../data/mockData` — that export does not exist in `mockData.js`. The import would throw at runtime.

**Why it is dead:** Zero call sites anywhere in the project.

---

### 3. `src/data/mockData.js` — entire module is dead

**Lines 1–49 (entire file)**

This file exports: `products`, `userInvestments`, `walletTransactions`, `userMetrics`, `adminMetrics`.

- None of these five named exports is imported by any other file in the project.
- The only two files that import from `mockData` (`SalesChart.jsx`, `SpendingChart.jsx`) request `salesByPlatform` and `monthlySpending` — exports that **do not exist** in this file (causing a silent `undefined` at the usage site).

**Why it is dead:** The entire module has no live consumers. All real data is fetched from Supabase via `src/lib/db.js`.

---

### 4. `src/components/Layout/Sidebar.jsx` — `/user/wallet` nav entry points to a non-existent route

**Line 11**
```
{ to: '/user/wallet', icon: Wallet, label: 'Wallet' },
```

- `App.jsx` defines no `<Route path="/user/wallet" ...>`. Clicking the sidebar link navigates to a catch-all `<Navigate to="/login">`, effectively a dead link.
- The `Wallet` icon imported on **line 2** is used only in this dead nav entry.

**Why it is dead:** The route `/user/wallet` is not registered anywhere. The nav entry and the `Wallet` icon import both exist solely for this unrouted path.

Also related: `Layout.jsx` line 9 contains `'/user/wallet': 'Wallet'` in `PAGE_TITLES` — a title mapping for a page that doesn't exist.

---

### 5. `src/pages/user/UserDashboard.jsx` — unused icon import

**Line 3**
```js
import { TrendingUp, ShoppingCart, Wallet, ArrowRight, Coins } from 'lucide-react';
```

`Wallet` is imported but never rendered in this file. The string "Wallet Balance" is a plain text label; no `<Wallet />` JSX element appears anywhere in this component.

---

### 6. `src/pages/user/Referral.jsx` — two unused icon imports and one empty `<div>`

**Line 4**
```js
import { Copy, Check, Users, TrendingUp, CheckCircle, Edit3, RefreshCw, AlertCircle, Share2 } from 'lucide-react';
```

- `Share2` is imported but never used in JSX anywhere in this file.
- `RefreshCw` is imported but never used in JSX anywhere in this file.

**Lines 190–191** — empty leftover container
```jsx
<div className="grid grid-cols-2 gap-2">
</div>
```
This empty `<div>` renders no children and produces no output. It is a leftover from a removed feature (additional share buttons that were once inside this grid).

---

### 7. `src/pages/user/Profile.jsx` — `Section` component defined but never rendered

**Lines 28–40**
```jsx
function Section({ title, children, defaultOpen = false }) { ... }
```

This collapsible-section wrapper is defined in the file but `<Section ...>` appears nowhere in the component's JSX. The profile page was refactored away from collapsible sections; the helper was left behind.

---

## Conclusions and Recommendations

| # | File | Action |
|---|------|--------|
| 1 | `src/components/charts/SalesChart.jsx` | Delete the file |
| 2 | `src/components/charts/SpendingChart.jsx` | Delete the file |
| 3 | `src/data/mockData.js` | Delete the file |
| 4 | `src/components/Layout/Sidebar.jsx` line 11 | Remove the `/user/wallet` entry from `userNav`; remove `Wallet` from the import on line 2 |
| 4b | `src/components/Layout/Layout.jsx` line 9 | Remove the `'/user/wallet': 'Wallet'` entry from `PAGE_TITLES` |
| 5 | `src/pages/user/UserDashboard.jsx` line 3 | Remove `Wallet` from the lucide import |
| 6a | `src/pages/user/Referral.jsx` line 4 | Remove `Share2` and `RefreshCw` from the lucide import |
| 6b | `src/pages/user/Referral.jsx` lines 190–191 | Delete the empty `<div className="grid grid-cols-2 gap-2"></div>` |
| 7 | `src/pages/user/Profile.jsx` lines 28–40 | Delete the `Section` function |

None of these removals affect any live feature. Items 1–3 are the highest priority: `SalesChart` and `SpendingChart` import non-existent symbols from `mockData.js`, which would cause a runtime crash if those components were ever rendered.
