import { useState } from 'react';
import { Wallet as WalletIcon, Plus, TrendingUp, TrendingDown, Star } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { userMetrics, walletTransactions } from '../../data/mockData';

const PRESETS = [10, 25, 50, 100];

export function Wallet() {
  const [balance, setBalance] = useState(userMetrics.walletBalance);
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [transactions, setTransactions] = useState(walletTransactions);

  const handleAddFunds = () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) return;
    setBalance((b) => b + val);
    setTransactions((t) => [{ id: Date.now(), type: 'credit', description: 'Funds Added', date: new Date().toISOString().slice(0, 10), amount: val }, ...t]);
    setAmount('');
    setShowModal(false);
  };

  const points = userMetrics.loyaltyPoints;
  const nextTier = 5000;
  const progress = Math.min((points / nextTier) * 100, 100);

  return (
    <div className="space-y-6">
      <div className="glass-card p-8 text-center" style={{border: '1px solid rgba(0,212,255,0.3)'}}>
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#ff6b35]/10 mb-4">
          <WalletIcon size={28} className="text-[#ff6b35]" />
        </div>
        <p className="text-[#8888aa] text-sm mb-1">Current Balance</p>
        <p className="text-4xl font-black text-[#f0f0ff] mb-6" style={{textShadow: '0 0 20px rgba(0,212,255,0.3)'}}>
          ${balance.toFixed(2)}
        </p>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#00d4ff] text-black font-semibold hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] transition-all"
        ><Plus size={18} /> Add Funds</button>
      </div>

      <div className="glass-card p-5">
        <h3 className="text-base font-semibold text-[#f0f0ff] mb-4">Recent Transactions</h3>
        <div className="space-y-3">
          {transactions.map((t) => (
            <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center ${ t.type === 'credit' ? 'bg-green-900/40' : 'bg-red-900/40'}`}>
                {t.type === 'credit' ? <TrendingUp size={16} className="text-green-400" /> : <TrendingDown size={16} className="text-red-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#f0f0ff] truncate">{t.description}</p>
                <p className="text-xs text-[#8888aa]">{t.date}</p>
              </div>
              <span className={`font-semibold text-sm ${t.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                {t.type === 'credit' ? '+' : ''}${Math.abs(t.amount).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-[#f0f0ff]">Loyalty Points</h3>
          <div className="flex items-center gap-1 text-[#00ff88]"><Star size={16} fill="currentColor" /><span className="font-bold">{points.toLocaleString()}</span></div>
        </div>
        <div className="mb-2">
          <div className="w-full bg-[#2a2a3a] rounded-full h-2">
            <div className="h-2 rounded-full bg-gradient-to-r from-[#00d4ff] to-[#00ff88] transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="flex justify-between text-xs text-[#8888aa]">
          <span>{points.toLocaleString()} pts</span>
          <span>{nextTier.toLocaleString()} pts (Gold Tier)</span>
        </div>
        <p className="text-xs text-[#8888aa] mt-2">{nextTier - points} points to next reward tier</p>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Funds">
        <div className="space-y-4">
          <p className="text-sm text-[#8888aa]">Select an amount or enter a custom value:</p>
          <div className="grid grid-cols-4 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => setAmount(p.toString())}
                className={`py-2 rounded-lg text-sm font-medium border transition-all ${
                  amount === p.toString() ? 'border-[#00d4ff] bg-[#00d4ff]/10 text-[#00d4ff]' : 'border-[#2a2a3a] text-[#8888aa] hover:text-[#f0f0ff]'
                }`}
              >${p}</button>
            ))}
          </div>
          <input
            type="number"
            placeholder="Custom amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-[#111118] border border-[#2a2a3a] rounded-lg px-4 py-3 text-[#f0f0ff] text-sm placeholder-[#8888aa] focus:outline-none focus:border-[#00d4ff] transition-colors"
          />
          <button
            onClick={handleAddFunds}
            className="w-full py-3 rounded-lg bg-[#00d4ff] text-black font-semibold text-sm hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] transition-all"
          >Confirm Add Funds</button>
        </div>
      </Modal>
    </div>
  );
}
