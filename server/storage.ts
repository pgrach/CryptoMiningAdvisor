import { users, type User, type InsertUser } from "@shared/schema";

// Interface for storing API tokens and mining account info
export interface MiningAccount {
  id: string;
  username: string; // F2Pool username/account
  currency: string; // default currency (e.g., "bitcoin")
  apiKey?: string; // API token for F2Pool
  lastUsed?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Mining account management
  getMiningAccount(id: string): Promise<MiningAccount | undefined>;
  getMiningAccountByUsername(username: string): Promise<MiningAccount | undefined>;
  createMiningAccount(account: Omit<MiningAccount, 'id' | 'createdAt' | 'updatedAt'>): Promise<MiningAccount>;
  updateMiningAccount(id: string, updates: Partial<Omit<MiningAccount, 'id' | 'createdAt' | 'updatedAt'>>): Promise<MiningAccount | undefined>;
  deleteMiningAccount(id: string): Promise<boolean>;
  listMiningAccounts(): Promise<MiningAccount[]>;
  
  // API token management
  getApiToken(miningUsername: string): Promise<string | undefined>;
  setApiToken(miningUsername: string, apiToken: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private miningAccounts: Map<string, MiningAccount>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.miningAccounts = new Map();
    this.currentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Mining account methods
  async getMiningAccount(id: string): Promise<MiningAccount | undefined> {
    return this.miningAccounts.get(id);
  }
  
  async getMiningAccountByUsername(username: string): Promise<MiningAccount | undefined> {
    return Array.from(this.miningAccounts.values()).find(
      (account) => account.username === username
    );
  }
  
  async createMiningAccount(account: Omit<MiningAccount, 'id' | 'createdAt' | 'updatedAt'>): Promise<MiningAccount> {
    const id = `mining_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date();
    
    const newAccount: MiningAccount = {
      ...account,
      id,
      createdAt: now,
      updatedAt: now
    };
    
    this.miningAccounts.set(id, newAccount);
    return newAccount;
  }
  
  async updateMiningAccount(id: string, updates: Partial<Omit<MiningAccount, 'id' | 'createdAt' | 'updatedAt'>>): Promise<MiningAccount | undefined> {
    const account = this.miningAccounts.get(id);
    
    if (!account) {
      return undefined;
    }
    
    const updatedAccount: MiningAccount = {
      ...account,
      ...updates,
      updatedAt: new Date()
    };
    
    this.miningAccounts.set(id, updatedAccount);
    return updatedAccount;
  }
  
  async deleteMiningAccount(id: string): Promise<boolean> {
    return this.miningAccounts.delete(id);
  }
  
  async listMiningAccounts(): Promise<MiningAccount[]> {
    return Array.from(this.miningAccounts.values());
  }
  
  // API token management methods
  async getApiToken(miningUsername: string): Promise<string | undefined> {
    const account = await this.getMiningAccountByUsername(miningUsername);
    return account?.apiKey;
  }
  
  async setApiToken(miningUsername: string, apiToken: string): Promise<boolean> {
    const account = await this.getMiningAccountByUsername(miningUsername);
    
    if (account) {
      // Update existing account
      await this.updateMiningAccount(account.id, { apiKey: apiToken });
      return true;
    }
    
    // Create a new account if it doesn't exist
    await this.createMiningAccount({
      username: miningUsername,
      currency: 'bitcoin', // Default currency
      apiKey: apiToken
    });
    
    return true;
  }
}

export const storage = new MemStorage();
