import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CURRENCIES } from '@/lib/constants';
import { formatDate } from '@/lib/utils/formatters';
import { Card } from '@/components/ui/card';

interface ConnectionFormProps {
  onConnect: (apiKey: string, miningUserName: string, currency: string) => Promise<void>;
  isLoading: boolean;
  lastUpdated: string | null;
}

const ConnectionForm: React.FC<ConnectionFormProps> = ({ onConnect, isLoading, lastUpdated }) => {
  const [apiKey, setApiKey] = useState('');
  const [miningUserName, setMiningUserName] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('bitcoin');
  const [showApiKey, setShowApiKey] = useState(false);
  
  const handleSubmit = async () => {
    if (!apiKey || !miningUserName) return;
    await onConnect(apiKey, miningUserName, selectedCurrency);
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* API Key Input */}
        <Card className="p-3">
          <label className="block text-xs text-muted-foreground font-medium mb-1.5">F2Pool API Key</label>
          <div className="relative">
            <Input 
              type={showApiKey ? "text" : "password"} 
              value={apiKey} 
              onChange={(e) => setApiKey(e.target.value)} 
              className="terminal-input text-foreground text-sm" 
              placeholder="Enter your F2Pool API key"
            />
            <button 
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" 
              title={showApiKey ? "Hide API Key" : "Show API Key"}
              onClick={() => setShowApiKey(!showApiKey)}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={showApiKey 
                  ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" 
                  : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                }></path>
              </svg>
            </button>
          </div>
        </Card>
        
        {/* Mining Username Input */}
        <Card className="p-3">
          <label className="block text-xs text-muted-foreground font-medium mb-1.5">Mining Username</label>
          <Input 
            type="text" 
            value={miningUserName} 
            onChange={(e) => setMiningUserName(e.target.value)} 
            className="terminal-input text-foreground text-sm"
            placeholder="Your F2Pool username"
          />
        </Card>
        
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
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSubmit}
              disabled={isLoading || !apiKey || !miningUserName}
              className="bg-[#A371F7]/10 hover:bg-[#A371F7]/20 text-[#A371F7]"
            >
              {isLoading ? 'Loading...' : 'Refresh Data'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ConnectionForm;
