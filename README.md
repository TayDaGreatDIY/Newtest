# M2DG - Next Gen Sports Experience

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
   - Go to Project Settings > API to find your project URL and anon key
   - Run the SQL in `supabase/schema.sql` in the Supabase SQL Editor (Dashboard > SQL Editor)

4. Create a `.env` file in the root directory with your Supabase credentials:
```bash
cp .env.example .env
```

5. Edit `.env` and add your Supabase credentials:
```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Running Locally

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

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
│   └── schema.sql       # Database schema and RLS policies
├── index.html           # HTML template
├── vite.config.ts       # Vite & PWA configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── package.json         # Dependencies and scripts
```

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
