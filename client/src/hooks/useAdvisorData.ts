import { useQuery } from '@tanstack/react-query';
import { AdvisorData, MiningData, MarketData } from '@/types/mining';

export const useAdvisorData = (
  currency: string = 'bitcoin',
  miningData: MiningData | null = null,
  marketData: MarketData | null = null
) => {
  // Query advisor recommendation
  const { 
    data: advisorData, 
    isLoading, 
    error 
  } = useQuery<AdvisorData>({
    queryKey: ['/api/advisor/recommendation', currency, miningData?.balance?.balance, marketData?.bitcoin?.usd_price],
    enabled: !!miningData && !!marketData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  return {
    advisorData,
    isLoading,
    error
  };
};
