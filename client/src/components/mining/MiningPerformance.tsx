import { Card, CardContent } from '@/components/ui/card';
import { formatHashrate, formatPercentage } from '@/lib/utils/formatters';
import { HashRateInfo } from '@/types/mining';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { CHART_COLORS } from '@/lib/constants';

interface MiningPerformanceProps {
  hashRateInfo: HashRateInfo | null;
  hashrateHistory: any[] | null;
  workersStats: {
    online: number;
    total: number;
  } | null;
}

const MiningPerformance: React.FC<MiningPerformanceProps> = ({ 
  hashRateInfo, 
  hashrateHistory,
  workersStats
}) => {
  if (!hashRateInfo) {
    return (
      <Card className="p-4 h-full flex items-center justify-center">
        <p className="text-muted-foreground">Loading mining performance data...</p>
      </Card>
    );
  }
  
  // Calculate efficiency
  const efficiency = hashRateInfo.h24_stale_hash_rate 
    ? 100 - ((hashRateInfo.h24_stale_hash_rate / hashRateInfo.h24_hash_rate) * 100) 
    : 98.7; // Default value
  
  // Calculate rejected shares percentage
  const rejectedShares = hashRateInfo.h24_stale_hash_rate 
    ? (hashRateInfo.h24_stale_hash_rate / hashRateInfo.h24_hash_rate) * 100 
    : 1.3; // Default value

  // Check for hashrate increase/decrease
  const hashrateChange = hashRateInfo.hash_rate > hashRateInfo.h24_hash_rate 
    ? { percent: ((hashRateInfo.hash_rate / hashRateInfo.h24_hash_rate - 1) * 100).toFixed(1), direction: 'up' }
    : { percent: ((1 - hashRateInfo.hash_rate / hashRateInfo.h24_hash_rate) * 100).toFixed(1), direction: 'down' };
    
  return (
    <Card className="p-4">
      <h3 className="text-sm font-medium text-foreground mb-4">Mining Performance</h3>
      
      <div className="space-y-4">
        {/* Hashrate */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs">Current Hashrate</span>
          <div className="text-right">
            <span className="text-foreground font-mono text-base font-semibold">
              {formatHashrate(hashRateInfo.hash_rate)}
            </span>
            <div className={`flex items-center text-xs justify-end ${hashrateChange.direction === 'up' ? 'indicator-up' : 'indicator-down'}`}>
              <svg className="h-3 w-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={hashrateChange.direction === 'up' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}></path>
              </svg>
              <span>{hashrateChange.percent}%</span>
            </div>
          </div>
        </div>
        
        {/* 24h Avg Hashrate */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs">24h Avg Hashrate</span>
          <div className="text-right">
            <span className="text-foreground font-mono text-base font-semibold">
              {formatHashrate(hashRateInfo.h24_hash_rate)}
            </span>
          </div>
        </div>
        
        {/* Workers Online */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs">Workers Online</span>
          <div className="text-right">
            <span className="text-foreground font-mono text-base font-semibold">
              {workersStats ? `${workersStats.online}/${workersStats.total}` : 'N/A'}
            </span>
          </div>
        </div>
        
        {/* Efficiency */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs">Efficiency</span>
          <div className="text-right">
            <span className="text-foreground font-mono text-base font-semibold">
              {formatPercentage(efficiency)}
            </span>
          </div>
        </div>
        
        {/* Rejected Shares */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs">Rejected Shares (24h)</span>
          <div className="text-right">
            <span className="text-foreground font-mono text-base font-semibold">
              {formatPercentage(rejectedShares)}
            </span>
          </div>
        </div>
      </div>
      
      {/* Hashrate Chart */}
      <div className="h-[180px] mt-4">
        <h4 className="text-xs text-muted-foreground mb-2">Hashrate (24h)</h4>
        {hashrateHistory ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={hashrateHistory}
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            >
              <defs>
                <linearGradient id="hashrate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.hashrate} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={CHART_COLORS.hashrate} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="timestamp" 
                tick={false} 
                axisLine={false} 
                tickLine={false} 
              />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1C2128', 
                  borderColor: '#30363D',
                  color: '#E6EDF3',
                  fontSize: '12px',
                  fontFamily: 'JetBrains Mono, monospace'
                }}
                formatter={(value: any) => [formatHashrate(value), 'Hashrate']}
                labelFormatter={() => ''}
              />
              <Area 
                type="monotone" 
                dataKey="hashrate" 
                stroke={CHART_COLORS.hashrate} 
                fillOpacity={1}
                fill="url(#hashrate)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-muted-foreground text-sm">No historical data available</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default MiningPerformance;
