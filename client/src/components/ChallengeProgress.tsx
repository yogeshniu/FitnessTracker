import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";

const ChallengeProgress = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/stats"],
  });
  
  // Challenge dates
  const startDate = new Date(2024, 0, 1); // Jan 1, 2024
  const endDate = new Date(2024, 5, 30); // Jun 30, 2024
  
  return (
    <Card className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Challenge Progress</h3>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-24">
          <p>Loading challenge progress...</p>
        </div>
      ) : (
        <div className="relative pt-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              {stats?.completionRate >= 90 ? (
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-secondary bg-green-100">
                  Excellent
                </span>
              ) : stats?.completionRate >= 70 ? (
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-accent bg-amber-100">
                  Good progress
                </span>
              ) : stats?.completionRate >= 50 ? (
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary bg-blue-100">
                  On track
                </span>
              ) : (
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-red-500 bg-red-100">
                  Needs improvement
                </span>
              )}
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-secondary">
                {stats?.challengeProgress || 0}%
              </span>
            </div>
          </div>
          
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
            <div 
              style={{ width: `${stats?.challengeProgress || 0}%` }} 
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-secondary rounded-l-full"
            ></div>
          </div>
          
          <div className="flex justify-between text-xs text-gray-600">
            <span>Start: {format(startDate, "MMM d, yyyy")}</span>
            <span className="font-medium">Day {stats?.daysCompleted || 0} of {stats?.totalDays || 180}</span>
            <span>End: {format(endDate, "MMM d, yyyy")}</span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ChallengeProgress;
