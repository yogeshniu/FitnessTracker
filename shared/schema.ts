import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Exercise model
export const exerciseTypes = pgTable("exercise_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  dailyGoal: integer("daily_goal").notNull(),
});

export const insertExerciseTypeSchema = createInsertSchema(exerciseTypes).pick({
  name: true,
  dailyGoal: true,
});

// Exercise Set model
export const exerciseSets = pgTable("exercise_sets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  exerciseTypeId: integer("exercise_type_id").notNull(),
  reps: integer("reps").notNull(),
  date: timestamp("date").notNull(),
  timeCompleted: text("time_completed").notNull(),
});

export const insertExerciseSetSchema = createInsertSchema(exerciseSets).pick({
  userId: true,
  exerciseTypeId: true,
  reps: true,
  date: true,
  timeCompleted: true,
});

// Challenge Progress model
export const challengeProgress = pgTable("challenge_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: timestamp("date").notNull(),
  pushupsDone: integer("pushups_done").notNull().default(0),
  squatsDone: integer("squats_done").notNull().default(0),
  situpsDone: integer("situps_done").notNull().default(0),
  completed: boolean("completed").notNull().default(false),
});

export const insertChallengeProgressSchema = createInsertSchema(challengeProgress).pick({
  userId: true,
  date: true,
  pushupsDone: true,
  squatsDone: true,
  situpsDone: true,
  completed: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type ExerciseType = typeof exerciseTypes.$inferSelect;
export type InsertExerciseType = z.infer<typeof insertExerciseTypeSchema>;

export type ExerciseSet = typeof exerciseSets.$inferSelect;
export type InsertExerciseSet = z.infer<typeof insertExerciseSetSchema>;

export type ChallengeProgress = typeof challengeProgress.$inferSelect;
export type InsertChallengeProgress = z.infer<typeof insertChallengeProgressSchema>;

// Special types for the front-end
export interface ExerciseSetWithTypeName extends ExerciseSet {
  exerciseName: string;
}

export interface DailyProgress {
  date: string;
  pushupsDone: number;
  squatsDone: number;
  situpsDone: number;
  completed: boolean;
}

export interface WeeklyProgress {
  day: string;
  pushups: number;
  squats: number;
  situps: number;
}

export interface StatsData {
  totalPushups: number;
  totalSquats: number;
  totalSitups: number;
  longestStreak: number;
  completionRate: number;
  daysCompleted: number;
  totalDays: number;
  currentStreak: number;
  challengeProgress: number;
}
