#!/bin/bash

# This script pushes the code to your GitHub repository

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Preparing to push your project to GitHub...${NC}"

# Check if git is initialized
if [ ! -d .git ]; then
  echo -e "${YELLOW}Initializing Git repository...${NC}"
  git init
  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to initialize Git repository. Exiting.${NC}"
    exit 1
  fi
fi

# Set up Git user information (replace with your information)
echo -e "${YELLOW}Please enter your GitHub username:${NC}"
read GITHUB_USERNAME

echo -e "${YELLOW}Please enter your GitHub email:${NC}"
read GITHUB_EMAIL

echo -e "${YELLOW}Setting Git configuration...${NC}"
git config user.name "$GITHUB_USERNAME"
git config user.email "$GITHUB_EMAIL"

# Ask for repository details
echo -e "${YELLOW}Please enter your GitHub repository name (e.g., yoga-challenge-tracker):${NC}"
read REPO_NAME

# Add all files
echo -e "${YELLOW}Adding files to Git...${NC}"
git add .
if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to add files to Git. Exiting.${NC}"
  exit 1
fi

# Commit changes
echo -e "${YELLOW}Committing changes...${NC}"
git commit -m "Initial commit of YogiChal fitness tracker"
if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to commit changes. Exiting.${NC}"
  exit 1
fi

# Add remote repository
echo -e "${YELLOW}Adding remote repository...${NC}"
git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
if [ $? -ne 0 ]; then
  echo -e "${YELLOW}Remote 'origin' already exists or there was an error.${NC}"
  echo -e "${YELLOW}Updating remote URL...${NC}"
  git remote set-url origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
fi

# Push to GitHub
echo -e "${YELLOW}Pushing to GitHub...${NC}"
echo -e "${YELLOW}You may be prompted to enter your GitHub credentials.${NC}"
git push -u origin main
if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to push to GitHub. Please check your credentials and try again.${NC}"
  exit 1
fi

echo -e "${GREEN}Successfully pushed your project to GitHub!${NC}"
echo -e "${GREEN}Repository URL: https://github.com/$GITHUB_USERNAME/$REPO_NAME${NC}"

# Instructions for GitHub Pages
echo -e "${YELLOW}\nTo deploy to GitHub Pages:${NC}"
echo -e "1. Go to your repository on GitHub: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo -e "2. Click on 'Settings' tab"
echo -e "3. Navigate to 'Pages' in the sidebar"
echo -e "4. Under 'Build and deployment', select:"
echo -e "   - Source: GitHub Actions"
echo -e "5. GitHub will automatically use the workflow file we've created"
echo -e "6. Your site will be available at: https://$GITHUB_USERNAME.github.io/$REPO_NAME/"