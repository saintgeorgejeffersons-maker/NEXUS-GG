import { useState } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { products } from '../../data/mockData';
import { Modal } from '../../components/ui/Modal';

const EMPTY_FORM = {
  name: '',
  price: '',
  dailyReturn: '',
  durationDays: 30,
  description: '',
  active: true,
};

export function Inventory() {
  const [productList, setProductList] = useState([...products]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null = adding new
  const [form, setForm] = useState(EMPTY_FORM);

  // Inline editing state
  const [editingPriceId, setEditingPriceId] = useState(null);
  const [editingPriceVal, setEditingPriceVal] = useState('');
  const [editingReturnId, setEditingReturnId] = useState(null);
  const [editingReturnVal, setEditingReturnVal] = useState('');

  // Delete confirm state
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  /* ---- helpers ---- */
  function openAdd() {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  }

  function openEdit(product) {
    setEditingProduct(product);
    setForm({
      name: product.name,
      price: product.price,
      dailyReturn: product.dailyReturn,
      durationDays: product.durationDays,
      description: product.description,
      active: product.active,
    });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingProduct(null);
  }

  function handleFormChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSave() {
    if (!form.name || !form.price || !form.dailyReturn || !form.durationDays) return;
    if (editingProduct) {
      setProductList((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? { ...p, ...form, price: Number(form.price), dailyReturn: Number(form.dailyReturn), durationDays: Number(form.durationDays) }
            : p
        )
      );
    } else {
      const newId = productList.length > 0 ? Math.max(...productList.map((p) => p.id)) + 1 : 1;
      setProductList((prev) => [
        ...prev,
        {
          id: newId,
          image: '🎮',
          name: form.name,
          price: Number(form.price),
          dailyReturn: Number(form.dailyReturn),
          durationDays: Number(form.durationDays),
          description: form.description,
          active: form.active,
        },
      ]);
    }
    closeModal();
  }

  function toggleActive(id) {
    setProductList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p))
    );
  }

  function confirmDelete(id) {
    setProductList((prev) => prev.filter((p) => p.id !== id));
    setDeleteConfirmId(null);
  }

  function savePriceEdit(id) {
    const val = parseFloat(editingPriceVal);
    if (!isNaN(val) && val > 0) {
      setProductList((prev) => prev.map((p) => (p.id === id ? { ...p, price: val } : p)));
    }
    setEditingPriceId(null);
  }

  function saveReturnEdit(id) {
    const val = parseFloat(editingReturnVal);
    if (!isNaN(val) && val > 0) {
      setProductList((prev) => prev.map((p) => (p.id === id ? { ...p, dailyReturn: val } : p)));
    }
    setEditingReturnId(null);
  }

  const totalReturn = Number(form.dailyReturn || 0) * Number(form.durationDays || 0);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#f0f0ff]">Product Management</h1>
          <p className="text-sm text-[#8888aa] mt-1">Manage investment products, pricing, and returns.</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm"
          style={{ background: '#00d4ff', color: '#000' }}
        >
          <Plus size={16} />
          Add New Product
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Products', value: productList.length, color: '#00d4ff' },
          { label: 'Active', value: productList.filter((p) => p.active).length, color: '#00ff88' },
          { label: 'Inactive', value: productList.filter((p) => !p.active).length, color: '#8888aa' },
        ].map((s) => (
          <div key={s.label} className="glass-card p-4 text-center">
            <p className="text-xs text-[#8888aa] mb-1">{s.label}</p>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Product Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ background: '#0a0a0f' }}>
              <tr>
                {['Product', 'Price (₵)', 'Daily Return (₵/day)', 'Duration (days)', 'Total Return (₵)', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#8888aa] uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {productList.map((product) => (
                <tr key={product.id} style={{ borderBottom: '1px solid #2a2a38' }}>
                  {/* Product */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{product.image}</span>
                      <span className="font-medium text-[#f0f0ff] whitespace-nowrap">{product.name}</span>
                    </div>
                  </td>

                  {/* Inline price edit */}
                  <td className="px-4 py-3">
                    {editingPriceId === product.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={editingPriceVal}
                          onChange={(e) => setEditingPriceVal(e.target.value)}
                          className="w-20 bg-[#0a0a0f] border border-[#00d4ff] rounded px-2 py-1 text-xs text-[#f0f0ff] outline-none"
                          autoFocus
                        />
                        <button onClick={() => savePriceEdit(product.id)} className="text-[#00ff88] hover:opacity-80">
                          <Save size={14} />
                        </button>
                        <button onClick={() => setEditingPriceId(null)} className="text-[#ef4444] hover:opacity-80">
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <span
                        className="text-[#f0f0ff] cursor-pointer hover:text-[#00d4ff] transition-colors"
                        onClick={() => { setEditingPriceId(product.id); setEditingPriceVal(String(product.price)); }}
                        title="Click to edit"
                      >
                        ₵{product.price}
                      </span>
                    )}
                  </td>

                  {/* Inline daily return edit */}
                  <td className="px-4 py-3">
                    {editingReturnId === product.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={editingReturnVal}
                          onChange={(e) => setEditingReturnVal(e.target.value)}
                          className="w-20 bg-[#0a0a0f] border border-[#00d4ff] rounded px-2 py-1 text-xs text-[#f0f0ff] outline-none"
                          autoFocus
                        />
                        <button onClick={() => saveReturnEdit(product.id)} className="text-[#00ff88] hover:opacity-80">
                          <Save size={14} />
                        </button>
                        <button onClick={() => setEditingReturnId(null)} className="text-[#ef4444] hover:opacity-80">
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <span
                        className="cursor-pointer hover:text-[#00d4ff] transition-colors"
                        style={{ color: '#00ff88' }}
                        onClick={() => { setEditingReturnId(product.id); setEditingReturnVal(String(product.dailyReturn)); }}
                        title="Click to edit"
                      >
                        +₵{product.dailyReturn}/day
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-[#8888aa]">{product.durationDays} days</td>
                  <td className="px-4 py-3" style={{ color: '#00ff88' }}>₵{product.dailyReturn * product.durationDays}</td>

                  {/* Active toggle */}
                  <td className="px-4 py-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={product.active}
                        onChange={() => toggleActive(product.id)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 rounded-full peer transition-colors peer-checked:bg-[#00ff88] bg-[#2a2a38] after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-5" />
                    </label>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    {deleteConfirmId === product.id ? (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-[#8888aa]">Delete?</span>
                        <button
                          onClick={() => confirmDelete(product.id)}
                          className="text-[#ef4444] font-semibold hover:opacity-80"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="text-[#8888aa] hover:text-[#f0f0ff]"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(product)}
                          className="p-1.5 rounded-lg transition-colors hover:bg-[#00d4ff]/10"
                          style={{ color: '#00d4ff' }}
                          title="Edit"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(product.id)}
                          className="p-1.5 rounded-lg transition-colors hover:bg-red-900/20"
                          style={{ color: '#ef4444' }}
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
      >
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs text-[#8888aa] mb-1">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              placeholder="Product name"
              className="w-full bg-[#0a0a0f] border border-[#2a2a38] rounded-lg px-3 py-2 text-sm text-[#f0f0ff] placeholder-[#8888aa] outline-none focus:border-[#00d4ff] transition-colors"
            />
          </div>

          {/* Price + Daily Return */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#8888aa] mb-1">Price (₵)</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => handleFormChange('price', e.target.value)}
                placeholder="0"
                className="w-full bg-[#0a0a0f] border border-[#2a2a38] rounded-lg px-3 py-2 text-sm text-[#f0f0ff] placeholder-[#8888aa] outline-none focus:border-[#00d4ff] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-[#8888aa] mb-1">Daily Return (₵/day)</label>
              <input
                type="number"
                value={form.dailyReturn}
                onChange={(e) => handleFormChange('dailyReturn', e.target.value)}
                placeholder="0"
                className="w-full bg-[#0a0a0f] border border-[#2a2a38] rounded-lg px-3 py-2 text-sm text-[#f0f0ff] placeholder-[#8888aa] outline-none focus:border-[#00d4ff] transition-colors"
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs text-[#8888aa] mb-1">Duration (days)</label>
            <input
              type="number"
              value={form.durationDays}
              onChange={(e) => handleFormChange('durationDays', e.target.value)}
              placeholder="30"
              className="w-full bg-[#0a0a0f] border border-[#2a2a38] rounded-lg px-3 py-2 text-sm text-[#f0f0ff] placeholder-[#8888aa] outline-none focus:border-[#00d4ff] transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs text-[#8888aa] mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              placeholder="Product description..."
              rows={2}
              className="w-full bg-[#0a0a0f] border border-[#2a2a38] rounded-lg px-3 py-2 text-sm text-[#f0f0ff] placeholder-[#8888aa] outline-none focus:border-[#00d4ff] transition-colors resize-none"
            />
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active-check"
              checked={form.active}
              onChange={(e) => handleFormChange('active', e.target.checked)}
              className="accent-[#00d4ff] w-4 h-4"
            />
            <label htmlFor="active-check" className="text-sm text-[#8888aa] cursor-pointer">
              Active (visible to users)
            </label>
          </div>

          {/* Live preview */}
          <div className="bg-[#0a0a0f] rounded-lg px-3 py-2 text-sm">
            <span className="text-[#8888aa]">Total Return: </span>
            <span style={{ color: '#00ff88' }}>₵{totalReturn}</span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="flex-1 py-2.5 rounded-lg font-bold text-sm"
              style={{ background: '#00d4ff', color: '#000' }}
            >
              Save Product
            </button>
            <button
              onClick={closeModal}
              className="flex-1 py-2.5 rounded-lg font-bold text-sm border border-[#2a2a38] text-[#8888aa] hover:text-[#f0f0ff] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
