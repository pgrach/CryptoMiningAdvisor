import { AdvisorData, AdvisorRecommendation, MarketData } from "../../client/src/types/mining";
import { marketService } from "./market";

class AdvisorService {
  private cache: Map<string, AdvisorData> = new Map();
  private lastUpdate: number = 0;
  private updateInterval = 300 * 1000; // 5 minutes
  
  // Get AI investment recommendation
  async getRecommendation(
    currency: string, 
    balance?: number, 
    btcPrice?: number
  ): Promise<AdvisorData> {
    const cacheKey = `recommendation:${currency}:${balance}:${btcPrice}`;
    const now = Date.now();
    
    // Check if we need to update the cache
    if (now - this.lastUpdate > this.updateInterval || !this.cache.has(cacheKey)) {
      let marketData: MarketData | null = null;
      
      if (!btcPrice) {
        // Fetch real market data if not provided
        marketData = await marketService.getMarketData(currency);
        btcPrice = marketData.bitcoin?.usd_price;
      } else {
        // Create minimal market data object if btcPrice is provided
        marketData = {
          bitcoin: {
            usd_price: btcPrice,
            trend: 'up', // Default value
          },
          timestamp: new Date().toISOString()
        };
      }
      
      // Create advisor recommendation based on market data and balance
      const recommendation = this.analyzeMarketAndBalance(currency, balance, marketData);
      
      // Generate accuracy metrics (these would ideally be calculated from historical data)
      const accuracy = {
        hodl: 92, // 92% accuracy for HODL recommendations
        sell: 87, // 87% accuracy for SELL recommendations
        trade: 79  // 79% accuracy for TRADE recommendations
      };
      
      const advisorData: AdvisorData = {
        recommendation,
        accuracy,
        timestamp: new Date().toISOString()
      };
      
      // Cache the recommendation
      this.cache.set(cacheKey, advisorData);
      this.lastUpdate = now;
      
      return advisorData;
    }
    
    return this.cache.get(cacheKey) as AdvisorData;
  }
  
  // Analyze market conditions and balance to generate a recommendation
  private analyzeMarketAndBalance(
    currency: string, 
    balance: number = 0.05, // Default value if not provided
    marketData: MarketData
  ): AdvisorRecommendation {
    const btcPrice = marketData.bitcoin?.usd_price || 60000; // Default value if not available
    const btcTrend = marketData.bitcoin?.trend || 'stable';
    const ethPrice = marketData.ethereum?.usd_price || 3000;
    const ethTrend = marketData.ethereum?.trend || 'stable';
    
    // Default recommendation is HODL
    let recommendation: 'HODL' | 'SELL' | 'TRADE' = 'HODL';
    let reason = 'Market conditions stable, accumulation phase.';
    
    // Apply investment strategy logic (this would be powered by a real AI/ML model in production)
    
    // Rule 1: Sell if BTC price is very high and balance is significant
    if (btcPrice > 64000 && balance > 0.1 && btcTrend === 'up') {
      recommendation = 'SELL';
      reason = `BTC price (${btcPrice.toFixed(0)} USD) is high and trend is up. Consider taking profits on balance (${balance.toFixed(4)} ${currency.toUpperCase()}).`;
    }
    // Rule 2: Consider trading if an altcoin looks promising (e.g., ETH is down)
    else if (btcPrice > 58000 && ethTrend === 'down' && ethPrice < 2900 && balance > 0.05) {
      recommendation = 'TRADE';
      reason = `BTC price is strong (${btcPrice.toFixed(0)} USD), while ETH price (${ethPrice.toFixed(0)} USD) shows potential entry point. Consider trading a portion of ${balance.toFixed(4)} ${currency.toUpperCase()} for ETH.`;
    }
    // Rule 3: HODL if price is low or dipping
    else if (btcPrice < 57000 || btcTrend === 'down') {
      recommendation = 'HODL';
      reason = `BTC price (${btcPrice.toFixed(0)} USD) is currently low or trending down. Continue accumulation strategy.`;
    }
    
    return { 
      recommendation, 
      reason 
    };
  }
}

export const advisorService = new AdvisorService();
