# Implementation Guide: Next Steps for M2DG Phase 2

This guide provides step-by-step instructions for implementing the next features in the M2DG platform.

## Quick Start: What to Build Next

Based on the current state of the project, here's what needs to be built next, in priority order:

### **Option 1: Posts & Feed System (RECOMMENDED - HIGHEST IMPACT)**
**Why:** This is the most visible feature and will drive user engagement. The UI is already built but using mock data.

**Time Estimate:** 2-3 weeks

**Steps:**
1. Run the SQL migration: `supabase/mvp_phase2_posts.sql`
2. Create Supabase Storage bucket for images
3. Add TypeScript types for posts
4. Replace mock data with real Supabase queries
5. Add create post functionality
6. Add like/comment functionality
7. Test and deploy

### **Option 2: Real-Time Messaging System**
**Why:** Enables player communication and community building. UI is built but uses mock data.

**Time Estimate:** 2-3 weeks

**Steps:**
1. Run the SQL migration: `supabase/mvp_phase2_messaging.sql`
2. Add TypeScript types for messages
3. Replace mock data with real Supabase queries
4. Implement real-time subscriptions
5. Add message sending functionality
6. Add thread creation
7. Test and deploy

### **Option 3: AI Coach Enhancement**
**Why:** Unique feature that differentiates the platform. Currently has hardcoded responses.

**Time Estimate:** 1-2 weeks

**Steps:**
1. Choose AI provider (OpenAI, Anthropic, or Gemini)
2. Set up API integration (Edge Function or client-side)
3. Add conversation history
4. Personalize based on user stats
5. Test and deploy

---

## Detailed Implementation: Posts & Feed System

### Step 1: Database Setup (30 minutes)

1. **Run the migration:**
   ```bash
   # Copy the SQL from supabase/mvp_phase2_posts.sql
   # Paste into Supabase Dashboard > SQL Editor
   # Execute
   ```

2. **Create Storage Bucket:**
   - Go to Supabase Dashboard > Storage
   - Click "New bucket"
   - Name: `post-images`
   - Make it public
   - Add the storage policies from the SQL file comments

### Step 2: TypeScript Types (30 minutes)

Add to `src/types/db.ts`:

```typescript
export interface Post {
  id: string;
  user_id: string;
  type: 'text' | 'image' | 'challenge';
  content: string;
  image_url?: string;
  challenge_id?: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  updated_at: string;
  // Joined fields
  user_display_name?: string;
  is_liked_by_me?: boolean;
}

export interface PostLike {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  user_display_name?: string;
}
```

### Step 3: Create Post Service (1-2 hours)

Create `src/lib/postService.ts`:

```typescript
import { supabase } from './supabase';
import type { Post, PostComment } from '../types/db';

export const postService = {
  // Get feed posts
  async getFeedPosts(limit = 50, offset = 0) {
    const { data, error } = await supabase
      .rpc('get_feed_posts', { limit_count: limit, offset_count: offset });
    
    if (error) throw error;
    return data as Post[];
  },

  // Create a post
  async createPost(content: string, type: 'text' | 'image' | 'challenge', imageUrl?: string, challengeId?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        type,
        content,
        image_url: imageUrl,
        challenge_id: challengeId,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Post;
  },

  // Like a post
  async likePost(postId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('post_likes')
      .insert({ post_id: postId, user_id: user.id });

    if (error) throw error;
  },

  // Unlike a post
  async unlikePost(postId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('post_likes')
      .delete()
      .match({ post_id: postId, user_id: user.id });

    if (error) throw error;
  },

  // Add comment
  async addComment(postId: string, content: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('post_comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        content,
      })
      .select()
      .single();

    if (error) throw error;
    return data as PostComment;
  },

  // Get comments for a post
  async getComments(postId: string) {
    const { data, error } = await supabase
      .from('post_comments')
      .select(`
        *,
        profiles:user_id (display_name)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data.map(comment => ({
      ...comment,
      user_display_name: comment.profiles?.display_name,
    })) as PostComment[];
  },

  // Upload image
  async uploadImage(file: File) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('post-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('post-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  },
};
```

### Step 4: Update Feed Component (2-3 hours)

Update `src/pages/Feed.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import { GlassCard, SectionHeader, GradientButton, EmptyState } from '../components';
import { postService } from '../lib/postService';
import type { Post } from '../types/db';

export const Feed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await postService.getFeedPosts();
      setPosts(data);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    try {
      if (post.is_liked_by_me) {
        await postService.unlikePost(postId);
      } else {
        await postService.likePost(postId);
      }
      
      // Update local state
      setPosts(posts.map(p => 
        p.id === postId 
          ? { 
              ...p, 
              is_liked_by_me: !p.is_liked_by_me,
              likes_count: p.is_liked_by_me ? p.likes_count - 1 : p.likes_count + 1
            }
          : p
      ));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  // ... rest of component implementation
};
```

### Step 5: Create Post Modal (2-3 hours)

Create `src/components/CreatePostModal.tsx`:

```typescript
import React, { useState } from 'react';
import { Modal, GradientButton } from './';
import { postService } from '../lib/postService';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: () => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onPostCreated,
}) => {
  const [content, setContent] = useState('');
  const [type, setType] = useState<'text' | 'image'>('text');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setUploading(true);
      
      let imageUrl: string | undefined;
      if (type === 'image' && imageFile) {
        imageUrl = await postService.uploadImage(imageFile);
      }

      await postService.createPost(content, type, imageUrl);
      
      onPostCreated();
      onClose();
      setContent('');
      setImageFile(null);
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post');
    } finally {
      setUploading(false);
    }
  };

  // ... rest of component
};
```

### Step 6: Testing (1-2 hours)

1. **Test post creation:**
   - Text posts
   - Image posts
   - Challenge posts

2. **Test interactions:**
   - Like/unlike
   - Comments
   - View counts

3. **Test edge cases:**
   - Empty content
   - Large images
   - Network errors

---

## Detailed Implementation: Messaging System

### Step 1: Database Setup (30 minutes)

```bash
# Copy the SQL from supabase/mvp_phase2_messaging.sql
# Paste into Supabase Dashboard > SQL Editor
# Execute
```

### Step 2: Enable Realtime (5 minutes)

In Supabase Dashboard:
1. Go to Database > Replication
2. Enable replication for:
   - `message_threads`
   - `messages`
   - `thread_participants`

### Step 3: Create Message Service (2-3 hours)

Create `src/lib/messageService.ts`:

```typescript
import { supabase } from './supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export const messageService = {
  // Get user's threads
  async getUserThreads(userId: string) {
    const { data, error } = await supabase
      .rpc('get_user_threads', { user_uuid: userId });
    
    if (error) throw error;
    return data;
  },

  // Get or create thread with another user
  async getOrCreateThread(otherUserId: string) {
    const { data, error } = await supabase
      .rpc('get_or_create_thread', { other_user_id: otherUserId });
    
    if (error) throw error;
    return data;
  },

  // Get messages in thread
  async getThreadMessages(threadId: string, limit = 50, offset = 0) {
    const { data, error } = await supabase
      .rpc('get_thread_messages', {
        thread_uuid: threadId,
        limit_count: limit,
        offset_count: offset,
      });
    
    if (error) throw error;
    return data;
  },

  // Send message
  async sendMessage(threadId: string, content: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('messages')
      .insert({
        thread_id: threadId,
        sender_id: user.id,
        content,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Mark thread as read
  async markAsRead(threadId: string) {
    const { error } = await supabase
      .rpc('mark_thread_as_read', { thread_uuid: threadId });
    
    if (error) throw error;
  },

  // Subscribe to new messages in a thread
  subscribeToThread(threadId: string, callback: (message: any) => void): RealtimeChannel {
    const channel = supabase
      .channel(`thread:${threadId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `thread_id=eq.${threadId}`,
        },
        (payload) => callback(payload.new)
      )
      .subscribe();

    return channel;
  },
};
```

### Step 4: Update Messages Component (3-4 hours)

Follow similar pattern as Feed component, replacing mock data with real Supabase queries.

---

## Detailed Implementation: AI Coach

### Option A: Client-Side OpenAI (Simpler)

1. **Install OpenAI SDK:**
   ```bash
   npm install openai
   ```

2. **Add API Key to .env:**
   ```
   VITE_OPENAI_API_KEY=your-key-here
   ```

3. **Update ThinkingCorner.tsx:**
   ```typescript
   import OpenAI from 'openai';

   const openai = new OpenAI({
     apiKey: import.meta.env.VITE_OPENAI_API_KEY,
     dangerouslyAllowBrowser: true, // Only for development
   });

   const getAIResponse = async (prompt: string): Promise<string> => {
     const completion = await openai.chat.completions.create({
       model: "gpt-3.5-turbo",
       messages: [
         {
           role: "system",
           content: "You are an expert basketball coach..."
         },
         {
           role: "user",
           content: prompt
         }
       ],
     });
     
     return completion.choices[0].message.content || '';
   };
   ```

### Option B: Edge Function (More Secure)

1. **Create Edge Function:**
   - Create in Supabase Dashboard > Edge Functions
   - Name: `ai-coach`
   - Use OpenAI API on server-side

2. **Call from client:**
   ```typescript
   const { data, error } = await supabase.functions.invoke('ai-coach', {
     body: { message: userMessage },
   });
   ```

---

## Testing Checklist

Before considering each feature complete:

- [ ] Feature works in development
- [ ] Feature works in production
- [ ] All error cases are handled
- [ ] Loading states are shown
- [ ] Empty states are handled
- [ ] Mobile responsive
- [ ] Tested on multiple browsers
- [ ] No console errors
- [ ] TypeScript types are correct
- [ ] No security vulnerabilities

---

## Deployment

After implementing each feature:

1. **Test locally:**
   ```bash
   npm run dev
   ```

2. **Build:**
   ```bash
   npm run build
   ```

3. **Preview build:**
   ```bash
   npm run preview
   ```

4. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "feat: implement posts system"
   git push origin main
   ```

5. **Verify deployment:**
   - Check GitHub Actions
   - Test on live URL

---

## Getting Help

If you encounter issues:

1. Check Supabase logs in Dashboard
2. Check browser console for errors
3. Check network tab for API errors
4. Review RLS policies if data access fails
5. Check GitHub Issues for similar problems

---

## Summary

**Immediate Priority:** Implement the Posts & Feed System first. It has the highest impact on user engagement and the UI is already built.

**Timeline:**
- Week 1-3: Posts & Feed
- Week 4-6: Messaging
- Week 7-9: AI Coach & polish

This will complete Phase 2 and make the platform fully functional!
