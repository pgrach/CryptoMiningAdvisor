import { Currency } from "../types/mining";

export const CURRENCIES: Currency[] = [
  'bitcoin', 'aleo', 'alephium', 'bells-mm', 'bitcion', 'bitcoin-cash',
  'conflux', 'dash', 'elacoin', 'ethereum-classic', 'ethw', 'fractal-bitcoin',
  'fractal-bitcoin-mm', 'hathor', 'ironfish', 'junkcoin', 'kadena', 'kaspa',
  'litecoin', 'luckycoin', 'nervos', 'nexa', 'nmccoin', 'pepecoin', 'zcash',
  'zen', 'dingocoin', 'craftcoin', 'elastos', 'quai', 'shibacoin', 'canxium'
];

export const HASHRATE_SUPPORTED_CURRENCIES: Currency[] = [
  'bitcoin', 'bitcoin-cash', 'litecoin'
];

export const UPDATE_INTERVAL = 60000; // 1 minute

export const CHART_COLORS = {
  hashrate: '#2EA043',
  income: '#A371F7',
  price: '#F85149',
};
