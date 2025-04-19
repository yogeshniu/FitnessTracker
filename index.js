// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
var MemStorage = class {
  users;
  exerciseTypes;
  exerciseSets;
  challengeProgresses;
  currentUserId = 1;
  currentExerciseTypeId = 1;
  currentExerciseSetId = 1;
  currentChallengeProgressId = 1;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.exerciseTypes = /* @__PURE__ */ new Map();
    this.exerciseSets = /* @__PURE__ */ new Map();
    this.challengeProgresses = /* @__PURE__ */ new Map();
    this.createExerciseType({ name: "Push-ups", dailyGoal: 100 });
    this.createExerciseType({ name: "Squats", dailyGoal: 100 });
    this.createExerciseType({ name: "Sit-ups", dailyGoal: 100 });
  }
  // User operations
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = this.currentUserId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  // Exercise type operations
  async getExerciseTypes() {
    return Array.from(this.exerciseTypes.values());
  }
  async getExerciseType(id) {
    return this.exerciseTypes.get(id);
  }
  async getExerciseTypeByName(name) {
    return Array.from(this.exerciseTypes.values()).find(
      (exerciseType) => exerciseType.name === name
    );
  }
  async createExerciseType(insertExerciseType) {
    const id = this.currentExerciseTypeId++;
    const exerciseType = { ...insertExerciseType, id };
    this.exerciseTypes.set(id, exerciseType);
    return exerciseType;
  }
  // Exercise set operations
  async getExerciseSets(userId) {
    const userSets = Array.from(this.exerciseSets.values()).filter(
      (set) => set.userId === userId
    );
    return Promise.all(userSets.map(async (set) => {
      const exerciseType = await this.getExerciseType(set.exerciseTypeId);
      return {
        ...set,
        exerciseName: exerciseType?.name || "Unknown"
      };
    }));
  }
  async getExerciseSetsByDate(userId, date) {
    const dateString = date.toISOString().split("T")[0];
    const userSets = Array.from(this.exerciseSets.values()).filter(
      (set) => set.userId === userId && set.date.toISOString().split("T")[0] === dateString
    );
    return Promise.all(userSets.map(async (set) => {
      const exerciseType = await this.getExerciseType(set.exerciseTypeId);
      return {
        ...set,
        exerciseName: exerciseType?.name || "Unknown"
      };
    }));
  }
  async createExerciseSet(insertExerciseSet) {
    const id = this.currentExerciseSetId++;
    const exerciseSet = { ...insertExerciseSet, id };
    this.exerciseSets.set(id, exerciseSet);
    const dateString = insertExerciseSet.date.toISOString().split("T")[0];
    await this.updateDailyProgressWithNewSet(insertExerciseSet);
    return exerciseSet;
  }
  async updateDailyProgressWithNewSet(exerciseSet) {
    const dateObj = new Date(exerciseSet.date);
    const exerciseType = await this.getExerciseType(exerciseSet.exerciseTypeId);
    if (!exerciseType) return;
    const dailyProgress = await this.getDailyProgress(exerciseSet.userId, dateObj);
    let updatedProgress = {};
    if (exerciseType.name === "Push-ups") {
      updatedProgress.pushupsDone = (dailyProgress?.pushupsDone || 0) + exerciseSet.reps;
    } else if (exerciseType.name === "Squats") {
      updatedProgress.squatsDone = (dailyProgress?.squatsDone || 0) + exerciseSet.reps;
    } else if (exerciseType.name === "Sit-ups") {
      updatedProgress.situpsDone = (dailyProgress?.situpsDone || 0) + exerciseSet.reps;
    }
    await this.updateDailyProgress(exerciseSet.userId, dateObj, updatedProgress);
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
  async getDailyProgress(userId, date) {
    const dateString = date.toISOString().split("T")[0];
    const key = `${userId}_${dateString}`;
    return this.challengeProgresses.get(key);
  }
  async updateDailyProgress(userId, date, data) {
    const dateString = date.toISOString().split("T")[0];
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
    const updatedProgress = {
      ...progress,
      ...data
    };
    this.challengeProgresses.set(key, updatedProgress);
    return updatedProgress;
  }
  async getProgressByDateRange(userId, startDate, endDate) {
    const startDateString = startDate.toISOString().split("T")[0];
    const endDateString = endDate.toISOString().split("T")[0];
    return Array.from(this.challengeProgresses.values()).filter(
      (progress) => {
        if (progress.userId !== userId) return false;
        const progressDateString = progress.date.toISOString().split("T")[0];
        return progressDateString >= startDateString && progressDateString <= endDateString;
      }
    );
  }
  // Stats operations
  async getWeeklyProgress(userId, startDate) {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    const progressList = await this.getProgressByDateRange(userId, startDate, endDate);
    const weeklyProgress = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + i);
      const dayLabel = currentDate.toLocaleDateString("en-US", { weekday: "short" });
      const dayProgress = progressList.find(
        (progress) => progress.date.toISOString().split("T")[0] === currentDate.toISOString().split("T")[0]
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
  async getStats(userId) {
    const startDate = new Date(2024, 0, 1);
    const endDate = new Date(2024, 5, 30);
    const progressList = await this.getProgressByDateRange(userId, startDate, endDate);
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
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    const sortedProgress = [...progressList].sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );
    for (let i = 0; i < sortedProgress.length; i++) {
      if (sortedProgress[i].completed) {
        tempStreak++;
        if (i > 0) {
          const prevDate = new Date(sortedProgress[i - 1].date);
          const currDate = new Date(sortedProgress[i].date);
          prevDate.setDate(prevDate.getDate() + 1);
          if (prevDate.toISOString().split("T")[0] !== currDate.toISOString().split("T")[0]) {
            tempStreak = 1;
          }
        }
      } else {
        tempStreak = 0;
      }
      longestStreak = Math.max(longestStreak, tempStreak);
    }
    const today = /* @__PURE__ */ new Date();
    for (let i = sortedProgress.length - 1; i >= 0; i--) {
      const progressDate = new Date(sortedProgress[i].date);
      const diffDays = Math.floor((today.getTime() - progressDate.getTime()) / (1e3 * 60 * 60 * 24));
      if (diffDays === currentStreak && sortedProgress[i].completed) {
        currentStreak++;
      } else {
        break;
      }
    }
    const totalDays = 180;
    const elapsedDays = Math.min(
      Math.floor(((/* @__PURE__ */ new Date()).getTime() - startDate.getTime()) / (1e3 * 60 * 60 * 24)),
      totalDays
    );
    const completionRate = elapsedDays === 0 ? 0 : Math.round(completedDays / elapsedDays * 100);
    const challengeProgress2 = Math.round(elapsedDays / totalDays * 100);
    return {
      totalPushups,
      totalSquats,
      totalSitups,
      longestStreak,
      completionRate,
      daysCompleted: completedDays,
      totalDays,
      currentStreak,
      challengeProgress: challengeProgress2
    };
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var exerciseTypes = pgTable("exercise_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  dailyGoal: integer("daily_goal").notNull()
});
var insertExerciseTypeSchema = createInsertSchema(exerciseTypes).pick({
  name: true,
  dailyGoal: true
});
var exerciseSets = pgTable("exercise_sets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  exerciseTypeId: integer("exercise_type_id").notNull(),
  reps: integer("reps").notNull(),
  date: timestamp("date").notNull(),
  timeCompleted: text("time_completed").notNull()
});
var insertExerciseSetSchema = createInsertSchema(exerciseSets).pick({
  userId: true,
  exerciseTypeId: true,
  reps: true,
  date: true,
  timeCompleted: true
});
var challengeProgress = pgTable("challenge_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: timestamp("date").notNull(),
  pushupsDone: integer("pushups_done").notNull().default(0),
  squatsDone: integer("squats_done").notNull().default(0),
  situpsDone: integer("situps_done").notNull().default(0),
  completed: boolean("completed").notNull().default(false)
});
var insertChallengeProgressSchema = createInsertSchema(challengeProgress).pick({
  userId: true,
  date: true,
  pushupsDone: true,
  squatsDone: true,
  situpsDone: true,
  completed: true
});

// server/routes.ts
import { z } from "zod";
async function registerRoutes(app2) {
  const httpServer = createServer(app2);
  const defaultUserId = 1;
  const existingUser = await storage.getUser(defaultUserId);
  if (!existingUser) {
    await storage.createUser({
      username: "yogichal",
      password: "password"
      // In a real app, you would hash this
    });
  }
  app2.get("/api/exercise-types", async (req, res) => {
    try {
      const exerciseTypes2 = await storage.getExerciseTypes();
      res.json(exerciseTypes2);
    } catch (error) {
      console.error("Error fetching exercise types:", error);
      res.status(500).json({ message: "Failed to fetch exercise types" });
    }
  });
  app2.get("/api/exercise-sets/:date", async (req, res) => {
    try {
      const date = new Date(req.params.date);
      if (isNaN(date.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      const exerciseSets2 = await storage.getExerciseSetsByDate(defaultUserId, date);
      res.json(exerciseSets2);
    } catch (error) {
      console.error("Error fetching exercise sets:", error);
      res.status(500).json({ message: "Failed to fetch exercise sets" });
    }
  });
  app2.post("/api/exercise-sets", async (req, res) => {
    try {
      const setSchema = insertExerciseSetSchema.extend({
        exerciseType: z.string()
      });
      const validation = setSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid exercise set data", errors: validation.error.errors });
      }
      const { exerciseType, ...data } = validation.data;
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
  app2.get("/api/progress/:date", async (req, res) => {
    try {
      const date = new Date(req.params.date);
      if (isNaN(date.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      let progress = await storage.getDailyProgress(defaultUserId, date);
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
  app2.patch("/api/progress/:date", async (req, res) => {
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
  app2.get("/api/weekly-progress/:startDate", async (req, res) => {
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
  app2.get("/api/progress-range/:startDate/:endDate", async (req, res) => {
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
  app2.get("/api/stats", async (req, res) => {
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

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
