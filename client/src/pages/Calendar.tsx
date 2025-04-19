import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, getDaysInMonth, getDay, addMonths, subMonths } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import CalendarView from "@/components/CalendarView";

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const firstDayOfMonth = startOfMonth(currentMonth);
  const lastDayOfMonth = endOfMonth(currentMonth);
  
  const { data: monthProgress, isLoading } = useQuery({
    queryKey: [`/api/progress-range/${format(firstDayOfMonth, "yyyy-MM-dd")}/${format(lastDayOfMonth, "yyyy-MM-dd")}`],
  });
  
  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  const handleNextMonth = () => {
    // Don't navigate to future months
    const nextMonth = addMonths(currentMonth, 1);
    if (nextMonth <= new Date()) {
      setCurrentMonth(nextMonth);
    }
  };
  
  const handleGoToCurrentMonth = () => {
    setCurrentMonth(new Date());
  };
  
  // Calculate stats for the month
  const calculateMonthStats = () => {
    if (!monthProgress || monthProgress.length === 0) {
      return {
        completedDays: 0,
        completionRate: 0,
        totalPushups: 0,
        totalSquats: 0,
        totalSitups: 0,
      };
    }
    
    const completedDays = monthProgress.filter((day: any) => day.completed).length;
    const daysInMonth = getDaysInMonth(currentMonth);
    
    // For past months, use all days in month for rate. For current month, use days up to today.
    const isCurrentMonth = format(currentMonth, "yyyy-MM") === format(new Date(), "yyyy-MM");
    const daysToConsider = isCurrentMonth 
      ? Math.min(parseInt(format(new Date(), "d")), daysInMonth)
      : daysInMonth;
    
    const completionRate = Math.round((completedDays / daysToConsider) * 100);
    
    const totalPushups = monthProgress.reduce((sum: number, day: any) => sum + day.pushupsDone, 0);
    const totalSquats = monthProgress.reduce((sum: number, day: any) => sum + day.squatsDone, 0);
    const totalSitups = monthProgress.reduce((sum: number, day: any) => sum + day.situpsDone, 0);
    
    return {
      completedDays,
      completionRate,
      totalPushups,
      totalSquats,
      totalSitups,
    };
  };
  
  const monthStats = calculateMonthStats();
  
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Challenge Calendar</h2>
          <p className="text-gray-600">Track your daily workout completion</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePreviousMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleGoToCurrentMonth}
          >
            Today
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleNextMonth}
            disabled={format(addMonths(currentMonth, 1), "yyyy-MM") > format(new Date(), "yyyy-MM")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">{format(currentMonth, "MMMM yyyy")}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <p>Loading calendar data...</p>
            </div>
          ) : (
            <CalendarView 
              date={currentMonth}
              progressData={monthProgress || []}
            />
          )}
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              Completion Rate
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 ml-1 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Percentage of days completed in this month</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthStats.completionRate}%</div>
            <p className="text-xs text-gray-500">
              {monthStats.completedDays} days completed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Push-ups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{monthStats.totalPushups}</div>
            <p className="text-xs text-gray-500">
              This month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Squats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{monthStats.totalSquats}</div>
            <p className="text-xs text-gray-500">
              This month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Sit-ups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{monthStats.totalSitups}</div>
            <p className="text-xs text-gray-500">
              This month
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Calendar;
