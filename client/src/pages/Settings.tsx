import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';

const Settings = () => {
  const [apiKey, setApiKey] = useState('');
  const [miningUserName, setMiningUserName] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(true);
  const [autoPayoutEnabled, setAutoPayoutEnabled] = useState(true);
  
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
              
              <Button className="w-full">Save API Settings</Button>
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
