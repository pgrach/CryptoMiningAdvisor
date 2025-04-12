import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const Settings = () => {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [miningUserName, setMiningUserName] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(true);
  const [autoPayoutEnabled, setAutoPayoutEnabled] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  
  const testConnection = async () => {
    if (!apiKey || !miningUserName) {
      toast({
        title: "Missing Information",
        description: "Please provide both the API Key and Mining Username.",
        variant: "destructive"
      });
      return;
    }
    
    setIsTesting(true);
    setConnectionStatus('idle');
    setStatusMessage('');
    
    try {
      console.log("Testing F2Pool API connection...");
      
      // Try to fetch mining data using the provided credentials
      const response = await fetch('/api/mining/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: apiKey,
          miningUserName: miningUserName,
          currency: 'bitcoin'
        }),
      });
      
      console.log("Test connection response status:", response.status);
      const responseData = await response.json();
      console.log("Test connection response:", responseData);
      
      if (response.ok && responseData.success) {
        setConnectionStatus('success');
        setStatusMessage("Successfully connected to F2Pool API. Your credentials are valid. Use these credentials when fetching data in dashboard and other pages.");
        toast({
          title: "Connection Successful",
          description: "Your F2Pool API credentials are valid.",
        });
        
        // Store credentials in session storage for convenience during the current session
        sessionStorage.setItem('f2pool_username', miningUserName);
        sessionStorage.setItem('f2pool_apikey', apiKey);
      } else {
        setConnectionStatus('error');
        setStatusMessage(responseData.message || "Could not connect to F2Pool. Please check your credentials.");
        toast({
          title: "Connection Failed",
          description: responseData.message || "Could not connect to F2Pool. Please check your credentials.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      setConnectionStatus('error');
      setStatusMessage("Network error. Could not connect to the server.");
      toast({
        title: "Connection Error",
        description: "Could not verify connection to F2Pool. There may be a network issue.",
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };
  
  return (
    <main className="flex-grow overflow-y-auto px-4 py-6">
      <div className="container mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Account Settings</h1>
          <p className="text-muted-foreground">
            Manage your F2Pool integration and application preferences.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* API Settings */}
          <Card>
            <CardHeader>
              <CardTitle>F2Pool Integration</CardTitle>
              <CardDescription>Connect to F2Pool API (credentials are only stored in your browser's session)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {connectionStatus !== 'idle' && (
                <Alert
                  variant={connectionStatus === 'success' ? "default" : "destructive"}
                  className="mb-4"
                >
                  <AlertTitle>
                    {connectionStatus === 'success' ? 'Connection Successful' : 'Connection Issue'}
                  </AlertTitle>
                  <AlertDescription>
                    {statusMessage}
                  </AlertDescription>
                </Alert>
              )}
            
              <div className="space-y-2">
                <Label htmlFor="apiKey">F2Pool API Key</Label>
                <Input 
                  id="apiKey" 
                  type="password" 
                  placeholder="Enter your F2Pool API key" 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="terminal-input"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="miningUserName">Mining Username</Label>
                <Input 
                  id="miningUserName" 
                  type="text" 
                  placeholder="Your F2Pool username" 
                  value={miningUserName}
                  onChange={(e) => setMiningUserName(e.target.value)}
                  className="terminal-input"
                />
              </div>
              
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button 
                  className="flex-1" 
                  onClick={testConnection} 
                  disabled={isTesting}
                >
                  {isTesting ? 'Testing...' : 'Test Connection'}
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground mt-2">
                Your API key is only stored temporarily in your browser session and never sent to any third parties. Learn how to 
                <a href="https://f2pool.io/mining/api" target="_blank" rel="noopener noreferrer" className="text-primary ml-1">
                  get an F2Pool API key
                </a>.
              </p>
            </CardContent>
          </Card>
          
          {/* Application Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Application Settings</CardTitle>
              <CardDescription>Configure app behavior and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive alerts for important events</p>
                </div>
                <Switch 
                  checked={notificationsEnabled} 
                  onCheckedChange={setNotificationsEnabled} 
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">Use dark theme throughout the app</p>
                </div>
                <Switch 
                  checked={darkModeEnabled} 
                  onCheckedChange={setDarkModeEnabled} 
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto Payout</p>
                  <p className="text-sm text-muted-foreground">Automatically process payouts</p>
                </div>
                <Switch 
                  checked={autoPayoutEnabled} 
                  onCheckedChange={setAutoPayoutEnabled} 
                />
              </div>
              
              <Button className="w-full">Save Preferences</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default Settings;
