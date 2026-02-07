# Demo Mode Testing Guide

This document explains how to run and test the Coaches & Trainers pages in demo mode.

## Overview

Demo mode has been enabled to allow testing of the Coaches & Trainers Corner feature without requiring a live Supabase connection or authentication. This is perfect for UI testing, screenshots, and demonstrations.

## What Was Implemented

### 1. Demo Mode Toggle
- Added `VITE_DEMO_MODE` environment variable
- When set to `true`, authentication is bypassed
- Mock data is used instead of Supabase queries

### 2. Mock Data
The following mock coaches and trainers are available:

#### Coaches (2)
1. **Coach Mike Johnson** (ID: 1)
   - Role: Coach
   - Experience: 10 years
   - Location: Los Angeles, CA
   - Rate: $75/hr
   - Specialties: Shooting, Ball Handling, Player Development
   - Status: Verified

2. **Coach Emma Thompson** (ID: 4)
   - Role: Coach
   - Experience: 6 years
   - Location: Chicago, IL
   - Rate: $50/hr
   - Specialties: Youth Development, Fundamentals, Team Building
   - Status: Not Verified

#### Trainers (2)
1. **Sarah Williams** (ID: 2)
   - Role: Trainer
   - Experience: 8 years
   - Location: New York, NY
   - Rate: $65/hr
   - Specialties: Strength Training, Conditioning, Injury Prevention
   - Status: Verified

2. **Alex Rodriguez** (ID: 5)
   - Role: Trainer
   - Experience: 12 years
   - Location: Atlanta, GA
   - Rate: $80/hr
   - Specialties: Nutrition, Weight Training, Recovery
   - Status: Verified

#### Both Coach & Trainer (1)
1. **Coach David Martinez** (ID: 3)
   - Role: Both
   - Experience: 15 years
   - Location: Miami, FL
   - Rate: $150/hr
   - Specialties: Elite Training, Mental Conditioning, Game Strategy, Performance Analysis
   - Status: Verified

## How to Run in Demo Mode

### Step 1: Set Up Environment
Create a `.env` file in the project root:
```bash
# Demo/Testing Mode
VITE_DEMO_MODE=true

# Placeholder Supabase credentials (not needed for demo mode)
VITE_SUPABASE_URL=https://example.supabase.co
VITE_SUPABASE_ANON_KEY=example-anon-key

# Optional
VITE_OPENAI_API_KEY=
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Start Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Step 4: Navigate to Coaches Pages
- **Coaches Corner**: `http://localhost:5173/Newtest/app/coaches`
- **Coach Profile**: `http://localhost:5173/Newtest/app/coaches/1`
- **Trainer Profile**: `http://localhost:5173/Newtest/app/coaches/2`
- **Both Profile**: `http://localhost:5173/Newtest/app/coaches/3`

## Features to Test

### Coaches Corner Page (`/app/coaches`)
- ✅ View all coaches and trainers
- ✅ Filter by role (All, Coaches, Trainers, Both)
- ✅ Search by name, location, or specialty
- ✅ See coach cards with key information
- ✅ Click cards to view detailed profiles
- ✅ "Become a Coach" button

### Coach/Trainer Profile Page (`/app/coaches/:id`)
- ✅ View detailed profile information
- ✅ See specialties and credentials
- ✅ View stats (certifications, connections, sessions)
- ✅ Verification badge for verified coaches
- ✅ Hourly rate display
- ✅ "Schedule a Session" button
- ✅ "Connect" button
- ✅ Back navigation

### Search and Filter
- Search for "Los Angeles" → shows Coach Mike Johnson
- Search for "Nutrition" → shows Alex Rodriguez
- Search for "shooting" → shows Coach Mike Johnson
- Filter by Coaches → shows 2 results
- Filter by Trainers → shows 2 results
- Filter by Both → shows 1 result

## Screenshots Captured

All screenshots have been taken and are available in the PR:
1. Coaches Corner - All View (5 coaches/trainers)
2. Coaches Filter (2 coaches)
3. Trainers Filter (2 trainers)
4. Coach Profile - Mike Johnson
5. Trainer Profile - Sarah Williams
6. Coach & Trainer Profile - David Martinez

## Switching to Production Mode

To disable demo mode and use real Supabase data:

1. Update `.env` file:
```bash
VITE_DEMO_MODE=false
VITE_SUPABASE_URL=your-actual-project-url
VITE_SUPABASE_ANON_KEY=your-actual-anon-key
```

2. Restart the dev server

3. Ensure the database migrations have been run (see `COACHES_TRAINERS_GUIDE.md`)

## Files Modified

- `src/lib/ProtectedRoute.tsx` - Added demo mode bypass
- `src/pages/CoachesCorner.tsx` - Added mock data for coaches list
- `src/pages/CoachTrainerProfile.tsx` - Added mock data for profile pages
- `.env` - Added demo mode configuration (not committed to repo)

## Important Notes

⚠️ **Demo mode is for testing only**
- Do not use in production
- The `.env` file is gitignored and won't be committed
- Mock data is hardcoded and not persisted

✅ **Safe to commit**
- All changes are minimal and backwards compatible
- Demo mode is opt-in via environment variable
- Does not affect production functionality when disabled

## Next Steps

1. Test all features in demo mode
2. Take any additional screenshots needed
3. Document any issues or improvements
4. When ready for production, disable demo mode and connect to real Supabase instance

## Support

For questions or issues:
- Review `COACHES_TRAINERS_GUIDE.md` for full feature documentation
- Check `README.md` for general setup instructions
- Review `COACHES_TRAINERS_IMPLEMENTATION_SUMMARY.md` for technical details
