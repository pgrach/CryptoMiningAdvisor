import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [miningUserName, setMiningUserName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(true);
  const [autoPayoutEnabled, setAutoPayoutEnabled] = useState(true);
  
  const saveApiSettings = async () => {
    if (!apiKey || !miningUserName) {
      toast({
        title: "Missing Information",
        description: "Please provide both the API Key and Mining Username.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      console.log("Attempting to save API settings to server...");
      const requestBody = {
        username: miningUserName,
        apiToken: apiKey,
        currency: 'bitcoin'
      };
      console.log("Request body:", requestBody);

      // Alternative approach - First try fetching existing accounts to see if the username exists
      console.log("Checking if mining account already exists...");
      
      // First try to use the mining/fetch endpoint which can store API keys implicitly
      try {
        const fetchResponse = await fetch('/api/mining/fetch', {
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
        
        console.log("Fetch API response status:", fetchResponse.status);
        const fetchData = await fetchResponse.json().catch(e => ({ error: "Failed to parse JSON response" }));
        console.log("Fetch API response:", fetchData);
        
        if (fetchResponse.ok) {
          toast({
            title: "API Settings Saved",
            description: "Your F2Pool API key has been saved and tested successfully.",
          });
          setIsSaving(false);
          return;
        }
      } catch (fetchError) {
        console.error("Error with fetch API approach:", fetchError);
        // Continue to try the next approach if this one fails
      }

      // Original approach - try the /accounts endpoint
      const response = await fetch('/api/mining/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      console.log("Server response status:", response.status);
      
      const responseData = await response.json().catch(e => ({ error: "Failed to parse JSON response" }));
      console.log("Server response:", responseData);
      
      if (!response.ok) {
        // Check for specific error status codes
        if (response.status === 409) {
          // 409 Conflict - account already exists
          toast({
            title: "Account Already Exists",
            description: "A mining account with this username already exists. Try using the update API instead.",
          });
          return;
        }
        throw new Error(`Error ${response.status}: ${responseData.message || "Unknown error"}`);
      }
      
      toast({
        title: "API Settings Saved",
        description: "Your F2Pool API settings have been saved successfully on the server.",
      });
    } catch (error) {
      console.error('Error saving API settings:', error);
      toast({
        title: "Error Saving Settings",
        description: error instanceof Error ? error.message : "There was a problem saving your API settings to the server.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
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
              <CardDescription>Manage your F2Pool API connection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
              
              <Button className="w-full" onClick={saveApiSettings} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save API Settings'}
              </Button>
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
