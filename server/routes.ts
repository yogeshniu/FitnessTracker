import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertExerciseSetSchema, insertChallengeProgressSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Default user for the challenge
  const defaultUserId = 1;
  const existingUser = await storage.getUser(defaultUserId);
  if (!existingUser) {
    await storage.createUser({
      username: "yogichal",
      password: "password" // In a real app, you would hash this
    });
  }

  // Get exercise types
  app.get("/api/exercise-types", async (req, res) => {
    try {
      const exerciseTypes = await storage.getExerciseTypes();
      res.json(exerciseTypes);
    } catch (error) {
      console.error("Error fetching exercise types:", error);
      res.status(500).json({ message: "Failed to fetch exercise types" });
    }
  });

  // Get exercise sets for a specific date
  app.get("/api/exercise-sets/:date", async (req, res) => {
    try {
      const date = new Date(req.params.date);
      if (isNaN(date.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }

      const exerciseSets = await storage.getExerciseSetsByDate(defaultUserId, date);
      res.json(exerciseSets);
    } catch (error) {
      console.error("Error fetching exercise sets:", error);
      res.status(500).json({ message: "Failed to fetch exercise sets" });
    }
  });

  // Create a new exercise set
  app.post("/api/exercise-sets", async (req, res) => {
    try {
      const setSchema = insertExerciseSetSchema.extend({
        exerciseType: z.string()
      });
      
      const validation = setSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid exercise set data", errors: validation.error.errors });
      }
      
      const { exerciseType, ...data } = validation.data;
      
      // Get the exercise type ID from name
      const exerciseTypeObj = await storage.getExerciseTypeByName(exerciseType);
      if (!exerciseTypeObj) {
        return res.status(400).json({ message: "Invalid exercise type" });
      }
      
      const exerciseSet = await storage.createExerciseSet({
        ...data,
        userId: defaultUserId,
        exerciseTypeId: exerciseTypeObj.id
      });
      
      res.status(201).json(exerciseSet);
    } catch (error) {
      console.error("Error creating exercise set:", error);
      res.status(500).json({ message: "Failed to create exercise set" });
    }
  });

  // Get daily progress for a specific date
  app.get("/api/progress/:date", async (req, res) => {
    try {
      const date = new Date(req.params.date);
      if (isNaN(date.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }

      let progress = await storage.getDailyProgress(defaultUserId, date);
      
      // If no progress found, return default values
      if (!progress) {
        progress = {
          id: 0,
          userId: defaultUserId,
          date,
          pushupsDone: 0,
          squatsDone: 0,
          situpsDone: 0,
          completed: false
        };
      }
      
      res.json(progress);
    } catch (error) {
      console.error("Error fetching daily progress:", error);
      res.status(500).json({ message: "Failed to fetch daily progress" });
    }
  });

  // Update daily progress
  app.patch("/api/progress/:date", async (req, res) => {
    try {
      const date = new Date(req.params.date);
      if (isNaN(date.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }

      const validation = insertChallengeProgressSchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid progress data", errors: validation.error.errors });
      }

      const updatedProgress = await storage.updateDailyProgress(defaultUserId, date, validation.data);
      res.json(updatedProgress);
    } catch (error) {
      console.error("Error updating daily progress:", error);
      res.status(500).json({ message: "Failed to update daily progress" });
    }
  });

  // Get weekly progress
  app.get("/api/weekly-progress/:startDate", async (req, res) => {
    try {
      const startDate = new Date(req.params.startDate);
      if (isNaN(startDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }

      const weeklyProgress = await storage.getWeeklyProgress(defaultUserId, startDate);
      res.json(weeklyProgress);
    } catch (error) {
      console.error("Error fetching weekly progress:", error);
      res.status(500).json({ message: "Failed to fetch weekly progress" });
    }
  });

  // Get progress for a date range
  app.get("/api/progress-range/:startDate/:endDate", async (req, res) => {
    try {
      const startDate = new Date(req.params.startDate);
      const endDate = new Date(req.params.endDate);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }

      const progressList = await storage.getProgressByDateRange(defaultUserId, startDate, endDate);
      res.json(progressList);
    } catch (error) {
      console.error("Error fetching progress range:", error);
      res.status(500).json({ message: "Failed to fetch progress range" });
    }
  });

  // Get challenge stats
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStats(defaultUserId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  return httpServer;
}
