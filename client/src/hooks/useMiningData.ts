import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useState, useEffect } from 'react';
import { MiningData, WorkerInfo, ActivityItem } from '@/types/mining';

export const useMiningData = () => {
  const queryClient = useQueryClient();
  const [apiKey, setApiKey] = useState<string>('');
  const [miningUserName, setMiningUserName] = useState<string>('');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('bitcoin');
  
  // Load credentials from session storage if available
  useEffect(() => {
    const storedApiKey = sessionStorage.getItem('f2pool_apikey');
    const storedUsername = sessionStorage.getItem('f2pool_username');
    
    if (storedApiKey && storedUsername) {
      setApiKey(storedApiKey);
      setMiningUserName(storedUsername);
    }
  }, []);
  
  // Simulated hashrate history data for charts
  const generateHashrateHistory = () => {
    const now = Date.now();
    return Array.from({ length: 24 }, (_, i) => {
      return {
        timestamp: new Date(now - (23 - i) * 3600 * 1000).toISOString(),
        hashrate: (Math.random() * 20 + 100) * 1e12, // 100-120 TH/s
      };
    });
  };
  
  // Simulated income history data for charts
  const generateIncomeHistory = () => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        income: Math.random() * 0.0005 + 0.001, // 0.001-0.0015 BTC
      };
    });
  };
  
  // Generate simulated worker status
  const generateWorkerStatus = (count: number = 25): WorkerInfo[] => {
    return Array.from({ length: count }, (_, i) => {
      const isOnline = Math.random() > 0.15; // 85% chance of being online
      const lastShareTime = isOnline 
        ? Date.now() / 1000 - Math.random() * 300 // 0-5 minutes ago
        : Date.now() / 1000 - (3600 + Math.random() * 10000); // 1-4 hours ago
      
      return {
        hash_rate_info: {
          name: `rig-${i + 1}`,
          hash_rate: isOnline ? Math.random() * 1 + 4 * 1e12 : 0, // 4-5 TH/s if online, 0 if offline
          h1_hash_rate: isOnline ? Math.random() * 1 + 4 * 1e12 : 0,
          h24_hash_rate: isOnline ? Math.random() * 1 + 4 * 1e12 : 0,
          h24_stale_hash_rate: isOnline ? Math.random() * 0.1 * 1e12 : 0, // 0-10% stale
        },
        last_share_at: lastShareTime,
        status: isOnline ? 'active' : 'inactive',
        host: `192.168.1.${100 + i}`, 
      };
    });
  };
  
  // Generate activity log
  const generateActivity = (): ActivityItem[] => {
    const now = Date.now() / 1000;
    return [
      { 
        id: '1', 
        type: 'payment', 
        description: '0.0452 BTC paid to wallet 3FZbgi29...8Cu7', 
        timestamp: now - 7200 // 2h ago
      },
      { 
        id: '2', 
        type: 'worker_online', 
        description: 'rig-02 is back online after 23m downtime', 
        timestamp: now - 18000 // 5h ago
      },
      { 
        id: '3', 
        type: 'worker_offline', 
        description: 'rig-05 went offline. Maintenance required.', 
        timestamp: now - 28800 // 8h ago
      },
      { 
        id: '4', 
        type: 'ai_update', 
        description: 'New trading recommendation: Trade BTC for ETH', 
        timestamp: now - 43200 // 12h ago
      }
    ];
  };
  
  // Query to fetch mining data with direct credentials
  const { 
    data: miningData,
    isLoading: isLoadingMining,
    error: miningError
  } = useQuery({
    queryKey: ['/api/mining/data', selectedCurrency, miningUserName, apiKey],
    queryFn: () => apiRequest('GET', `/api/mining/data?currency=${selectedCurrency}&miningUserName=${miningUserName}&apiKey=${apiKey}`),
    enabled: !!apiKey && !!miningUserName,
  });
  
  // Generate hashrate history data with direct credentials
  const { 
    data: hashrateHistory
  } = useQuery({
    queryKey: ['/api/mining/hashrate-history', selectedCurrency, miningUserName, apiKey],
    queryFn: () => apiRequest('GET', `/api/mining/hashrate-history?currency=${selectedCurrency}&miningUserName=${miningUserName}&apiKey=${apiKey}`),
    enabled: !!apiKey && !!miningUserName,
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: generateHashrateHistory()
  });
  
  // Generate income history data with direct credentials
  const { 
    data: incomeHistory
  } = useQuery({
    queryKey: ['/api/mining/income-history', selectedCurrency, miningUserName, apiKey],
    queryFn: () => apiRequest('GET', `/api/mining/income-history?currency=${selectedCurrency}&miningUserName=${miningUserName}&apiKey=${apiKey}`),
    enabled: !!apiKey && !!miningUserName,
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: generateIncomeHistory()
  });
  
  // Query to fetch workers data with direct credentials
  const { 
    data: workersData, 
    isLoading: isLoadingWorkers
  } = useQuery({
    queryKey: ['/api/mining/workers', selectedCurrency, miningUserName, apiKey],
    queryFn: () => apiRequest('GET', `/api/mining/workers?currency=${selectedCurrency}&miningUserName=${miningUserName}&apiKey=${apiKey}`),
    enabled: !!apiKey && !!miningUserName,
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: generateWorkerStatus()
  });
  
  // Query to fetch activity data with direct credentials
  const { 
    data: activityData, 
    isLoading: isLoadingActivity
  } = useQuery({
    queryKey: ['/api/mining/activity', selectedCurrency, miningUserName, apiKey],
    queryFn: () => apiRequest('GET', `/api/mining/activity?currency=${selectedCurrency}&miningUserName=${miningUserName}&apiKey=${apiKey}`),
    enabled: !!apiKey && !!miningUserName,
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: generateActivity()
  });
  
  // Mutation to fetch mining data
  const { mutateAsync: fetchMiningData, isPending: isFetchingMining } = useMutation({
    mutationFn: async (params: { apiKey: string, miningUserName: string, currency: string }) => {
      return await apiRequest('POST', '/api/mining/fetch', params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mining/data'] });
      queryClient.invalidateQueries({ queryKey: ['/api/mining/hashrate-history'] });
      queryClient.invalidateQueries({ queryKey: ['/api/mining/income-history'] });
      queryClient.invalidateQueries({ queryKey: ['/api/mining/workers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/mining/activity'] });
      queryClient.invalidateQueries({ queryKey: ['/api/market/data'] });
      queryClient.invalidateQueries({ queryKey: ['/api/advisor/recommendation'] });
    }
  });
  
  // Function to handle connection and data fetching
  const connectAndFetchData = async (apiKey: string, miningUserName: string, currency: string) => {
    setApiKey(apiKey);
    setMiningUserName(miningUserName);
    setSelectedCurrency(currency);
    
    // Save to session storage for temporary convenience
    sessionStorage.setItem('f2pool_username', miningUserName);
    sessionStorage.setItem('f2pool_apikey', apiKey);
    
    try {
      await fetchMiningData({ apiKey, miningUserName, currency });
      return { success: true, message: 'Successfully fetched mining data' };
    } catch (error) {
      console.error('Error fetching mining data:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to fetch mining data'
      };
    }
  };
  
  // Calculate worker statistics
  const workersStats = workersData ? {
    online: workersData.filter(worker => 
      worker.last_share_at > (Date.now() / 1000) - 3600 // Consider workers active if share in last hour
    ).length,
    total: workersData.length
  } : null;
  
  return {
    miningData,
    hashrateHistory,
    incomeHistory,
    workersData,
    activityData,
    workersStats,
    isLoading: isLoadingMining || isFetchingMining,
    isLoadingWorkers,
    isLoadingActivity,
    error: miningError,
    connectAndFetchData,
    selectedCurrency,
    apiKey,
    miningUserName
  };
};
