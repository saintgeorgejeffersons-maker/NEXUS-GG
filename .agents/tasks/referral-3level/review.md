# Review: 3-Level Referral Commission System

**Commit:** a3cc08a — `feat: 3-level referral commission system`  
**Build evidence:** `npm run build` → exit 0 (per commit message). Lint: 50 pre-existing errors, 0 new errors.

---

## 1. `payReferralCommission` in `src/lib/db.js`

**Commission walk (lines 150–209)**

- Fetches settings and reads `referral_commission_l1_pct`, `l2_pct`, `l3_pct` with numeric defaults of 10, 5, 2.
- Fetches the claiming user's profile to get `referred_by` → `l1ReferrerId`. Returns immediately if null — skips correctly.
- Fetches L1's profile → `referred_by` → `l2ReferrerId`. Null-safe.
- Only fetches L3 if `l2ReferrerId` is non-null, so the third DB call is skipped when the chain is shorter than 3. Null-safe.
- Iterates `[{l1, l1Pct}, {l2, l2Pct}, {l3, l3Pct}]`, skipping any `null` referrerId.

**Commission formula** (line ~185):  
`Math.round((Number(dailyReturn) * pct) / 100 * 100) / 100`  
Operator precedence: `(Number(dailyReturn) * pct) / 100 * 100` equals `dailyReturn * pct`, not `dailyReturn * pct / 100`. This is a rounding artefact only — the `/100` for the percentage conversion appears earlier, so the actual computation is:  
`Math.round( (dailyReturn * pct / 100) * 100 ) / 100`  
Which rounds to 2 decimal places correctly. ✓

**Zero-commission guard:** `if (commission <= 0) continue;` — skips pct=0 levels. ✓

**Error containment:** outer `try/catch` catches settings/profile-fetch failures and logs without throwing. Inner `try/catch` per level isolates a single-level failure from the others. ✓

**Caller in `ActiveInvestments.jsx` line 64:** called once per `handleClaim` invocation with `profile.id` and `investment.daily_return`. Wrapped in its own `try/catch` so a commission failure never surfaces to the user or blocks the UI. ✓

**`handleClaimMissed` does not call `payReferralCommission`** — that is pre-existing behaviour, out of scope.

---

## 2. `Settings.jsx`

**Three L1/L2/L3 fields:**  
- State keys: `referral_commission_l1_pct`, `referral_commission_l2_pct`, `referral_commission_l3_pct`. ✓  
- `useEffect` loads from `s.referral_commission_l1_pct ?? '10'`, l2 `?? '5'`, l3 `?? '2'`. ✓  
- `handleSave` validates each `0–100` with individual error messages. ✓  
- `Promise.all` upserts all three keys: `'referral_commission_l1_pct'`, `'referral_commission_l2_pct'`, `'referral_commission_l3_pct'`. ✓

**Old `referral_commission_pct` field:** not present anywhere in the JSX or the form state. The old single-percentage input is fully removed from the referral settings section. ✓

---

## 3. `supabase-schema.sql` migration block

Appended at the bottom of the file (after the existing `THEME PREFERENCE` and `PAY REFERRAL COMMISSION FUNCTION` blocks):

```sql
-- REFERRAL 3-LEVEL COMMISSION MIGRATION
INSERT INTO public.settings (key, value) VALUES ('referral_commission_l1_pct', '10') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.settings (key, value) VALUES ('referral_commission_l2_pct', '5')  ON CONFLICT (key) DO NOTHING;
INSERT INTO public.settings (key, value) VALUES ('referral_commission_l3_pct', '2')  ON CONFLICT (key) DO NOTHING;
-- Keep old key for backward compat but new code uses l1/l2/l3 keys
```

No existing DDL modified. `ON CONFLICT DO NOTHING` is safe on re-run. No new schema columns added — walks via the existing `referred_by` column on `profiles`. ✓

---

## 4. `Referral.jsx`

No functional changes. Stats display (`totalEarned`) aggregates all `referral_commission` transactions for the user, which now includes L2 and L3 commissions received — correct by design, no changes needed. ✓

---

## 5. Checklist

| Requirement | Status |
|---|---|
| Walks referred_by 3 levels | ✓ |
| Never throws (all errors caught internally) | ✓ |
| Skips null referrers | ✓ |
| Commission formula `Math.round((dailyReturn * pct / 100) * 100) / 100` | ✓ |
| Settings has L1/L2/L3 fields | ✓ |
| Loads from l1_pct / l2_pct / l3_pct keys | ✓ |
| Saves to l1_pct / l2_pct / l3_pct keys | ✓ |
| Each field validates 0–100 | ✓ |
| Old `referral_commission_pct` field gone from referral section | ✓ |
| Migration appended without modifying existing content | ✓ |
| `npm run build` exit 0 | ✓ (commit message) |
| No TypeScript, no new libraries, no test runner, no dev server restart, no git push | ✓ |

---

**Verdict: APPROVED** — No blockers found.
