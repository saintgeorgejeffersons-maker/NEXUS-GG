import { useState, useMemo } from 'react';
import { Search, HardDrive, Monitor, Cpu } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { consoles } from '../../data/mockData';

const BRANDS = ['All', 'PlayStation', 'Xbox', 'Nintendo', 'PC Gaming'];

function stockVariant(s) {
  if (s === 'In Stock') return 'instock';
  if (s === 'Low Stock') return 'lowstock';
  if (s === 'Pre-Order') return 'preorder';
  return 'outofstock';
}

function tagVariant(t) {
  if (t === 'New') return 'new';
  if (t === 'Bundle') return 'bundle';
  return 'limited';
}

const BRAND_COLORS = { PlayStation: '#00d4ff', Xbox: '#00ff88', Nintendo: '#ff6b35', 'PC Gaming': '#7c3aed' };

export function Catalog() {
  const [search, setSearch] = useState('');
  const [brand, setBrand] = useState('All');
  const [sort, setSort] = useState('default');

  const filtered = useMemo(() => {
    let list = [...consoles];
    if (search) list = list.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
    if (brand !== 'All') list = list.filter((c) => c.brand === brand);
    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    else if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [search, brand, sort]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8888aa]" />
          <input
            className="w-full pl-9 pr-4 py-2.5 bg-[#1a1a24] border border-[#2a2a3a] rounded-lg text-sm text-[#f0f0ff] placeholder-[#8888aa] focus:outline-none focus:border-[#00d4ff] transition-colors"
            placeholder="Search consoles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="bg-[#1a1a24] border border-[#2a2a3a] rounded-lg px-3 py-2.5 text-sm text-[#f0f0ff] focus:outline-none focus:border-[#00d4ff] transition-colors"
        >
          <option value="default">Sort: Default</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name">Name: A-Z</option>
        </select>
      </div>
      <div className="flex gap-2 flex-wrap">
        {BRANDS.map((b) => (
          <button
            key={b}
            onClick={() => setBrand(b)}
            className={`px-4 py-1.5 rounded-full text-sm transition-all ${
              brand === b
                ? 'bg-[#00d4ff] text-black font-medium'
                : 'bg-[#1a1a24] border border-[#2a2a3a] text-[#8888aa] hover:text-[#f0f0ff]'
            }`}
          >{b}</button>
        ))}
        <span className="ml-auto self-center text-sm text-[#8888aa]">{filtered.length} results</span>
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card p-12 text-center text-[#8888aa]">No consoles found matching your filters.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="glass-card overflow-hidden hover:shadow-[0_0_20px_rgba(0,212,255,0.1)] transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className="h-1 w-full" style={{background: BRAND_COLORS[c.brand] || '#00d4ff'}} />
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <Badge variant={stockVariant(c.stockStatus)}>{c.stockStatus}</Badge>
                  <div className="flex gap-1 flex-wrap justify-end">
                    {c.tags.map((t) => <Badge key={t} variant={tagVariant(t)}>{t}</Badge>)}
                  </div>
                </div>
                <div className="text-5xl text-center py-4 select-none">{c.image}</div>
                <h3 className="text-base font-bold text-[#f0f0ff] mb-1">{c.name}</h3>
                <p className="text-xs text-[#8888aa] mb-3 line-clamp-2">{c.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="flex items-center gap-1 text-xs text-[#8888aa] bg-white/5 px-2 py-1 rounded"><HardDrive size={11} /> {c.storage}</span>
                  <span className="flex items-center gap-1 text-xs text-[#8888aa] bg-white/5 px-2 py-1 rounded"><Monitor size={11} /> {c.resolution}</span>
                  <span className="flex items-center gap-1 text-xs text-[#8888aa] bg-white/5 px-2 py-1 rounded"><Cpu size={11} /> {c.fps}</span>
                </div>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-xl font-bold" style={{color: BRAND_COLORS[c.brand] || '#00d4ff'}}>${c.price.toFixed(2)}</span>
                  {c.originalPrice > c.price && <span className="text-sm text-[#8888aa] line-through">${c.originalPrice.toFixed(2)}</span>}
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 py-2 rounded-lg text-sm border border-[#00d4ff] text-[#00d4ff] hover:bg-[#00d4ff]/10 transition-all" disabled={c.stockStatus === 'Out of Stock'}>Add to Cart</button>
                  <button className="flex-1 py-2 rounded-lg text-sm bg-[#00d4ff] text-black font-medium hover:shadow-[0_0_15px_rgba(0,212,255,0.4)] transition-all" disabled={c.stockStatus === 'Out of Stock'}>Buy Now</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
