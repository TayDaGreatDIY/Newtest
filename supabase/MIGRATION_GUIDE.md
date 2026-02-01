# Database Setup and Migration Guide

This guide explains how to set up the database and run migrations for the M2DG application.

## Prerequisites

1. A Supabase project (sign up at https://supabase.com)
2. Access to the Supabase SQL Editor in your project dashboard

## Running Migrations

Execute the migration files in the following order:

### 1. Base Schema
Run `schema.sql` first to create the profiles table:
```sql
-- Run in Supabase SQL Editor
```

### 2. Phase 1: Courts and Challenges
Run `mvp_phase1.sql` to create:
- Courts table
- Court check-ins table
- Challenges table
- Challenge participants table
- Helper functions and views

### 3. Phase 2: Posts
Run `mvp_phase2_posts.sql` to create:
- Posts table
- Post likes table
- Post comments table
- Post reposts table
- Helper functions

### 4. Phase 2: Messaging
Run `mvp_phase2_messaging.sql` to create:
- Message threads table
- Thread participants table
- Messages table
- Helper functions

### 5. Storage Bucket
Run `create_storage_bucket.sql` to create:
- Post images storage bucket
- Storage policies for upload/download

### 6. Foreign Key Fixes
Run `fix_foreign_keys.sql` to:
- Update profile visibility policies
- Allow proper joins between tables

## Important Notes

### Storage Bucket
The storage bucket `post-images` must be created for image uploads to work. The migration script handles this automatically.

### RLS Policies
All tables have Row Level Security (RLS) enabled. Make sure:
- Users are authenticated before accessing data
- Policies are properly configured for your use case

### Profile Visibility
After running `fix_foreign_keys.sql`, all authenticated users can view other users' profiles. This is required for:
- Displaying user names in check-ins
- Showing challenge creators
- Message participants

## Troubleshooting

### "Bucket not found" error
Make sure you've run `create_storage_bucket.sql` successfully.

### "Could not find a relationship" errors
These have been fixed in the latest version by:
1. Running `fix_foreign_keys.sql` to update policies
2. Using separate queries instead of joins in the application code

### Missing data
If you see empty results, check:
1. Are you logged in?
2. Do the RLS policies allow access?
3. Have you created test data?

## Test Data

To clean up test data, see `cleanup_test_data.sql` for instructions.
