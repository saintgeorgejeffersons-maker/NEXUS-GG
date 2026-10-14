export const consoles = [
  {
    id: 1, name: 'PlayStation 5 Pro Bundle', brand: 'PlayStation',
    price: 699.99, originalPrice: 749.99,
    image: '🎮', storage: '2TB SSD', resolution: '8K', fps: '120fps',
    stockStatus: 'In Stock', stockCount: 42,
    description: 'The ultimate PS5 bundle with DualSense Edge and 3 games.',
    tags: ['Bundle', 'New'],
  },
  {
    id: 2, name: 'Xbox Series X Cyber Edition', brand: 'Xbox',
    price: 649.99, originalPrice: 649.99,
    image: '🕹️', storage: '1TB SSD', resolution: '4K', fps: '120fps',
    stockStatus: 'Low Stock', stockCount: 7,
    description: 'Limited cyberpunk-themed Xbox Series X with exclusive controller.',
    tags: ['Limited'],
  },
  {
    id: 3, name: 'Nintendo Switch OLED Limited', brand: 'Nintendo',
    price: 399.99, originalPrice: 349.99,
    image: '🃏', storage: '64GB', resolution: '1080p', fps: '60fps',
    stockStatus: 'Pre-Order', stockCount: 0,
    description: 'Special edition OLED Switch with Splatoon 3 design.',
    tags: ['Limited', 'New'],
  },
  {
    id: 4, name: 'Steam Deck OLED 1TB', brand: 'PC Gaming',
    price: 649.99, originalPrice: 699.99,
    image: '💻', storage: '1TB NVMe', resolution: '1280x800 OLED', fps: '90fps',
    stockStatus: 'In Stock', stockCount: 25,
    description: 'Handheld PC gaming with gorgeous OLED display.',
    tags: ['New'],
  },
  {
    id: 5, name: 'Xbox Series S Arctic White', brand: 'Xbox',
    price: 299.99, originalPrice: 299.99,
    image: '🕹️', storage: '512GB SSD', resolution: '1440p', fps: '120fps',
    stockStatus: 'In Stock', stockCount: 88,
    description: 'Compact next-gen gaming in pristine Arctic White.',
    tags: [],
  },
  {
    id: 6, name: 'PS5 Digital Slim', brand: 'PlayStation',
    price: 449.99, originalPrice: 449.99,
    image: '🎮', storage: '1TB SSD', resolution: '4K', fps: '120fps',
    stockStatus: 'In Stock', stockCount: 31,
    description: 'Sleeker, lighter PS5 Digital Edition for the modern gamer.',
    tags: ['New'],
  },
  {
    id: 7, name: 'Nintendo Switch Lite Coral', brand: 'Nintendo',
    price: 199.99, originalPrice: 199.99,
    image: '🃏', storage: '32GB', resolution: '720p', fps: '60fps',
    stockStatus: 'In Stock', stockCount: 54,
    description: 'Vibrant coral handheld-only Nintendo Switch Lite.',
    tags: [],
  },
  {
    id: 8, name: 'Asus ROG Ally X', brand: 'PC Gaming',
    price: 799.99, originalPrice: 899.99,
    image: '💻', storage: '1TB SSD', resolution: '1920x1080', fps: '120fps',
    stockStatus: 'Low Stock', stockCount: 4,
    description: 'ROG Ally X: the most powerful handheld gaming PC.',
    tags: ['New', 'Bundle'],
  },
];

export const userOrders = [
  { id: 1, orderNumber: 'NX-10041', product: 'PlayStation 5 Pro Bundle', date: '2025-06-01', amount: 699.99, status: 'Delivered', isPreorder: false },
  { id: 2, orderNumber: 'NX-10038', product: 'Steam Deck OLED 1TB', date: '2025-05-28', amount: 649.99, status: 'Shipped', isPreorder: false },
  { id: 3, orderNumber: 'NX-10035', product: 'Nintendo Switch OLED Limited', date: '2025-05-15', amount: 399.99, status: 'Processing', isPreorder: true },
  { id: 4, orderNumber: 'NX-10030', product: 'Xbox Series S Arctic White', date: '2025-05-01', amount: 299.99, status: 'Delivered', isPreorder: false },
  { id: 5, orderNumber: 'NX-10027', product: 'Asus ROG Ally X', date: '2025-04-22', amount: 799.99, status: 'Delivered', isPreorder: false },
  { id: 6, orderNumber: 'NX-10025', product: 'PS5 Digital Slim', date: '2025-04-15', amount: 449.99, status: 'Cancelled', isPreorder: false },
  { id: 7, orderNumber: 'NX-10021', product: 'Xbox Series X Cyber Edition', date: '2025-04-01', amount: 649.99, status: 'Pending', isPreorder: false },
  { id: 8, orderNumber: 'NX-10018', product: 'Nintendo Switch Lite Coral', date: '2025-03-20', amount: 199.99, status: 'Delivered', isPreorder: false },
  { id: 9, orderNumber: 'NX-10015', product: 'Steam Deck OLED 1TB', date: '2025-03-10', amount: 649.99, status: 'Delivered', isPreorder: false },
  { id: 10, orderNumber: 'NX-10010', product: 'PlayStation 5 Pro Bundle', date: '2025-02-28', amount: 699.99, status: 'Delivered', isPreorder: false },
];

export const adminOrders = [
  { id: 1, orderNumber: 'NX-10041', customer: 'Alex Chen', product: 'PS5 Pro Bundle', date: '2025-06-01', amount: 699.99, status: 'Delivered' },
  { id: 2, orderNumber: 'NX-10040', customer: 'Jordan Smith', product: 'Xbox Series X Cyber', date: '2025-06-01', amount: 649.99, status: 'Shipped' },
  { id: 3, orderNumber: 'NX-10039', customer: 'Riley Park', product: 'Steam Deck OLED', date: '2025-05-31', amount: 649.99, status: 'Processing' },
  { id: 4, orderNumber: 'NX-10038', customer: 'Morgan Lee', product: 'Nintendo Switch OLED', date: '2025-05-30', amount: 399.99, status: 'Pending' },
  { id: 5, orderNumber: 'NX-10037', customer: 'Casey Kim', product: 'Asus ROG Ally X', date: '2025-05-29', amount: 799.99, status: 'Processing' },
  { id: 6, orderNumber: 'NX-10036', customer: 'Drew Wilson', product: 'PS5 Digital Slim', date: '2025-05-28', amount: 449.99, status: 'Shipped' },
  { id: 7, orderNumber: 'NX-10035', customer: 'Sam Torres', product: 'Xbox Series S Arctic', date: '2025-05-27', amount: 299.99, status: 'Delivered' },
  { id: 8, orderNumber: 'NX-10034', customer: 'Jamie Fox', product: 'Nintendo Switch Lite', date: '2025-05-26', amount: 199.99, status: 'Delivered' },
  { id: 9, orderNumber: 'NX-10033', customer: 'Taylor Nguyen', product: 'Steam Deck OLED', date: '2025-05-25', amount: 649.99, status: 'Pending' },
  { id: 10, orderNumber: 'NX-10032', customer: 'Quinn Adams', product: 'PS5 Pro Bundle', date: '2025-05-24', amount: 699.99, status: 'Shipped' },
  { id: 11, orderNumber: 'NX-10031', customer: 'Avery Brown', product: 'Xbox Series X Cyber', date: '2025-05-23', amount: 649.99, status: 'Processing' },
  { id: 12, orderNumber: 'NX-10030', customer: 'Blake Davis', product: 'Asus ROG Ally X', date: '2025-05-22', amount: 799.99, status: 'Delivered' },
  { id: 13, orderNumber: 'NX-10029', customer: 'Charlie Evans', product: 'PS5 Digital Slim', date: '2025-05-21', amount: 449.99, status: 'Cancelled' },
  { id: 14, orderNumber: 'NX-10028', customer: 'Devin Fisher', product: 'Nintendo Switch OLED', date: '2025-05-20', amount: 399.99, status: 'Delivered' },
  { id: 15, orderNumber: 'NX-10027', customer: 'Emery Garcia', product: 'Xbox Series S Arctic', date: '2025-05-19', amount: 299.99, status: 'Shipped' },
];

export const monthlySpending = [
  { month: 'Jul', hardware: 0, digital: 45, total: 45 },
  { month: 'Aug', hardware: 299, digital: 60, total: 359 },
  { month: 'Sep', hardware: 0, digital: 30, total: 30 },
  { month: 'Oct', hardware: 0, digital: 80, total: 80 },
  { month: 'Nov', hardware: 649, digital: 120, total: 769 },
  { month: 'Dec', hardware: 699, digital: 200, total: 899 },
  { month: 'Jan', hardware: 0, digital: 55, total: 55 },
  { month: 'Feb', hardware: 699, digital: 40, total: 739 },
  { month: 'Mar', hardware: 649, digital: 70, total: 719 },
  { month: 'Apr', hardware: 449, digital: 90, total: 539 },
  { month: 'May', hardware: 299, digital: 110, total: 409 },
  { month: 'Jun', hardware: 699, digital: 60, total: 759 },
];

export const salesByPlatform = [
  { platform: 'PlayStation', units: 1240, revenue: 856560, color: '#00d4ff' },
  { platform: 'Xbox', units: 980, revenue: 622060, color: '#7c3aed' },
  { platform: 'Nintendo', units: 1560, revenue: 545244, color: '#00ff88' },
  { platform: 'PC Gaming', units: 420, revenue: 314580, color: '#ff6b35' },
];

export const adminMetrics = {
  totalRevenue: 2338444,
  totalSold: 4200,
  activeUsers: 18420,
  lowStockAlerts: 3,
};

export const userMetrics = {
  totalOrders: 10,
  activePreorders: 2,
  loyaltyPoints: 4820,
  walletBalance: 125.50,
};

export const walletTransactions = [
  { id: 1, type: 'credit', description: 'Funds Added', date: '2025-06-01', amount: 50.00 },
  { id: 2, type: 'debit', description: 'PS5 Pro Bundle Purchase', date: '2025-06-01', amount: -699.99 },
  { id: 3, type: 'credit', description: 'Loyalty Reward Redemption', date: '2025-05-28', amount: 25.00 },
  { id: 4, type: 'debit', description: 'Steam Deck OLED Purchase', date: '2025-05-28', amount: -649.99 },
  { id: 5, type: 'credit', description: 'Funds Added', date: '2025-05-15', amount: 100.00 },
  { id: 6, type: 'credit', description: 'Refund: PS5 Digital Slim', date: '2025-04-20', amount: 449.99 },
  { id: 7, type: 'debit', description: 'Nintendo Switch OLED Pre-order', date: '2025-05-15', amount: -399.99 },
  { id: 8, type: 'credit', description: 'Referral Bonus', date: '2025-04-01', amount: 15.00 },
];
