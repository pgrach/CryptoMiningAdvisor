/**
 * Format a cryptocurrency amount with proper decimal places
 */
export const formatCrypto = (amount: number, currency: string): string => {
  if (amount === null || amount === undefined) return 'N/A';
  
  // Bitcoin and most cryptocurrencies display 8 decimal places
  return amount.toFixed(currency === 'bitcoin' ? 8 : 6);
};

/**
 * Format a currency amount to USD with proper formatting
 */
export const formatFiat = (amount: number): string => {
  if (amount === null || amount === undefined) return 'N/A';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Format a date to a human readable format
 */
export const formatDate = (timestamp: number | string): string => {
  if (!timestamp) return 'N/A';
  
  const date = typeof timestamp === 'number' 
    ? new Date(timestamp * 1000) 
    : new Date(timestamp);
  
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
};

/**
 * Format a date to a relative time (e.g. 5m ago)
 */
export const formatRelativeTime = (timestamp: number): string => {
  if (!timestamp) return 'N/A';
  
  const now = Date.now();
  const date = timestamp * 1000;
  const diff = now - date;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return `${seconds}s ago`;
};

/**
 * Format a hashrate with appropriate unit
 */
export const formatHashrate = (hashrate: number): string => {
  if (hashrate === null || hashrate === undefined || isNaN(hashrate)) return 'N/A';
  
  const units = ['H/s', 'KH/s', 'MH/s', 'GH/s', 'TH/s', 'PH/s', 'EH/s'];
  let unitIndex = 0;
  
  while (hashrate >= 1000 && unitIndex < units.length - 1) {
    hashrate /= 1000;
    unitIndex++;
  }
  
  return `${hashrate.toFixed(2)} ${units[unitIndex]}`;
};

/**
 * Format a percentage
 */
export const formatPercentage = (percentage: number): string => {
  if (percentage === null || percentage === undefined || isNaN(percentage)) return 'N/A';
  
  return `${percentage.toFixed(1)}%`;
};
