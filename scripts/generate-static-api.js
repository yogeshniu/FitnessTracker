// Generate static API data for GitHub Pages
import fs from 'fs';
import path from 'path';
import { format, addDays, subDays } from 'date-fns';

const API_DIR = './dist/api';

// Ensure API directory exists
if (!fs.existsSync(API_DIR)) {
  fs.mkdirSync(API_DIR, { recursive: true });
}

// Generate today's date and format it
const today = new Date();
const todayFormatted = format(today, 'yyyy-MM-dd');

// Create progress endpoint
const progressDir = path.join(API_DIR, 'progress');
if (!fs.existsSync(progressDir)) {
  fs.mkdirSync(progressDir, { recursive: true });
}

// Create today's progress data
const todayProgress = {
  id: 1,
  userId: 1,
  date: todayFormatted,
  pushupsDone: 75,
  squatsDone: 80,
  situpsDone: 90,
  completed: false
};

fs.writeFileSync(
  path.join(progressDir, `${todayFormatted}.json`), 
  JSON.stringify(todayProgress)
);

// Create exercise sets endpoint
const setsDir = path.join(API_DIR, 'exercise-sets');
if (!fs.existsSync(setsDir)) {
  fs.mkdirSync(setsDir, { recursive: true });
}

// Create today's exercise sets
const todaySets = [
  {
    id: 1,
    userId: 1,
    exerciseTypeId: 1,
    exerciseName: "Push-ups",
    reps: 25,
    date: todayFormatted,
    timeCompleted: "08:15"
  },
  {
    id: 2,
    userId: 1,
    exerciseTypeId: 1,
    exerciseName: "Push-ups",
    reps: 50,
    date: todayFormatted,
    timeCompleted: "14:30"
  },
  {
    id: 3,
    userId: 1,
    exerciseTypeId: 2,
    exerciseName: "Squats",
    reps: 80,
    date: todayFormatted,
    timeCompleted: "16:45"
  },
  {
    id: 4,
    userId: 1,
    exerciseTypeId: 3,
    exerciseName: "Sit-ups",
    reps: 90,
    date: todayFormatted,
    timeCompleted: "19:00"
  }
];

fs.writeFileSync(
  path.join(setsDir, `${todayFormatted}.json`), 
  JSON.stringify(todaySets)
);

// Create weekly progress endpoint
const weeklyDir = path.join(API_DIR, 'weekly-progress');
if (!fs.existsSync(weeklyDir)) {
  fs.mkdirSync(weeklyDir, { recursive: true });
}

// Get the start of the week
const weekStartDate = subDays(today, today.getDay() === 0 ? 6 : today.getDay() - 1);
const weekStartFormatted = format(weekStartDate, 'yyyy-MM-dd');

// Create weekly progress data
const weeklyProgress = [
  { day: "Mon", pushups: 100, squats: 100, situps: 100 },
  { day: "Tue", pushups: 100, squats: 100, situps: 90 },
  { day: "Wed", pushups: 85, squats: 100, situps: 100 },
  { day: "Thu", pushups: 100, squats: 75, situps: 80 },
  { day: "Fri", pushups: 75, squats: 80, situps: 90 },
  { day: "Sat", pushups: 0, squats: 0, situps: 0 },
  { day: "Sun", pushups: 0, squats: 0, situps: 0 }
];

fs.writeFileSync(
  path.join(weeklyDir, `${weekStartFormatted}.json`), 
  JSON.stringify(weeklyProgress)
);

// Create progress range endpoint
const rangeDir = path.join(API_DIR, 'progress-range');
if (!fs.existsSync(rangeDir)) {
  fs.mkdirSync(rangeDir, { recursive: true });
}

// Generate month data
const monthStartDate = new Date(today.getFullYear(), today.getMonth(), 1);
const monthEndDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
const monthStartFormatted = format(monthStartDate, 'yyyy-MM-dd');
const monthEndFormatted = format(monthEndDate, 'yyyy-MM-dd');

// Create sample month progress data
const monthProgress = [];
let currentDate = new Date(monthStartDate);

while (currentDate <= today) {
  const dateString = format(currentDate, 'yyyy-MM-dd');
  const dayOfMonth = currentDate.getDate();
  
  // Only generate data up to today
  if (currentDate <= today) {
    const isCompleted = Math.random() > 0.3; // 70% chance of completion
    const pushupsDone = isCompleted ? 100 : Math.floor(Math.random() * 80) + 20;
    const squatsDone = isCompleted ? 100 : Math.floor(Math.random() * 85) + 15;
    const situpsDone = isCompleted ? 100 : Math.floor(Math.random() * 90) + 10;
    
    monthProgress.push({
      id: dayOfMonth,
      userId: 1,
      date: dateString,
      pushupsDone,
      squatsDone,
      situpsDone,
      completed: isCompleted
    });
  }
  
  currentDate = addDays(currentDate, 1);
}

fs.writeFileSync(
  path.join(rangeDir, `${monthStartFormatted}_${monthEndFormatted}.json`), 
  JSON.stringify(monthProgress)
);

console.log('Static API data generated successfully.');