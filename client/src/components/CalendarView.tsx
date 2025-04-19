import { format, addDays, startOfMonth, endOfMonth, getDay } from "date-fns";
import { ChallengeProgress } from "@shared/schema";

interface CalendarViewProps {
  date: Date;
  progressData: any[];
}

const CalendarView = ({ date, progressData }: CalendarViewProps) => {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const startDate = monthStart;
  const endDate = monthEnd;
  
  // Get the day of the week for the first day of the month (0 = Sunday, 1 = Monday, etc.)
  const startDay = getDay(monthStart);
  
  // Adjust for the week starting on Monday (0 = Monday, 1 = Tuesday, etc.)
  const adjustedStartDay = startDay === 0 ? 6 : startDay - 1;
  
  // Get the total number of days in the month
  const daysInMonth = parseInt(format(monthEnd, "d"));
  
  // Create calendar days
  const days = [];
  
  // Add previous month days to fill the first week
  for (let i = 0; i < adjustedStartDay; i++) {
    const prevMonthDay = addDays(monthStart, -adjustedStartDay + i);
    days.push({
      date: prevMonthDay,
      isCurrentMonth: false,
      dayNumber: parseInt(format(prevMonthDay, "d")),
    });
  }
  
  // Add days for the current month
  for (let i = 1; i <= daysInMonth; i++) {
    const currentDate = new Date(date.getFullYear(), date.getMonth(), i);
    days.push({
      date: currentDate,
      isCurrentMonth: true,
      dayNumber: i,
    });
  }
  
  // Add days from the next month to complete the last week
  const remainingDays = 7 - (days.length % 7);
  if (remainingDays < 7) {
    for (let i = 1; i <= remainingDays; i++) {
      const nextMonthDay = addDays(monthEnd, i);
      days.push({
        date: nextMonthDay,
        isCurrentMonth: false,
        dayNumber: parseInt(format(nextMonthDay, "d")),
      });
    }
  }
  
  // Group days into weeks
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  
  // Function to find progress data for a specific date
  const getProgressForDate = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd");
    return progressData.find((progress) => {
      const progressDate = new Date(progress.date);
      return format(progressDate, "yyyy-MM-dd") === dateString;
    });
  };
  
  // Check if a date is today
  const isToday = (date: Date) => {
    return format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
  };
  
  // Check if a date is in the future
  const isFutureDate = (date: Date) => {
    return date > new Date();
  };
  
  return (
    <div>
      <div className="grid grid-cols-7 gap-1 text-center">
        <div className="text-xs font-medium text-gray-500 py-2">Mon</div>
        <div className="text-xs font-medium text-gray-500 py-2">Tue</div>
        <div className="text-xs font-medium text-gray-500 py-2">Wed</div>
        <div className="text-xs font-medium text-gray-500 py-2">Thu</div>
        <div className="text-xs font-medium text-gray-500 py-2">Fri</div>
        <div className="text-xs font-medium text-gray-500 py-2">Sat</div>
        <div className="text-xs font-medium text-gray-500 py-2">Sun</div>
        
        {weeks.map((week, weekIndex) => (
          week.map((day, dayIndex) => {
            const progress = day.isCurrentMonth ? getProgressForDate(day.date) : null;
            const dayIsToday = isToday(day.date);
            const isFuture = isFutureDate(day.date);
            
            let dayClass = "py-2 text-sm";
            
            if (!day.isCurrentMonth) {
              dayClass += " text-gray-300";
            } else if (dayIsToday) {
              dayClass += " border border-primary rounded-md bg-blue-50 font-medium";
            }
            
            return (
              <div key={`${weekIndex}-${dayIndex}`} className={dayClass}>
                {day.dayNumber}
                
                {day.isCurrentMonth && !isFuture && (
                  <div className="mt-1 flex justify-center">
                    {progress?.completed ? (
                      <div className="w-3 h-3 rounded-full bg-secondary mx-auto"></div>
                    ) : progress ? (
                      <div className="w-3 h-3 rounded-full bg-amber-500 mx-auto"></div>
                    ) : (
                      <div className="w-3 h-3 rounded-full bg-red-500 mx-auto"></div>
                    )}
                  </div>
                )}
                
                {dayIsToday && (
                  <div className="mt-1 flex justify-center gap-0.5">
                    <div className="w-1 h-1 rounded-full bg-primary"></div>
                    <div className="w-1 h-1 rounded-full bg-primary"></div>
                    <div className="w-1 h-1 rounded-full bg-primary"></div>
                  </div>
                )}
              </div>
            );
          })
        ))}
      </div>
      
      <div className="flex justify-center mt-4 space-x-4 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-secondary mr-1"></div>
          <span>Completed</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-amber-500 mr-1"></div>
          <span>Partial</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
          <span>Missed</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
