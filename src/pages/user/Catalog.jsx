import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getProducts, createInvestment, createTransaction, updateWalletBalance, getUserActiveInvestmentIds, applyReferralBonus } from '../../lib/db';
import { Modal } from '../../components/ui/Modal';

const ACCENT_COLORS = ['#00d4ff', '#7c3aed', '#00ff88', '#ff6b35', '#f59e0b', '#ec4899'];

export function Catalog() {
  const { profile, refreshProfile } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalMsg, setModalMsg] = useState('');
  const [modalError, setModalError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [ownedProductIds, setOwnedProductIds] = useState(new Set());

  useEffect(() => {
    getProducts(true).then((data) => { setProducts(data); setLoading(false); });
  }, []);

  useEffect(() => {
    if (profile) {
      setWalletBalance(Number(profile.wallet_balance));
      getUserActiveInvestmentIds(profile.id)
        .then((ids) => setOwnedProductIds(new Set(ids)))
        .catch(() => {});
    }
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
      setModalError('Insufficient balance. Please deposit funds.');
      return;
    }
    setConfirming(true);
    setModalError('');
    try {
      const newBalance = walletBalance - selectedProduct.price;
      // Deduct wallet
      await updateWalletBalance(profile.id, newBalance);
      // Create investment record
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
      // Record transaction
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
      setModalMsg(`Investment successful! ₵${selectedProduct.price} deducted from wallet.`);
    } catch (err) {
      setModalError('Something went wrong. Please try again.');
    } finally {
      setConfirming(false);
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-[#8888aa]">Loading products...</div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#f0f0ff]">Investment Products</h1>
        <p className="text-sm text-[#8888aa] mt-1">Buy a product to start earning daily returns</p>
        <p className="text-sm mt-1" style={{ color: '#00d4ff' }}>
          Wallet Balance: ₵{walletBalance.toLocaleString()}
        </p>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full bg-[#1a1a24] border border-[#2a2a38] rounded-lg px-4 py-2.5 text-sm text-[#f0f0ff] placeholder-[#8888aa] outline-none focus:border-[#00d4ff] transition-colors"
      />

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="text-center text-[#8888aa] py-10">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((product, idx) => {
            const accent = ACCENT_COLORS[idx % ACCENT_COLORS.length];
            const totalReturn = product.daily_return * product.duration_days;
            return (
              <div key={product.id} className="relative flex flex-col rounded-xl overflow-hidden"
                style={{ background: '#1a1a24', border: '1px solid #2a2a38' }}>
                <div style={{ height: 4, background: accent }} />

                {!product.active && (
                  <div className="absolute top-4 right-3 z-10 bg-gray-700/90 text-gray-300 text-xs font-semibold px-2 py-1 rounded">
                    Unavailable
                  </div>
                )}

                <div className="p-5 flex flex-col flex-1">
                  {/* Product image */}
                  {product.image_url ? (
                    <div className="w-full h-36 rounded-lg overflow-hidden mb-4 bg-[#0a0a0f]">
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                  ) : null}

                  <h3 className="text-base font-bold text-[#f0f0ff] text-center mb-1">{product.name}</h3>
                  <p className="text-xs text-[#8888aa] text-center mb-4">{product.description}</p>

                  {/* Info chips */}
                  <div className="flex flex-wrap justify-center gap-2 mb-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-[#0a0a0f] text-[#f0f0ff] border border-[#2a2a38]">
                      ₵{product.price}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-[#0a0a0f] border border-[#2a2a38]"
                      style={{ color: '#00ff88' }}>
                      +₵{product.daily_return}/day
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-[#0a0a0f] text-[#8888aa] border border-[#2a2a38]">
                      {product.duration_days} days
                    </span>
                  </div>

                  <p className="text-center text-sm font-semibold mb-4" style={{ color: '#00ff88' }}>
                    Total Return: ₵{totalReturn}
                  </p>

                  <button
                    onClick={() => product.active && !ownedProductIds.has(product.id) && openModal(product)}
                    disabled={!product.active || ownedProductIds.has(product.id)}
                    className="w-full py-2.5 rounded-lg text-sm font-bold transition-opacity mt-auto"
                    style={{
                      background: product.active && !ownedProductIds.has(product.id) ? '#00d4ff' : '#2a2a38',
                      color: product.active && !ownedProductIds.has(product.id) ? '#000' : '#8888aa',
                      cursor: product.active && !ownedProductIds.has(product.id) ? 'pointer' : 'not-allowed',
                    }}>
                    {ownedProductIds.has(product.id) ? 'Already Invested' : product.active ? 'Invest Now' : 'Unavailable'}
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
              <img src={selectedProduct.image_url} alt={selectedProduct.name}
                className="w-full h-32 object-cover rounded-lg bg-[#0a0a0f]" />
            )}
            <div>
              <p className="font-bold text-[#f0f0ff]">{selectedProduct.name}</p>
              <p className="text-sm text-[#8888aa]">Price: ₵{selectedProduct.price}</p>
              <p className="text-sm" style={{ color: '#00ff88' }}>
                Daily Return: +₵{selectedProduct.daily_return}/day
              </p>
            </div>

            <div className="bg-[#0a0a0f] rounded-lg p-3 text-sm text-[#8888aa] space-y-1">
              <p>Duration: <span className="text-[#f0f0ff]">{selectedProduct.duration_days} days</span></p>
              <p>Total Return: <span style={{ color: '#00ff88' }}>₵{selectedProduct.daily_return * selectedProduct.duration_days}</span></p>
              <p>Balance After: <span className="text-[#f0f0ff]">₵{(walletBalance - selectedProduct.price).toFixed(2)}</span></p>
            </div>

            {modalError && (
              <p className="text-red-400 text-sm bg-red-900/20 rounded-lg px-3 py-2">{modalError}</p>
            )}
            {modalMsg && (
              <p className="text-[#00ff88] text-sm bg-green-900/20 rounded-lg px-3 py-2">{modalMsg}</p>
            )}

            {!modalMsg && (
              <button onClick={handleConfirm} disabled={confirming}
                className="w-full py-2.5 rounded-lg font-bold text-sm bg-[#00d4ff] text-black hover:opacity-90 transition-all disabled:opacity-50">
                {confirming ? 'Processing...' : 'Confirm Investment'}
              </button>
            )}
            <button onClick={closeModal}
              className="w-full py-2.5 rounded-lg font-bold text-sm border border-[#2a2a38] text-[#8888aa] hover:text-[#f0f0ff] transition-colors">
              {modalMsg ? 'Close' : 'Cancel'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
