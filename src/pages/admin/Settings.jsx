import { useEffect, useState } from 'react';
import { Save, Smartphone } from 'lucide-react';
import { getSettings, upsertSetting } from '../../lib/db';

const NETWORKS = ['MTN', 'Vodafone', 'AirtelTigo'];

const inputClass =
  'w-full bg-[#1a1a24] border border-[#2a2a3a] rounded-lg px-4 py-3 text-[#f0f0ff] text-sm placeholder-[#8888aa] focus:outline-none focus:border-[#00d4ff] transition-all';

export function Settings() {
  const [form, setForm] = useState({ momo_number: '', momo_name: '', momo_network: 'MTN' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    getSettings().then((s) => {
      setForm({
        momo_number:  s.momo_number  ?? '',
        momo_name:    s.momo_name    ?? '',
        momo_network: s.momo_network ?? 'MTN',
      });
      setLoading(false);
    });
  }, []);

  async function handleSave() {
    if (!form.momo_number.trim()) { setError('Mobile money number is required.'); return; }
    if (!form.momo_name.trim())   { setError('Account name is required.'); return; }
    setError('');
    setSaving(true);
    try {
      await Promise.all([
        upsertSetting('momo_number',  form.momo_number.trim()),
        upsertSetting('momo_name',    form.momo_name.trim()),
        upsertSetting('momo_network', form.momo_network),
      ]);
      setSuccess('Payment details saved successfully.');
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
          <h3 className="text-base font-semibold text-[#f0f0ff]">Mobile Money Details</h3>
        </div>

        {/* Network */}
        <div>
          <label className="text-xs text-[#8888aa] font-medium mb-2 block">Network</label>
          <div className="flex gap-2">
            {NETWORKS.map((n) => (
              <button key={n}
                onClick={() => setForm((f) => ({ ...f, momo_network: n }))}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-all ${
                  form.momo_network === n
                    ? 'border-[#00d4ff] bg-[#00d4ff]/10 text-[#00d4ff]'
                    : 'border-[#2a2a3a] text-[#8888aa] hover:text-[#f0f0ff]'
                }`}>
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Number */}
        <div>
          <label className="text-xs text-[#8888aa] font-medium mb-2 block">Mobile Money Number</label>
          <input
            type="text"
            placeholder="e.g. 0241234567"
            value={form.momo_number}
            onChange={(e) => setForm((f) => ({ ...f, momo_number: e.target.value }))}
            className={inputClass}
          />
        </div>

        {/* Name */}
        <div>
          <label className="text-xs text-[#8888aa] font-medium mb-2 block">Account Name</label>
          <input
            type="text"
            placeholder="e.g. Nexus GG"
            value={form.momo_name}
            onChange={(e) => setForm((f) => ({ ...f, momo_name: e.target.value }))}
            className={inputClass}
          />
        </div>

        {error && <p className="text-red-400 text-sm bg-red-900/20 rounded-lg px-3 py-2">{error}</p>}
        {success && <p className="text-[#00ff88] text-sm bg-green-900/20 rounded-lg px-3 py-2">{success}</p>}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-[#00d4ff] text-black font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50">
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Payment Details'}
        </button>
      </div>

      {/* Preview */}
      <div className="glass-card p-5">
        <p className="text-xs font-semibold text-[#8888aa] uppercase tracking-wide mb-3">Preview — what users will see</p>
        <div className="p-4 rounded-lg bg-[#00d4ff]/5 border border-[#00d4ff]/20 space-y-2">
          <p className="text-xs font-semibold text-[#00d4ff] uppercase tracking-wide mb-2">Send payment to</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-xs text-[#8888aa]">Network</p>
              <p className="text-[#f0f0ff] font-semibold">{form.momo_network || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-[#8888aa]">Number</p>
              <p className="text-[#f0f0ff] font-semibold">{form.momo_number || '—'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-[#8888aa]">Account Name</p>
              <p className="text-[#f0f0ff] font-semibold">{form.momo_name || '—'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
