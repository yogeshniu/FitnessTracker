import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const StatsOverview = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/stats"],
  });
  
  const formatNumber = (number: number) => {
    if (number >= 1000) {
      return number.toLocaleString();
    }
    return number;
  };
  
  return (
    <Card className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Challenge Stats</h3>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <p>Loading stats...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Total Push-ups</p>
              <p className="text-2xl font-bold text-primary">
                {formatNumber(stats?.totalPushups || 0)}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Total Squats</p>
              <p className="text-2xl font-bold text-secondary">
                {formatNumber(stats?.totalSquats || 0)}
              </p>
            </div>
            <div className="bg-amber-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Total Sit-ups</p>
              <p className="text-2xl font-bold text-accent">
                {formatNumber(stats?.totalSitups || 0)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Longest Streak</p>
              <p className="text-2xl font-bold text-gray-700">
                {stats?.longestStreak || 0} days
              </p>
            </div>
          </div>
          
          <div className="mt-4">
            <h4 className="font-medium text-sm mb-2">Completion Rate</h4>
            <div className="flex items-center">
              <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                <div 
                  className="bg-secondary h-2.5 rounded-full" 
                  style={{ width: `${stats?.completionRate || 0}%` }}
                />
              </div>
              <span className="text-sm font-medium">{stats?.completionRate || 0}%</span>
            </div>
          </div>
        </>
      )}
    </Card>
  );
};

export default StatsOverview;
