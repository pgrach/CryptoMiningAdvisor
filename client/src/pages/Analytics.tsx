import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const Analytics = () => {
  return (
    <main className="flex-grow overflow-y-auto px-4 py-6">
      <div className="container mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Mining Analytics</h1>
          <p className="text-muted-foreground">
            Advanced analytics and reporting for your cryptocurrency mining operation.
          </p>
        </div>
        
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Analytics Dashboard</CardTitle>
            <CardDescription>
              This feature is coming soon. Check back later for detailed mining analytics.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              The analytics dashboard will include:
            </p>
            <ul className="list-disc list-inside mt-4 space-y-2 text-muted-foreground">
              <li>Historical hashrate trends</li>
              <li>Revenue analysis</li>
              <li>Worker performance comparison</li>
              <li>Profitability calculator</li>
              <li>Network difficulty tracking</li>
              <li>Power consumption metrics</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default Analytics;
