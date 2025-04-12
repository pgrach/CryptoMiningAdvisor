import { useQuery } from '@tanstack/react-query';
import { MarketData } from '@/types/mining';

export const useMarketData = (currency: string = 'bitcoin') => {
  // Query market data
  const { 
    data: marketData, 
    isLoading, 
    error 
  } = useQuery<MarketData>({
    queryKey: ['/api/market/data', currency],
    staleTime: 60 * 1000, // 1 minute
  });
  
  // Extract BTC price
  const btcPrice = marketData?.bitcoin?.usd_price || null;
  
  // Extract additional currencies from market data
  const marketPrices = marketData 
    ? Object.entries(marketData).reduce((acc, [key, value]) => {
        if (key !== 'timestamp' && typeof value === 'object' && value.usd_price) {
          acc[key] = {
            price: value.usd_price,
            trend: value.trend
          };
        }
        return acc;
      }, {} as Record<string, {price: number, trend: 'up' | 'down' | 'stable'}>)
    : {};
  
  return {
    marketData,
    btcPrice,
    marketPrices,
    isLoading,
    error
  };
};
