import { MarketData } from "../../client/src/types/mining";

class MarketService {
  private cache: Map<string, MarketData> = new Map();
  private lastUpdate: number = 0;
  private updateInterval = 60 * 1000; // 1 minute
  
  // Get market data
  async getMarketData(currency: string = 'bitcoin'): Promise<MarketData> {
    const now = Date.now();
    
    // Check if we need to update the cache
    if (now - this.lastUpdate > this.updateInterval || !this.cache.has(currency)) {
      // In a real app, we would fetch data from a cryptocurrency API
      const marketData = this.generateMarketData();
      this.cache.set(currency, marketData);
      this.lastUpdate = now;
    }
    
    return this.cache.get(currency) as MarketData;
  }
  
  // Generate simulated market data
  private generateMarketData(): MarketData {
    // Bitcoin random price between $60,000 and $65,000
    const btcPrice = 60000 + Math.random() * 5000;
    
    // Ethereum random price between $2,800 and $3,300
    const ethPrice = 2800 + Math.random() * 500;
    
    // Litecoin random price between $80 and $120
    const ltcPrice = 80 + Math.random() * 40;
    
    // Generate random trends
    const btcTrend = Math.random() > 0.5 ? 'up' : 'down';
    const ethTrend = Math.random() > 0.5 ? 'up' : 'down';
    const ltcTrend = Math.random() > 0.5 ? 'up' : 'down';
    
    return {
      bitcoin: {
        usd_price: btcPrice,
        trend: btcTrend
      },
      ethereum: {
        usd_price: ethPrice,
        trend: ethTrend
      },
      litecoin: {
        usd_price: ltcPrice,
        trend: ltcTrend
      },
      'bitcoin-cash': {
        usd_price: 200 + Math.random() * 50,
        trend: Math.random() > 0.5 ? 'up' : 'down'
      },
      timestamp: new Date().toISOString()
    };
  }
}

export const marketService = new MarketService();
