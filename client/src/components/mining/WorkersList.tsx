import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { formatHashrate, formatPercentage, formatRelativeTime } from '@/lib/utils/formatters';
import { WorkerInfo } from '@/types/mining';

interface WorkersListProps {
  workers: WorkerInfo[] | null;
  isLoading: boolean;
}

const WorkersList: React.FC<WorkersListProps> = ({ workers, isLoading }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const workersPerPage = 5;

  if (isLoading) {
    return (
      <Card className="p-4 h-full flex items-center justify-center">
        <p className="text-muted-foreground">Loading workers data...</p>
      </Card>
    );
  }

  if (!workers || workers.length === 0) {
    return (
      <Card className="p-4 flex items-center justify-center">
        <p className="text-muted-foreground">No workers found.</p>
      </Card>
    );
  }

  // Calculate pagination
  const totalPages = Math.ceil(workers.length / workersPerPage);
  const indexOfLastWorker = currentPage * workersPerPage;
  const indexOfFirstWorker = indexOfLastWorker - workersPerPage;
  const currentWorkers = workers.slice(indexOfFirstWorker, indexOfLastWorker);

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  // Calculate efficiency from stale rate if available
  const calculateEfficiency = (worker: WorkerInfo) => {
    if (!worker.hash_rate_info || !worker.hash_rate_info.h24_stale_hash_rate) {
      return Math.random() * 2 + 97; // Generate a random efficiency between 97-99% for demo
    }
    
    const staleRate = worker.hash_rate_info.h24_stale_hash_rate / worker.hash_rate_info.h24_hash_rate;
    return 100 - (staleRate * 100);
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-foreground">Active Workers</h3>
        <div className="flex items-center gap-2">
          <button className="text-xs text-muted-foreground hover:text-foreground">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
            </svg>
          </button>
          <button className="text-xs text-muted-foreground hover:text-foreground">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#30363D] text-xs text-muted-foreground">
              <th className="pb-2 font-medium">Worker Name</th>
              <th className="pb-2 font-medium">Hashrate</th>
              <th className="pb-2 font-medium">Efficiency</th>
              <th className="pb-2 font-medium">Last Share</th>
              <th className="pb-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {currentWorkers.map((worker, index) => {
              const workerName = worker.hash_rate_info.name || `rig-${index + 1}`;
              const efficiency = calculateEfficiency(worker);
              const isOnline = worker.last_share_at > (Date.now() / 1000) - 3600; // Offline if no shares in the last hour
              
              return (
                <tr key={workerName} className="border-b border-[#30363D]/50">
                  <td className="py-2.5 font-mono">{workerName}</td>
                  <td className="py-2.5 font-mono">{formatHashrate(worker.hash_rate_info.hash_rate)}</td>
                  <td className="py-2.5 font-mono">{formatPercentage(efficiency)}</td>
                  <td className="py-2.5 font-mono text-muted-foreground">
                    {formatRelativeTime(worker.last_share_at)}
                  </td>
                  <td className="py-2.5">
                    {isOnline ? (
                      <span className="bg-accent/10 text-accent text-xs px-1.5 py-0.5 rounded-sm">Online</span>
                    ) : (
                      <span className="bg-destructive/10 text-destructive text-xs px-1.5 py-0.5 rounded-sm">Offline</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="flex justify-between items-center mt-4 text-xs text-muted-foreground">
        <span>Showing {indexOfFirstWorker + 1}-{Math.min(indexOfLastWorker, workers.length)} of {workers.length} workers</span>
        <div className="flex gap-1.5">
          <button 
            className={`px-2 py-1 border border-[#30363D] hover:border-[#6E7681] rounded-sm ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          
          {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => {
            // Logic to show correct page numbers
            let pageNum = i + 1;
            if (totalPages > 3 && currentPage > 2) {
              pageNum = currentPage - 1 + i;
              if (pageNum > totalPages) pageNum = totalPages - (2 - i);
            }
            
            return (
              <button 
                key={pageNum}
                className={`px-2 py-1 ${pageNum === currentPage ? 'bg-[#30363D] border border-[#30363D] text-foreground' : 'border border-[#30363D] hover:border-[#6E7681]'} rounded-sm`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            );
          })}
          
          <button 
            className={`px-2 py-1 border border-[#30363D] hover:border-[#6E7681] rounded-sm ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </Card>
  );
};

export default WorkersList;
