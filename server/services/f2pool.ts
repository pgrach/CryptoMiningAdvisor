import { MiningData, HashRateInfo, BalanceInfo, WorkerInfo, ActivityItem, Currency } from "../../client/src/types/mining";

interface ApiResponse<T> {
  code?: number;
  msg?: string;
  data?: T;
}

class F2PoolService {
  private apiBaseUrl = 'https://api.f2pool.com/v2';
  private cache: Map<string, any> = new Map();
  
  // Get API credentials from environment variables
  getApiCredentials() {
    return { 
      apiKey: process.env.F2POOL_API_KEY || '', 
      username: process.env.F2POOL_USERNAME || '' 
    };
  }
  
  // Direct test method for simplified connection testing with detailed error handling
  async testDirectConnection(apiKey: string, miningUserName: string, currency: string): Promise<boolean> {
    console.log(`Testing direct connection to F2Pool API for ${miningUserName} on ${currency}`);
    
    try {
      // Make a simple API call with minimal data requirements - using hash_rate/info endpoint
      // This endpoint is specifically mentioned in the docs as supporting bitcoin, bitcoin-cash, litecoin
      const response = await fetch(`${this.apiBaseUrl}/hash_rate/info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'F2P-API-SECRET': apiKey
        },
        body: JSON.stringify({
          currency: currency,
          user_name: miningUserName,  // Changed from mining_user_name to user_name per API docs
        })
      });
      
      console.log(`F2Pool API response status: ${response.status}`);
      
      // Check for non-OK responses
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`F2Pool API Error (${response.status}): ${errorText}`);
        throw new Error(`F2Pool API Error: ${response.status} ${response.statusText}`);
      }
      
      // Read the response as text first to log it
      const responseText = await response.text();
      console.log('F2Pool API response:', responseText);
      
      // Then parse it as JSON if it's valid
      try {
        const data = JSON.parse(responseText);
        
        // Check if the API returned an error code
        if (data.code && data.code !== 0) {
          throw new Error(`F2Pool API Error: ${data.msg}`);
        }
        
        // Success!
        return true;
      } catch (jsonError) {
        console.error('Error parsing JSON response:', jsonError);
        throw new Error(`Invalid JSON response from F2Pool API: ${responseText.substring(0, 100)}...`);
      }
    } catch (error) {
      console.error(`Error testing connection to F2Pool API:`, error);
      throw error;
    }
  }
  
  // Fetch mining data from F2Pool API
  async fetchMiningData(apiKey: string | undefined, miningUserName: string | undefined, currency: string): Promise<MiningData> {
    // Use environment variables
    const { apiKey: envApiKey, username: envUsername } = this.getApiCredentials();
    const actualApiKey = apiKey || envApiKey;
    const actualUsername = miningUserName || envUsername;
    
    console.log(`Attempting to fetch F2Pool data for user: ${actualUsername}, currency: ${currency}`);
    try {
      // Fetch balance information
      const balanceInfo = await this.fetchBalanceInfo(actualApiKey, actualUsername, currency);
      
      // Fetch hashrate information
      const hashrateInfo = await this.fetchHashrateInfo(actualApiKey, actualUsername, currency);
      
      // Fetch workers data
      const workersData = await this.fetchWorkersData(actualApiKey, actualUsername, currency);
      
      // Create mining data object
      const miningData: MiningData = {
        balance: balanceInfo,
        hashrate: hashrateInfo,
        workers: workersData,
        currency: currency,
        timestamp: new Date().toISOString()
      };
      
      // Cache the mining data with API key in the cache key to avoid cross-user data leakage
      const cacheKey = `mining_data:${actualUsername}:${currency}:${this.hashKey(actualApiKey)}`;
      this.cache.set(cacheKey, miningData);
      
      // Generate and cache hashrate history
      const hashrateHistory = await this.fetchHashrateHistory(actualApiKey, actualUsername, currency);
      this.cache.set(`hashrate_history:${actualUsername}:${currency}:${this.hashKey(actualApiKey)}`, hashrateHistory);
      
      // Generate and cache income history
      const incomeHistory = await this.fetchIncomeHistory(actualApiKey, actualUsername, currency);
      this.cache.set(`income_history:${actualUsername}:${currency}:${this.hashKey(actualApiKey)}`, incomeHistory);
      
      // Cache workers data
      this.cache.set(`workers:${actualUsername}:${currency}:${this.hashKey(actualApiKey)}`, workersData);
      
      // Generate and cache activity logs
      const activityLogs = await this.fetchActivityLogs(actualApiKey, actualUsername, currency);
      this.cache.set(`activity:${actualUsername}:${currency}:${this.hashKey(actualApiKey)}`, activityLogs);
      
      return miningData;
    } catch (error) {
      console.error("Error fetching mining data:", error);
      throw new Error("Failed to fetch mining data from F2Pool API");
    }
  }
  
  // Make an authenticated API call to F2Pool
  private async makeApiCall<T>(endpoint: string, apiKey: string, body: Record<string, any>): Promise<T> {
    console.log(`Making API call to ${endpoint} with body:`, body);
    
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
        const errorText = await response.text();
        console.error(`F2Pool API Error (${response.status}): ${errorText}`);
        throw new Error(`F2Pool API Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`API response from ${endpoint}:`, data);
      
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
  
  // Get cached mining data or generate simulated data as fallback
  async getMiningData(miningUserName?: string, currency: string = 'bitcoin', apiKey?: string): Promise<MiningData | null> {
    // Use environment variables
    const { apiKey: envApiKey, username: envUsername } = this.getApiCredentials();
    const actualApiKey = apiKey || envApiKey;
    const actualUsername = miningUserName || envUsername;
    
    const cacheKey = `mining_data:${actualUsername}:${currency}:${this.hashKey(actualApiKey)}`;
    
    // If we have cached data, return it
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    try {
      return await this.fetchMiningData(actualApiKey, actualUsername, currency);
    } catch (error) {
      console.error("Error fetching real data, falling back to simulated data:", error);
      // Generate simulated data as fallback
      const simulatedData = this.generateSimulatedMiningData(actualUsername || 'unknown', currency as Currency);
      return simulatedData;
    }
  }
  
  // Get hashrate history
  async getHashrateHistory(miningUserName?: string, currency: string = 'bitcoin', apiKey?: string): Promise<any[]> {
    // Use environment variables
    const { apiKey: envApiKey, username: envUsername } = this.getApiCredentials();
    const actualApiKey = apiKey || envApiKey;
    const actualUsername = miningUserName || envUsername;
    
    const cacheKey = `hashrate_history:${actualUsername}:${currency}:${this.hashKey(actualApiKey)}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    try {
      const history = await this.fetchHashrateHistory(actualApiKey, actualUsername, currency);
      this.cache.set(cacheKey, history);
      return history;
    } catch (error) {
      console.error("Error fetching hashrate history, falling back to simulated data:", error);
      // Get mining data to get current hashrate
      const miningData = await this.getMiningData(actualUsername, currency, actualApiKey);
      if (miningData) {
        const history = this.generateHashrateHistory(miningData.hashrate.h24_hash_rate);
        return history;
      }
      return [];
    }
  }
  
  // Get income history
  async getIncomeHistory(miningUserName?: string, currency: string = 'bitcoin', apiKey?: string): Promise<any[]> {
    // Use environment variables
    const { apiKey: envApiKey, username: envUsername } = this.getApiCredentials();
    const actualApiKey = apiKey || envApiKey;
    const actualUsername = miningUserName || envUsername;
    
    const cacheKey = `income_history:${actualUsername}:${currency}:${this.hashKey(actualApiKey)}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    try {
      const history = await this.fetchIncomeHistory(actualApiKey, actualUsername, currency);
      this.cache.set(cacheKey, history);
      return history;
    } catch (error) {
      console.error("Error fetching income history, falling back to simulated data:", error);
      
      // Get mining data to get current income
      const miningData = await this.getMiningData(actualUsername, currency, actualApiKey);
      if (miningData) {
        const history = this.generateIncomeHistory(miningData.balance.yesterday_income);
        return history;
      }
      return [];
    }
  }
  
  // Get workers data
  async getWorkers(miningUserName?: string, currency: string = 'bitcoin', apiKey?: string): Promise<WorkerInfo[]> {
    // Use environment variables
    const { apiKey: envApiKey, username: envUsername } = this.getApiCredentials();
    const actualApiKey = apiKey || envApiKey;
    const actualUsername = miningUserName || envUsername;
    
    const cacheKey = `workers:${actualUsername}:${currency}:${this.hashKey(actualApiKey)}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    try {
      const workers = await this.fetchWorkersData(actualApiKey, actualUsername, currency);
      this.cache.set(cacheKey, workers);
      return workers;
    } catch (error) {
      console.error("Error fetching workers data, falling back to simulated data:", error);
      const workers = this.generateWorkersData(25);
      return workers;
    }
  }
  
  // Get activity logs
  async getActivityLogs(miningUserName?: string, currency: string = 'bitcoin', apiKey?: string): Promise<ActivityItem[]> {
    // Use environment variables
    const { apiKey: envApiKey, username: envUsername } = this.getApiCredentials();
    const actualApiKey = apiKey || envApiKey;
    const actualUsername = miningUserName || envUsername;
    
    const cacheKey = `activity:${actualUsername}:${currency}:${this.hashKey(actualApiKey)}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    try {
      const activity = await this.fetchActivityLogs(actualApiKey, actualUsername, currency);
      this.cache.set(cacheKey, activity);
      return activity;
    } catch (error) {
      console.error("Error fetching activity logs, falling back to simulated data:", error);
      const activity = this.generateActivityLogs();
      return activity;
    }
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
        user_name: miningUserName, // Changed from mining_user_name to user_name per API docs
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
  
  async fetchHashrateInfo(apiKey: string, miningUserName: string, currency: string): Promise<HashRateInfo> {
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
        user_name: miningUserName, // Changed from mining_user_name to user_name per API docs
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
      throw error;
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
        user_name: miningUserName, // Changed from mining_user_name to user_name per API docs
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
        user_name: miningUserName, // Changed from mining_user_name to user_name per API docs
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
      const miningData = await this.getMiningData(miningUserName, currency, apiKey);
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
        user_name: miningUserName, // Changed from mining_user_name to user_name per API docs
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
      const miningData = await this.getMiningData(miningUserName, currency, apiKey);
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
        user_name: miningUserName, // Changed from mining_user_name to user_name per API docs
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

  // Helper to create a simple hash of the API key for cache keys
  private hashKey(key: string): string {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
  }
}

export const f2poolService = new F2PoolService();
