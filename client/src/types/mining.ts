export interface MiningUser {
  mining_user_name: string;
  wallets: Wallet[];
  description?: string;
}

export interface Wallet {
  currency: string;
  address: string;
  threshold: string;
}

export interface HashRateInfo {
  name: string;
  hash_rate: number;
  h1_hash_rate: number;
  h24_hash_rate: number;
  h1_stale_hash_rate?: number;
  h24_stale_hash_rate?: number;
  h24_delay_hash_rate?: number;
  local_hash_rate?: number;
  h24_local_hash_rate?: number;
}

export interface BalanceInfo {
  balance: number;
  immature_balance: number;
  paid: number;
  total_income: number;
  yesterday_income: number;
  estimated_today_income: number;
}

export interface WorkerInfo {
  hash_rate_info: HashRateInfo;
  last_share_at: number;
  status: string;
  host?: string;
}

export interface MiningData {
  balance: BalanceInfo;
  hashrate: HashRateInfo;
  workers?: WorkerInfo[];
  currency: string;
  timestamp: string;
}

export interface MarketPrice {
  usd_price: number;
  trend: 'up' | 'down' | 'stable';
}

export interface MarketData {
  [currency: string]: MarketPrice;
  timestamp: string;
}

export interface AdvisorRecommendation {
  recommendation: 'HODL' | 'SELL' | 'TRADE';
  reason: string;
}

export interface AdvisorAccuracy {
  hodl: number;
  sell: number;
  trade: number;
}

export interface AdvisorData {
  recommendation: AdvisorRecommendation;
  accuracy: AdvisorAccuracy;
  timestamp: string;
}

export interface ActivityItem {
  id: string;
  type: 'payment' | 'worker_online' | 'worker_offline' | 'ai_update';
  description: string;
  timestamp: number;
}

export interface QuickSettingsState {
  autoPayout: boolean;
  emailAlerts: boolean;
  aiAdvisory: boolean;
  darkMode: boolean;
}

export type Currency = 
  'bitcoin' | 'aleo' | 'alephium' | 'bells-mm' | 'bitcion' | 'bitcoin-cash' |
  'conflux' | 'dash' | 'elacoin' | 'ethereum-classic' | 'ethw' | 'fractal-bitcoin' |
  'fractal-bitcoin-mm' | 'hathor' | 'ironfish' | 'junkcoin' | 'kadena' | 'kaspa' |
  'litecoin' | 'luckycoin' | 'nervos' | 'nexa' | 'nmccoin' | 'pepecoin' | 'zcash' |
  'zen' | 'dingocoin' | 'craftcoin' | 'elastos' | 'quai' | 'shibacoin' | 'canxium';
