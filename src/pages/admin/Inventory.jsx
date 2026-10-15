import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { getProducts, upsertProduct, updateProduct, deleteProduct } from '../../lib/db';

const EMPTY_FORM = {
  name: '', price: '', daily_return: '', duration_days: 30,
  description: '', image_url: '', active: true,
};

export function Inventory() {
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [editingPriceId, setEditingPriceId] = useState(null);
  const [editingPriceVal, setEditingPriceVal] = useState('');
  const [editingReturnId, setEditingReturnId] = useState(null);
  const [editingReturnVal, setEditingReturnVal] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  useEffect(() => {
    getProducts().then((data) => { setProductList(data); setLoading(false); });
  }, []);

  function openAdd() { setEditingProduct(null); setForm(EMPTY_FORM); setShowModal(true); }
  function openEdit(p) {
    setEditingProduct(p);
    setForm({
      name: p.name, price: p.price, daily_return: p.daily_return,
      duration_days: p.duration_days, description: p.description ?? '',
      image_url: p.image_url ?? '', active: p.active,
    });
    setShowModal(true);
  }
  function closeModal() { setShowModal(false); setEditingProduct(null); }
  const set = (f, v) => setForm((prev) => ({ ...prev, [f]: v }));

  async function handleSave() {
    if (!form.name || !form.price || !form.daily_return || !form.duration_days) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        price: Number(form.price),
        daily_return: Number(form.daily_return),
        duration_days: Number(form.duration_days),
        description: form.description,
        image_url: form.image_url,
        active: form.active,
      };
      if (editingProduct) {
        const updated = await updateProduct(editingProduct.id, payload);
        setProductList((prev) => prev.map((p) => p.id === editingProduct.id ? updated : p));
      } else {
        const created = await upsertProduct(payload);
        setProductList((prev) => [...prev, created]);
      }
      closeModal();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    await deleteProduct(id);
    setProductList((prev) => prev.filter((p) => p.id !== id));
    setDeleteConfirmId(null);
  }

  async function savePriceEdit(id) {
    const val = parseFloat(editingPriceVal);
    if (!isNaN(val) && val > 0) {
      const updated = await updateProduct(id, { price: val });
      setProductList((prev) => prev.map((p) => p.id === id ? updated : p));
    }
    setEditingPriceId(null);
  }

  async function saveReturnEdit(id) {
    const val = parseFloat(editingReturnVal);
    if (!isNaN(val) && val > 0) {
      const updated = await updateProduct(id, { daily_return: val });
      setProductList((prev) => prev.map((p) => p.id === id ? updated : p));
    }
    setEditingReturnId(null);
  }

  async function toggleActive(id, current) {
    const updated = await updateProduct(id, { active: !current });
    setProductList((prev) => prev.map((p) => p.id === id ? updated : p));
  }

  const inputClass = 'w-full bg-[#0a0a0f] border border-[#2a2a38] rounded-lg px-3 py-2 text-sm text-[#f0f0ff] placeholder-[#8888aa] outline-none focus:border-[#00d4ff] transition-colors';
  const totalReturn = Number(form.daily_return || 0) * Number(form.duration_days || 0);

  if (loading) return <div className="flex items-center justify-center h-64 text-[#8888aa]">Loading...</div>;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#f0f0ff]">Product Management</h1>
          <p className="text-sm text-[#8888aa] mt-1">Manage investment products, pricing, and returns.</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm bg-[#00d4ff] text-black hover:opacity-90 transition-all">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: productList.length, color: '#f0f0ff' },
          { label: 'Active', value: productList.filter((p) => p.active).length, color: '#00ff88' },
          { label: 'Inactive', value: productList.filter((p) => !p.active).length, color: '#8888aa' },
        ].map((s) => (
          <div key={s.label} className="glass-card p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-[#8888aa] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ background: '#0a0a0f' }}>
              <tr>
                {['Product', 'Price (₵)', 'Daily Return', 'Duration', 'Total Return', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#8888aa] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {productList.map((product) => (
                <tr key={product.id} style={{ borderBottom: '1px solid #2a2a38' }}>
                  {/* Product */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-[#0a0a0f]" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-[#2a2a38] flex items-center justify-center flex-shrink-0">
                          <span className="text-[#8888aa] text-xs">No img</span>
                        </div>
                      )}
                      <span className="font-medium text-[#f0f0ff] whitespace-nowrap">{product.name}</span>
                    </div>
                  </td>

                  {/* Inline price */}
                  <td className="px-4 py-3">
                    {editingPriceId === product.id ? (
                      <div className="flex items-center gap-1">
                        <input type="number" value={editingPriceVal}
                          onChange={(e) => setEditingPriceVal(e.target.value)}
                          className="w-20 bg-[#0a0a0f] border border-[#00d4ff] rounded px-2 py-1 text-xs text-[#f0f0ff] outline-none" autoFocus />
                        <button onClick={() => savePriceEdit(product.id)} className="text-[#00ff88]"><Save size={14} /></button>
                        <button onClick={() => setEditingPriceId(null)} className="text-red-400"><X size={14} /></button>
                      </div>
                    ) : (
                      <span className="text-[#f0f0ff] cursor-pointer hover:text-[#00d4ff] transition-colors"
                        onClick={() => { setEditingPriceId(product.id); setEditingPriceVal(String(product.price)); }}>
                        ₵{product.price}
                      </span>
                    )}
                  </td>

                  {/* Inline daily return */}
                  <td className="px-4 py-3">
                    {editingReturnId === product.id ? (
                      <div className="flex items-center gap-1">
                        <input type="number" value={editingReturnVal}
                          onChange={(e) => setEditingReturnVal(e.target.value)}
                          className="w-20 bg-[#0a0a0f] border border-[#00d4ff] rounded px-2 py-1 text-xs text-[#f0f0ff] outline-none" autoFocus />
                        <button onClick={() => saveReturnEdit(product.id)} className="text-[#00ff88]"><Save size={14} /></button>
                        <button onClick={() => setEditingReturnId(null)} className="text-red-400"><X size={14} /></button>
                      </div>
                    ) : (
                      <span className="cursor-pointer hover:text-[#00d4ff] transition-colors" style={{ color: '#00ff88' }}
                        onClick={() => { setEditingReturnId(product.id); setEditingReturnVal(String(product.daily_return)); }}>
                        +₵{product.daily_return}/day
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-[#8888aa]">{product.duration_days} days</td>
                  <td className="px-4 py-3" style={{ color: '#00ff88' }}>₵{product.daily_return * product.duration_days}</td>

                  {/* Toggle */}
                  <td className="px-4 py-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={product.active}
                        onChange={() => toggleActive(product.id, product.active)} className="sr-only peer" />
                      <div className="w-10 h-5 rounded-full peer transition-colors peer-checked:bg-[#00ff88] bg-[#2a2a38] after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-5" />
                    </label>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    {deleteConfirmId === product.id ? (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-[#8888aa]">Delete?</span>
                        <button onClick={() => handleDelete(product.id)} className="text-red-400 font-semibold">Yes</button>
                        <button onClick={() => setDeleteConfirmId(null)} className="text-[#8888aa]">No</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(product)}
                          className="p-1.5 rounded-lg hover:bg-[#00d4ff]/10 text-[#00d4ff] transition-colors">
                          <Edit size={15} />
                        </button>
                        <button onClick={() => setDeleteConfirmId(product.id)}
                          className="p-1.5 rounded-lg hover:bg-red-900/20 text-red-400 transition-colors">
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
      <Modal isOpen={showModal} onClose={closeModal} title={editingProduct ? 'Edit Product' : 'Add New Product'}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-[#8888aa] mb-1">Name</label>
            <input className={inputClass} type="text" placeholder="Product name"
              value={form.name} onChange={(e) => set('name', e.target.value)} />
          </div>

          <div>
            <label className="block text-xs text-[#8888aa] mb-1">Image URL</label>
            <input className={inputClass} type="url" placeholder="https://example.com/image.jpg"
              value={form.image_url} onChange={(e) => set('image_url', e.target.value)} />
            {form.image_url && (
              <img src={form.image_url} alt="Preview"
                className="mt-2 w-full h-32 object-cover rounded-lg bg-[#0a0a0f]"
                onError={(e) => { e.target.style.display = 'none'; }} />
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#8888aa] mb-1">Price (₵)</label>
              <input className={inputClass} type="number" placeholder="0"
                value={form.price} onChange={(e) => set('price', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-[#8888aa] mb-1">Daily Return (₵/day)</label>
              <input className={inputClass} type="number" placeholder="0"
                value={form.daily_return} onChange={(e) => set('daily_return', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#8888aa] mb-1">Duration (days)</label>
            <input className={inputClass} type="number" placeholder="30"
              value={form.duration_days} onChange={(e) => set('duration_days', e.target.value)} />
          </div>

          <div>
            <label className="block text-xs text-[#8888aa] mb-1">Description</label>
            <textarea className={inputClass} placeholder="Product description..." rows={2}
              value={form.description} onChange={(e) => set('description', e.target.value)} />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="active-check" checked={form.active}
              onChange={(e) => set('active', e.target.checked)} className="accent-[#00d4ff] w-4 h-4" />
            <label htmlFor="active-check" className="text-sm text-[#8888aa] cursor-pointer">
              Active (visible to users)
            </label>
          </div>

          <div className="bg-[#0a0a0f] rounded-lg px-3 py-2 text-sm">
            <span className="text-[#8888aa]">Total Return: </span>
            <span style={{ color: '#00ff88' }}>₵{totalReturn}</span>
          </div>

          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving}
              className="flex-1 py-2.5 rounded-lg font-bold text-sm bg-[#00d4ff] text-black hover:opacity-90 disabled:opacity-50 transition-all">
              {saving ? 'Saving...' : 'Save Product'}
            </button>
            <button onClick={closeModal}
              className="flex-1 py-2.5 rounded-lg font-bold text-sm border border-[#2a2a38] text-[#8888aa] hover:text-[#f0f0ff] transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
