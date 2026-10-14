export function Badge({ variant = 'default', children, className = '' }) {
  const variants = {
    default: 'bg-gray-800 text-gray-300',
    pending: 'bg-yellow-900/60 text-yellow-400 border border-yellow-600/40',
    processing: 'bg-blue-900/60 text-blue-400 border border-blue-600/40',
    shipped: 'bg-purple-900/60 text-purple-400 border border-purple-600/40',
    delivered: 'bg-green-900/60 text-green-400 border border-green-600/40',
    cancelled: 'bg-red-900/60 text-red-400 border border-red-600/40',
    instock: 'bg-green-900/60 text-green-400 border border-green-600/40',
    lowstock: 'bg-yellow-900/60 text-yellow-400 border border-yellow-600/40',
    preorder: 'bg-blue-900/60 text-blue-400 border border-blue-600/40',
    outofstock: 'bg-red-900/60 text-red-400 border border-red-600/40',
    new: 'bg-cyan-900/60 text-cyan-400 border border-cyan-600/40',
    bundle: 'bg-purple-900/60 text-purple-400 border border-purple-600/40',
    limited: 'bg-orange-900/60 text-orange-400 border border-orange-600/40',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  );
}
