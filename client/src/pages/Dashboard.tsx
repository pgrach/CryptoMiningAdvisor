import { useEffect, useState } from 'react';
import { useMiningData } from '@/hooks/useMiningData';
import { useMarketData } from '@/hooks/useMarketData';
import { useAdvisorData } from '@/hooks/useAdvisorData';
import { QuickSettingsState } from '@/types/mining';
import ConnectionForm from '@/components/mining/ConnectionForm';
import MiningPerformance from '@/components/mining/MiningPerformance';
import FinancialPerformance from '@/components/mining/FinancialPerformance';
import AIAdvisor from '@/components/mining/AIAdvisor';
import WorkersList from '@/components/mining/WorkersList';
import ActivityLog from '@/components/mining/ActivityLog';
import QuickSettings from '@/components/mining/QuickSettings';
import { UPDATE_INTERVAL } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const { toast } = useToast();
  const {
    miningData,
    hashrateHistory,
    incomeHistory,
    workersData,
    activityData,
    workersStats,
    isLoading,
    isLoadingWorkers,
    isLoadingActivity,
    error,
    connectAndFetchData,
    selectedCurrency
  } = useMiningData();
  
  const { marketData, btcPrice } = useMarketData(selectedCurrency);
  const { advisorData } = useAdvisorData(selectedCurrency, miningData, marketData);
  
  // Quick settings state
  const [quickSettings, setQuickSettings] = useState<QuickSettingsState>({
    autoPayout: true,
    emailAlerts: true,
    aiAdvisory: true,
    darkMode: true
  });
  
  // Set up automatic data refresh
  useEffect(() => {
    let intervalId: number | undefined;
    
    if (miningData) {
      intervalId = window.setInterval(() => {
        // We don't await this because we don't want to block the UI
        connectAndFetchData('saved-api-key', 'saved-username', selectedCurrency);
      }, UPDATE_INTERVAL);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [miningData, selectedCurrency]);
  
  // Show error if there is one
  useEffect(() => {
    if (error) {
      toast({
        title: "Error fetching data",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    }
  }, [error, toast]);
  
  const handleSettingsChange = (newSettings: QuickSettingsState) => {
    setQuickSettings(newSettings);
    
    // Here you would normally make an API call to save the settings
    toast({
      title: "Settings updated",
      description: "Your settings have been saved successfully."
    });
  };
  
  return (
    <main className="flex-grow overflow-y-auto px-4 py-6">
      <div className="container mx-auto">
        {/* API Connection Form */}
        <ConnectionForm 
          onConnect={connectAndFetchData}
          isLoading={isLoading}
          lastUpdated={miningData?.timestamp || null}
        />
        
        {/* Mining Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Left Column: Performance Metrics */}
          <MiningPerformance
            hashRateInfo={miningData?.hashrate || null}
            hashrateHistory={hashrateHistory}
            workersStats={workersStats}
          />
          
          {/* Middle Column: Financial Metrics */}
          <FinancialPerformance
            balanceInfo={miningData?.balance || null}
            incomeHistory={incomeHistory}
            btcPrice={btcPrice}
            currency={selectedCurrency}
          />
          
          {/* Right Column: AI Advisor */}
          <AIAdvisor
            advisorData={advisorData}
            marketData={marketData}
            miningData={miningData}
          />
        </div>
        
        {/* Detailed Data */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Workers List */}
          <div className="lg:col-span-3">
            <WorkersList
              workers={workersData}
              isLoading={isLoadingWorkers}
            />
          </div>
          
          {/* Recent Activity & Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Activity */}
            <ActivityLog
              activities={activityData}
              isLoading={isLoadingActivity}
            />
            
            {/* Quick Settings */}
            <QuickSettings
              initialSettings={quickSettings}
              onSettingsChange={handleSettingsChange}
            />
          </div>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
