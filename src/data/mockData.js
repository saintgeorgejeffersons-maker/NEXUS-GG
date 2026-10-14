// Products: gaming hardware users can "invest" in for daily returns
export const products = [
  { id: 1, name: 'PlayStation 5 Pro', price: 500, dailyReturn: 20, durationDays: 30, imageUrl: '', description: 'High-performance gaming console with top-tier daily yields.', active: true },
  { id: 2, name: 'Xbox Series X Cyber', price: 350, dailyReturn: 13, durationDays: 30, imageUrl: '', description: 'Next-gen Xbox with steady daily returns for investors.', active: true },
  { id: 3, name: 'Nintendo Switch OLED', price: 200, dailyReturn: 7, durationDays: 30, imageUrl: '', description: 'Portable gaming investment with consistent yields.', active: true },
  { id: 4, name: 'Steam Deck OLED 1TB', price: 450, dailyReturn: 17, durationDays: 30, imageUrl: '', description: 'PC handheld powerhouse delivering strong daily returns.', active: true },
  { id: 5, name: 'Asus ROG Ally X', price: 650, dailyReturn: 26, durationDays: 30, imageUrl: '', description: 'Premium ROG gaming rig with the highest daily payout.', active: true },
  { id: 6, name: 'PS5 Digital Slim', price: 280, dailyReturn: 10, durationDays: 30, imageUrl: '', description: 'Sleek entry-level PS5 for consistent earners.', active: true },
]

// User's active investments (products they have purchased)
export const userInvestments = [
  { id: 1, productId: 1, productName: 'PlayStation 5 Pro', price: 500, dailyReturn: 20, durationDays: 30, daysRemaining: 22, totalEarned: 160, purchaseDate: '2026-09-22' },
  { id: 2, productId: 3, productName: 'Nintendo Switch OLED', price: 200, dailyReturn: 7, durationDays: 30, daysRemaining: 5, totalEarned: 175, purchaseDate: '2026-09-09' },
]

// Wallet transaction history
export const walletTransactions = [
  { id: 1, type: 'deposit', description: 'Wallet Deposit', date: '2026-09-20', amount: 1000 },
  { id: 2, type: 'purchase', description: 'Purchased: PlayStation 5 Pro', date: '2026-09-22', amount: -500 },
  { id: 3, type: 'return', description: 'Daily Return: PlayStation 5 Pro', date: '2026-09-23', amount: 20 },
  { id: 4, type: 'return', description: 'Daily Return: PlayStation 5 Pro', date: '2026-09-24', amount: 20 },
  { id: 5, type: 'purchase', description: 'Purchased: Nintendo Switch OLED', date: '2026-09-09', amount: -200 },
  { id: 6, type: 'return', description: 'Daily Return: Nintendo Switch OLED', date: '2026-09-10', amount: 7 },
  { id: 7, type: 'withdrawal', description: 'Withdrawal to Bank', date: '2026-09-15', amount: -100 },
  { id: 8, type: 'deposit', description: 'Wallet Deposit', date: '2026-09-01', amount: 500 },
]

// User metrics
export const userMetrics = {
  walletBalance: 747,
  totalInvested: 700,
  totalEarned: 335,
  activeInvestments: 2,
}

// Admin metrics
export const adminMetrics = {
  totalDeposits: 128400,
  totalUsers: 1842,
  activeInvestments: 3940,
  totalPaidOut: 54200,
}
