import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, subDays, addDays, startOfWeek, endOfWeek } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const Progress = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("weekly");
  
  // Calculate date ranges based on view mode
  const startDate = viewMode === "weekly" 
    ? startOfWeek(currentDate, { weekStartsOn: 1 }) 
    : subDays(currentDate, 30);
  
  const endDate = viewMode === "weekly"
    ? endOfWeek(currentDate, { weekStartsOn: 1 })
    : currentDate;
  
  const { data: progressData, isLoading } = useQuery({
    queryKey: [`/api/progress-range/${format(startDate, "yyyy-MM-dd")}/${format(endDate, "yyyy-MM-dd")}`],
  });
  
  const handlePrevious = () => {
    if (viewMode === "weekly") {
      setCurrentDate(subDays(currentDate, 7));
    } else {
      setCurrentDate(subDays(currentDate, 30));
    }
  };
  
  const handleNext = () => {
    const newDate = viewMode === "weekly" 
      ? addDays(currentDate, 7)
      : addDays(currentDate, 30);
    
    // Don't allow navigating to future dates
    if (newDate <= new Date()) {
      setCurrentDate(newDate);
    }
  };
  
  // Format data for chart
  const formatChartData = () => {
    if (!progressData) return [];
    
    return progressData.map((day: any) => ({
      date: format(new Date(day.date), "MMM dd"),
      pushups: day.pushupsDone,
      squats: day.squatsDone,
      situps: day.situpsDone,
    }));
  };
  
  const chartData = formatChartData();
  
  // Calculate completion rates
  const calculateCompletionRate = () => {
    if (!progressData || progressData.length === 0) return 0;
    
    const completedDays = progressData.filter((day: any) => day.completed).length;
    return Math.round((completedDays / progressData.length) * 100);
  };
  
  const dateRangeText = viewMode === "weekly"
    ? `${format(startDate, "MMM d")} - ${format(endDate, "MMM d, yyyy")}`
    : `${format(startDate, "MMM d")} - ${format(endDate, "MMM d, yyyy")}`;

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Progress Tracking</h2>
          <p className="text-gray-600">Monitor your fitness challenge journey</p>
        </div>
        <Tabs 
          defaultValue="weekly" 
          className="mt-4 md:mt-0"
          onValueChange={(value) => setViewMode(value)}
        >
          <TabsList>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between space-y-0 pb-2">
          <CardTitle>Exercise Progress</CardTitle>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePrevious}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">{dateRangeText}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleNext}
              disabled={endDate >= new Date()}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <p>Loading chart data...</p>
              </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="pushups" 
                    stroke="#3B82F6" 
                    name="Push-ups" 
                    strokeWidth={2} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="squats" 
                    stroke="#10B981" 
                    name="Squats" 
                    strokeWidth={2} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="situps" 
                    stroke="#F59E0B" 
                    name="Sit-ups" 
                    strokeWidth={2} 
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p>No data available for this period</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary mb-2">
              {calculateCompletionRate()}%
            </div>
            <p className="text-sm text-gray-500">
              Days completed in selected period
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Average Push-ups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary mb-2">
              {chartData.length > 0 
                ? Math.round(chartData.reduce((sum: number, day: any) => sum + day.pushups, 0) / chartData.length) 
                : 0}
            </div>
            <p className="text-sm text-gray-500">
              Average per day
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Average Squats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-secondary mb-2">
              {chartData.length > 0 
                ? Math.round(chartData.reduce((sum: number, day: any) => sum + day.squats, 0) / chartData.length) 
                : 0}
            </div>
            <p className="text-sm text-gray-500">
              Average per day
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Progress;
