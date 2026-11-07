# Implementation Plan — NexusGG Referral System

**Project root:** `c:\PRIVATE\gaming-dashboard`
**Build/verify command:** `npm run build` (Vite, must exit 0)
**No test framework** — lint with `npm run lint` as secondary check.

---

## FEAT-001 · DB schema migration + referral helpers in db.js

Dependencies: none — must be done first; FEAT-002 and FEAT-003 import these helpers.

- [ ] 1. **SQL migration block in `supabase-schema.sql`**
      Append a clearly-titled block `-- REFERRAL SYSTEM MIGRATION` at the very bottom of the file (after the existing `ALTER TABLE … ADD COLUMN IF NOT EXISTS is_read` block). Include these statements in order:

      ```sql
      -- REFERRAL SYSTEM MIGRATION
      ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code text unique;
      ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by uuid references public.profiles(id) on delete set null;

      CREATE TABLE IF NOT EXISTS public.referrals (
        id bigserial primary key,
        referrer_id uuid references public.profiles(id) on delete cascade not null,
        referred_id uuid references public.profiles(id) on delete cascade not null,
        bonus_paid boolean not null default false,
        created_at timestamptz default now(),
        CONSTRAINT referrals_referred_id_key UNIQUE(referred_id)
      );

      ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

      CREATE POLICY IF NOT EXISTS "Users can view own referral rows"
        ON public.referrals FOR SELECT
        USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

      CREATE POLICY IF NOT EXISTS "Admins can manage all referral rows"
        ON public.referrals FOR ALL
        USING (public.is_admin());

      -- Allow the trigger/service role to insert referral rows on signup
      CREATE POLICY IF NOT EXISTS "Authenticated users can insert referral rows"
        ON public.referrals FOR INSERT
        WITH CHECK (auth.role() = 'authenticated');

      -- Extend transactions.type to include referral_commission
      ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_type_check;
      ALTER TABLE public.transactions ADD CONSTRAINT transactions_type_check
        CHECK (type IN ('deposit', 'withdrawal', 'purchase', 'return', 'referral_commission'));

      -- Seed referral settings
      INSERT INTO public.settings (key, value) VALUES
        ('referral_commission_pct', '10'),
        ('referral_bonus_amount',   '50')
      ON CONFLICT DO NOTHING;
      ```

      Files: `supabase-schema.sql`
      Verify: File saves cleanly (SQL is valid). Build verify comes after db.js changes.

- [ ] 2. **Add `generateReferralCode(userId)` to `src/lib/db.js`**
      Takes first 8 characters of userId, uppercases them, updates `profiles.referral_code` for that user via supabase `.update({referral_code: code}).eq('id', userId)`. Returns the code string. Throws on error. Insert after the `updateWalletBalance` function.

      ```js
      export async function generateReferralCode(userId) {
        const code = userId.replace(/-/g, '').slice(0, 8).toUpperCase();
        const { error } = await supabase
          .from('profiles')
          .update({ referral_code: code })
          .eq('id', userId);
        if (error) throw error;
        return code;
      }
      ```

      Files: `src/lib/db.js`

- [ ] 3. **Add `updateReferralCode(userId, newCode)` to `src/lib/db.js`**
      Validates `newCode` matches `/^[a-zA-Z0-9]{4,16}$/`. Checks uniqueness: query `profiles` where `referral_code = newCode.toUpperCase()` and `id != userId`. If taken, return `{success: false, error: 'Code already taken.'}`. Update profile. Return `{success: true}`. Returns error object (does NOT throw) so the Referral page can show inline errors.

      Files: `src/lib/db.js`

- [ ] 4. **Add `getReferralStats(userId)` to `src/lib/db.js`**
      Query: `supabase.from('referrals').select('*, referred:profiles!referred_id(full_name, email, created_at)').eq('referrer_id', userId)`.
      Then query: `supabase.from('transactions').select('amount').eq('user_id', userId).eq('type', 'referral_commission')` — sum amounts to get `totalEarned`.
      Get `referredIds` array from the referrals rows. If non-empty, query `supabase.from('investments').select('user_id').in('user_id', referredIds).eq('active', true)` — count distinct user_ids for `activeCount`.
      Return `{ referrals, totalEarned, activeCount }`. Throws on error.

      Files: `src/lib/db.js`

- [ ] 5. **Add `applyReferralBonus(referredUserId)` to `src/lib/db.js`**
      Query referrals where `referred_id = referredUserId AND bonus_paid = false`. If no row, return (no-op). Get `referral_bonus_amount` from `getSettings()`. Get referred user profile via `getProfile(referredUserId)`. Credit: `updateWalletBalance(referredUserId, currentBalance + bonusAmount)`. Insert transaction `{user_id: referredUserId, type: 'return', description: 'Referral signup bonus', amount: bonusAmount}`. Update referrals row `{bonus_paid: true}` where `referred_id = referredUserId`. Throws on error.

      Files: `src/lib/db.js`

- [ ] 6. **Add `payReferralCommission(referredUserId, dailyReturn)` to `src/lib/db.js`**
      Query referrals where `referred_id = referredUserId`. If no row, return (no-op). Get `referral_commission_pct` from `getSettings()`. Commission = `Math.round((dailyReturn * pct / 100) * 100) / 100`. Get referrer profile. Credit referrer wallet. Insert transaction `{user_id: referrerId, type: 'referral_commission', description: 'Referral commission', amount: commission}`. Throws on error.

      Files: `src/lib/db.js`
      Verify: `npm run build` — must exit 0.

---

## FEAT-002 · Wire referral mechanics into signup, claim, and purchase

Dependencies: FEAT-001 must be complete (helpers must be exported from db.js).

- [ ] 7. **Extend `AuthContext.register` to accept and process `referralCode`**
      In `src/context/AuthContext.jsx`: change signature to `register(fullName, email, mobile, password, referralCode = '')`. After the existing `if (data.session)` block, add referral linkage logic:
      - If `referralCode` is non-empty (trimmed):
        - `const { data: refData } = await supabase.from('profiles').select('id').eq('referral_code', referralCode.trim().toUpperCase()).single()`
        - If `refData?.id` exists and the new user's ID is known (`data.session?.user?.id || data.user?.id`):
          - `await supabase.from('profiles').update({ referred_by: refData.id }).eq('id', newUserId)`
          - `await supabase.from('referrals').insert({ referrer_id: refData.id, referred_id: newUserId, bonus_paid: false })`
      - Wrap in `try/catch` — swallow silently so registration never fails due to a bad code.

      Files: `src/context/AuthContext.jsx`
      Verify: `npm run build`

- [ ] 8. **Add referral code field to `LoginPage.jsx` register form + URL pre-fill**
      In `src/pages/LoginPage.jsx`:
      - Add `useEffect` to existing React import. Add `useLocation` is NOT needed — use `window.location.search` directly.
      - Add `referralCode: ''` to form initial state in `useState`.
      - Add `useEffect(() => { const ref = new URLSearchParams(window.location.search).get('ref'); if (ref) set('referralCode', ref); }, [])`.
      - In the register JSX section, after the mobile input, insert:
        ```jsx
        <input className={inputClass} type="text" placeholder="Referral code (optional)"
          value={form.referralCode} onChange={(e) => set('referralCode', e.target.value)} />
        ```
      - In `handleSubmit` register branch, change the `register(...)` call to: `register(form.name, form.email, form.mobile, form.password, form.referralCode)`.
      - In `switchMode`, reset `referralCode: ''` in the form reset object.

      Files: `src/pages/LoginPage.jsx`
      Verify: `npm run build`

- [ ] 9. **Call `payReferralCommission` after daily claim in `ActiveInvestments.jsx`**
      In `src/pages/user/ActiveInvestments.jsx`:
      - Add `payReferralCommission` to the import from `'../../lib/db'`.
      - In `handleClaim`, after `await claimDailyReturn(investment, profile.id)` succeeds (before `fetchInvestments()`), add:
        ```js
        try { await payReferralCommission(profile.id, investment.daily_return); } catch (_) {}
        ```

      Files: `src/pages/user/ActiveInvestments.jsx`
      Verify: `npm run build`

- [ ] 10. **Call `applyReferralBonus` after investment purchase in `Catalog.jsx`**
       In `src/pages/user/Catalog.jsx`:
       - Add `applyReferralBonus` to the import from `'../../lib/db'`.
       - In `handleConfirm`, after `await refreshProfile()` (after `setOwnedProductIds`), add:
         ```js
         try { await applyReferralBonus(profile.id); } catch (_) {}
         ```

       Files: `src/pages/user/Catalog.jsx`
       Verify: `npm run build`

---

## FEAT-003 · Referral page UI, admin settings fields, sidebar + route wiring

Dependencies: FEAT-001 (getReferralStats, generateReferralCode, updateReferralCode helpers), FEAT-002 (routes context is set). FEAT-003 is independent of FEAT-002's exact signup flow; it only needs FEAT-001's helpers.

- [ ] 11. **Create `src/pages/user/Referral.jsx`**
       Full new file. Named export `Referral`. Dark-theme, glass-card pattern matching existing user pages.

       Structure:
       - Imports: `useState`, `useEffect` from 'react'; `useAuth` from `../../context/AuthContext`; `generateReferralCode`, `updateReferralCode`, `getReferralStats` from `../../lib/db`; `Share2, Copy, Users, TrendingUp, CheckCircle, Edit3, RefreshCw, AlertCircle` from `lucide-react`.
       - State: `referralCode`, `editingCode`, `isEditing`, `stats` (default `{referrals:[], totalEarned:0, activeCount:0}`), `loading`, `copying`, `saving`, `codeError`, `codeSuccess`.
       - `useEffect`: on mount, if `profile.referral_code` exists set it; otherwise call `generateReferralCode(profile.id)`. Call `getReferralStats(profile.id)` and set stats.
       - Sections:
         1. **Header glass-card** — Share2 icon (text-[#00d4ff]), title 'Referral Program', subtitle 'Earn ₵ for every daily claim your referred users make'.
         2. **Your Referral Code glass-card** — Shows `referralCode` in `font-mono text-2xl text-[#00d4ff]` centered. Row of 3 action buttons:
            - Edit (Edit3, 14px) — sets `isEditing=true`, `editingCode=referralCode`.
            - When editing: input bound to `editingCode` (alphanumeric hint), Save button calls `updateReferralCode(profile.id, editingCode.toUpperCase())` → on `{success:true}` update state, call `refreshProfile()`; on error show `codeError`.
            - Copy Referral Link (Copy, 14px) — `navigator.clipboard.writeText('https://nexusgg.vercel.app/signup?ref=' + referralCode)` → set `copying=true` for 2000ms to show 'Copied!'.
            - Generate New Code (RefreshCw, 14px) — calls `generateReferralCode(profile.id)`, updates `referralCode`, calls `refreshProfile()`.
         3. **Stats row** — 3 glass-card chips in a flex/grid:
            - "Total Referrals" / `stats.referrals.length` / Users icon
            - "Commission Earned" / `₵${stats.totalEarned.toFixed(2)}` / TrendingUp icon  
            - "Active Investors" / `stats.activeCount` / CheckCircle icon
         4. **Referred Users glass-card** — list of `stats.referrals`. For each: `full_name`, masked email (first 2 chars + `***@` + domain part after @), date joined (`new Date(created_at).toLocaleDateString()`), bonus badge (green 'Bonus Paid' pill if `bonus_paid`, else grey 'Pending'). Empty state if array is empty: AlertCircle icon + 'No referrals yet. Share your link to start earning!'

       Files: `src/pages/user/Referral.jsx` (new file)
       Verify: `npm run build`

- [ ] 12. **Add referral settings fields to `src/pages/admin/Settings.jsx`**
       - Add `Percent` to the lucide-react import (already has `Save, Smartphone`).
       - Extend initial form state: add `referral_commission_pct: ''` and `referral_bonus_amount: ''`.
       - In `useEffect` getSettings call, set `referral_commission_pct: s.referral_commission_pct ?? '10'` and `referral_bonus_amount: s.referral_bonus_amount ?? '50'`.
       - Add validation in `handleSave`: if `Number(form.referral_commission_pct) < 0 || Number(form.referral_commission_pct) > 100` → set error 'Commission must be 0-100%'; if `Number(form.referral_bonus_amount) < 0` → set error 'Bonus must be ≥ 0'.
       - Add to `Promise.all` in `handleSave`: `upsertSetting('referral_commission_pct', String(form.referral_commission_pct))`, `upsertSetting('referral_bonus_amount', String(form.referral_bonus_amount))`.
       - Add a second glass-card section **below** the existing MoMo card:
         ```
         <div className="glass-card p-6 space-y-5">
           <div className="flex items-center gap-2 mb-2">
             <Percent size={18} className="text-[#00d4ff]" />
             <h3 className="text-base font-semibold text-[#f0f0ff]">Referral Settings</h3>
           </div>
           /* Commission % input (type=number, min=0, max=100) */
           /* Signup Bonus ₵ input (type=number, min=0) */
         </div>
         ```
       - The save button at the bottom of the existing MoMo card now covers both sections (it already calls Promise.all — just add the two new upserts).

       Files: `src/pages/admin/Settings.jsx`
       Verify: `npm run build`

- [ ] 13. **Add Referrals nav item to `src/components/Layout/Sidebar.jsx`**
       - Add `Share2` to the lucide-react import list (currently imports: `LayoutDashboard, ShoppingBag, Wallet, TrendingUp, BarChart3, Package, Users, ArrowDownCircle, ArrowUpCircle, List, Settings, LogOut, Zap`).
       - Insert into `userNav` array between the Active Investments and Wallet entries:
         ```js
         { to: '/user/referrals', icon: Share2, label: 'Referrals' },
         ```
         Final userNav order: Dashboard → Store → Active Investments → **Referrals** → Wallet.

       Files: `src/components/Layout/Sidebar.jsx`
       Verify: `npm run build`

- [ ] 14. **Add `/user/referrals` route to `src/App.jsx`**
       - Add import: `import { Referral } from './pages/user/Referral';`
       - Add route in the user routes block (after the investments route, before wallet route):
         ```jsx
         <Route path="/user/referrals" element={<ProtectedRoute role="user"><Referral /></ProtectedRoute>} />
         ```

       Files: `src/App.jsx`
       Verify: `npm run build` exits 0; `npm run lint` produces no new errors.

---

## Cross-cutting notes

1. **`referral_commission` transaction type**: The new type is added via `ALTER TABLE … DROP CONSTRAINT … ADD CONSTRAINT` in the SQL migration. The `getAdminMetrics` function sums `return` and `withdrawal` types — `referral_commission` is intentionally excluded since it's not a user-visible payout from admin's perspective. If the admin wants to track it separately, that's a future concern; do not change `getAdminMetrics` now.

2. **Supabase RLS for `referrals` insert**: The insert from `AuthContext.register` runs as the authenticated user's session, so the `INSERT WITH CHECK (auth.role() = 'authenticated')` policy covers it. The `update` (setting `bonus_paid=true` and `referred_by`) in `applyReferralBonus` / AuthContext runs as the same session — the existing "Users can update own profile" policy on profiles covers the `referred_by` update since the updated row is the current user's own profile.

3. **`CREATE POLICY IF NOT EXISTS`** — Supabase SQL Editor supports this syntax on pg14+. Use it to make the migration re-runnable safely.

4. **Dependency order summary**:
   - Step 1-6 (FEAT-001): DB + helpers — no JS imports yet
   - Steps 7-10 (FEAT-002): import helpers from db.js — requires steps 5-6 done
   - Steps 11-14 (FEAT-003): UI + routes — requires steps 2-4 (generateReferralCode, updateReferralCode, getReferralStats) from FEAT-001
