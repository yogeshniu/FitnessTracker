// Build script for GitHub Pages deployment
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

// Ensure the scripts directory exists
const scriptsDir = path.resolve('./scripts');
if (!fs.existsSync(scriptsDir)) {
  fs.mkdirSync(scriptsDir, { recursive: true });
}

console.log('Building for GitHub Pages...');

// Build the client-side application
exec('vite build', (err, stdout, stderr) => {
  if (err) {
    console.error('Error building client:', err);
    return;
  }
  console.log(stdout);
  
  // Create a simple server.js file for GitHub Pages
  const serverJs = `
// This is a simplified version of the server for GitHub Pages
// It's used to redirect API requests to a static JSON files
console.log('Loading static server for GitHub Pages...');

// In a real deployment, you would use a proper backend server
// This is just for demonstration purposes on GitHub Pages
  `;
  
  fs.writeFileSync('./dist/server.js', serverJs);
  
  // Create static data files for demo purposes
  const mockDataDir = './dist/api';
  if (!fs.existsSync(mockDataDir)) {
    fs.mkdirSync(mockDataDir, { recursive: true });
  }
  
  // Example: Create a static stats.json file
  const statsData = {
    totalPushups: 1250,
    totalSquats: 980,
    totalSitups: 870,
    longestStreak: 14,
    completionRate: 78,
    daysCompleted: 47,
    totalDays: 60,
    currentStreak: 7,
    challengeProgress: 26
  };
  
  fs.writeFileSync('./dist/api/stats.json', JSON.stringify(statsData));
  
  console.log('GitHub Pages build completed successfully!');
});