export const CHALLENGE = {
  // Challenge specifications
  TOTAL_DAYS: 180, // 6 months
  START_DATE: "2024-01-01",
  END_DATE: "2024-06-30",
  
  // Exercise goals
  DAILY_GOALS: {
    "Push-ups": 100,
    "Squats": 100,
    "Sit-ups": 100
  },
  
  // Colors
  COLORS: {
    "Push-ups": "#3B82F6", // blue
    "Squats": "#10B981",   // green
    "Sit-ups": "#F59E0B"   // amber
  },
  
  // Status colors
  STATUS: {
    COMPLETED: "#10B981", // green
    PARTIAL: "#F59E0B",   // amber
    MISSED: "#EF4444",    // red
    FUTURE: "#E5E7EB"     // gray
  }
};

export const CHART_SETTINGS = {
  LINE: {
    strokeWidth: 2,
    dot: true
  },
  BAR: {
    barSize: 20,
    radius: [4, 4, 0, 0]
  }
};

export const STATUS_MESSAGES = {
  EXCELLENT: "Excellent",
  GOOD: "Good progress",
  ON_TRACK: "On track",
  NEEDS_IMPROVEMENT: "Needs improvement"
};

export const DEFAULT_EXERCISE_VALUES = [
  {
    name: "Push-ups",
    count: 0,
    goal: 100,
    sets: []
  },
  {
    name: "Squats",
    count: 0,
    goal: 100,
    sets: []
  },
  {
    name: "Sit-ups",
    count: 0,
    goal: 100,
    sets: []
  }
];

export const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
