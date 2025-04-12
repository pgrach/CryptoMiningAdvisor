import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { QuickSettingsState } from '@/types/mining';

interface QuickSettingsProps {
  initialSettings: QuickSettingsState;
  onSettingsChange: (settings: QuickSettingsState) => void;
}

const QuickSettings: React.FC<QuickSettingsProps> = ({ initialSettings, onSettingsChange }) => {
  const [settings, setSettings] = useState<QuickSettingsState>(initialSettings);
  
  const updateSetting = (key: keyof QuickSettingsState, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange(newSettings);
  };
  
  return (
    <Card className="p-4">
      <h3 className="text-sm font-medium text-foreground mb-4">Quick Settings</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-foreground">Auto-payout</span>
            <p className="text-xs text-muted-foreground mt-0.5">Automatically process payouts when threshold is reached</p>
          </div>
          <Switch 
            checked={settings.autoPayout} 
            onCheckedChange={(checked) => updateSetting('autoPayout', checked)} 
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-foreground">Email Alerts</span>
            <p className="text-xs text-muted-foreground mt-0.5">Get notified about important events</p>
          </div>
          <Switch 
            checked={settings.emailAlerts} 
            onCheckedChange={(checked) => updateSetting('emailAlerts', checked)} 
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-foreground">AI Advisory</span>
            <p className="text-xs text-muted-foreground mt-0.5">Allow AI to make trading recommendations</p>
          </div>
          <Switch 
            checked={settings.aiAdvisory} 
            onCheckedChange={(checked) => updateSetting('aiAdvisory', checked)} 
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-foreground">Dark Mode</span>
            <p className="text-xs text-muted-foreground mt-0.5">Use dark theme for interface</p>
          </div>
          <Switch 
            checked={settings.darkMode} 
            onCheckedChange={(checked) => updateSetting('darkMode', checked)} 
          />
        </div>
      </div>
      
      <button className="w-full mt-6 bg-secondary border border-[#30363D] hover:border-[#6E7681] text-xs font-medium text-foreground py-2 rounded-sm">
        View All Settings
      </button>
    </Card>
  );
};

export default QuickSettings;
