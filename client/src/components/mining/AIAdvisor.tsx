import { Card } from '@/components/ui/card';
import { AdvisorData, MarketData, MiningData } from '@/types/mining';
import { formatCrypto, formatFiat } from '@/lib/utils/formatters';

interface AIAdvisorProps {
  advisorData: AdvisorData | null;
  marketData: MarketData | null;
  miningData: MiningData | null;
}

const AIAdvisor: React.FC<AIAdvisorProps> = ({ advisorData, marketData, miningData }) => {
  if (!advisorData || !marketData || !miningData) {
    return (
      <Card className="p-4 h-full flex items-center justify-center">
        <p className="text-muted-foreground">Loading advisor data...</p>
      </Card>
    );
  }

  const btcPrice = marketData.bitcoin?.usd_price;
  const ethPrice = marketData.ethereum?.usd_price;
  const btcTrend = marketData.bitcoin?.trend;
  const ethTrend = marketData.ethereum?.trend;

  // Get recommendation color
  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'HODL':
        return 'bg-accent text-white';
      case 'SELL':
        return 'bg-destructive text-white';
      case 'TRADE':
        return 'bg-[#A371F7] text-white';
      default:
        return 'bg-muted text-foreground';
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-foreground">AI Portfolio Advisor</h3>
        <span className="bg-accent/10 text-accent text-xs px-2 py-0.5 rounded-sm">LIVE</span>
      </div>
      
      {/* Market Data */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs">BTC Price</span>
          <div className="text-right">
            <span className="text-foreground font-mono text-base font-semibold">
              {formatFiat(btcPrice || 0)}
            </span>
            {btcTrend && (
              <div className={`flex items-center text-xs justify-end ${btcTrend === 'up' ? 'indicator-up' : 'indicator-down'}`}>
                <svg className="h-3 w-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={btcTrend === 'up' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}></path>
                </svg>
                <span>{btcTrend === 'up' ? '+3.2%' : '-1.7%'}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs">ETH Price</span>
          <div className="text-right">
            <span className="text-foreground font-mono text-base font-semibold">
              {formatFiat(ethPrice || 0)}
            </span>
            {ethTrend && (
              <div className={`flex items-center text-xs justify-end ${ethTrend === 'up' ? 'indicator-up' : 'indicator-down'}`}>
                <svg className="h-3 w-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={ethTrend === 'up' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}></path>
                </svg>
                <span>{ethTrend === 'up' ? '+2.8%' : '-1.7%'}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs">Market Sentiment</span>
          <div className="text-right">
            <span className="text-foreground font-mono text-sm font-medium px-2 py-0.5 bg-accent/10 text-accent rounded-sm">
              {btcTrend === 'up' ? 'Bullish' : 'Bearish'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Recommendation */}
      <div className="bg-secondary border border-[#30363D] p-3 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">AI Recommendation</span>
          <span className="text-xs font-mono text-muted-foreground">Updated 5m ago</span>
        </div>
        
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-sm ${getRecommendationColor(advisorData.recommendation.recommendation)}`}>
            {advisorData.recommendation.recommendation}
          </span>
          <span className="text-foreground font-medium">
            {advisorData.recommendation.recommendation === 'TRADE' 
              ? 'Consider trading a portion for ETH'
              : advisorData.recommendation.recommendation === 'SELL'
                ? 'Consider taking profits'
                : 'Continue accumulation strategy'
            }
          </span>
        </div>
        
        <p className="text-xs text-muted-foreground">
          {advisorData.recommendation.reason}
        </p>
      </div>
      
      {/* Historical Accuracy */}
      <div>
        <h4 className="text-xs text-muted-foreground mb-2">AI Advisor Historical Accuracy</h4>
        <div className="bg-secondary border border-[#30363D] p-2">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">HODL Recommendations</span>
            <span className="text-foreground font-mono">{advisorData.accuracy.hodl}%</span>
          </div>
          <div className="w-full bg-[#0D1117] h-1.5 rounded-sm overflow-hidden">
            <div className="bg-accent h-full rounded-sm" style={{ width: `${advisorData.accuracy.hodl}%` }}></div>
          </div>
        </div>
        
        <div className="bg-secondary border border-[#30363D] p-2 mt-2">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">SELL Recommendations</span>
            <span className="text-foreground font-mono">{advisorData.accuracy.sell}%</span>
          </div>
          <div className="w-full bg-[#0D1117] h-1.5 rounded-sm overflow-hidden">
            <div className="bg-destructive h-full rounded-sm" style={{ width: `${advisorData.accuracy.sell}%` }}></div>
          </div>
        </div>
        
        <div className="bg-secondary border border-[#30363D] p-2 mt-2">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">TRADE Recommendations</span>
            <span className="text-foreground font-mono">{advisorData.accuracy.trade}%</span>
          </div>
          <div className="w-full bg-[#0D1117] h-1.5 rounded-sm overflow-hidden">
            <div className="bg-[#A371F7] h-full rounded-sm" style={{ width: `${advisorData.accuracy.trade}%` }}></div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AIAdvisor;
