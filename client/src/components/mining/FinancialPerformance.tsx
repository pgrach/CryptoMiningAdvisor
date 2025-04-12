import { Card } from '@/components/ui/card';
import { formatCrypto, formatFiat } from '@/lib/utils/formatters';
import { BalanceInfo } from '@/types/mining';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { CHART_COLORS } from '@/lib/constants';

interface FinancialPerformanceProps {
  balanceInfo: BalanceInfo | null;
  incomeHistory: any[] | null;
  btcPrice: number | null;
  currency: string;
}

const FinancialPerformance: React.FC<FinancialPerformanceProps> = ({ 
  balanceInfo, 
  incomeHistory, 
  btcPrice, 
  currency 
}) => {
  if (!balanceInfo) {
    return (
      <Card className="p-4 h-full flex items-center justify-center">
        <p className="text-muted-foreground">Loading financial data...</p>
      </Card>
    );
  }
  
  const calculateUsdValue = (cryptoAmount: number) => {
    if (!btcPrice) return null;
    return cryptoAmount * btcPrice;
  };
  
  return (
    <Card className="p-4">
      <h3 className="text-sm font-medium text-foreground mb-4">Financial Performance</h3>
      
      <div className="space-y-4">
        {/* Current Balance */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs">Current Balance</span>
          <div className="text-right">
            <span className="text-foreground font-mono text-base font-semibold">
              {formatCrypto(balanceInfo.balance, currency)} {currency.toUpperCase()}
            </span>
            <div className="text-xs text-muted-foreground font-mono">
              {btcPrice ? formatFiat(calculateUsdValue(balanceInfo.balance) || 0) : 'N/A'}
            </div>
          </div>
        </div>
        
        {/* Estimated Daily Income */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs">Est. Daily Income</span>
          <div className="text-right">
            <span className="text-foreground font-mono text-base font-semibold">
              {formatCrypto(balanceInfo.estimated_today_income, currency)} {currency.toUpperCase()}
            </span>
            <div className="text-xs text-muted-foreground font-mono">
              {btcPrice ? formatFiat(calculateUsdValue(balanceInfo.estimated_today_income) || 0) : 'N/A'}
            </div>
          </div>
        </div>
        
        {/* Yesterday's Income */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs">Yesterday's Income</span>
          <div className="text-right">
            <span className="text-foreground font-mono text-base font-semibold">
              {formatCrypto(balanceInfo.yesterday_income, currency)} {currency.toUpperCase()}
            </span>
            <div className="text-xs text-muted-foreground font-mono">
              {btcPrice ? formatFiat(calculateUsdValue(balanceInfo.yesterday_income) || 0) : 'N/A'}
            </div>
          </div>
        </div>
        
        {/* Total Mined */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs">Total Mined (Lifetime)</span>
          <div className="text-right">
            <span className="text-foreground font-mono text-base font-semibold">
              {formatCrypto(balanceInfo.total_income, currency)} {currency.toUpperCase()}
            </span>
            <div className="text-xs text-muted-foreground font-mono">
              {btcPrice ? formatFiat(calculateUsdValue(balanceInfo.total_income) || 0) : 'N/A'}
            </div>
          </div>
        </div>
        
        {/* Payout Threshold */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs">Payout Threshold</span>
          <div className="text-right">
            <span className="text-foreground font-mono text-base font-semibold">
              0.1000 {currency.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
      
      {/* Income Chart */}
      <div className="h-[180px] mt-4">
        <h4 className="text-xs text-muted-foreground mb-2">Daily Income (7 days)</h4>
        {incomeHistory ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={incomeHistory}
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            >
              <defs>
                <linearGradient id="income" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.income} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={CHART_COLORS.income} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
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
                formatter={(value: any) => [`${formatCrypto(value, currency)} ${currency.toUpperCase()}`, 'Income']}
                labelFormatter={(label) => label}
              />
              <Area 
                type="monotone" 
                dataKey="income" 
                stroke={CHART_COLORS.income} 
                fillOpacity={1}
                fill="url(#income)" 
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

export default FinancialPerformance;
