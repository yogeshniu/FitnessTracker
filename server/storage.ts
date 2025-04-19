import { 
  users, 
  exerciseTypes, 
  exerciseSets, 
  challengeProgress,
  type User, 
  type InsertUser,
  type ExerciseType,
  type InsertExerciseType,
  type ExerciseSet,
  type InsertExerciseSet,
  type ChallengeProgress,
  type InsertChallengeProgress,
  type ExerciseSetWithTypeName,
  type DailyProgress,
  type WeeklyProgress,
  type StatsData
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Exercise type operations
  getExerciseTypes(): Promise<ExerciseType[]>;
  getExerciseType(id: number): Promise<ExerciseType | undefined>;
  getExerciseTypeByName(name: string): Promise<ExerciseType | undefined>;
  createExerciseType(exerciseType: InsertExerciseType): Promise<ExerciseType>;
  
  // Exercise set operations
  getExerciseSets(userId: number): Promise<ExerciseSetWithTypeName[]>;
  getExerciseSetsByDate(userId: number, date: Date): Promise<ExerciseSetWithTypeName[]>;
  createExerciseSet(exerciseSet: InsertExerciseSet): Promise<ExerciseSet>;
  
  // Challenge progress operations
  getDailyProgress(userId: number, date: Date): Promise<ChallengeProgress | undefined>;
  updateDailyProgress(userId: number, date: Date, data: Partial<InsertChallengeProgress>): Promise<ChallengeProgress>;
  getProgressByDateRange(userId: number, startDate: Date, endDate: Date): Promise<ChallengeProgress[]>;
  
  // Stats operations
  getWeeklyProgress(userId: number, startDate: Date): Promise<WeeklyProgress[]>;
  getStats(userId: number): Promise<StatsData>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private exerciseTypes: Map<number, ExerciseType>;
  private exerciseSets: Map<number, ExerciseSet>;
  private challengeProgresses: Map<string, ChallengeProgress>;
  
  private currentUserId: number = 1;
  private currentExerciseTypeId: number = 1;
  private currentExerciseSetId: number = 1;
  private currentChallengeProgressId: number = 1;
  
  constructor() {
    this.users = new Map();
    this.exerciseTypes = new Map();
    this.exerciseSets = new Map();
    this.challengeProgresses = new Map();
    
    // Initialize with default exercise types
    this.createExerciseType({ name: "Push-ups", dailyGoal: 100 });
    this.createExerciseType({ name: "Squats", dailyGoal: 100 });
    this.createExerciseType({ name: "Sit-ups", dailyGoal: 100 });
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Exercise type operations
  async getExerciseTypes(): Promise<ExerciseType[]> {
    return Array.from(this.exerciseTypes.values());
  }
  
  async getExerciseType(id: number): Promise<ExerciseType | undefined> {
    return this.exerciseTypes.get(id);
  }
  
  async getExerciseTypeByName(name: string): Promise<ExerciseType | undefined> {
    return Array.from(this.exerciseTypes.values()).find(
      (exerciseType) => exerciseType.name === name
    );
  }
  
  async createExerciseType(insertExerciseType: InsertExerciseType): Promise<ExerciseType> {
    const id = this.currentExerciseTypeId++;
    const exerciseType: ExerciseType = { ...insertExerciseType, id };
    this.exerciseTypes.set(id, exerciseType);
    return exerciseType;
  }
  
  // Exercise set operations
  async getExerciseSets(userId: number): Promise<ExerciseSetWithTypeName[]> {
    const userSets = Array.from(this.exerciseSets.values()).filter(
      (set) => set.userId === userId
    );
    
    return Promise.all(userSets.map(async (set) => {
      const exerciseType = await this.getExerciseType(set.exerciseTypeId);
      return {
        ...set,
        exerciseName: exerciseType?.name || "Unknown",
      };
    }));
  }
  
  async getExerciseSetsByDate(userId: number, date: Date): Promise<ExerciseSetWithTypeName[]> {
    const dateString = date.toISOString().split('T')[0];
    const userSets = Array.from(this.exerciseSets.values()).filter(
      (set) => set.userId === userId && set.date.toISOString().split('T')[0] === dateString
    );
    
    return Promise.all(userSets.map(async (set) => {
      const exerciseType = await this.getExerciseType(set.exerciseTypeId);
      return {
        ...set,
        exerciseName: exerciseType?.name || "Unknown",
      };
    }));
  }
  
  async createExerciseSet(insertExerciseSet: InsertExerciseSet): Promise<ExerciseSet> {
    const id = this.currentExerciseSetId++;
    const exerciseSet: ExerciseSet = { ...insertExerciseSet, id };
    this.exerciseSets.set(id, exerciseSet);
    
    // Update the daily progress
    const dateString = insertExerciseSet.date.toISOString().split('T')[0];
    await this.updateDailyProgressWithNewSet(insertExerciseSet);
    
    return exerciseSet;
  }
  
  private async updateDailyProgressWithNewSet(exerciseSet: InsertExerciseSet): Promise<void> {
    const dateObj = new Date(exerciseSet.date);
    const exerciseType = await this.getExerciseType(exerciseSet.exerciseTypeId);
    
    if (!exerciseType) return;
    
    const dailyProgress = await this.getDailyProgress(exerciseSet.userId, dateObj);
    
    let updatedProgress: Partial<InsertChallengeProgress> = {};
    
    if (exerciseType.name === "Push-ups") {
      updatedProgress.pushupsDone = (dailyProgress?.pushupsDone || 0) + exerciseSet.reps;
    } else if (exerciseType.name === "Squats") {
      updatedProgress.squatsDone = (dailyProgress?.squatsDone || 0) + exerciseSet.reps;
    } else if (exerciseType.name === "Sit-ups") {
      updatedProgress.situpsDone = (dailyProgress?.situpsDone || 0) + exerciseSet.reps;
    }
    
    await this.updateDailyProgress(exerciseSet.userId, dateObj, updatedProgress);
    
    // Check if all exercises are completed
    const updatedDailyProgress = await this.getDailyProgress(exerciseSet.userId, dateObj);
    if (updatedDailyProgress) {
      const pushupsDone = updatedDailyProgress.pushupsDone >= 100;
      const squatsDone = updatedDailyProgress.squatsDone >= 100;
      const situpsDone = updatedDailyProgress.situpsDone >= 100;
      
      if (pushupsDone && squatsDone && situpsDone) {
        await this.updateDailyProgress(exerciseSet.userId, dateObj, { completed: true });
      }
    }
  }
  
  // Challenge progress operations
  async getDailyProgress(userId: number, date: Date): Promise<ChallengeProgress | undefined> {
    const dateString = date.toISOString().split('T')[0];
    const key = `${userId}_${dateString}`;
    return this.challengeProgresses.get(key);
  }
  
  async updateDailyProgress(userId: number, date: Date, data: Partial<InsertChallengeProgress>): Promise<ChallengeProgress> {
    const dateString = date.toISOString().split('T')[0];
    const key = `${userId}_${dateString}`;
    
    let progress = this.challengeProgresses.get(key);
    
    if (!progress) {
      const id = this.currentChallengeProgressId++;
      progress = {
        id,
        userId,
        date: new Date(date),
        pushupsDone: 0,
        squatsDone: 0,
        situpsDone: 0,
        completed: false
      };
    }
    
    const updatedProgress: ChallengeProgress = {
      ...progress,
      ...data
    };
    
    this.challengeProgresses.set(key, updatedProgress);
    return updatedProgress;
  }
  
  async getProgressByDateRange(userId: number, startDate: Date, endDate: Date): Promise<ChallengeProgress[]> {
    const startDateString = startDate.toISOString().split('T')[0];
    const endDateString = endDate.toISOString().split('T')[0];
    
    return Array.from(this.challengeProgresses.values()).filter(
      (progress) => {
        if (progress.userId !== userId) return false;
        
        const progressDateString = progress.date.toISOString().split('T')[0];
        return progressDateString >= startDateString && progressDateString <= endDateString;
      }
    );
  }
  
  // Stats operations
  async getWeeklyProgress(userId: number, startDate: Date): Promise<WeeklyProgress[]> {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    
    const progressList = await this.getProgressByDateRange(userId, startDate, endDate);
    
    const weeklyProgress: WeeklyProgress[] = [];
    
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + i);
      const dayLabel = currentDate.toLocaleDateString('en-US', { weekday: 'short' });
      
      const dayProgress = progressList.find(
        (progress) => progress.date.toISOString().split('T')[0] === currentDate.toISOString().split('T')[0]
      );
      
      weeklyProgress.push({
        day: dayLabel,
        pushups: dayProgress?.pushupsDone || 0,
        squats: dayProgress?.squatsDone || 0,
        situps: dayProgress?.situpsDone || 0
      });
    }
    
    return weeklyProgress;
  }
  
  async getStats(userId: number): Promise<StatsData> {
    // For the six-month challenge
    const startDate = new Date(2024, 0, 1); // January 1, 2024
    const endDate = new Date(2024, 5, 30); // June 30, 2024
    
    const progressList = await this.getProgressByDateRange(userId, startDate, endDate);
    
    // Calculate total exercises
    let totalPushups = 0;
    let totalSquats = 0;
    let totalSitups = 0;
    let completedDays = 0;
    
    for (const progress of progressList) {
      totalPushups += progress.pushupsDone;
      totalSquats += progress.squatsDone;
      totalSitups += progress.situpsDone;
      
      if (progress.completed) {
        completedDays++;
      }
    }
    
    // Calculate streaks
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    // Sort by date
    const sortedProgress = [...progressList].sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );
    
    // Calculate streaks
    for (let i = 0; i < sortedProgress.length; i++) {
      if (sortedProgress[i].completed) {
        tempStreak++;
        
        // Check if dates are consecutive
        if (i > 0) {
          const prevDate = new Date(sortedProgress[i-1].date);
          const currDate = new Date(sortedProgress[i].date);
          
          prevDate.setDate(prevDate.getDate() + 1);
          
          if (prevDate.toISOString().split('T')[0] !== currDate.toISOString().split('T')[0]) {
            tempStreak = 1;
          }
        }
      } else {
        tempStreak = 0;
      }
      
      longestStreak = Math.max(longestStreak, tempStreak);
    }
    
    // Calculate current streak
    const today = new Date();
    for (let i = sortedProgress.length - 1; i >= 0; i--) {
      const progressDate = new Date(sortedProgress[i].date);
      
      // Check if this is today or consecutive previous days
      const diffDays = Math.floor((today.getTime() - progressDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === currentStreak && sortedProgress[i].completed) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    // Calculate completion rate and challenge progress
    const totalDays = 180; // Six months
    const elapsedDays = Math.min(
      Math.floor((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
      totalDays
    );
    
    const completionRate = elapsedDays === 0 ? 0 : Math.round((completedDays / elapsedDays) * 100);
    const challengeProgress = Math.round((elapsedDays / totalDays) * 100);
    
    return {
      totalPushups,
      totalSquats,
      totalSitups,
      longestStreak,
      completionRate,
      daysCompleted: completedDays,
      totalDays,
      currentStreak,
      challengeProgress
    };
  }
}

// Create and export a single instance of MemStorage
export const storage = new MemStorage();
