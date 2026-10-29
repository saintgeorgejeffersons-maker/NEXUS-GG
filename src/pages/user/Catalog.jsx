import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getProducts, createInvestment, createTransaction,
  updateWalletBalance, getUserActiveInvestmentIds, applyReferralBonus,
} from '../../lib/db';
import { Modal } from '../../components/ui/Modal';
import { Search, CheckCircle } from 'lucide-react';

// Muted accent palette — varied but not neon
const ACCENT_COLORS = ['#4da6c8', '#7c6aad', '#3db87a', '#c97a4a', '#c4963a', '#b85c8a'];

export function Catalog() {
  const { profile, refreshProfile } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);
  const [ownedProductIds, setOwnedProductIds] = useState(new Set());

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalMsg, setModalMsg] = useState('');
  const [modalError, setModalError] = useState('');
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    getProducts(true).then((data) => { setProducts(data); setLoading(false); });
  }, []);

  useEffect(() => {
    if (!profile) return;
    setWalletBalance(Number(profile.wallet_balance));
    getUserActiveInvestmentIds(profile.id)
      .then((ids) => setOwnedProductIds(new Set(ids)))
      .catch(() => {});
  }, [profile]);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  function openModal(product) {
    setSelectedProduct(product);
    setModalMsg('');
    setModalError('');
  }

  function closeModal() {
    setSelectedProduct(null);
    setModalMsg('');
    setModalError('');
  }

  async function handleConfirm() {
    if (!selectedProduct || confirming) return;
    if (ownedProductIds.has(selectedProduct.id)) {
      setModalError('You already have an active investment in this product.');
      return;
    }
    if (walletBalance < selectedProduct.price) {
      setModalError('Insufficient balance. Please deposit funds first.');
      return;
    }
    setConfirming(true);
    setModalError('');
    try {
      const newBalance = walletBalance - selectedProduct.price;
      await updateWalletBalance(profile.id, newBalance);
      await createInvestment({
        user_id: profile.id,
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        price: selectedProduct.price,
        daily_return: selectedProduct.daily_return,
        duration_days: selectedProduct.duration_days,
        days_remaining: selectedProduct.duration_days,
        total_earned: 0,
        purchase_date: new Date().toISOString().slice(0, 10),
        active: true,
      });
      await createTransaction({
        user_id: profile.id,
        type: 'purchase',
        description: `Purchased: ${selectedProduct.name}`,
        amount: -selectedProduct.price,
      });
      setWalletBalance(newBalance);
      await refreshProfile();
      setOwnedProductIds((prev) => new Set([...prev, selectedProduct.id]));
      try { await applyReferralBonus(profile.id); } catch (_) {}
      setModalMsg(`Investment successful! ₵${selectedProduct.price} deducted.`);
    } catch (_) {
      setModalError('Something went wrong. Please try again.');
    } finally {
      setConfirming(false);
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-[#8888aa]">Loading...</div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-black text-[#f0f0ff]">Investment Store</p>
          <p className="text-xs text-[#8888aa]">Buy a product to earn daily returns</p>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-[#00d4ff]/10 border border-[#00d4ff]/20">
          <p className="text-xs text-[#8888aa]">Balance</p>
          <p className="text-sm font-bold text-[#00d4ff]">₵{walletBalance.toLocaleString()}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8888aa]" />
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#1a1a24] border border-[#2a2a3a] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#f0f0ff] placeholder-[#8888aa] focus:outline-none focus:border-[#00d4ff] transition-colors"
        />
      </div>

      {/* Product cards */}
      {filtered.length === 0 ? (
        <p className="text-center text-[#8888aa] py-10 text-sm">No products found.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((product, idx) => {
            const totalReturn = product.daily_return * product.duration_days;
            const owned = ownedProductIds.has(product.id);
            const accent = ACCENT_COLORS[idx % ACCENT_COLORS.length];
            return (
              <div
                key={product.id}
                className="rounded-2xl overflow-hidden"
                style={{ background: '#1a1a24', border: '1px solid #2a2a3a' }}
              >
                {/* Muted accent top line */}
                <div style={{ height: 3, background: accent }} />

                <div className="p-4">
                  {product.image_url && (
                    <div className="w-full h-32 rounded-xl overflow-hidden mb-3 bg-[#0a0a0f]">
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Name + daily badge */}
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-base font-bold text-[#f0f0ff] flex-1">{product.name}</p>
                    <span
                      className="text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0"
                      style={{ background: `${accent}20`, color: accent, border: `1px solid ${accent}40` }}
                    >
                      +₵{product.daily_return}/day
                    </span>
                  </div>

                  {product.description && (
                    <p className="text-xs text-[#8888aa] mb-3">{product.description}</p>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-[#0a0a0f] rounded-xl p-2 text-center">
                      <p className="text-xs text-[#8888aa]">Price</p>
                      <p className="text-sm font-bold text-[#f0f0ff]">₵{product.price}</p>
                    </div>
                    <div className="bg-[#0a0a0f] rounded-xl p-2 text-center">
                      <p className="text-xs text-[#8888aa]">Duration</p>
                      <p className="text-sm font-bold text-[#f0f0ff]">{product.duration_days}d</p>
                    </div>
                    <div className="bg-[#0a0a0f] rounded-xl p-2 text-center">
                      <p className="text-xs text-[#8888aa]">Total</p>
                      <p className="text-sm font-bold" style={{ color: accent }}>₵{totalReturn}</p>
                    </div>
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => product.active && !owned && openModal(product)}
                    disabled={!product.active || owned}
                    className={`w-full py-3 rounded-xl text-sm font-bold transition-all active:scale-[0.98] ${
                      owned
                        ? 'border border-[#2a2a3a] text-[#8888aa] cursor-not-allowed'
                        : !product.active
                        ? 'bg-[#2a2a3a] text-[#8888aa] cursor-not-allowed'
                        : 'hover:opacity-90'
                    }`}
                    style={product.active && !owned ? { background: accent, color: '#fff' } : {}}
                  >
                    {owned ? (
                      <span className="flex items-center justify-center gap-1.5">
                        <CheckCircle size={14} /> Already Invested
                      </span>
                    ) : product.active ? 'Invest Now' : 'Unavailable'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirm Modal */}
      {selectedProduct && (
        <Modal isOpen={!!selectedProduct} onClose={closeModal} title="Confirm Investment">
          <div className="space-y-4">
            {selectedProduct.image_url && (
              <img
                src={selectedProduct.image_url}
                alt={selectedProduct.name}
                className="w-full h-28 object-cover rounded-xl bg-[#0a0a0f]"
              />
            )}

            <div>
              <p className="font-bold text-[#f0f0ff] text-base">{selectedProduct.name}</p>
              <p className="text-xs text-[#8888aa] mt-0.5">{selectedProduct.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Price',         value: `₵${selectedProduct.price}`,                                        color: '#f0f0ff' },
                { label: 'Daily Return',  value: `+₵${selectedProduct.daily_return}/day`,                            color: '#3db87a' },
                { label: 'Duration',      value: `${selectedProduct.duration_days} days`,                             color: '#f0f0ff' },
                { label: 'Total Return',  value: `₵${selectedProduct.daily_return * selectedProduct.duration_days}`,  color: '#3db87a' },
                { label: 'Balance After', value: `₵${(walletBalance - selectedProduct.price).toFixed(2)}`,            color: '#f0f0ff' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-[#0a0a0f] rounded-xl p-3">
                  <p className="text-xs text-[#8888aa]">{label}</p>
                  <p className="text-sm font-bold mt-0.5" style={{ color }}>{value}</p>
                </div>
              ))}
            </div>

            {modalError && (
              <p className="text-red-400 text-sm bg-red-900/20 rounded-xl px-3 py-2">{modalError}</p>
            )}
            {modalMsg && (
              <p className="text-[#00ff88] text-sm bg-green-900/20 rounded-xl px-3 py-2">{modalMsg}</p>
            )}

            {!modalMsg && (
              <button
                onClick={handleConfirm}
                disabled={confirming}
                className="w-full py-3 rounded-xl font-bold text-sm bg-[#00d4ff] text-black hover:opacity-90 disabled:opacity-50"
              >
                {confirming ? 'Processing...' : 'Confirm Investment'}
              </button>
            )}
            <button
              onClick={closeModal}
              className="w-full py-3 rounded-xl font-bold text-sm border border-[#2a2a3a] text-[#8888aa]"
            >
              {modalMsg ? 'Close' : 'Cancel'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
