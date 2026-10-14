import { useState } from 'react';
import { products, userInvestments } from '../../data/mockData';
import { Modal } from '../../components/ui/Modal';

const ACCENT_COLORS = ['#00d4ff', '#7c3aed', '#00ff88', '#ff6b35', '#f59e0b', '#ec4899'];

export function Catalog() {
  const [search, setSearch] = useState('');
  const [activeOnly, setActiveOnly] = useState(false);
  const [walletBalance, setWalletBalance] = useState(747);
  const [investments, setInvestments] = useState([...userInvestments]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalMsg, setModalMsg] = useState('');
  const [modalError, setModalError] = useState('');

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchActive = activeOnly ? p.active : true;
    return matchSearch && matchActive;
  });

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

  function handleConfirm() {
    if (!selectedProduct) return;
    if (walletBalance < selectedProduct.price) {
      setModalError('Insufficient balance. Please deposit funds.');
      return;
    }
    setWalletBalance((b) => b - selectedProduct.price);
    setInvestments((prev) => [
      ...prev,
      {
        id: Date.now(),
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        price: selectedProduct.price,
        dailyReturn: selectedProduct.dailyReturn,
        durationDays: selectedProduct.durationDays,
        daysRemaining: selectedProduct.durationDays,
        totalEarned: 0,
        purchaseDate: new Date().toISOString().slice(0, 10),
      },
    ]);
    setModalError('');
    setModalMsg(`Investment successful! ₵${selectedProduct.price} deducted from wallet.`);
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#f0f0ff]">Investment Products</h1>
        <p className="text-sm text-[#8888aa] mt-1">Buy a product to start earning daily returns</p>
        <p className="text-sm text-[#00d4ff] mt-1">Wallet Balance: ₵{walletBalance}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-[#1a1a24] border border-[#2a2a38] rounded-lg px-4 py-2 text-sm text-[#f0f0ff] placeholder-[#8888aa] outline-none focus:border-[#00d4ff] transition-colors"
        />
        <label className="flex items-center gap-2 text-sm text-[#8888aa] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={activeOnly}
            onChange={(e) => setActiveOnly(e.target.checked)}
            className="accent-[#00d4ff] w-4 h-4"
          />
          Active Only
        </label>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((product) => {
          const accent = ACCENT_COLORS[(product.id - 1) % ACCENT_COLORS.length];
          const totalReturn = product.dailyReturn * product.durationDays;
          return (
            <div
              key={product.id}
              className="relative flex flex-col rounded-xl overflow-hidden"
              style={{ background: '#1a1a24', border: '1px solid #2a2a38' }}
            >
              {/* Top accent bar */}
              <div style={{ height: 4, background: accent }} />

              {!product.active && (
                <div className="absolute top-4 right-3 z-10 bg-gray-700/90 text-gray-300 text-xs font-semibold px-2 py-1 rounded">
                  Unavailable
                </div>
              )}

              <div className="p-5 flex flex-col flex-1">
                {/* Emoji */}
                <div className="text-5xl text-center mb-3">{product.image}</div>

                {/* Name & Description */}
                <h3 className="text-base font-bold text-[#f0f0ff] text-center mb-1">{product.name}</h3>
                <p className="text-xs text-[#8888aa] text-center mb-4">{product.description}</p>

                {/* Info chips */}
                <div className="flex flex-wrap justify-center gap-2 mb-3">
                  <span className="text-xs px-2 py-1 rounded-full bg-[#0a0a0f] text-[#f0f0ff] border border-[#2a2a38]">
                    ₵{product.price}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-[#0a0a0f] border border-[#2a2a38]" style={{ color: '#00ff88' }}>
                    +₵{product.dailyReturn}/day
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-[#0a0a0f] text-[#8888aa] border border-[#2a2a38]">
                    {product.durationDays} days
                  </span>
                </div>

                {/* Total return */}
                <p className="text-center text-sm font-semibold mb-4" style={{ color: '#00ff88' }}>
                  Total Return: ₵{totalReturn}
                </p>

                {/* Button */}
                <button
                  onClick={() => product.active && openModal(product)}
                  disabled={!product.active}
                  className="w-full py-2.5 rounded-lg text-sm font-bold transition-opacity mt-auto"
                  style={{
                    background: product.active ? '#00d4ff' : '#2a2a38',
                    color: product.active ? '#000' : '#8888aa',
                    cursor: product.active ? 'pointer' : 'not-allowed',
                  }}
                >
                  {product.active ? 'Invest Now' : 'Unavailable'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-[#8888aa] mt-10">No products found.</p>
      )}

      {/* Confirm Modal */}
      {selectedProduct && (
        <Modal isOpen={!!selectedProduct} onClose={closeModal} title="Confirm Investment">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{selectedProduct.image}</span>
              <div>
                <p className="font-bold text-[#f0f0ff]">{selectedProduct.name}</p>
                <p className="text-sm text-[#8888aa]">Price: ₵{selectedProduct.price}</p>
                <p className="text-sm" style={{ color: '#00ff88' }}>Daily Return: +₵{selectedProduct.dailyReturn}/day</p>
              </div>
            </div>

            <div className="bg-[#0a0a0f] rounded-lg p-3 text-sm text-[#8888aa]">
              <p>Duration: <span className="text-[#f0f0ff]">{selectedProduct.durationDays} days</span></p>
              <p>Total Return: <span style={{ color: '#00ff88' }}>₵{selectedProduct.dailyReturn * selectedProduct.durationDays}</span></p>
              <p>Your Balance After: <span className="text-[#f0f0ff]">₵{walletBalance - selectedProduct.price}</span></p>
            </div>

            {modalError && (
              <p className="text-red-400 text-sm bg-red-900/20 rounded-lg px-3 py-2">{modalError}</p>
            )}
            {modalMsg && (
              <p className="text-[#00ff88] text-sm bg-green-900/20 rounded-lg px-3 py-2">{modalMsg}</p>
            )}

            {!modalMsg && (
              <button
                onClick={handleConfirm}
                className="w-full py-2.5 rounded-lg font-bold text-sm"
                style={{ background: '#00d4ff', color: '#000' }}
              >
                Confirm Investment
              </button>
            )}
            <button
              onClick={closeModal}
              className="w-full py-2.5 rounded-lg font-bold text-sm border border-[#2a2a38] text-[#8888aa] hover:text-[#f0f0ff] transition-colors"
            >
              {modalMsg ? 'Close' : 'Cancel'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
