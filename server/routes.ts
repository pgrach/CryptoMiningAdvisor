import type { Express } from "express";
import { createServer, type Server } from "http";
import { f2poolService } from "./services/f2pool";
import { marketService } from "./services/market";
import { advisorService } from "./services/advisor";

export async function registerRoutes(app: Express): Promise<Server> {
  // API connection testing - now using env vars if no credentials provided
  app.post('/api/mining/test-connection', async (req, res) => {
    try {
      const { apiKey, miningUserName, currency = 'bitcoin' } = req.body;
      
      // Try to make a minimal API call to verify credentials
      try {
        // The simplest call is to fetch hashrate info using provided or env credentials
        await f2poolService.fetchHashrateInfo(apiKey, miningUserName, currency);
        
        // If we get here, the connection was successful
        res.json({
          success: true,
          message: 'Connection successful. API credentials are valid.',
        });
      } catch (apiError: any) {
        console.error('F2Pool API test failed:', apiError);

        // Try to provide a more meaningful error message
        let errorMessage = 'Failed to connect to F2Pool API. Please check your credentials.';
        
        if (apiError.message) {
          if (apiError.message.includes('401') || apiError.message.includes('403')) {
            errorMessage = 'Authentication failed. Your API key appears to be invalid.';
          } else if (apiError.message.includes('404')) {
            errorMessage = 'Mining username not found. Please check your F2Pool username.';
          } else if (apiError.message.includes('Too Many Requests') || apiError.message.includes('429')) {
            errorMessage = 'Too many requests to F2Pool API. Please try again later.';
          }
        }
        
        res.status(400).json({
          success: false,
          message: errorMessage
        });
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  });

  // New API endpoint to get connection status using environment variables
  app.get('/api/mining/env-connection-status', async (req, res) => {
    try {
      const apiKey = process.env.F2POOL_API_KEY;
      const miningUserName = process.env.F2POOL_USERNAME;
      const currency = 'bitcoin';
      
      if (!apiKey || !miningUserName) {
        return res.json({
          success: false,
          message: 'API credentials not configured in environment variables',
          configured: false
        });
      }
      
      try {
        // Test connection with environment variables
        await f2poolService.fetchHashrateInfo(apiKey, miningUserName, currency);
        
        res.json({
          success: true,
          message: 'Environment connection successful',
          configured: true,
          username: miningUserName,
          currency: currency
        });
      } catch (apiError) {
        console.error('F2Pool API env connection test failed:', apiError);
        
        res.json({
          success: false,
          message: 'Environment credentials are invalid',
          configured: true,
          error: apiError instanceof Error ? apiError.message : 'Unknown error'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error checking environment connection',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // New endpoint specifically for testing direct connection to F2Pool API
  app.post('/api/mining/test-direct-connection', async (req, res) => {
    try {
      console.log('Testing direct connection to F2Pool API...');
      const { currency = 'bitcoin' } = req.body;
      
      // Get credentials from environment variables
      const apiKey = process.env.F2POOL_API_KEY;
      const username = process.env.F2POOL_USERNAME;
      
      if (!apiKey || !username) {
        console.error('Missing API credentials in environment variables');
        return res.json({
          success: false,
          message: 'API credentials not properly configured in environment variables'
        });
      }
      
      console.log(`Making test request with username: ${username}, currency: ${currency}`);
      
      try {
        // Make a direct API call to F2Pool with detailed logging
        await f2poolService.testDirectConnection(apiKey, username, currency);
        
        // If we get here, the connection was successful
        res.json({
          success: true,
          message: 'Successfully connected to F2Pool API',
          username: username
        });
      } catch (apiError: any) {
        // Log the full error for debugging
        console.error('F2Pool API direct test failed:', apiError);
        
        let errorMessage = 'Failed to connect to F2Pool API. Please check your credentials.';
        
        if (apiError.message) {
          if (apiError.message.includes('401') || apiError.message.includes('403')) {
            errorMessage = 'Authentication failed. Your API key appears to be invalid.';
          } else if (apiError.message.includes('404')) {
            errorMessage = 'Mining username not found. Please check your F2Pool username.';
          } else if (apiError.message.includes('Too Many Requests') || apiError.message.includes('429')) {
            errorMessage = 'Too many requests to F2Pool API. Please try again later.';
          } else {
            errorMessage = `API Error: ${apiError.message}`;
          }
        }
        
        res.status(200).json({
          success: false,
          message: errorMessage
        });
      }
    } catch (error: any) {
      console.error('Error handling direct connection test:', error);
      res.status(200).json({
        success: false,
        message: `Server error: ${error.message || 'Unknown error'}`
      });
    }
  });

  // Mining data direct fetch endpoint
  app.post('/api/mining/fetch', async (req, res) => {
    try {
      const { apiKey, miningUserName, currency = 'bitcoin' } = req.body;
      
      // Fetch mining data from F2Pool (will use env vars if no credentials provided)
      const miningData = await f2poolService.fetchMiningData(apiKey, miningUserName, currency);
      
      res.json({ 
        success: true, 
        message: 'Mining data fetched successfully',
        data: miningData
      });
    } catch (error) {
      console.error('Error fetching mining data:', error);
      res.status(500).json({ 
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch mining data' 
      });
    }
  });
  
  // Endpoint to get mining data using env credentials if not provided
  app.get('/api/mining/data', async (req, res) => {
    try {
      const { currency = 'bitcoin', miningUserName, apiKey } = req.query;
      
      // Get mining data with the provided credentials or env vars
      const miningData = await f2poolService.getMiningData(
        miningUserName as string | undefined, 
        currency as string,
        apiKey as string | undefined
      );
      
      if (!miningData) {
        return res.status(404).json({ 
          success: false,
          message: 'Mining data not found' 
        });
      }
      
      res.json(miningData);
    } catch (error) {
      console.error('Error getting mining data:', error);
      res.status(500).json({ 
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get mining data' 
      });
    }
  });
  
  // Endpoint to get hashrate history using env credentials if not provided
  app.get('/api/mining/hashrate-history', async (req, res) => {
    try {
      const { currency = 'bitcoin', miningUserName, apiKey } = req.query;
      
      // Get hashrate history with provided credentials or env vars
      const history = await f2poolService.getHashrateHistory(
        miningUserName as string | undefined, 
        currency as string,
        apiKey as string | undefined
      );
      
      res.json(history);
    } catch (error) {
      console.error('Error getting hashrate history:', error);
      res.status(500).json({ 
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get hashrate history' 
      });
    }
  });
  
  // Endpoint to get income history using env credentials if not provided
  app.get('/api/mining/income-history', async (req, res) => {
    try {
      const { currency = 'bitcoin', miningUserName, apiKey } = req.query;
      
      // Get income history with provided credentials or env vars
      const history = await f2poolService.getIncomeHistory(
        miningUserName as string | undefined, 
        currency as string,
        apiKey as string | undefined
      );
      
      res.json(history);
    } catch (error) {
      console.error('Error getting income history:', error);
      res.status(500).json({ 
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get income history' 
      });
    }
  });
  
  // Endpoint to get workers data using env credentials if not provided
  app.get('/api/mining/workers', async (req, res) => {
    try {
      const { currency = 'bitcoin', miningUserName, apiKey } = req.query;
      
      // Get workers data with provided credentials or env vars
      const workers = await f2poolService.getWorkers(
        miningUserName as string | undefined, 
        currency as string,
        apiKey as string | undefined
      );
      
      res.json(workers);
    } catch (error) {
      console.error('Error getting workers data:', error);
      res.status(500).json({ 
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get workers data' 
      });
    }
  });
  
  // Endpoint to get activity logs using env credentials if not provided
  app.get('/api/mining/activity', async (req, res) => {
    try {
      const { currency = 'bitcoin', miningUserName, apiKey } = req.query;
      
      // Get activity logs with provided credentials or env vars
      const activity = await f2poolService.getActivityLogs(
        miningUserName as string | undefined, 
        currency as string,
        apiKey as string | undefined
      );
      
      res.json(activity);
    } catch (error) {
      console.error('Error getting activity logs:', error);
      res.status(500).json({ 
        success: false,
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
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get market data' 
      });
    }
  });
  
  // Endpoint to get advisor recommendations
  app.get('/api/advisor/recommendation', async (req, res) => {
    try {
      const { currency, balance, price } = req.query;
      
      if (!currency) {
        return res.status(400).json({ 
          success: false,
          message: 'Currency is required' 
        });
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
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get advisor recommendation' 
      });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
