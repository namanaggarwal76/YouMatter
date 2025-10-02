# Facebook Integration Setup Guide

## Setting up Facebook Login for YouMatter

To enable Facebook integration for finding and adding friends, follow these steps:

### 1. Create a Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "My Apps" and then "Create App"
3. Choose "Consumer" app type
4. Fill in your app details:
   - App Name: "YouMatter Wellness"
   - App Contact Email: your email
   - Business Account: (optional)

### 2. Configure Facebook App

1. In your app dashboard, go to "Settings" > "Basic"
2. Note down your **App ID** - you'll need this
3. Add your domain to "App Domains": `localhost` (for development)
4. In "Website" section, add your Site URL: `http://localhost:5173` (for development)

### 3. Set up Facebook Login

1. Go to "Products" in the left sidebar
2. Find "Facebook Login" and click "Set Up"
3. Choose "Web" platform
4. Enter your Site URL: `http://localhost:5173`
5. In Facebook Login settings, add these Valid OAuth Redirect URIs:
   - `http://localhost:5173`
   - `http://localhost:5173/`

### 4. Configure App Permissions

In Facebook Login > Settings, make sure these permissions are enabled:
- `email` (for user's email)
- `user_friends` (for accessing friend list)

### 5. Environment Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Facebook App ID:
   ```
   REACT_APP_FACEBOOK_APP_ID=your-actual-facebook-app-id
   ```

### 6. Test Your Setup

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to the Friends page
3. Click "Connect with Facebook"
4. You should see Facebook's login dialog

### Important Notes

- **Privacy**: The app only accesses public friend information
- **Permissions**: Users must explicitly grant permissions
- **Development**: Facebook apps in development mode only work for app administrators
- **Production**: Before going live, submit your app for review if using advanced permissions

### Troubleshooting

**"App Not Set Up" Error:**
- Check that your domain is added to App Domains
- Verify your Site URL is correct
- Make sure Facebook Login product is added

**"Invalid App ID" Error:**
- Verify your App ID in the .env file
- Restart your development server after changing .env

**Facebook Login Not Working:**
- Check browser console for errors
- Ensure your app is in development or live mode
- Verify redirect URIs are correctly configured

### Production Deployment

For production deployment:

1. Add your production domain to Facebook App settings
2. Update redirect URIs with your production URLs
3. Submit app for review if using `user_friends` permission
4. Set production environment variables

### Alternative Mock Mode

If you don't want to set up Facebook integration, the app includes a mock mode that simulates Facebook friends for demonstration purposes. This will activate automatically if no Facebook App ID is provided.