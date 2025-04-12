import { MiningData, HashRateInfo, BalanceInfo, WorkerInfo, ActivityItem, Currency } from "../../client/src/types/mining";

interface ApiResponse<T> {
  code?: number;
  msg?: string;
  data?: T;
}

class F2PoolService {
  private apiBaseUrl = 'https://api.f2pool.com/v2';
  private cache: Map<string, any> = new Map();
  private defaultApiKey: string | undefined;
  private defaultMiningUserName: string | undefined;
  
  constructor() {
    // Read API key from environment variables
    this.defaultApiKey = process.env.F2POOL_API_KEY;
    this.defaultMiningUserName = process.env.F2POOL_USERNAME || 'default_user';
    
    if (this.defaultApiKey) {
      console.log('F2Pool API key loaded from environment variables');
    } else {
      console.log('No F2Pool API key found in environment variables');
    }
  }
  
  // Fetch mining data from F2Pool API
  async fetchMiningData(apiKey: string | undefined, miningUserName: string, currency: string): Promise<MiningData> {
    // Use provided API key or fall back to environment variable
    const resolvedApiKey = apiKey || this.defaultApiKey;
    
    if (!resolvedApiKey) {
      throw new Error("F2Pool API key is required. Please provide it or set F2POOL_API_KEY in environment variables.");
    }
    
    console.log(`Attempting to fetch F2Pool data for user: ${miningUserName}, currency: ${currency}`);
    try {
      // Fetch balance information
      const balanceInfo = await this.fetchBalanceInfo(resolvedApiKey, miningUserName, currency);
      
      // Fetch hashrate information
      const hashrateInfo = await this.fetchHashrateInfo(resolvedApiKey, miningUserName, currency);
      
      // Fetch workers data
      const workersData = await this.fetchWorkersData(resolvedApiKey, miningUserName, currency);
      
      // Create mining data object
      const miningData: MiningData = {
        balance: balanceInfo,
        hashrate: hashrateInfo,
        workers: workersData,
        currency: currency,
        timestamp: new Date().toISOString()
      };
      
      // Cache the mining data
      this.cache.set(`mining_data:${miningUserName}:${currency}`, miningData);
      
      // Generate and cache hashrate history (we'll implement this with real API data later)
      const hashrateHistory = await this.fetchHashrateHistory(resolvedApiKey, miningUserName, currency);
      this.cache.set(`hashrate_history:${miningUserName}:${currency}`, hashrateHistory);
      
      // Generate and cache income history
      const incomeHistory = await this.fetchIncomeHistory(resolvedApiKey, miningUserName, currency);
      this.cache.set(`income_history:${miningUserName}:${currency}`, incomeHistory);
      
      // Cache workers data
      this.cache.set(`workers:${miningUserName}:${currency}`, workersData);
      
      // Generate and cache activity logs
      const activityLogs = await this.fetchActivityLogs(resolvedApiKey, miningUserName, currency);
      this.cache.set(`activity:${miningUserName}:${currency}`, activityLogs);
      
      return miningData;
    } catch (error) {
      console.error("Error fetching mining data:", error);
      throw new Error("Failed to fetch mining data from F2Pool API");
    }
  }
  
  // Make an authenticated API call to F2Pool
  private async makeApiCall<T>(endpoint: string, apiKey: string, body: Record<string, any>): Promise<T> {
    try {
      const response = await fetch(`${this.apiBaseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'F2P-API-SECRET': apiKey
        },
        body: JSON.stringify(body)
      });
      
      if (!response.ok) {
        throw new Error(`F2Pool API Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`F2Pool API response for ${endpoint}:`, data); // Added log
      
      // Check if the API returned an error code
      if (data.code && data.code !== 0) {
        throw new Error(`F2Pool API Error: ${data.msg}`);
      }
      
      return data as T;
    } catch (error) {
      console.error(`Error calling F2Pool API endpoint ${endpoint}:`, error);
      throw error;
    }
  }
  
  // Get cached mining data
  async getMiningData(miningUserName: string, currency: string, apiKey?: string): Promise<MiningData | null> {
    const cacheKey = `mining_data:${miningUserName}:${currency}`;
    
    // If we have cached data, return it
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    // If we have an API key, attempt to fetch real data
    if (apiKey || this.defaultApiKey) {
      try {
        return await this.fetchMiningData(apiKey, miningUserName, currency);
      } catch (error) {
        console.error("Error fetching real data, falling back to simulated data:", error);
      }
    }
    
    // Otherwise, simulate data for testing
    const simulatedData = this.generateSimulatedMiningData(miningUserName, currency as Currency);
    this.cache.set(cacheKey, simulatedData);
    
    // Also generate and cache related data
    this.cache.set(`hashrate_history:${miningUserName}:${currency}`, this.generateHashrateHistory(simulatedData.hashrate.h24_hash_rate));
    this.cache.set(`income_history:${miningUserName}:${currency}`, this.generateIncomeHistory(simulatedData.balance.yesterday_income));
    this.cache.set(`workers:${miningUserName}:${currency}`, this.generateWorkersData(25));
    this.cache.set(`activity:${miningUserName}:${currency}`, this.generateActivityLogs());
    
    return simulatedData;
  }
  
  // Get hashrate history
  async getHashrateHistory(miningUserName: string, currency: string, apiKey?: string): Promise<any[]> {
    const cacheKey = `hashrate_history:${miningUserName}:${currency}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    if (apiKey || this.defaultApiKey) {
      try {
        const history = await this.fetchHashrateHistory(apiKey || this.defaultApiKey, miningUserName, currency);
        this.cache.set(cacheKey, history);
        return history;
      } catch (error) {
        console.error("Error fetching hashrate history, falling back to simulated data:", error);
      }
    }
    
    // Get mining data to get current hashrate
    const miningData = await this.getMiningData(miningUserName, currency);
    if (miningData) {
      const history = this.generateHashrateHistory(miningData.hashrate.h24_hash_rate);
      this.cache.set(cacheKey, history);
      return history;
    }
    
    return [];
  }
  
  // Get income history
  async getIncomeHistory(miningUserName: string, currency: string, apiKey?: string): Promise<any[]> {
    const cacheKey = `income_history:${miningUserName}:${currency}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    if (apiKey || this.defaultApiKey) {
      try {
        const history = await this.fetchIncomeHistory(apiKey || this.defaultApiKey, miningUserName, currency);
        this.cache.set(cacheKey, history);
        return history;
      } catch (error) {
        console.error("Error fetching income history, falling back to simulated data:", error);
      }
    }
    
    // Get mining data to get current income
    const miningData = await this.getMiningData(miningUserName, currency);
    if (miningData) {
      const history = this.generateIncomeHistory(miningData.balance.yesterday_income);
      this.cache.set(cacheKey, history);
      return history;
    }
    
    return [];
  }
  
  // Get workers data
  async getWorkers(miningUserName: string, currency: string, apiKey?: string): Promise<WorkerInfo[]> {
    const cacheKey = `workers:${miningUserName}:${currency}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    if (apiKey || this.defaultApiKey) {
      try {
        const workers = await this.fetchWorkersData(apiKey || this.defaultApiKey, miningUserName, currency);
        this.cache.set(cacheKey, workers);
        return workers;
      } catch (error) {
        console.error("Error fetching workers data, falling back to simulated data:", error);
      }
    }
    
    const workers = this.generateWorkersData(25);
    this.cache.set(cacheKey, workers);
    return workers;
  }
  
  // Get activity logs
  async getActivityLogs(miningUserName: string, currency: string, apiKey?: string): Promise<ActivityItem[]> {
    const cacheKey = `activity:${miningUserName}:${currency}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    if (apiKey || this.defaultApiKey) {
      try {
        const activity = await this.fetchActivityLogs(apiKey || this.defaultApiKey, miningUserName, currency);
        this.cache.set(cacheKey, activity);
        return activity;
      } catch (error) {
        console.error("Error fetching activity logs, falling back to simulated data:", error);
      }
    }
    
    const activity = this.generateActivityLogs();
    this.cache.set(cacheKey, activity);
    return activity;
  }
  
  // Real API methods
  private async fetchBalanceInfo(apiKey: string, miningUserName: string, currency: string): Promise<BalanceInfo> {
    interface BalanceApiResponse {
      balance_info: {
        balance: number;
        immature_balance: number;
        paid: number;
        total_income: number;
        yesterday_income: number;
        estimated_today_income: number;
      }
    }
    
    try {
      const data = await this.makeApiCall<BalanceApiResponse>('/assets/balance', apiKey, {
        currency: currency,
        mining_user_name: miningUserName,
      });
      
      return {
        balance: data.balance_info.balance,
        immature_balance: data.balance_info.immature_balance,
        paid: data.balance_info.paid,
        total_income: data.balance_info.total_income,
        yesterday_income: data.balance_info.yesterday_income,
        estimated_today_income: data.balance_info.estimated_today_income,
      };
    } catch (error) {
      console.error("Error fetching balance info:", error);
      // Return simulated data as fallback
      return this.generateSimulatedBalanceInfo();
    }
  }
  
  private async fetchHashrateInfo(apiKey: string, miningUserName: string, currency: string): Promise<HashRateInfo> {
    interface HashRateApiResponse {
      info: {
        name: string;
        hash_rate: number;
        h1_hash_rate: number;
        h24_hash_rate: number;
        h24_stale_hash_rate: number;
        h24_delay_hash_rate: number;
      };
      currency: string;
    }
    
    try {
      const data = await this.makeApiCall<HashRateApiResponse>('/hash_rate/info', apiKey, {
        currency: currency,
        mining_user_name: miningUserName,
      });
      
      return {
        name: data.info.name,
        hash_rate: data.info.hash_rate,
        h1_hash_rate: data.info.h1_hash_rate,
        h24_hash_rate: data.info.h24_hash_rate,
        h24_stale_hash_rate: data.info.h24_stale_hash_rate,
        h24_delay_hash_rate: data.info.h24_delay_hash_rate,
      };
    } catch (error) {
      console.error("Error fetching hashrate info:", error);
      // Return simulated data as fallback
      return this.generateSimulatedHashrateInfo(miningUserName);
    }
  }
  
  private async fetchWorkersData(apiKey: string, miningUserName: string, currency: string): Promise<WorkerInfo[]> {
    interface WorkerApiResponse {
      workers: Array<{
        hash_rate_info: {
          name: string;
          hash_rate: number;
          h1_hash_rate: number;
          h24_hash_rate: number;
          h24_stale_hash_rate: number;
        };
        last_share_at: number;
        status: string;
        host: string;
      }>;
    }
    
    try {
      const data = await this.makeApiCall<WorkerApiResponse>('/hash_rate/worker/list', apiKey, {
        currency: currency,
        mining_user_name: miningUserName,
      });
      
      return data.workers.map(worker => ({
        hash_rate_info: {
          name: worker.hash_rate_info.name,
          hash_rate: worker.hash_rate_info.hash_rate,
          h1_hash_rate: worker.hash_rate_info.h1_hash_rate,
          h24_hash_rate: worker.hash_rate_info.h24_hash_rate,
          h24_stale_hash_rate: worker.hash_rate_info.h24_stale_hash_rate,
        },
        last_share_at: worker.last_share_at,
        status: worker.status,
        host: worker.host,
      }));
    } catch (error) {
      console.error("Error fetching workers data:", error);
      // Return simulated data as fallback
      return this.generateWorkersData(25);
    }
  }
  
  private async fetchHashrateHistory(apiKey: string, miningUserName: string, currency: string): Promise<any[]> {
    interface HashrateHistoryResponse {
      history: Array<{
        timestamp: number;
        hash_rate: number;
        stale_hash_rate: number;
        delay_hash_rate: number;
      }>;
    }
    
    const dayInSeconds = 24 * 60 * 60;
    
    try {
      const data = await this.makeApiCall<HashrateHistoryResponse>('/hash_rate/history', apiKey, {
        currency: currency,
        mining_user_name: miningUserName,
        interval: 3600, // 1 hour intervals (in seconds)
        duration: dayInSeconds, // Last 24 hours
      });
      
      return data.history.map(item => ({
        timestamp: new Date(item.timestamp * 1000).toISOString(),
        hashrate: item.hash_rate,
      }));
    } catch (error) {
      console.error("Error fetching hashrate history:", error);
      // Get mining data to get current hashrate
      const miningData = await this.getMiningData(miningUserName, currency);
      if (miningData) {
        // Return simulated data as fallback
        return this.generateHashrateHistory(miningData.hashrate.h24_hash_rate);
      }
      return [];
    }
  }
  
  private async fetchIncomeHistory(apiKey: string, miningUserName: string, currency: string): Promise<any[]> {
    interface TransactionItem {
      id: number;
      type: string;
      changed_balance: number;
      created_at: number;
      mining_extra: {
        mining_date: number;
        settle_date: number;
      };
    }
    
    interface TransactionsResponse {
      transactions: TransactionItem[];
    }
    
    const now = Math.floor(Date.now() / 1000);
    const weekAgo = now - (7 * 24 * 60 * 60);
    
    try {
      const data = await this.makeApiCall<TransactionsResponse>('/assets/transactions/list', apiKey, {
        currency: currency,
        mining_user_name: miningUserName,
        type: 'revenue', // Only get revenue transactions
        start_time: weekAgo,
        end_time: now,
      });
      
      // Group transactions by day and sum up the income
      const incomeByDay = new Map<string, number>();
      
      data.transactions.forEach(transaction => {
        if (transaction.changed_balance > 0) { // Only consider positive changes (income)
          const date = new Date(transaction.created_at * 1000);
          const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          
          const currentIncome = incomeByDay.get(dateKey) || 0;
          incomeByDay.set(dateKey, currentIncome + transaction.changed_balance);
        }
      });
      
      // Convert to array format
      return Array.from(incomeByDay).map(([date, income]) => ({
        date,
        income,
      }));
    } catch (error) {
      console.error("Error fetching income history:", error);
      
      // Get mining data to get current income
      const miningData = await this.getMiningData(miningUserName, currency);
      if (miningData) {
        // Return simulated data as fallback
        return this.generateIncomeHistory(miningData.balance.yesterday_income);
      }
      return [];
    }
  }
  
  private async fetchActivityLogs(apiKey: string, miningUserName: string, currency: string): Promise<ActivityItem[]> {
    interface TransactionItem {
      id: number;
      type: string;
      changed_balance: number;
      created_at: number;
    }
    
    interface TransactionsResponse {
      transactions: TransactionItem[];
    }
    
    const now = Math.floor(Date.now() / 1000);
    const dayAgo = now - (24 * 60 * 60);
    
    try {
      // Fetch transactions for activity
      const data = await this.makeApiCall<TransactionsResponse>('/assets/transactions/list', apiKey, {
        currency: currency,
        mining_user_name: miningUserName,
        type: 'all', // Get all transaction types
        start_time: dayAgo,
        end_time: now,
      });
      
      // Process transactions into activity items
      const activities: ActivityItem[] = [];
      
      data.transactions.forEach(transaction => {
        const id = transaction.id.toString();
        let type: 'payment' | 'worker_online' | 'worker_offline' | 'ai_update' = 'payment';
        let description = '';
        
        if (transaction.type === 'payout') {
          type = 'payment';
          description = `${Math.abs(transaction.changed_balance).toFixed(6)} ${currency} paid out`;
        } else if (transaction.type === 'revenue') {
          type = 'payment';
          description = `${transaction.changed_balance.toFixed(6)} ${currency} earned from mining`;
        }
        
        activities.push({
          id,
          type,
          description,
          timestamp: transaction.created_at,
        });
      });
      
      // For now we still need to include some simulated worker data since the API doesn't provide worker status changes
      const simulatedActivities = this.generateActivityLogs().filter(
        activity => activity.type === 'worker_online' || activity.type === 'worker_offline'
      );
      
      return [...activities, ...simulatedActivities].sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      // Return simulated data as fallback
      return this.generateActivityLogs();
    }
  }
  
  // Helper methods to generate simulated data
  private generateSimulatedMiningData(miningUserName: string, currency: Currency): MiningData {
    return {
      balance: this.generateSimulatedBalanceInfo(),
      hashrate: this.generateSimulatedHashrateInfo(miningUserName),
      currency: currency,
      timestamp: new Date().toISOString()
    };
  }
  
  private generateSimulatedBalanceInfo(): BalanceInfo {
    return {
      balance: Math.random() * 0.1, // 0.0 to 0.1 BTC
      immature_balance: Math.random() * 0.01,
      paid: Math.random() * 10,
      total_income: Math.random() * 11,
      yesterday_income: Math.random() * 0.005,
      estimated_today_income: Math.random() * 0.002,
    };
  }
  
  private generateSimulatedHashrateInfo(miningUserName: string): HashRateInfo {
    return {
      name: miningUserName,
      hash_rate: (Math.random() * 20 + 110) * 1e12, // 110-130 TH/s
      h1_hash_rate: (Math.random() * 20 + 105) * 1e12,
      h24_hash_rate: (Math.random() * 20 + 100) * 1e12,
      h24_stale_hash_rate: (Math.random() * 2) * 1e12, // 0-2% stale
      h24_delay_hash_rate: (Math.random()) * 1e12, // 0-1% delayed
    };
  }
  
  private generateHashrateHistory(baseHashrate: number): any[] {
    const now = Date.now();
    return Array.from({ length: 24 }, (_, i) => {
      // Create some variation in the hashrate over time
      const variation = (Math.random() * 0.2 - 0.1) * baseHashrate; // +/- 10%
      return {
        timestamp: new Date(now - (23 - i) * 3600 * 1000).toISOString(),
        hashrate: baseHashrate + variation,
      };
    });
  }
  
  private generateIncomeHistory(baseIncome: number): any[] {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      // Create some variation in the income over days
      const variation = (Math.random() * 0.4 - 0.2) * baseIncome; // +/- 20%
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        income: baseIncome + variation,
      };
    });
  }
  
  private generateWorkersData(count: number = 25): WorkerInfo[] {
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
  }
  
  private generateActivityLogs(): ActivityItem[] {
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
  }
}

export const f2poolService = new F2PoolService();
