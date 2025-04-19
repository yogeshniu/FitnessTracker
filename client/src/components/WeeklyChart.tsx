import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, startOfWeek, subDays } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const WeeklyChart = () => {
  const [startDate, setStartDate] = useState(() => {
    // Get the start of the current week (Monday)
    const today = new Date();
    return startOfWeek(today, { weekStartsOn: 1 });
  });
  
  const formattedStartDate = format(startDate, "yyyy-MM-dd");
  
  const { data: weeklyData, isLoading } = useQuery({
    queryKey: [`/api/weekly-progress/${formattedStartDate}`],
  });
  
  return (
    <Card className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Weekly Progress</h3>
      <div className="h-64">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p>Loading chart data...</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={weeklyData}
              margin={{
                top: 5,
                right: 5,
                left: 5,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="pushups" name="Push-ups" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="squats" name="Squats" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="situps" name="Sit-ups" fill="#F59E0B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
};

export default WeeklyChart;
