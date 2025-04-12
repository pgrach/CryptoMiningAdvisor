import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CURRENCIES } from '@/lib/constants';
import { formatDate } from '@/lib/utils/formatters';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ConnectionFormProps {
  onConnect: (apiKey: string, miningUserName: string, currency: string) => Promise<void>;
  isLoading: boolean;
  lastUpdated: string | null;
}

const ConnectionForm: React.FC<ConnectionFormProps> = ({ onConnect, isLoading, lastUpdated }) => {
  const [selectedCurrency, setSelectedCurrency] = useState<string>('bitcoin');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  
  useEffect(() => {
    // Test connection with hardcoded credentials immediately
    testConnection();
  }, []);
  
  const testConnection = async () => {
    try {
      setConnectionStatus('checking');
      setStatusMessage('Testing connection to F2Pool...');
      
      // Test connection directly to F2Pool API using the hardcoded credentials
      try {
        console.log('Making direct API call test...');
        
        // Make a direct API call to test if we can connect to the API
        const response = await fetch('/api/mining/test-direct-connection', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ currency: selectedCurrency }),
        });
        
        console.log('API response status:', response.status);
        
        // Handle 404 error specifically
        if (response.status === 404) {
          console.error('API endpoint not found (404)');
          setConnectionStatus('error');
          setStatusMessage('Error: API endpoint /api/mining/test-direct-connection not found. The server might need to be restarted or the endpoint is not implemented.');
          return;
        }
        
        console.log('API response headers:', response.headers);
        console.log('Content-Type:', response.headers.get('content-type'));
        
        let responseText;
        try {
          // Try to get the response as text first for logging
          responseText = await response.text();
          console.log('API response text:', responseText);
          
          // Try to parse as JSON
          const data = responseText ? JSON.parse(responseText) : { success: false, message: 'Empty response' };
          
          if (data.success) {
            setConnectionStatus('connected');
            setStatusMessage('Connected to F2Pool using hardcoded API credentials.');
          } else {
            setConnectionStatus('error');
            setStatusMessage(`Connection error: ${data.message || 'Unknown error'}`);
          }
        } catch (parseError) {
          console.error('Error parsing response:', parseError);
          setConnectionStatus('error');
          setStatusMessage(`Response parsing error: ${responseText ? responseText.substring(0, 100) : 'Empty response'}`);
        }
      } catch (error: any) {
        console.error('Error testing connection:', error);
        setConnectionStatus('error');
        setStatusMessage(`Failed to connect to F2Pool API: ${error.message || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Error in test connection:', error);
      setConnectionStatus('error');
      setStatusMessage(`Connection test failed: ${error.message || 'Unknown error'}`);
    }
  };
  
  const handleSubmit = async () => {
    // Call onConnect with empty values - the server will use hardcoded credentials
    await onConnect('', '', selectedCurrency);
  };
  
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">F2Pool Connection</h2>
        {lastUpdated ? (
          <div className="text-xs px-2 py-1 bg-accent/10 text-accent rounded-sm font-medium flex items-center">
            <span className="h-2 w-2 rounded-full bg-accent mr-1.5"></span>Connected
          </div>
        ) : (
          <div className="text-xs px-2 py-1 bg-destructive/10 text-destructive rounded-sm font-medium flex items-center">
            <span className="h-2 w-2 rounded-full bg-destructive mr-1.5"></span>Disconnected
          </div>
        )}
      </div>
      
      {/* Connection Status */}
      <Alert className={`mb-4 ${connectionStatus === 'connected' ? 'border-green-500' : connectionStatus === 'error' ? 'border-destructive' : 'border-amber-500'}`}>
        <AlertDescription>
          {connectionStatus === 'checking' ? (
            'Testing connection to F2Pool API...'
          ) : connectionStatus === 'connected' ? (
            <>
              <span className="font-bold text-green-500">Connected</span> - Using hardcoded F2Pool API credentials
            </>
          ) : (
            <>
              <span className="font-bold text-destructive">Error</span> - Could not connect to F2Pool API
              <br />
              <span className="text-sm text-muted-foreground">{statusMessage}</span>
            </>
          )}
        </AlertDescription>
      </Alert>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Currency Selector */}
        <Card className="p-3">
          <label className="block text-xs text-muted-foreground font-medium mb-1.5">Mining Currency</label>
          <div className="relative">
            <select 
              className="terminal-input w-full px-3 py-2 text-foreground text-sm outline-none appearance-none focus:border-[#A371F7]"
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
            >
              {CURRENCIES.map((currency) => (
                <option key={currency} value={currency}>{currency}</option>
              ))}
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
        </Card>
        
        {/* Refresh Action */}
        <Card className="p-3 flex flex-col justify-between">
          <label className="block text-xs text-muted-foreground font-medium">Last Updated</label>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-mono">
              {lastUpdated ? formatDate(lastUpdated) : 'Never'}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={testConnection}
                disabled={connectionStatus === 'checking'}
                className="text-muted-foreground"
              >
                Test Connection
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSubmit}
                disabled={isLoading || connectionStatus !== 'connected'}
                className="bg-[#A371F7]/10 hover:bg-[#A371F7]/20 text-[#A371F7]"
              >
                {isLoading ? 'Loading...' : 'Refresh Data'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
      
      <div className="mt-4 text-xs text-muted-foreground">
        <p>
          Using hardcoded F2Pool API credentials to fetch mining data directly from the API.
        </p>
      </div>
    </div>
  );
};

export default ConnectionForm;
