# Deployment Guide for YogiChal Fitness Tracker

This guide will help you deploy the YogiChal fitness tracker application to GitHub Pages.

## Prerequisites

- GitHub account
- Git installed on your computer

## Deployment Steps

### 1. Create a GitHub Repository

1. Go to [GitHub](https://github.com) and sign in to your account
2. Click the "+" icon in the top-right corner and select "New repository"
3. Name your repository (e.g., "yoga-challenge-tracker")
4. Add an optional description
5. Choose whether to make it public or private
6. Click "Create repository"

### 2. Push Your Code to GitHub

Use our provided script to easily push your code:

```bash
./scripts/push-to-github.sh
```

This script will:
- Ask for your GitHub username and email
- Ask for your repository name
- Add all files to Git
- Commit changes
- Push to your GitHub repository

Alternatively, you can do it manually:

```bash
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/your-repo-name.git
git push -u origin main
```

### 3. GitHub Pages Deployment

#### Option 1: Automatic Deployment with GitHub Actions

The project is already set up with a GitHub Actions workflow that will automatically deploy your application to GitHub Pages when you push to the main branch.

1. Go to your repository on GitHub
2. Click on the "Settings" tab
3. In the left sidebar, click on "Pages"
4. Under "Build and deployment," select:
   - Source: GitHub Actions

GitHub will use the `.github/workflows/deploy.yml` file to build and deploy your application.

#### Option 2: Manual Deployment

If you prefer to deploy manually, you can run:

```bash
# Install the gh-pages package if not already installed
npm install --save-dev gh-pages

# Build the project
npm run build

# Deploy to GitHub Pages
npx gh-pages -d dist
```

### 4. Accessing Your Deployed Application

After deployment is complete, your application will be available at:

```
https://your-username.github.io/your-repo-name/
```

Replace `your-username` with your GitHub username and `your-repo-name` with your repository name.

## Customization

### Custom Domain (Optional)

If you want to use a custom domain:

1. Purchase a domain from a domain registrar (e.g., Namecheap, GoDaddy)
2. Go to your repository's "Settings" > "Pages"
3. Under "Custom domain," enter your domain name and click "Save"
4. Follow the instructions to set up DNS records with your domain provider

### Updating Your Application

To update your deployed application:

1. Make changes to your code
2. Commit your changes:
   ```bash
   git add .
   git commit -m "Your update message"
   git push
   ```
3. The GitHub Actions workflow will automatically deploy your changes

## Troubleshooting

If your deployment fails:

1. Check the Actions tab in your GitHub repository to see error messages
2. Ensure your repository is public (or you have GitHub Pro for private repository deployments)
3. Verify that the GitHub Pages source is set correctly in your repository settings

For more help, refer to the [GitHub Pages documentation](https://docs.github.com/en/pages).