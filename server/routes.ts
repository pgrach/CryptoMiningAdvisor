import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { f2poolService } from "./services/f2pool";
import { marketService } from "./services/market";
import { advisorService } from "./services/advisor";

export async function registerRoutes(app: Express): Promise<Server> {
  // Mining account management endpoints
  app.post('/api/mining/accounts', async (req, res) => {
    try {
      const { username, apiToken, currency = 'bitcoin' } = req.body;
      
      if (!username) {
        return res.status(400).json({ 
          message: 'F2Pool mining username is required' 
        });
      }
      
      // Check if account already exists
      const existingAccount = await storage.getMiningAccountByUsername(username);
      if (existingAccount) {
        return res.status(409).json({
          message: 'A mining account with this username already exists',
          accountId: existingAccount.id
        });
      }
      
      // Create new mining account
      const newAccount = await storage.createMiningAccount({
        username,
        apiKey: apiToken,
        currency
      });
      
      // Remove apiKey from response for security
      const { apiKey, ...accountWithoutToken } = newAccount;
      
      res.status(201).json({
        message: 'Mining account created successfully',
        account: accountWithoutToken
      });
    } catch (error) {
      console.error('Error creating mining account:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to create mining account' 
      });
    }
  });
  
  app.get('/api/mining/accounts', async (req, res) => {
    try {
      // Get all mining accounts (without API keys)
      const accounts = await storage.listMiningAccounts();
      
      // Remove API keys from response for security
      const safeAccounts = accounts.map(({ apiKey, ...rest }) => rest);
      
      res.json(safeAccounts);
    } catch (error) {
      console.error('Error listing mining accounts:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to list mining accounts' 
      });
    }
  });
  
  app.get('/api/mining/accounts/:id', async (req, res) => {
    try {
      const account = await storage.getMiningAccount(req.params.id);
      
      if (!account) {
        return res.status(404).json({ message: 'Mining account not found' });
      }
      
      // Remove API key from response for security
      const { apiKey, ...accountWithoutToken } = account;
      
      res.json(accountWithoutToken);
    } catch (error) {
      console.error('Error getting mining account:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to get mining account' 
      });
    }
  });
  
  app.put('/api/mining/accounts/:id', async (req, res) => {
    try {
      const { currency } = req.body;
      const updates: Record<string, any> = {};
      
      if (currency) updates.currency = currency;
      
      const updatedAccount = await storage.updateMiningAccount(req.params.id, updates);
      
      if (!updatedAccount) {
        return res.status(404).json({ message: 'Mining account not found' });
      }
      
      // Remove API key from response for security
      const { apiKey, ...accountWithoutToken } = updatedAccount;
      
      res.json({
        message: 'Mining account updated successfully',
        account: accountWithoutToken
      });
    } catch (error) {
      console.error('Error updating mining account:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to update mining account' 
      });
    }
  });
  
  app.delete('/api/mining/accounts/:id', async (req, res) => {
    try {
      const success = await storage.deleteMiningAccount(req.params.id);
      
      if (!success) {
        return res.status(404).json({ message: 'Mining account not found' });
      }
      
      res.json({ message: 'Mining account deleted successfully' });
    } catch (error) {
      console.error('Error deleting mining account:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to delete mining account' 
      });
    }
  });
  
  // API token management
  app.post('/api/mining/accounts/:id/token', async (req, res) => {
    try {
      const { apiToken } = req.body;
      
      if (!apiToken) {
        return res.status(400).json({ message: 'API token is required' });
      }
      
      const account = await storage.getMiningAccount(req.params.id);
      
      if (!account) {
        return res.status(404).json({ message: 'Mining account not found' });
      }
      
      // Update the API token
      await storage.updateMiningAccount(req.params.id, { apiKey: apiToken });
      
      res.json({ message: 'API token updated successfully' });
    } catch (error) {
      console.error('Error updating API token:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to update API token' 
      });
    }
  });
  
  // Mining data endpoints
  app.post('/api/mining/fetch', async (req, res) => {
    try {
      const { apiKey, miningUserName, currency } = req.body;
      
      if (!miningUserName || !currency) {
        return res.status(400).json({ 
          message: 'Mining username and currency are required' 
        });
      }
      
      // Use provided API key or try to get it from storage
      const token = apiKey || await storage.getApiToken(miningUserName);
      
      if (!token) {
        return res.status(400).json({ 
          message: 'API token is required. Either provide it or set up a mining account first.' 
        });
      }
      
      // Fetch mining data from F2Pool
      const miningData = await f2poolService.fetchMiningData(token, miningUserName, currency);
      
      // If apiKey was provided but not stored, store it for future use
      if (apiKey && !(await storage.getMiningAccountByUsername(miningUserName))) {
        await storage.setApiToken(miningUserName, apiKey);
      }
      
      res.json({ success: true, message: 'Mining data fetched successfully' });
    } catch (error) {
      console.error('Error fetching mining data:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to fetch mining data' 
      });
    }
  });
  
  // Endpoint to get mining data
  app.get('/api/mining/data', async (req, res) => {
    try {
      const { currency, miningUserName } = req.query;
      
      if (!currency || !miningUserName) {
        return res.status(400).json({ 
          message: 'Currency and mining username are required' 
        });
      }
      
      // Try to get API token from storage
      const apiToken = await storage.getApiToken(miningUserName as string);
      
      // Get mining data, using API token if available
      const miningData = await f2poolService.getMiningData(
        miningUserName as string, 
        currency as string,
        apiToken
      );
      
      if (!miningData) {
        return res.status(404).json({ message: 'Mining data not found' });
      }
      
      res.json(miningData);
    } catch (error) {
      console.error('Error getting mining data:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to get mining data' 
      });
    }
  });
  
  // Endpoint to get hashrate history
  app.get('/api/mining/hashrate-history', async (req, res) => {
    try {
      const { currency, miningUserName } = req.query;
      
      if (!currency || !miningUserName) {
        return res.status(400).json({ 
          message: 'Currency and mining username are required' 
        });
      }
      
      // Try to get API token from storage
      const apiToken = await storage.getApiToken(miningUserName as string);
      
      // Get hashrate history, using API token if available
      const history = await f2poolService.getHashrateHistory(
        miningUserName as string, 
        currency as string,
        apiToken
      );
      
      res.json(history);
    } catch (error) {
      console.error('Error getting hashrate history:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to get hashrate history' 
      });
    }
  });
  
  // Endpoint to get income history
  app.get('/api/mining/income-history', async (req, res) => {
    try {
      const { currency, miningUserName } = req.query;
      
      if (!currency || !miningUserName) {
        return res.status(400).json({ 
          message: 'Currency and mining username are required' 
        });
      }
      
      // Try to get API token from storage
      const apiToken = await storage.getApiToken(miningUserName as string);
      
      // Get income history, using API token if available
      const history = await f2poolService.getIncomeHistory(
        miningUserName as string, 
        currency as string,
        apiToken
      );
      
      res.json(history);
    } catch (error) {
      console.error('Error getting income history:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to get income history' 
      });
    }
  });
  
  // Endpoint to get workers data
  app.get('/api/mining/workers', async (req, res) => {
    try {
      const { currency, miningUserName } = req.query;
      
      if (!currency || !miningUserName) {
        return res.status(400).json({ 
          message: 'Currency and mining username are required' 
        });
      }
      
      // Try to get API token from storage
      const apiToken = await storage.getApiToken(miningUserName as string);
      
      // Get workers data, using API token if available
      const workers = await f2poolService.getWorkers(
        miningUserName as string, 
        currency as string,
        apiToken
      );
      
      res.json(workers);
    } catch (error) {
      console.error('Error getting workers data:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to get workers data' 
      });
    }
  });
  
  // Endpoint to get activity logs
  app.get('/api/mining/activity', async (req, res) => {
    try {
      const { currency, miningUserName } = req.query;
      
      if (!currency || !miningUserName) {
        return res.status(400).json({ 
          message: 'Currency and mining username are required' 
        });
      }
      
      // Try to get API token from storage
      const apiToken = await storage.getApiToken(miningUserName as string);
      
      // Get activity logs, using API token if available
      const activity = await f2poolService.getActivityLogs(
        miningUserName as string, 
        currency as string,
        apiToken
      );
      
      res.json(activity);
    } catch (error) {
      console.error('Error getting activity logs:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to get activity logs' 
      });
    }
  });
  
  // Endpoint to get market data
  app.get('/api/market/data', async (req, res) => {
    try {
      const { currency } = req.query;
      
      // Get market data
      const marketData = await marketService.getMarketData(currency as string);
      
      res.json(marketData);
    } catch (error) {
      console.error('Error getting market data:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to get market data' 
      });
    }
  });
  
  // Endpoint to get advisor recommendations
  app.get('/api/advisor/recommendation', async (req, res) => {
    try {
      const { currency, balance, price } = req.query;
      
      if (!currency) {
        return res.status(400).json({ message: 'Currency is required' });
      }
      
      // Get AI advisor recommendation
      const recommendation = await advisorService.getRecommendation(
        currency as string,
        balance ? parseFloat(balance as string) : undefined,
        price ? parseFloat(price as string) : undefined
      );
      
      res.json(recommendation);
    } catch (error) {
      console.error('Error getting advisor recommendation:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to get advisor recommendation' 
      });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
