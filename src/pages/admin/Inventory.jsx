import { useState } from 'react';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { consoles as initialConsoles } from '../../data/mockData';

function stockVariant(s) {
  if (s === 'In Stock') return 'instock';
  if (s === 'Low Stock') return 'lowstock';
  if (s === 'Pre-Order') return 'preorder';
  return 'outofstock';
}

const EMPTY_FORM = { name: '', brand: 'PlayStation', price: '', stockCount: '', storage: '', resolution: '', fps: '', description: '', stockStatus: 'In Stock', tags: [] };

export function Inventory() {
  const [items, setItems] = useState(initialConsoles);
  const [editingPrice, setEditingPrice] = useState(null);
  const [tempPrice, setTempPrice] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState(null);

  const inStock = items.filter((i) => i.stockStatus === 'In Stock').length;
  const lowStock = items.filter((i) => i.stockStatus === 'Low Stock').length;
  const outOfStock = items.filter((i) => i.stockStatus === 'Out of Stock').length;

  const openAdd = () => { setForm(EMPTY_FORM); setEditItem(null); setShowModal(true); };
  const openEdit = (item) => {
    setForm({ name: item.name, brand: item.brand, price: item.price, stockCount: item.stockCount, storage: item.storage, resolution: item.resolution, fps: item.fps, description: item.description, stockStatus: item.stockStatus, tags: item.tags });
    setEditItem(item.id); setShowModal(true);
  };
  const handleSave = () => {
    if (!form.name || !form.price) return;
    if (editItem) {
      setItems((list) => list.map((i) => i.id === editItem ? { ...i, ...form, price: parseFloat(form.price), stockCount: parseInt(form.stockCount) || 0 } : i));
    } else {
      setItems((list) => [...list, { ...form, id: Date.now(), originalPrice: parseFloat(form.price), image: '🎮', price: parseFloat(form.price), stockCount: parseInt(form.stockCount) || 0 }]);
    }
    setShowModal(false);
  };
  const handleDelete = (id) => { setItems((list) => list.filter((i) => i.id !== id)); setDeleteId(null); };
  const handlePriceSave = (id) => {
    const val = parseFloat(tempPrice);
    if (!isNaN(val) && val > 0) setItems((list) => list.map((i) => i.id === id ? { ...i, price: val } : i));
    setEditingPrice(null);
  };
  const toggleActive = (id) => {
    setItems((list) => list.map((i) => i.id === id ? { ...i, stockStatus: i.stockStatus === 'Out of Stock' ? 'In Stock' : 'Out of Stock' } : i));
  };

  const inputClass = 'w-full bg-[#111118] border border-[#2a2a3a] rounded-lg px-3 py-2 text-[#f0f0ff] text-sm focus:outline-none focus:border-[#00d4ff] transition-colors';

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#00d4ff] text-black text-sm font-medium hover:shadow-[0_0_15px_rgba(0,212,255,0.4)] transition-all">
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[{ label: 'Total', value: items.length, color: '#f0f0ff' }, { label: 'In Stock', value: inStock, color: '#00ff88' }, { label: 'Low Stock', value: lowStock, color: '#ff6b35' }, { label: 'Out of Stock', value: outOfStock, color: '#ef4444' }].map((s) => (
          <div key={s.label} className="glass-card p-4 text-center">
            <p className="text-2xl font-bold" style={{color: s.color}}>{s.value}</p>
            <p className="text-xs text-[#8888aa] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#8888aa] border-b border-[#2a2a3a]">
                <th className="p-4">Product</th>
                <th className="p-4 hidden md:table-cell">Brand</th>
                <th className="p-4">Price</th>
                <th className="p-4 hidden sm:table-cell">Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4">Active</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a3a]">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{item.image}</span>
                      <span className="text-[#f0f0ff] font-medium max-w-[140px] truncate">{item.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-[#8888aa] hidden md:table-cell">{item.brand}</td>
                  <td className="p-4">
                    {editingPrice === item.id ? (
                      <div className="flex items-center gap-1">
                        <input type="number" value={tempPrice} onChange={(e) => setTempPrice(e.target.value)}
                          className="w-20 bg-[#111118] border border-[#00d4ff] rounded px-2 py-1 text-xs text-[#f0f0ff] focus:outline-none" />
                        <button onClick={() => handlePriceSave(item.id)} className="text-green-400 hover:text-green-300"><Check size={14} /></button>
                        <button onClick={() => setEditingPrice(null)} className="text-red-400 hover:text-red-300"><X size={14} /></button>
                      </div>
                    ) : (
                      <button onClick={() => { setEditingPrice(item.id); setTempPrice(item.price.toString()); }}
                        className="text-[#00d4ff] font-medium hover:underline">${item.price.toFixed(2)}</button>
                    )}
                  </td>
                  <td className="p-4 text-[#f0f0ff] hidden sm:table-cell">{item.stockCount}</td>
                  <td className="p-4"><Badge variant={stockVariant(item.stockStatus)}>{item.stockStatus}</Badge></td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleActive(item.id)}
                      className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                        item.stockStatus !== 'Out of Stock' ? 'bg-[#00d4ff]' : 'bg-[#2a2a3a]'
                      }`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        item.stockStatus !== 'Out of Stock' ? 'translate-x-5' : 'translate-x-1'
                      }`} />
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(item)} className="text-[#8888aa] hover:text-[#00d4ff] transition-colors"><Pencil size={15} /></button>
                      <button onClick={() => setDeleteId(item.id)} className="text-[#8888aa] hover:text-red-400 transition-colors"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Product' : 'Add New Product'}>
        <div className="space-y-3">
          <input className={inputClass} placeholder="Product name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <select className={inputClass} value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })}>
            {['PlayStation', 'Xbox', 'Nintendo', 'PC Gaming'].map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <input className={inputClass} type="number" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            <input className={inputClass} type="number" placeholder="Stock count" value={form.stockCount} onChange={(e) => setForm({ ...form, stockCount: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <input className={inputClass} placeholder="Storage" value={form.storage} onChange={(e) => setForm({ ...form, storage: e.target.value })} />
            <input className={inputClass} placeholder="Resolution" value={form.resolution} onChange={(e) => setForm({ ...form, resolution: e.target.value })} />
            <input className={inputClass} placeholder="FPS" value={form.fps} onChange={(e) => setForm({ ...form, fps: e.target.value })} />
          </div>
          <textarea className={inputClass} placeholder="Description" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <select className={inputClass} value={form.stockStatus} onChange={(e) => setForm({ ...form, stockStatus: e.target.value })}>
            {['In Stock', 'Low Stock', 'Pre-Order', 'Out of Stock'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={handleSave} className="w-full py-2.5 rounded-lg bg-[#00d4ff] text-black font-semibold text-sm hover:shadow-[0_0_15px_rgba(0,212,255,0.4)] transition-all">
            {editItem ? 'Save Changes' : 'Add Product'}
          </button>
        </div>
      </Modal>

      <Modal isOpen={deleteId !== null} onClose={() => setDeleteId(null)} title="Confirm Delete">
        <div className="space-y-4">
          <p className="text-[#8888aa] text-sm">Are you sure you want to delete this product? This action cannot be undone.</p>
          <div className="flex gap-3">
            <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-500 transition-colors">Delete</button>
            <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-lg border border-[#2a2a3a] text-[#8888aa] text-sm hover:text-[#f0f0ff] transition-colors">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
