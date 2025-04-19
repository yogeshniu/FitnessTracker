import { DailyProgress, ExerciseSetWithTypeName, WeeklyProgress } from "@shared/schema";

// Storage keys
const EXERCISE_SETS_KEY = "yogichal_exercise_sets";
const DAILY_PROGRESS_KEY = "yogichal_daily_progress";

// Save exercise sets to local storage
export const saveExerciseSets = (date: string, sets: ExerciseSetWithTypeName[]): void => {
  try {
    const allSets = getExerciseSets();
    allSets[date] = sets;
    localStorage.setItem(EXERCISE_SETS_KEY, JSON.stringify(allSets));
  } catch (error) {
    console.error("Error saving exercise sets to local storage:", error);
  }
};

// Get exercise sets from local storage
export const getExerciseSets = (): Record<string, ExerciseSetWithTypeName[]> => {
  try {
    const storedSets = localStorage.getItem(EXERCISE_SETS_KEY);
    return storedSets ? JSON.parse(storedSets) : {};
  } catch (error) {
    console.error("Error getting exercise sets from local storage:", error);
    return {};
  }
};

// Get exercise sets for a specific date
export const getExerciseSetsForDate = (date: string): ExerciseSetWithTypeName[] => {
  const allSets = getExerciseSets();
  return allSets[date] || [];
};

// Save daily progress to local storage
export const saveDailyProgress = (date: string, progress: DailyProgress): void => {
  try {
    const allProgress = getDailyProgress();
    allProgress[date] = progress;
    localStorage.setItem(DAILY_PROGRESS_KEY, JSON.stringify(allProgress));
  } catch (error) {
    console.error("Error saving daily progress to local storage:", error);
  }
};

// Get all daily progress from local storage
export const getDailyProgress = (): Record<string, DailyProgress> => {
  try {
    const storedProgress = localStorage.getItem(DAILY_PROGRESS_KEY);
    return storedProgress ? JSON.parse(storedProgress) : {};
  } catch (error) {
    console.error("Error getting daily progress from local storage:", error);
    return {};
  }
};

// Get daily progress for a specific date
export const getDailyProgressForDate = (date: string): DailyProgress | null => {
  const allProgress = getDailyProgress();
  return allProgress[date] || null;
};

// Get progress for a date range
export const getProgressForDateRange = (startDate: string, endDate: string): DailyProgress[] => {
  const allProgress = getDailyProgress();
  const result: DailyProgress[] = [];
  
  // Convert to Date objects for comparison
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  for (const dateStr in allProgress) {
    const date = new Date(dateStr);
    if (date >= start && date <= end) {
      result.push(allProgress[dateStr]);
    }
  }
  
  // Sort by date
  return result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

// Calculate and save weekly progress
export const calculateWeeklyProgress = (startDate: string): WeeklyProgress[] => {
  const weeklyProgress: WeeklyProgress[] = [];
  const start = new Date(startDate);
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    const dayProgress = getDailyProgressForDate(dateStr);
    const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
    
    weeklyProgress.push({
      day: dayLabel,
      pushups: dayProgress?.pushupsDone || 0,
      squats: dayProgress?.squatsDone || 0,
      situps: dayProgress?.situpsDone || 0
    });
  }
  
  return weeklyProgress;
};

// Clear all stored data (for testing or reset)
export const clearAllData = (): void => {
  localStorage.removeItem(EXERCISE_SETS_KEY);
  localStorage.removeItem(DAILY_PROGRESS_KEY);
};
