import { useState } from 'react';
import { ArrowUpCircle, ArrowDownCircle, TrendingUp, ShoppingCart, Wallet as WalletIcon } from 'lucide-react';
import { walletTransactions, userMetrics } from '../../data/mockData';
import { Modal } from '../../components/ui/Modal';

const PRESET_AMOUNTS = [50, 100, 200, 500];

export function Wallet() {
  const [balance, setBalance] = useState(userMetrics.walletBalance);
  const [transactions, setTransactions] = useState([...walletTransactions]);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  // Deposit state
  const [depositAmount, setDepositAmount] = useState('');
  const [depositError, setDepositError] = useState('');

  // Withdraw state
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawError, setWithdrawError] = useState('');

  function handleDeposit() {
    const amt = parseFloat(depositAmount);
    if (!amt || amt <= 0) {
      setDepositError('Please enter a valid amount.');
      return;
    }
    setBalance((b) => b + amt);
    setTransactions((prev) => [
      {
        id: Date.now(),
        type: 'deposit',
        description: 'Wallet Deposit',
        date: new Date().toISOString().slice(0, 10),
        amount: amt,
      },
      ...prev,
    ]);
    setDepositAmount('');
    setDepositError('');
    setShowDeposit(false);
  }

  function handleWithdraw() {
    const amt = parseFloat(withdrawAmount);
    if (!amt || amt <= 0) {
      setWithdrawError('Please enter a valid amount.');
      return;
    }
    if (amt > balance) {
      setWithdrawError('Amount exceeds available balance.');
      return;
    }
    setBalance((b) => b - amt);
    setTransactions((prev) => [
      {
        id: Date.now(),
        type: 'withdrawal',
        description: 'Withdrawal to Bank',
        date: new Date().toISOString().slice(0, 10),
        amount: -amt,
      },
      ...prev,
    ]);
    setWithdrawAmount('');
    setWithdrawError('');
    setShowWithdraw(false);
  }

  function getTxIcon(type) {
    switch (type) {
      case 'deposit':
        return <ArrowUpCircle size={20} style={{ color: '#00ff88' }} />;
      case 'return':
        return <TrendingUp size={20} style={{ color: '#00ff88' }} />;
      case 'withdrawal':
        return <ArrowDownCircle size={20} style={{ color: '#ef4444' }} />;
      case 'purchase':
        return <ShoppingCart size={20} style={{ color: '#f59e0b' }} />;
      default:
        return <ArrowUpCircle size={20} style={{ color: '#8888aa' }} />;
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#f0f0ff]">Wallet</h1>
        <p className="text-sm text-[#8888aa] mt-1">Manage your deposits, withdrawals, and balance.</p>
      </div>

      {/* Balance Card */}
      <div
        className="glass-card p-8 text-center"
        style={{ borderColor: '#00d4ff44' }}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <WalletIcon size={20} style={{ color: '#00d4ff' }} />
          <span className="text-sm text-[#8888aa]">Available Balance</span>
        </div>
        <p
          className="text-5xl font-black text-[#f0f0ff] mb-6"
          style={{ textShadow: '0 0 20px #00d4ff' }}
        >
          ₵{balance.toLocaleString()}
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => { setShowDeposit(true); setDepositAmount(''); setDepositError(''); }}
            className="px-6 py-2.5 rounded-lg font-bold text-sm transition-opacity hover:opacity-90"
            style={{ background: '#00d4ff', color: '#000' }}
          >
            Deposit
          </button>
          <button
            onClick={() => { setShowWithdraw(true); setWithdrawAmount(''); setWithdrawError(''); }}
            className="px-6 py-2.5 rounded-lg font-bold text-sm border transition-colors hover:bg-[#00d4ff]/10"
            style={{ borderColor: '#00d4ff', color: '#00d4ff' }}
          >
            Withdraw
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Invested', value: `₵${userMetrics.totalInvested.toLocaleString()}`, color: '#00d4ff' },
          { label: 'Total Earned', value: `₵${userMetrics.totalEarned.toLocaleString()}`, color: '#00ff88' },
          { label: 'Available Balance', value: `₵${balance.toLocaleString()}`, color: '#f59e0b' },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-4 text-center">
            <p className="text-xs text-[#8888aa] mb-1">{stat.label}</p>
            <p className="text-xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Transaction History */}
      <div className="glass-card p-5">
        <h2 className="text-base font-semibold text-[#f0f0ff] mb-4">Transaction History</h2>
        <div className="space-y-3">
          {transactions.map((tx) => {
            const isPositive = tx.amount > 0;
            return (
              <div key={tx.id} className="flex items-center gap-3 py-2 border-b border-[#2a2a38] last:border-0">
                {getTxIcon(tx.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#f0f0ff] truncate">{tx.description}</p>
                  <p className="text-xs text-[#8888aa]">{tx.date}</p>
                </div>
                <span
                  className="text-sm font-semibold"
                  style={{ color: isPositive ? '#00ff88' : '#ef4444' }}
                >
                  {isPositive ? '+' : '-'}₵{Math.abs(tx.amount)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Deposit Modal */}
      <Modal isOpen={showDeposit} onClose={() => setShowDeposit(false)} title="Deposit Funds">
        <div className="space-y-4">
          <p className="text-sm text-[#8888aa]">Select a preset amount or enter a custom value.</p>
          <div className="grid grid-cols-4 gap-2">
            {PRESET_AMOUNTS.map((amt) => (
              <button
                key={amt}
                onClick={() => setDepositAmount(String(amt))}
                className="py-2 rounded-lg text-sm font-semibold border transition-colors"
                style={{
                  borderColor: depositAmount === String(amt) ? '#00d4ff' : '#2a2a38',
                  color: depositAmount === String(amt) ? '#00d4ff' : '#8888aa',
                  background: depositAmount === String(amt) ? '#00d4ff11' : 'transparent',
                }}
              >
                ₵{amt}
              </button>
            ))}
          </div>
          <input
            type="number"
            placeholder="Custom amount (₵)"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            className="w-full bg-[#0a0a0f] border border-[#2a2a38] rounded-lg px-4 py-2.5 text-sm text-[#f0f0ff] placeholder-[#8888aa] outline-none focus:border-[#00d4ff] transition-colors"
          />
          {depositError && <p className="text-red-400 text-sm">{depositError}</p>}
          <button
            onClick={handleDeposit}
            className="w-full py-2.5 rounded-lg font-bold text-sm"
            style={{ background: '#00d4ff', color: '#000' }}
          >
            Confirm Deposit
          </button>
        </div>
      </Modal>

      {/* Withdraw Modal */}
      <Modal isOpen={showWithdraw} onClose={() => setShowWithdraw(false)} title="Withdraw Funds">
        <div className="space-y-4">
          <p className="text-sm text-[#8888aa]">
            Available balance: <span className="text-[#f0f0ff] font-semibold">₵{balance.toLocaleString()}</span>
          </p>
          <input
            type="number"
            placeholder="Amount to withdraw (₵)"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            className="w-full bg-[#0a0a0f] border border-[#2a2a38] rounded-lg px-4 py-2.5 text-sm text-[#f0f0ff] placeholder-[#8888aa] outline-none focus:border-[#00d4ff] transition-colors"
          />
          {withdrawError && <p className="text-red-400 text-sm">{withdrawError}</p>}
          <button
            onClick={handleWithdraw}
            className="w-full py-2.5 rounded-lg font-bold text-sm"
            style={{ background: '#00d4ff', color: '#000' }}
          >
            Confirm Withdrawal
          </button>
        </div>
      </Modal>
    </div>
  );
}
