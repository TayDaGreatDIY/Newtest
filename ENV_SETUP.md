# Environment Setup Guide

This guide explains how to set up your local `.env` file for testing the M2DG application.

## Quick Setup

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Get your Supabase credentials:**
   - Go to [https://app.supabase.com](https://app.supabase.com)
   - Select your project (or create one if you haven't)
   - Navigate to **Project Settings** > **API**
   - Copy the following values:
     - **Project URL** → `VITE_SUPABASE_URL`
     - **Project API keys** → **anon/public** → `VITE_SUPABASE_ANON_KEY`

3. **Update your `.env` file:**
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

## GitHub Actions Configuration

The GitHub Actions workflows are already configured to use repository secrets during the build process:

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous/public key

### Adding Secrets to GitHub

If you haven't added these secrets yet:

1. Go to your repository on GitHub
2. Navigate to **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret**
4. Add both secrets:
   - Name: `VITE_SUPABASE_URL`, Value: `https://your-project-id.supabase.co`
   - Name: `VITE_SUPABASE_ANON_KEY`, Value: `your-anon-public-key`

## Testing Authentication

Once your `.env` file is configured with real credentials:

### 1. Sign Up Flow
1. Start the dev server: `npm run dev`
2. Navigate to `/auth/sign-up`
3. Enter email, password, and display name
4. Submit the form
5. **Expected:** Redirect to `/app/feed` after successful sign-up

### 2. Sign In Flow
1. Navigate to `/auth/sign-in`
2. Enter your email and password
3. Submit the form
4. **Expected:** Redirect to `/app/feed` after successful sign-in

### 3. Protected Routes
- Try accessing `/app/feed` without being logged in
- **Expected:** Redirect to `/auth/sign-in`

### 4. Sign Out
- Once logged in, click the sign-out button in the profile menu
- **Expected:** Redirect to home page and cleared session

## Database Setup

If you haven't set up your Supabase database yet:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the migration files in order:
   - First: `supabase/schema.sql` (creates profiles table)
   - Second: `supabase/mvp_phase1.sql` (creates courts, check-ins, challenges tables)

## Troubleshooting

### "Missing Supabase environment variables" error
- Make sure your `.env` file exists in the project root
- Verify the file contains both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart the dev server after changing `.env` values

### Authentication not working
- Check that your Supabase URL is correct (should start with `https://`)
- Verify your anon key is the **public** key (not the service role key)
- Ensure email confirmation is disabled in Supabase Auth settings for testing

### Build fails in GitHub Actions
- Verify you've added both secrets to your repository
- Check the workflow logs to see which secret is missing
- Secret names must match exactly: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

## Security Notes

- The `.env` file is automatically ignored by git (see `.gitignore`)
- Never commit your `.env` file to version control
- The anon/public key is safe to use in client-side code
- Never expose your Supabase service role key in client-side code
