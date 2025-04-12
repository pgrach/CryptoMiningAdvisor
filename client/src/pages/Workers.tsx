import { Card, CardContent } from '@/components/ui/card';
import { useMiningData } from '@/hooks/useMiningData';
import WorkersList from '@/components/mining/WorkersList';

const Workers = () => {
  const { workersData, isLoadingWorkers } = useMiningData();
  
  return (
    <main className="flex-grow overflow-y-auto px-4 py-6">
      <div className="container mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Mining Workers</h1>
          <p className="text-muted-foreground">
            Manage and monitor your F2Pool mining workers from this page.
          </p>
        </div>
        
        <WorkersList
          workers={workersData}
          isLoading={isLoadingWorkers}
        />
      </div>
    </main>
  );
};

export default Workers;
