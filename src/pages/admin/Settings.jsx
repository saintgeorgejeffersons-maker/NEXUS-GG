import { useEffect, useState } from 'react';
import { Save, Smartphone, Percent, ArrowDownCircle, ArrowUpCircle, Info, MessageCircle, Trash2, Plus } from 'lucide-react';
import { getSettings, upsertSetting, getMomoAccounts, addMomoAccount, deleteMomoAccount } from '../../lib/db';

const NETWORKS = ['MTN', 'Vodafone', 'AirtelTigo'];

const inputClass =
  'w-full bg-[#1a1a24] border border-[#2a2a3a] rounded-lg px-4 py-3 text-[#f0f0ff] text-sm placeholder-[#8888aa] focus:outline-none focus:border-[#00d4ff] transition-all';

export function Settings() {
  const [form, setForm] = useState({
    referral_commission_l1_pct: '',
    referral_commission_l2_pct: '',
    referral_commission_l3_pct: '',
    referral_bonus_amount: '',
    missed_earnings_pct: '',
    min_deposit_amount: '',
    min_withdrawal_amount: '',
    withdrawal_fee_pct:    '',
    about_title:       '',
    about_tagline:     '',
    about_description: '',
    about_mission:     '',
    about_email:       '',
    about_phone:       '',
    about_website:     '',
    about_feat1_title: '',
    about_feat1_desc:  '',
    about_feat2_title: '',
    about_feat2_desc:  '',
    about_feat3_title: '',
    about_feat3_desc:  '',
    about_feat4_title: '',
    about_feat4_desc:  '',
    support_whatsapp:  '',
    support_telegram:  '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [momoAccounts, setMomoAccounts] = useState([]);
  const [momoLoading, setMomoLoading] = useState(true);
  const [addForm, setAddForm] = useState({ network: 'MTN', number: '', accountName: '' });
  const [addError, setAddError] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  async function loadMomoAccounts() {
    try {
      const list = await getMomoAccounts();
      setMomoAccounts(list);
    } catch { /* ignore */ }
    setMomoLoading(false);
  }

  useEffect(() => {
    getSettings().then((s) => {
      setForm({
        referral_commission_l1_pct: s.referral_commission_l1_pct ?? '10',
        referral_commission_l2_pct: s.referral_commission_l2_pct ?? '5',
        referral_commission_l3_pct: s.referral_commission_l3_pct ?? '2',
        referral_bonus_amount:   s.referral_bonus_amount   ?? '50',
        missed_earnings_pct:     s.missed_earnings_pct     ?? '50',
        min_deposit_amount:      s.min_deposit_amount      ?? '120',
        min_withdrawal_amount:   s.min_withdrawal_amount   ?? '50',
        withdrawal_fee_pct:      s.withdrawal_fee_pct      ?? '0',
        about_title:       s.about_title       ?? 'About NEXUS GG',
        about_tagline:     s.about_tagline     ?? 'Interactive Hardware Investment Platform  US · CA · UK · Ghana',
        about_description: s.about_description ?? 'Physical gaming hubs, from high-energy console lounges to competitive esports arenas, run on immediate, daily rental transactions. Every hour, gamers pay cash or tap their cards to play on top-tier consoles. Nexus GG bridges the gap through a high-yield, interactive model: On-Demand Fractional Hardware Deployment. First proven across esports centers in North America and Europe, Nexus GG puts investors directly in control of physical gaming assets, generating automated daily yield payouts whenever consoles are deployed for active play.',
        about_mission:     s.about_mission     ?? 'Ghana\'s gaming and esports community is experiencing exponential growth across Accra, Kumasi, and Takoradi. Nexus GG provides local gaming lounges with state-of-the-art hardware without heavy upfront debt, while opening direct asset-backed investment access to local and international investors. Start acquiring fractional console shares from as low as GHS 150 / $10, and receive daily yields directly into Mobile Money (MTN, Telecel, AT) or local bank accounts.',
        about_email:       s.about_email       ?? '',
        about_phone:       s.about_phone       ?? '',
        about_website:     s.about_website     ?? '',
        about_feat1_title: s.about_feat1_title ?? 'Daily Payouts',
        about_feat1_desc:  s.about_feat1_desc  ?? 'Revenue is routed directly to your wallet every 24 hours, no quarterly or annual waiting.',
        about_feat2_title: s.about_feat2_title ?? 'Physical Asset Backing',
        about_feat2_desc:  s.about_feat2_desc  ?? 'Your investment is backed by real, income-generating hardware, not paper assets or market speculation.',
        about_feat3_title: s.about_feat3_title ?? 'Click-to-Rent Control',
        about_feat3_desc:  s.about_feat3_desc  ?? 'You actively control when your console enters the lounge rental pool to earn daily returns.',
        about_feat4_title: s.about_feat4_title ?? 'Low Entry Barrier',
        about_feat4_desc:  s.about_feat4_desc  ?? 'Start acquiring fractional console shares in PS5s, Xbox, or SIM rigs from as low as GHS 150 / $10.',
        support_whatsapp:  s.support_whatsapp  ?? '',
        support_telegram:  s.support_telegram  ?? '',
      });
      setLoading(false);
    });
    getMomoAccounts().then((list) => {
      setMomoAccounts(list);
      setMomoLoading(false);
    }).catch(() => { setMomoLoading(false); });
  }, []);

  async function handleSave() {
    if (Number(form.referral_commission_l1_pct) < 0 || Number(form.referral_commission_l1_pct) > 100) {
      setError('L1 commission must be between 0 and 100%.'); return;
    }
    if (Number(form.referral_commission_l2_pct) < 0 || Number(form.referral_commission_l2_pct) > 100) {
      setError('L2 commission must be between 0 and 100%.'); return;
    }
    if (Number(form.referral_commission_l3_pct) < 0 || Number(form.referral_commission_l3_pct) > 100) {
      setError('L3 commission must be between 0 and 100%.'); return;
    }
    if (Number(form.referral_bonus_amount) < 0) {
      setError('Bonus amount must be 0 or more.'); return;
    }
    if (Number(form.missed_earnings_pct) < 0 || Number(form.missed_earnings_pct) > 100) {
      setError('Missed earnings % must be between 0 and 100%.'); return;
    }
    if (Number(form.min_deposit_amount) < 0) {
      setError('Minimum deposit must be 0 or more.'); return;
    }
    if (Number(form.min_withdrawal_amount) < 0) {
      setError('Minimum withdrawal must be 0 or more.'); return;
    }
    setError('');
    setSaving(true);
    try {
      await Promise.all([
        upsertSetting('referral_commission_l1_pct', String(form.referral_commission_l1_pct)),
        upsertSetting('referral_commission_l2_pct', String(form.referral_commission_l2_pct)),
        upsertSetting('referral_commission_l3_pct', String(form.referral_commission_l3_pct)),
        upsertSetting('referral_bonus_amount',   String(form.referral_bonus_amount)),
        upsertSetting('missed_earnings_pct',     String(form.missed_earnings_pct)),
        upsertSetting('min_deposit_amount',      String(form.min_deposit_amount)),
        upsertSetting('min_withdrawal_amount',   String(form.min_withdrawal_amount)),
        upsertSetting('withdrawal_fee_pct',      String(form.withdrawal_fee_pct)),
        upsertSetting('about_title',       form.about_title.trim()),
        upsertSetting('about_tagline',     form.about_tagline.trim()),
        upsertSetting('about_description', form.about_description.trim()),
        upsertSetting('about_mission',     form.about_mission.trim()),
        upsertSetting('about_email',       form.about_email.trim()),
        upsertSetting('about_phone',       form.about_phone.trim()),
        upsertSetting('about_website',     form.about_website.trim()),
        upsertSetting('about_feat1_title', form.about_feat1_title.trim()),
        upsertSetting('about_feat1_desc',  form.about_feat1_desc.trim()),
        upsertSetting('about_feat2_title', form.about_feat2_title.trim()),
        upsertSetting('about_feat2_desc',  form.about_feat2_desc.trim()),
        upsertSetting('about_feat3_title', form.about_feat3_title.trim()),
        upsertSetting('about_feat3_desc',  form.about_feat3_desc.trim()),
        upsertSetting('about_feat4_title', form.about_feat4_title.trim()),
        upsertSetting('about_feat4_desc',  form.about_feat4_desc.trim()),
        upsertSetting('support_whatsapp',  form.support_whatsapp.trim()),
        upsertSetting('support_telegram',  form.support_telegram.trim()),
      ]);
      setSuccess('Settings saved successfully.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError('Failed to save settings. Please try again.');
    }
    setSaving(false);
  }

  if (loading)
    return <div className="flex items-center justify-center h-64 text-[#8888aa]">Loading...</div>;

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#f0f0ff]">Settings</h2>
        <p className="text-sm text-[#8888aa]">Configure payment details shown to users on deposit.</p>
      </div>

      <div className="glass-card p-6 space-y-5">
        <div className="flex items-center gap-2 mb-2">
          <Smartphone size={18} className="text-[#00d4ff]" />
          <h3 className="text-base font-semibold text-[#f0f0ff]">Mobile Money Numbers</h3>
        </div>

        {momoLoading ? (
          <p className="text-sm text-[#8888aa]">Loading...</p>
        ) : momoAccounts.length === 0 ? (
          <p className="text-sm text-[#8888aa] py-2">No MoMo numbers added yet.</p>
        ) : (
          <div className="space-y-2">
            {momoAccounts.map((acc) => (
              <div key={acc.id} className="flex items-center justify-between p-3 rounded-xl border border-[#2a2a3a] bg-[#0a0a0f]">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold px-2 py-1 rounded-full bg-[#00d4ff]/10 text-[#00d4ff]">{acc.network}</span>
                  <div>
                    <p className="text-sm font-semibold text-[#f0f0ff]">{acc.number}</p>
                    <p className="text-xs text-[#8888aa]">{acc.account_name}</p>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    try {
                      await deleteMomoAccount(acc.id);
                      await loadMomoAccounts();
                    } catch { /* ignore */ }
                  }}
                  className="p-2 rounded-lg text-red-400 hover:bg-red-900/20 transition-all">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="pt-2 border-t border-[#2a2a3a] space-y-3">
          <p className="text-xs text-[#8888aa] font-semibold uppercase tracking-wide">Add Number</p>
          <div>
            <label className="text-xs text-[#8888aa] font-medium mb-2 block">Network</label>
            <div className="flex gap-2">
              {NETWORKS.map((n) => (
                <button key={n}
                  onClick={() => setAddForm((f) => ({ ...f, network: n }))}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-all ${
                    addForm.network === n
                      ? 'border-[#00d4ff] bg-[#00d4ff]/10 text-[#00d4ff]'
                      : 'border-[#2a2a3a] text-[#8888aa] hover:text-[#f0f0ff]'
                  }`}>
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-[#8888aa] font-medium mb-2 block">Number</label>
            <input
              type="text"
              placeholder="e.g. 0241234567"
              value={addForm.number}
              onChange={(e) => setAddForm((f) => ({ ...f, number: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-xs text-[#8888aa] font-medium mb-2 block">Account Name</label>
            <input
              type="text"
              placeholder="e.g. Nexus GG"
              value={addForm.accountName}
              onChange={(e) => setAddForm((f) => ({ ...f, accountName: e.target.value }))}
              className={inputClass}
            />
          </div>
          {addError && <p className="text-red-400 text-sm bg-red-900/20 rounded-lg px-3 py-2">{addError}</p>}
          <button
            onClick={async () => {
              if (!addForm.number.trim()) { setAddError('Number is required.'); return; }
              if (!addForm.accountName.trim()) { setAddError('Account name is required.'); return; }
              setAddError('');
              setAddLoading(true);
              try {
                await addMomoAccount(addForm.network, addForm.number.trim(), addForm.accountName.trim());
                setAddForm({ network: 'MTN', number: '', accountName: '' });
                await loadMomoAccounts();
              } catch {
                setAddError('Failed to add number. Please try again.');
              }
              setAddLoading(false);
            }}
            disabled={addLoading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-[#00d4ff] text-black font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50">
            <Plus size={16} />
            {addLoading ? 'Adding...' : 'Add Number'}
          </button>
        </div>
      </div>

      {/* Referral Settings */}
      <div className="glass-card p-6 space-y-5">
        <div className="flex items-center gap-2 mb-2">
          <Percent size={18} className="text-[#00d4ff]" />
          <h3 className="text-base font-semibold text-[#f0f0ff]">Referral Settings</h3>
        </div>

        <div>
          <label className="text-xs text-[#8888aa] font-medium mb-2 block">L1 Commission % (0-100)</label>
          <input
            type="number"
            min="0"
            max="100"
            placeholder="e.g. 10"
            value={form.referral_commission_l1_pct}
            onChange={(e) => setForm((f) => ({ ...f, referral_commission_l1_pct: e.target.value }))}
            className={inputClass}
          />
          <p className="text-xs text-[#8888aa] mt-1">Paid to the direct referrer (level 1) on each daily claim.</p>
        </div>
        <div>
          <label className="text-xs text-[#8888aa] font-medium mb-2 block">L2 Commission % (0-100)</label>
          <input
            type="number"
            min="0"
            max="100"
            placeholder="e.g. 5"
            value={form.referral_commission_l2_pct}
            onChange={(e) => setForm((f) => ({ ...f, referral_commission_l2_pct: e.target.value }))}
            className={inputClass}
          />
          <p className="text-xs text-[#8888aa] mt-1">Paid to the level-2 referrer (the referrer's referrer) on each daily claim.</p>
        </div>
        <div>
          <label className="text-xs text-[#8888aa] font-medium mb-2 block">L3 Commission % (0-100)</label>
          <input
            type="number"
            min="0"
            max="100"
            placeholder="e.g. 2"
            value={form.referral_commission_l3_pct}
            onChange={(e) => setForm((f) => ({ ...f, referral_commission_l3_pct: e.target.value }))}
            className={inputClass}
          />
          <p className="text-xs text-[#8888aa] mt-1">Paid to the level-3 referrer on each daily claim.</p>
        </div>

        <div>
          <label className="text-xs text-[#8888aa] font-medium mb-2 block">Signup Bonus Amount (₵)</label>
          <input
            type="number"
            min="0"
            placeholder="e.g. 50"
            value={form.referral_bonus_amount}
            onChange={(e) => setForm((f) => ({ ...f, referral_bonus_amount: e.target.value }))}
            className={inputClass}
          />
          <p className="text-xs text-[#8888aa] mt-1">One-time bonus credited to the referred user on their first investment.</p>
        </div>

        <div>
          <label className="text-xs text-[#8888aa] font-medium mb-2 block">Missed Earnings % (0–100)</label>
          <input
            type="number"
            min="0"
            max="100"
            placeholder="e.g. 50"
            value={form.missed_earnings_pct}
            onChange={(e) => setForm((f) => ({ ...f, missed_earnings_pct: e.target.value }))}
            className={inputClass}
          />
          <p className="text-xs text-[#8888aa] mt-1">Percentage of daily earnings paid when a user claims missed days.</p>
        </div>

        {error && <p className="text-red-400 text-sm bg-red-900/20 rounded-lg px-3 py-2">{error}</p>}
        {success && <p className="text-[#00ff88] text-sm bg-green-900/20 rounded-lg px-3 py-2">{success}</p>}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-[#00d4ff] text-black font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50">
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Referral Settings'}
        </button>
      </div>

      {/* Transaction Limits */}
      <div className="glass-card p-6 space-y-5">
        <div className="flex items-center gap-2 mb-2">
          <ArrowUpCircle size={18} className="text-[#00d4ff]" />
          <h3 className="text-base font-semibold text-[#f0f0ff]">Transaction Limits</h3>
        </div>

        <div>
          <label className="text-xs text-[#8888aa] font-medium mb-2 block">Minimum Deposit Amount (₵)</label>
          <input
            type="number"
            min="0"
            placeholder="e.g. 120"
            value={form.min_deposit_amount}
            onChange={(e) => setForm((f) => ({ ...f, min_deposit_amount: e.target.value }))}
            className={inputClass}
          />
          <p className="text-xs text-[#8888aa] mt-1">Users cannot submit a deposit request below this amount.</p>
        </div>

        <div>
          <label className="text-xs text-[#8888aa] font-medium mb-2 block">Minimum Withdrawal Amount (₵)</label>
          <input
            type="number"
            min="0"
            placeholder="e.g. 50"
            value={form.min_withdrawal_amount}
            onChange={(e) => setForm((f) => ({ ...f, min_withdrawal_amount: e.target.value }))}
            className={inputClass}
          />
          <p className="text-xs text-[#8888aa] mt-1">Users cannot submit a withdrawal request below this amount.</p>
        </div>

        <div>
          <label className="text-xs text-[#8888aa] font-medium mb-2 block">Withdrawal Processing Fee % (0–100)</label>
          <input
            type="number"
            min="0"
            max="100"
            placeholder="e.g. 5"
            value={form.withdrawal_fee_pct}
            onChange={(e) => setForm((f) => ({ ...f, withdrawal_fee_pct: e.target.value }))}
            className={inputClass}
          />
          <p className="text-xs text-[#8888aa] mt-1">Percentage deducted from the requested amount. Users will see a live breakdown in the withdrawal modal. Set to 0 to disable.</p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-[#00d4ff] text-black font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50">
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Limits'}
        </button>
      </div>

      {/* About Us */}
      <div className="glass-card p-6 space-y-5">
        <div className="flex items-center gap-2 mb-2">
          <Info size={18} className="text-[#00d4ff]" />
          <h3 className="text-base font-semibold text-[#f0f0ff]">About Us Page</h3>
        </div>

        {[
          { label: 'Page Title', key: 'about_title',   placeholder: 'e.g. About NEXUS GG' },
          { label: 'Tagline',    key: 'about_tagline', placeholder: 'e.g. Game. Invest. Earn.' },
          { label: 'Email',      key: 'about_email',   placeholder: 'e.g. support@nexusgg.com' },
          { label: 'Phone',      key: 'about_phone',   placeholder: 'e.g. +233 24 000 0000' },
          { label: 'Website',    key: 'about_website', placeholder: 'e.g. https://nexusgg.com' },
        ].map(({ label, key, placeholder }) => (
          <div key={key}>
            <label className="text-xs text-[#8888aa] font-medium mb-2 block">{label}</label>
            <input
              type="text"
              placeholder={placeholder}
              value={form[key]}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              className={inputClass}
            />
          </div>
        ))}

        {[
          { label: 'Description', key: 'about_description', placeholder: 'Tell users who you are...' },
          { label: 'Mission',     key: 'about_mission',     placeholder: 'Your mission statement...' },
        ].map(({ label, key, placeholder }) => (
          <div key={key}>
            <label className="text-xs text-[#8888aa] font-medium mb-2 block">{label}</label>
            <textarea
              rows={3}
              placeholder={placeholder}
              value={form[key]}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              className={`${inputClass} resize-none`}
            />
          </div>
        ))}

        <p className="text-xs text-[#8888aa] font-semibold uppercase tracking-wide pt-1">Feature Highlights</p>
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="space-y-2 p-3 rounded-xl border border-[#2a2a3a]">
            <p className="text-xs text-[#8888aa]">Feature {n}</p>
            <input
              type="text"
              placeholder="Title"
              value={form[`about_feat${n}_title`]}
              onChange={(e) => setForm((f) => ({ ...f, [`about_feat${n}_title`]: e.target.value }))}
              className={inputClass}
            />
            <input
              type="text"
              placeholder="Short description"
              value={form[`about_feat${n}_desc`]}
              onChange={(e) => setForm((f) => ({ ...f, [`about_feat${n}_desc`]: e.target.value }))}
              className={inputClass}
            />
          </div>
        ))}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-[#00d4ff] text-black font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50">
          <Save size={16} />
          {saving ? 'Saving...' : 'Save About Us'}
        </button>
      </div>

      {/* Support Channels */}
      <div className="glass-card p-6 space-y-5">
        <div className="flex items-center gap-2 mb-2">
          <MessageCircle size={18} className="text-[#00d4ff]" />
          <h3 className="text-base font-semibold text-[#f0f0ff]">Support Channels</h3>
        </div>
        <p className="text-xs text-[#8888aa] -mt-3">These links power the floating support widget visible to all users. Leave blank to hide a channel.</p>

        <div>
          <label className="text-xs text-[#8888aa] font-medium mb-2 block">WhatsApp Link</label>
          <input
            type="url"
            placeholder="e.g. https://wa.me/233241234567"
            value={form.support_whatsapp}
            onChange={(e) => setForm((f) => ({ ...f, support_whatsapp: e.target.value }))}
            className={inputClass}
          />
          <p className="text-xs text-[#8888aa] mt-1">Format: https://wa.me/&lt;countrycode&gt;&lt;number&gt;</p>
        </div>

        <div>
          <label className="text-xs text-[#8888aa] font-medium mb-2 block">Telegram Link</label>
          <input
            type="url"
            placeholder="e.g. https://t.me/nexusgg_support"
            value={form.support_telegram}
            onChange={(e) => setForm((f) => ({ ...f, support_telegram: e.target.value }))}
            className={inputClass}
          />
          <p className="text-xs text-[#8888aa] mt-1">Format: https://t.me/&lt;username&gt;</p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-[#00d4ff] text-black font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50">
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Support Links'}
        </button>
      </div>

    </div>
  );
}
