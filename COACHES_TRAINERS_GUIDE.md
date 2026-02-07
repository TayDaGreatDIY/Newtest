# Coaches and Trainers Corner - Setup Guide

This document describes the setup and usage of the Coaches and Trainers Corner feature.

## Overview

The Coaches and Trainers Corner allows certified coaches and trainers to offer their services to athletes in the M2DG community. Athletes can discover, connect with, and schedule sessions with coaches and trainers.

## Database Setup

### 1. Apply the Migration

Run the migration file in your Supabase SQL Editor:

```sql
-- File: supabase/coaches_trainers_system.sql
```

This will create the following tables:
- `coaches_trainers` - Coach/trainer profiles
- `coach_certifications` - Uploaded credential documents
- `coach_schedules` - Training sessions and availability
- `athlete_coach_connections` - Connection requests between athletes and coaches

### 2. Verify Row Level Security (RLS)

All tables have RLS enabled with the following policies:
- **Public viewing**: Anyone (authenticated or not) can view active coaches and their verified certifications
- **Profile management**: Coaches can manage their own profiles, schedules, and certifications
- **Connection requests**: Authenticated athletes can send connection requests
- **Connection management**: Both parties can view and update their connections

**Note**: While the database allows public viewing of coaches, the app UI requires authentication to access the coaches pages through `/app/coaches`. Users must sign in to browse and connect with coaches.

### 3. Storage Bucket

Documents and certifications are uploaded to the existing `post-images` bucket. No additional storage setup is required.

## Features

### For Coaches and Trainers

1. **Registration**
   - Navigate to `/app/coaches`
   - Click "Become a Coach"
   - Select role: Coach, Trainer, or Both
   - Fill in profile information:
     - Bio
     - Specialties
     - Years of experience
     - Hourly rate
     - Location
     - Calendly link (optional)
   - Upload credentials:
     - Resume
     - Certifications
     - References
     - Other documents

2. **Profile Management**
   - View profile at `/app/coaches/{id}`
   - Display verification status
   - Show stats (certifications, connections, sessions)
   - Calendly integration for easy scheduling

3. **Scheduling**
   - Create training sessions
   - Set session types (individual, group, workshop, clinic)
   - Manage availability
   - Set pricing per session

### For Athletes

1. **Discovery**
   - Browse all coaches and trainers at `/app/coaches`
   - Filter by role: Coach, Trainer, or Both
   - Search by name, location, or specialty
   - View coach profiles and credentials

2. **Connections**
   - Send connection requests to coaches
   - View connection status (pending, accepted, rejected)
   - Access coach's Calendly for session booking

3. **Navigation**
   - Access from bottom navigation bar
   - Quick action tiles on profile page
   - Direct links from search results

## UI Components

### CoachesCorner Page
- Browse and search all active coaches/trainers
- Filter by role
- Search by name, location, or specialty
- Display coach cards with key information
- Link to become a coach

### CoachTrainerProfile Page
- Detailed coach profile
- Specialties and credentials
- Stats (certifications, connections, sessions)
- Calendly integration
- Connection request button
- Upcoming sessions list

### CoachSignup Page
- 3-step registration process
  1. Role selection and basic info
  2. Specialties and calendar integration
  3. Credential upload
- Form validation
- Image upload for documents
- Progress indicator

## Database Functions

### `get_coaches_trainers()`
Returns a list of coaches/trainers with aggregated details:
- User display name
- Role, bio, specialties
- Years of experience, hourly rate, location
- Certification count
- Connection count
- Verification status

Parameters:
- `p_role` - Filter by role (optional)
- `p_search` - Search query (optional)
- `p_limit` - Results limit (default: 50)
- `p_offset` - Pagination offset (default: 0)

### `get_coach_profile()`
Returns detailed profile for a specific coach including:
- All profile fields
- Certification count
- Connection count
- Upcoming sessions count

Parameters:
- `p_coach_id` - UUID of the coach

## Security

### Document Upload
- All documents must be uploaded through the app
- Files are stored in Supabase Storage
- Only the coach can see unverified documents
- Public can only view verified certifications

### Verification
- New coaches start as unverified
- Admin verification process (manual for now)
- Verified badge displayed on profiles

### RLS Policies
- Users can only modify their own data
- Connection requests require authentication
- Profile visibility is controlled per user

## Future Enhancements

1. **Admin Panel**
   - Verify coach credentials
   - Review and approve/reject applications
   - Monitor coach activity

2. **Enhanced Scheduling**
   - Booking system within the app
   - Payment integration
   - Session reminders

3. **Reviews and Ratings**
   - Athletes can rate coaches
   - Review system with comments
   - Average rating display

4. **Messaging Integration**
   - Direct messaging between athletes and coaches
   - Session-specific chat threads

5. **Analytics**
   - Coach dashboard with metrics
   - Session history
   - Earnings tracking

## Testing Checklist

- [ ] Sign up as a new coach/trainer
- [ ] Upload certification documents
- [ ] View coach profile as an athlete
- [ ] Send connection request
- [ ] Click Calendly link
- [ ] Search and filter coaches
- [ ] Test all 3 role types (coach, trainer, both)
- [ ] Verify RLS policies prevent unauthorized access
- [ ] Test on mobile devices
- [ ] Verify build and deployment

## Troubleshooting

### Coaches not showing up

If coaches are not appearing on the `/app/coaches` page:

1. **Verify database migration was applied**:
   - Check that `coaches_trainers_system.sql` was executed in Supabase SQL Editor
   - Verify tables exist: `coaches_trainers`, `coach_certifications`, `coach_schedules`, `athlete_coach_connections`
   - Verify functions exist: `get_coaches_trainers()`, `get_coach_profile()`

2. **Check RLS policies**:
   - Run the test script: `supabase/test_coaches_rls.sql`
   - Verify SELECT policies allow public access (no `auth.uid() IS NOT NULL` requirement)

3. **Add test data**:
   ```sql
   -- Insert a test coach
   INSERT INTO public.coaches_trainers (
     user_id, role, bio, specialties, years_of_experience, 
     hourly_rate, location, is_verified, is_active
   ) VALUES (
     auth.uid(), -- Your user ID
     'coach',
     'Test coach bio',
     ARRAY['Basketball', 'Training'],
     5,
     50.00,
     'Test City',
     true,
     true
   );
   ```

4. **Test the RPC function directly**:
   ```sql
   SELECT * FROM get_coaches_trainers(NULL, NULL, 10, 0);
   ```

5. **Use demo mode for testing**:
   - Set `VITE_DEMO_MODE=true` in `.env` file
   - This bypasses database and uses mock data
   - Useful for verifying UI works before connecting to database

### Authentication issues

- Users must be signed in to access `/app/coaches`
- If redirected to sign-in page, create an account first
- Demo mode can be used to test without authentication

## Support

For questions or issues, please refer to the main README.md or create an issue on GitHub.
