// Deploy to GitHub Pages script
import { exec } from 'child_process';
import ghpages from 'gh-pages';
import path from 'path';

console.log('Starting GitHub Pages deployment process...');

// First run the build script for GitHub Pages
exec('node scripts/gh-pages-build.js && node scripts/generate-static-api.js', (err, stdout, stderr) => {
  if (err) {
    console.error('Error running build scripts:', err);
    return;
  }
  
  console.log(stdout);
  
  // Now deploy to GitHub Pages
  const options = {
    branch: 'gh-pages',
    repo: 'https://github.com/yourusername/yoga-challenge-tracker.git', // Replace with your repo URL
    message: 'Auto-generated deployment to GitHub Pages'
  };
  
  ghpages.publish('dist', options, (err) => {
    if (err) {
      console.error('Error deploying to GitHub Pages:', err);
      return;
    }
    
    console.log('Successfully deployed to GitHub Pages!');
    console.log('Your app should be available at: https://yourusername.github.io/yoga-challenge-tracker/');
  });
});