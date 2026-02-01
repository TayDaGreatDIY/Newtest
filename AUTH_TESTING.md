# Authentication Testing Checklist

This document provides a comprehensive checklist for testing the authentication flow with Supabase.

## Prerequisites

- [x] `.env` file created with Supabase credentials
- [x] GitHub Actions workflows configured with repository secrets
- [x] Dependencies installed (`npm ci`)
- [ ] Real Supabase credentials added to `.env` file

## Testing Steps

### Setup Phase

1. **Configure Environment Variables**
   - [ ] Open `.env` file in the project root
   - [ ] Replace `your-project-url` with actual Supabase URL
   - [ ] Replace `your-anon-key` with actual Supabase anon key
   - [ ] Save the file

2. **Verify Supabase Database**
   - [ ] Go to Supabase dashboard → SQL Editor
   - [ ] Confirm `profiles` table exists (run `supabase/schema.sql` if not)
   - [ ] Confirm other tables exist (run `supabase/mvp_phase1.sql` if not)

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   - [ ] Server starts without errors
   - [ ] No "Missing Supabase environment variables" warning in console
   - [ ] App loads at `http://localhost:5173`

### Sign-Up Flow Testing

4. **Navigate to Sign-Up Page**
   - [ ] Click "Get Started" on landing page OR navigate to `/auth/sign-up`
   - [ ] Sign-up form is displayed
   - [ ] Form has fields: Full Name, Email, Password, Confirm Password

5. **Test Sign-Up Validation**
   - [ ] Try submitting empty form → Shows validation errors
   - [ ] Enter mismatched passwords → Shows "Passwords do not match" error
   - [ ] Enter invalid email format → Shows validation error

6. **Complete Sign-Up**
   - [ ] Enter valid full name (e.g., "Test User")
   - [ ] Enter valid email (e.g., "testuser@example.com")
   - [ ] Enter matching passwords (min 6 characters)
   - [ ] Click "Create Account" button
   - [ ] Button shows "Creating Account..." while processing
   - [ ] **CRITICAL:** Verify redirect to `/app/feed` after success
   - [ ] User is logged in (check for user menu in header)

7. **Verify Sign-Up in Supabase**
   - [ ] Go to Supabase dashboard → Authentication → Users
   - [ ] New user appears in the list
   - [ ] Email matches the one you used
   - [ ] Go to Table Editor → profiles
   - [ ] Profile record exists for the new user
   - [ ] Display name is populated

### Sign-In Flow Testing

8. **Sign Out**
   - [ ] Click user profile menu
   - [ ] Click "Sign Out"
   - [ ] Redirected to home page or auth page
   - [ ] Session cleared (no longer logged in)

9. **Navigate to Sign-In Page**
   - [ ] Go to `/auth/sign-in`
   - [ ] Sign-in form is displayed
   - [ ] Form has fields: Email, Password

10. **Test Sign-In Validation**
    - [ ] Try submitting empty form → Shows validation errors
    - [ ] Enter wrong password → Shows error message
    - [ ] Enter non-existent email → Shows error message

11. **Complete Sign-In**
    - [ ] Enter correct email from sign-up
    - [ ] Enter correct password from sign-up
    - [ ] Click "Sign In" button
    - [ ] Button shows "Signing In..." while processing
    - [ ] **CRITICAL:** Verify redirect to `/app/feed` after success
    - [ ] User is logged in (check for user menu in header)
    - [ ] Display name shows correctly in profile section

### Protected Routes Testing

12. **Test Route Protection**
    - [ ] Sign out from the app
    - [ ] Try to access `/app/feed` directly
    - [ ] **Expected:** Redirect to `/auth/sign-in`
    - [ ] Try to access `/app/courts`
    - [ ] **Expected:** Redirect to `/auth/sign-in`
    - [ ] Try to access `/app/profile`
    - [ ] **Expected:** Redirect to `/auth/sign-in`

13. **Test Authenticated Access**
    - [ ] Sign in to the app
    - [ ] Navigate to `/app/feed`
    - [ ] **Expected:** Page loads successfully
    - [ ] Navigate to `/app/courts`
    - [ ] **Expected:** Page loads successfully
    - [ ] Navigate to `/app/profile`
    - [ ] **Expected:** Page loads successfully, shows user info

### Session Persistence Testing

14. **Test Session Persistence**
    - [ ] Sign in to the app
    - [ ] Navigate to `/app/feed`
    - [ ] Refresh the page (F5 or Cmd+R)
    - [ ] **Expected:** Still logged in, no redirect to auth
    - [ ] Close the browser tab
    - [ ] Open app in new tab
    - [ ] **Expected:** Still logged in (session persisted)

15. **Test Auth State Change**
    - [ ] Sign in to the app
    - [ ] Open browser dev tools → Application → Local Storage
    - [ ] Clear Supabase auth tokens
    - [ ] Try to navigate to a protected route
    - [ ] **Expected:** Redirect to `/auth/sign-in`

### Additional Edge Cases

16. **Test Already Authenticated User**
    - [ ] Sign in to the app
    - [ ] Navigate to `/auth/sign-in` manually
    - [ ] **Expected:** Redirect to `/app/feed` (can't access auth when logged in)
    - [ ] Navigate to `/auth/sign-up` manually
    - [ ] **Expected:** Redirect to `/app/feed`

17. **Test Profile Update**
    - [ ] Sign in to the app
    - [ ] Go to `/app/profile`
    - [ ] Update display name
    - [ ] **Expected:** Name updates successfully
    - [ ] Refresh page
    - [ ] **Expected:** Updated name persists

### Browser Console Checks

18. **Monitor Console for Errors**
    - [ ] Open browser DevTools → Console
    - [ ] Complete sign-up flow
    - [ ] **Expected:** No red errors related to auth
    - [ ] Complete sign-in flow
    - [ ] **Expected:** No red errors related to auth
    - [ ] Navigate between protected routes
    - [ ] **Expected:** No red errors related to auth or routing

## Success Criteria

✅ **All tests must pass for the authentication flow to be considered complete:**

1. Sign-up creates new user in Supabase
2. Sign-up redirects to `/app/feed` after success
3. Sign-in authenticates existing user
4. Sign-in redirects to `/app/feed` after success
5. Protected routes redirect unauthenticated users to `/auth/sign-in`
6. Protected routes load successfully for authenticated users
7. Session persists across page refreshes
8. Sign-out clears session and redirects appropriately
9. No console errors during any auth flow
10. Already authenticated users cannot access auth pages

## Current Implementation Status

✅ **Already Implemented:**
- Supabase client configuration (`src/lib/supabaseClient.ts`)
- Auth context with sign-up, sign-in, sign-out (`src/lib/AuthContext.tsx`)
- Protected route component (`src/lib/ProtectedRoute.tsx`)
- Auth page with sign-up and sign-in forms (`src/pages/Auth.tsx`)
- Automatic redirect to `/app/feed` after auth (line 20-24 in `Auth.tsx`)
- Route protection for `/app/*` routes (`App.tsx`)

✅ **Configuration:**
- `.env` file created (needs real credentials)
- `.gitignore` configured to ignore `.env` files
- GitHub Actions workflows configured to use repository secrets

## Notes

- The authentication logic is already fully implemented
- The redirect to `/app/feed` is working (see `Auth.tsx` lines 20-24)
- Testing requires real Supabase credentials in `.env` file
- All protected routes are under `/app/*` path
- Auth routes are public and accessible without login
