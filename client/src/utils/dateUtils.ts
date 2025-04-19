import { format, differenceInDays, addDays, subDays, isSameDay } from "date-fns";

// Format date to YYYY-MM-DD for API requests
export const formatDateForApi = (date: Date): string => {
  return format(date, "yyyy-MM-dd");
};

// Format date for display
export const formatDateForDisplay = (date: Date): string => {
  return format(date, "MMMM d, yyyy");
};

// Format date for calendar day display
export const formatCalendarDay = (date: Date): string => {
  return format(date, "d");
};

// Check if the date is today
export const isToday = (date: Date): boolean => {
  return isSameDay(date, new Date());
};

// Get a date range for a week starting on Monday
export const getWeekDateRange = (date: Date): { start: Date; end: Date } => {
  const dayOfWeek = date.getDay();
  // Adjust for week starting on Monday (0 = Monday, 6 = Sunday in our custom week)
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  
  const start = subDays(date, daysFromMonday);
  const end = addDays(start, 6);
  
  return { start, end };
};

// Calculate streak based on completed dates
export const calculateStreak = (dates: Date[], isCompleted: (date: Date) => boolean): number => {
  if (!dates.length) return 0;
  
  let streak = 0;
  let currentStreak = 0;
  
  // Sort dates in ascending order
  const sortedDates = [...dates].sort((a, b) => a.getTime() - b.getTime());
  
  for (let i = 0; i < sortedDates.length; i++) {
    if (isCompleted(sortedDates[i])) {
      currentStreak++;
      
      // If not the first date, check if consecutive
      if (i > 0) {
        const prevDate = sortedDates[i - 1];
        const currDate = sortedDates[i];
        
        if (differenceInDays(currDate, prevDate) !== 1) {
          // Reset if not consecutive
          currentStreak = 1;
        }
      }
      
      streak = Math.max(streak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }
  
  return streak;
};

// Calculate the number of days between two dates (inclusive)
export const daysBetween = (startDate: Date, endDate: Date): number => {
  return differenceInDays(endDate, startDate) + 1;
};

// Format time for display (12-hour format)
export const formatTimeForDisplay = (time: string): string => {
  const [hours, minutes] = time.split(":");
  const hoursNum = parseInt(hours);
  const ampm = hoursNum >= 12 ? "PM" : "AM";
  const hour12 = hoursNum % 12 || 12;
  
  return `${hour12}:${minutes} ${ampm}`;
};
