# Clerk Authentication Setup

## Setup Instructions

1. **Get your Clerk Publishable Key:**
   - Go to [Clerk Dashboard](https://dashboard.clerk.com/last-active?path=api-keys)
   - Select **React** and copy your Publishable Key

2. **Create Environment File:**
   - Create a `.env.local` file in the project root
   - Add your publishable key:
   ```
   VITE_CLERK_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
   ```

3. **Configure Google OAuth (Optional):**
   - In your Clerk Dashboard, go to **User & Authentication** → **Social Connections**
   - Enable Google OAuth
   - Add your Google OAuth credentials

4. **Start the Application:**
   ```bash
   pnpm dev
   ```

## Features

- ✅ **Google Sign-In**: Users can sign in with their Google account
- ✅ **Protected Upload**: Only authenticated users can upload images
- ✅ **User Management**: Users can sign out and manage their account
- ✅ **Modal Authentication**: Clean sign-in experience with modal dialogs

## Authentication Flow

1. **Unauthenticated Users**: Can view the gallery but cannot upload
2. **Upload Protection**: Clicking upload shows a sign-in prompt
3. **Authenticated Users**: Can upload images and access all features
4. **User Button**: Shows user avatar and sign-out option when signed in 