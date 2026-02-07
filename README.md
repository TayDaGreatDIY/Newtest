# M2DG - Next Gen Sports Experience

> **🎉 Production Ready!** All MVP Phase 1 & 2 features are complete and integrated with Supabase.  
> See [`PRODUCTION_CHECKLIST.md`](PRODUCTION_CHECKLIST.md) for deployment steps and [`TESTING_GUIDE.md`](TESTING_GUIDE.md) for testing.

A Progressive Web App (PWA) built with React, TypeScript, Vite, and Tailwind CSS. Mobile-first sports experience platform featuring real-time updates, challenges, and community interaction.

## 🚀 Live Demo

**Production URL:** https://taydagreatdiy.github.io/Newtest/

The app is deployed automatically via GitHub Actions on every push to the `main` branch.

## ✨ Features

- ⚡️ Lightning-fast with Vite
- 📱 Mobile-first responsive design
- 🎨 Styled with Tailwind CSS (2026 glassmorphism UI)
- 🔄 Client-side routing with React Router
- 📦 Installable as PWA (Progressive Web App)
- 🍎 iOS "Add to Home Screen" support
- 🔒 Offline-ready with Service Worker
- 🎯 TypeScript for type safety
- 🔐 Supabase authentication with email/password
- 👤 User profiles with editable display names
- 🛡️ Row-level security (RLS) for data protection

### MVP Phase 1 Features ✅

- 🏀 **Courts System**: Browse, search, and create basketball courts
- 📍 **Check-ins**: Check in to courts to track activity
- 👑 **Court Champions**: Dynamic champion based on most check-ins in the last 7 days
- ⚔️ **Challenges**: Create and join challenges at courts
- 🏆 **Leaderboards**: Real-time leaderboards for each challenge
- 📊 **User Stats**: Track check-ins, challenges, and wins

### MVP Phase 2 Features ✅

**All features complete and integrated with Supabase!**

- ✅ **Posts & Feed System**: Share achievements, photos, and challenges with real-time updates
- ✅ **Real-Time Messaging**: Direct messaging between players with instant updates
- ✅ **Image Upload**: Upload and share photos via Supabase Storage
- ✅ **Social Interactions**: Like, comment, and share posts
- ✅ **AI Coach**: Basic version working (optional OpenAI integration for enhanced features)

### NEW: Coaches & Trainers Corner ✅

**Professional coaching and training services integrated into the platform!**

- 🏆 **Coach/Trainer Profiles**: Browse certified coaches and trainers with verified credentials
- 📄 **Credential Verification**: Upload and verify resumes, certifications, and references
- 📅 **Calendly Integration**: Direct scheduling with coaches through integrated Calendly links
- 🤝 **Connection System**: Athletes can connect with coaches and trainers
- 🔍 **Advanced Search**: Filter by role, location, specialty, and experience
- 💪 **Multiple Roles**: Support for coaches, trainers, or both
- 📊 **Session Management**: Coaches can create and manage training sessions
- ⭐ **Verification Badges**: Verified coach status displayed on profiles

> 📘 **Setup Guide:** See [`COACHES_TRAINERS_GUIDE.md`](COACHES_TRAINERS_GUIDE.md) for setup instructions  
> 📋 **Implementation:** See [`COACHES_TRAINERS_IMPLEMENTATION_SUMMARY.md`](COACHES_TRAINERS_IMPLEMENTATION_SUMMARY.md) for details

> 📘 **Production Ready:** See [`PRODUCTION_CHECKLIST.md`](PRODUCTION_CHECKLIST.md) for deployment  
> 🧪 **Testing Guide:** See [`TESTING_GUIDE.md`](TESTING_GUIDE.md) for comprehensive testing steps  
> 🚀 **Next Steps:** See [`WHATS_NEXT.md`](WHATS_NEXT.md) for future enhancements

## 🏆 Court Champion Logic

The Court Champion system identifies the most active player at each court. Here's how it works:

**MVP Approach**: The court champion is determined by **the user with the most check-ins in the last 7 days** at that specific court.

- **7-Day Rolling Window**: Only check-ins from the past 7 days are counted
- **Automatic Updates**: Champion status updates automatically as new check-ins are recorded
- **Per-Court Basis**: Each court has its own champion
- **Tie Breaking**: In case of equal check-ins, the most recent check-in wins
- **Display**: Champion badge shows on court detail pages with check-in count

This system encourages consistent participation and rewards regular players at each court.

## 📋 Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- A Supabase account (free tier available at [https://supabase.com](https://supabase.com))

## 🔐 Authentication

This app uses Supabase for authentication and user management. All routes under `/app/*` are protected and require authentication.

### Features:
- Email/password sign up and sign in
- Protected routes with automatic redirects
- User profiles with editable display names
- Secure session management
- Row-level security (RLS) on database

## 🛠️ Local Development

### Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- A Supabase account and project (for authentication features)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/TayDaGreatDIY/Newtest.git
cd Newtest
```

2. Install dependencies:
```bash
npm install
```

3. Set up Supabase:
   - Create a free account at [https://supabase.com](https://supabase.com)
   - Create a new project
   - Go to Project Settings → API to get your credentials:
     - Project URL (looks like: `https://xxxxx.supabase.co`)
     - `anon` public key
   
4. Create `.env` file in the project root:
```bash
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_OPENAI_API_KEY=your-openai-api-key  # Optional, for AI Coach feature
```

5. Run database migrations:
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Copy the entire contents of `supabase/mvp_migrations.sql`
   - Paste into the SQL Editor and click "Run"
   - This will create all necessary tables, policies, and functions

   > ⚠️ **COMMON ISSUES:**  
   > - **"relation 'public.post_reposts' does not exist"** error? See [FIX_POST_REPOSTS_ERROR.md](FIX_POST_REPOSTS_ERROR.md)  
   > - **"Could not find a relationship" or "failed to load comments"** errors? See [DATABASE_FIXES.md](DATABASE_FIXES.md)
   
6. Set up Storage:
   - Go to Storage section in Supabase Dashboard
   - Create a new bucket named `post-images`
   - Make it public
   - Set up storage policies (see instructions in `SUPABASE_SETUP.md`)

7. (Optional but recommended) Enable Realtime:
   - Go to Database → Replication in Supabase Dashboard
   - Enable replication for: `posts`, `post_likes`, `post_comments`, `messages`
   - This enables real-time updates in the app

8. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

   > 📖 **Complete Setup Guide:** See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for the complete SQL setup guide, including OpenAI API key configuration for GitHub Actions.
   >
   > 📖 **Environment Setup:** See [ENV_SETUP.md](ENV_SETUP.md) for detailed environment configuration instructions.

### Build for Production

Create an optimized production build:

### Build for Production

Create an optimized production build:
```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

Preview the production build locally:
```bash
npm run preview
```

### Linting

Run ESLint to check code quality:
```bash
npm run lint
```

## 📱 Installing as PWA

### On iOS (Safari)

1. Open the app in Safari
2. Tap the Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Name it "M2DG" and tap "Add"
5. The app icon will appear on your home screen

### On Android (Chrome)

1. Open the app in Chrome
2. Tap the three-dot menu
3. Select "Add to Home Screen" or "Install App"
4. Tap "Install" in the prompt
5. The app will be installed like a native app

### On Desktop (Chrome/Edge)

1. Open the app in Chrome or Edge
2. Look for the install icon in the address bar (⊕)
3. Click it and select "Install"
4. The app will open in its own window

## 🔧 Troubleshooting

### SPA Routing Issues

If you encounter 404 errors when refreshing pages or accessing direct URLs:

**GitHub Pages:** The deployment workflow automatically handles SPA routing by copying `index.html` to `404.html`. This ensures all routes are handled by the React Router.

**Local Development:** The Vite dev server handles all routes automatically. No configuration needed.

**Other hosting platforms:**

- **Vercel:** Add a `vercel.json`:
  ```json
  {
    "rewrites": [{ "source": "/(.*)", "destination": "/" }]
  }
  ```

- **Netlify:** Add a `_redirects` file to `public/`:
  ```
  /*    /index.html   200
  ```

- **Apache:** Add `.htaccess`:
  ```apache
  <IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
  </IfModule>
  ```

### PWA Not Installing

1. **HTTPS Required:** PWAs require HTTPS (except on localhost). GitHub Pages provides HTTPS automatically.
2. **Service Worker:** Check browser console for service worker registration errors
3. **Manifest:** Verify the manifest is loading correctly at `/manifest.webmanifest`
4. **Icons:** Ensure PWA icons are present in the `public/` directory

### Build Issues

If you encounter build errors:

1. Clear node modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Clear Vite cache:
   ```bash
   rm -rf node_modules/.vite
   ```

3. Ensure you're using Node.js 18 or higher:
   ```bash
   node --version
   ```

## 🚢 Deployment

### GitHub Pages (Current Setup)

The app automatically deploys to GitHub Pages when you push to the `main` branch.

**Manual deployment trigger:**
```bash
# Push to main branch
git push origin main

# Or trigger manually via GitHub Actions UI
# Go to Actions → Deploy to GitHub Pages → Run workflow
```

**Requirements:**
1. Enable GitHub Pages in repository settings
2. Set source to "GitHub Actions"
3. Ensure workflows have write permissions

### Alternative: Vercel

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. For production:
   ```bash
   vercel --prod
   ```

### Alternative: Netlify

1. Install Netlify CLI:
   ```bash
   npm i -g netlify-cli
   ```

2. Deploy:
   ```bash
   netlify deploy
   ```

3. For production:
   ```bash
   netlify deploy --prod
   ```

## 🏗️ Project Structure

```
Newtest/
├── .github/
│   └── workflows/       # GitHub Actions CI/CD
├── public/              # Static assets & PWA icons
├── src/
│   ├── components/      # Reusable React components
│   ├── layout/          # Layout components
│   ├── pages/           # Page components
│   ├── data/            # Data models and mock data
│   ├── lib/             # Utilities (Supabase client, Auth context)
│   ├── App.tsx          # Main app component with routing
│   ├── main.tsx         # App entry point
│   └── index.css        # Global styles
├── supabase/
│   ├── schema.sql       # Database schema for user profiles
│   └── mvp_phase1.sql   # Database schema for courts, check-ins, challenges
├── index.html           # HTML template
├── vite.config.ts       # Vite & PWA configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── package.json         # Dependencies and scripts
```

## 🧪 Manual Testing Guide

Follow these steps to test the MVP Phase 1 features:

### 1. Sign Up
1. Navigate to the app (locally or via GitHub Pages)
2. Click "Sign Up" or go to `/auth/sign-up`
3. Enter email, password, and display name
4. Verify you're redirected to `/app/feed` after signup

### 2. Create a Court
1. Go to `/app/courts`
2. Click the "+ Court" button
3. Fill in court details:
   - Name (e.g., "Venice Beach Courts")
   - Location (e.g., "Venice, CA")
   - Description (optional)
   - Amenities (select from options)
   - Max Players (default 10)
4. Click "Create Court"
5. Verify the court appears in the list
6. Click on the court to view details

### 3. Check In to a Court
1. Go to a court detail page (`/app/courts/:id`)
2. Click the "Check In" button
3. Verify you see a success message
4. Check that the button changes to "Checked in today"
5. Verify the check-in appears in "Recent Check-ins" section
6. Try checking in again - should show already checked in

### 4. Verify Court Champion
1. Check in to the same court multiple times (on different days or with different users)
2. View the court detail page
3. Verify the "Court Champion" badge shows:
   - The user with most check-ins in last 7 days
   - The check-in count
4. Test with multiple users to see champion change

### 5. Create a Challenge
1. Go to a court detail page
2. Click "+ Challenge" button
3. Fill in challenge details:
   - Title (e.g., "Friday Night 3-Point Contest")
   - Challenge Type (select from options)
   - Description and Rules
   - Start and End times
4. Click "Create Challenge"
5. Verify challenge appears in the court's challenges list
6. Click on the challenge to view details

### 6. Join Challenge & Submit Result
1. Go to a challenge detail page (`/app/challenges/:id`)
2. Click "Join Challenge & Submit Score" button
3. Enter your score (numeric value)
4. Add optional notes
5. Click "Submit Score"
6. Verify:
   - You appear in the leaderboard
   - Your score is displayed
   - Leaderboard is sorted by score (highest first)
   - Top 3 get medals (🥇🥈🥉)

### 7. Browse Challenges
1. Go to `/app/challenges`
2. Test filters: All, Active, Upcoming, Ended
3. Create challenges with different time ranges
4. Verify filters work correctly
5. Click on challenges to view details

### 8. View Profile Stats
1. Go to `/app/profile`
2. Verify stats are displayed:
   - Total check-ins
   - Total challenges participated
   - Challenges won
   - Courts championed
3. If you're a champion at any court, verify the "Champion Status" section appears

### Expected Behaviors

- **Empty States**: Friendly messages when no data exists
- **Loading States**: Spinners/animations while data loads
- **Error Handling**: Clear error messages for failures
- **Responsive Design**: Works on mobile and desktop
- **Real-time Updates**: Data refreshes after actions
- **Navigation**: All links and back buttons work correctly

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 🔗 Links

- **Live App:** https://taydagreatdiy.github.io/Newtest/
- **Repository:** https://github.com/TayDaGreatDIY/Newtest
- **Issues:** https://github.com/TayDaGreatDIY/Newtest/issues
