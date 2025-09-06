# Firebase Setup Instructions

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or select existing project
3. Follow the setup wizard

## 2. Enable Authentication

1. In your Firebase project, go to **Authentication**
2. Click **Get started**
3. Go to **Sign-in method** tab
4. Enable **Google** and **GitHub** providers
5. For GitHub: You'll need to add your GitHub OAuth App credentials
6. For Google: Use the default settings or configure custom OAuth client

## 3. Get Firebase Config

1. Go to **Project Settings** (gear icon)
2. Scroll down to **Your apps** section
3. Click **Add app** → Web app (</>) 
4. Register your app with name "pindown.ai"
5. Copy the config object values

## 4. Create Environment File

Create `.env.local` in the `frontend` directory with:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 5. Configure OAuth Providers

### GitHub OAuth App
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create new OAuth App with:
   - Homepage URL: `http://localhost:3000` (for development)
   - Authorization callback URL: `https://your_project_id.firebaseapp.com/__/auth/handler`
3. Copy Client ID and Client Secret to Firebase Console

### Google OAuth (should work by default)
- Google OAuth is pre-configured with Firebase
- For production, you may want to configure custom OAuth client

## 6. Test Authentication

Once environment variables are set up:
1. Restart your dev server: `npm run dev`
2. Navigate to `/login`
3. Try signing in with Google or GitHub

## 7. Authorized Domains (for production)

In Firebase Console → Authentication → Settings:
- Add your production domain to authorized domains
- Remove localhost for production

---

**Current Error Fix:** 
The error you're seeing is because the environment variables aren't set up yet. Follow steps 3-4 above to resolve it.
