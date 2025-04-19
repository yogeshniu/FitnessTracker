import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import ChallengeProgress from "@/components/ChallengeProgress";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B"];

const Statistics = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/stats"],
  });
  
  // Format exercise totals for comparison chart
  const formatExerciseTotals = () => {
    if (!stats) return [];
    
    return [
      { name: "Push-ups", value: stats.totalPushups },
      { name: "Squats", value: stats.totalSquats },
      { name: "Sit-ups", value: stats.totalSitups },
    ];
  };
  
  const exerciseTotals = formatExerciseTotals();
  
  // Format completion data for pie chart
  const formatCompletionData = () => {
    if (!stats) return [];
    
    return [
      { name: "Completed", value: stats.daysCompleted },
      { name: "Remaining", value: Math.max(0, stats.totalDays - stats.daysCompleted) }
    ];
  };
  
  const completionData = formatCompletionData();
  
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Challenge Statistics</h2>
        <p className="text-gray-600">Overview of your six-month challenge progress</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Push-ups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {stats?.totalPushups?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-gray-500">Challenge to date</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Squats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">
              {stats?.totalSquats?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-gray-500">Challenge to date</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Sit-ups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {stats?.totalSitups?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-gray-500">Challenge to date</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Longest Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-700">
              {stats?.longestStreak || 0} days
            </div>
            <p className="text-xs text-gray-500">Consecutive completion</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Exercise Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <p>Loading chart data...</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={exerciseTotals}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar 
                      dataKey="value" 
                      name="Total Reps" 
                      fill="#3B82F6" 
                      radius={[4, 4, 0, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Challenge Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex flex-col justify-center">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <p>Loading chart data...</p>
                </div>
              ) : (
                <>
                  <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={completionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {completionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 0 ? "#10B981" : "#E5E7EB"} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">
                      {stats?.daysCompleted || 0} of {stats?.totalDays || 180} days completed
                    </p>
                    <p className="text-sm text-gray-500">
                      Completion rate: {stats?.completionRate || 0}%
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <ChallengeProgress />
    </div>
  );
};

export default Statistics;
