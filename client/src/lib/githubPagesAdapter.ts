/**
 * This adapter enables the app to run on GitHub Pages with static JSON files
 * instead of a real backend server
 */

// Check if the app is running in GitHub Pages environment
export const isGitHubPages = (): boolean => {
  return window.location.hostname.includes('github.io') || 
         process.env.NODE_ENV === 'gh-pages';
};

// Transform API request for GitHub Pages to use static JSON files
export const transformApiUrl = (url: string): string => {
  if (!isGitHubPages()) {
    return url; // Return original URL if not on GitHub Pages
  }
  
  try {
    // Remove leading API prefix
    const pathWithoutApi = url.replace(/^\/api\//, '');
    
    // Handle different endpoints
    if (pathWithoutApi === 'stats') {
      return '/api/stats.json';
    }
    
    // Handle endpoints with date parameters
    if (pathWithoutApi.startsWith('progress/')) {
      const date = pathWithoutApi.split('/')[1];
      return `/api/progress/${date}.json`;
    }
    
    if (pathWithoutApi.startsWith('exercise-sets/')) {
      const date = pathWithoutApi.split('/')[1];
      return `/api/exercise-sets/${date}.json`;
    }
    
    if (pathWithoutApi.startsWith('weekly-progress/')) {
      const date = pathWithoutApi.split('/')[1];
      return `/api/weekly-progress/${date}.json`;
    }
    
    if (pathWithoutApi.startsWith('progress-range/')) {
      const parts = pathWithoutApi.split('/');
      const startDate = parts[1];
      const endDate = parts[2];
      return `/api/progress-range/${startDate}_${endDate}.json`;
    }
    
    // Default fallback - return original with .json
    return `${url}.json`;
  } catch (error) {
    console.error('Error transforming API URL:', error);
    return `${url}.json`;
  }
};