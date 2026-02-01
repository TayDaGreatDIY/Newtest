# M2DG Phase 2 Roadmap: Next Features to Build

## Overview
MVP Phase 1 has successfully implemented the core Courts, Check-ins, Challenges, and Champions features. This document outlines the remaining features that need to be built to complete the platform.

## Current Status

### ✅ Completed (MVP Phase 1)
- User Authentication (Supabase email/password)
- User Profiles with editable display names
- Courts System (create, browse, search)
- Court Check-ins (one per day per court)
- Court Champions (based on 7-day check-in counts)
- Challenges System (create, join, submit scores)
- Challenge Leaderboards with medals
- User Stats Dashboard
- PWA functionality with offline support
- Mobile-first responsive design
- GitHub Pages deployment

### 🚧 In Progress (Using Mock Data)
These features exist in the UI but use mock/hardcoded data and need backend integration:

1. **Feed/Posts System** (`src/pages/Feed.tsx`)
   - Currently uses `mockPosts.ts`
   - Has UI for text posts, image posts, and challenge posts
   - Needs Supabase schema and real-time integration

2. **Messaging System** (`src/pages/Messages.tsx`, `src/pages/ChatThread.tsx`)
   - Currently uses `mockMessages.ts`
   - Has UI for message threads and chat
   - Needs Supabase schema and real-time messaging

3. **AI Coach / Thinking Corner** (`src/pages/ThinkingCorner.tsx`)
   - Currently has hardcoded responses
   - Needs real AI integration (OpenAI, Anthropic, or similar)

## Phase 2 Priorities

### Priority 1: Posts & Feed System (High Impact)
**Goal:** Enable users to share achievements, photos, and challenges with the community

**Database Schema:**
```sql
-- Posts table
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('text', 'image', 'challenge')),
  content TEXT NOT NULL,
  image_url TEXT, -- URL to uploaded image
  challenge_id UUID REFERENCES public.challenges(id), -- For challenge posts
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Post likes
CREATE TABLE public.post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Post comments
CREATE TABLE public.post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Features to Implement:**
- [ ] Create post (text, image, challenge)
- [ ] Upload images to Supabase Storage
- [ ] View feed with real-time updates
- [ ] Like/unlike posts
- [ ] Comment on posts
- [ ] Share posts
- [ ] Delete own posts
- [ ] Report inappropriate content

**Estimated Effort:** 2-3 weeks

---

### Priority 2: Real-Time Messaging (High Impact)
**Goal:** Enable direct communication between players

**Database Schema:**
```sql
-- Message threads
CREATE TABLE public.message_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Thread participants
CREATE TABLE public.thread_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.message_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(thread_id, user_id)
);

-- Messages
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.message_threads(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Features to Implement:**
- [ ] Create new message thread
- [ ] Send messages with real-time delivery
- [ ] Mark messages as read
- [ ] Show unread count
- [ ] Show typing indicators
- [ ] Show online status
- [ ] Message notifications
- [ ] Search messages

**Estimated Effort:** 2-3 weeks

---

### Priority 3: Image Upload System (Medium Impact)
**Goal:** Enable users to upload and share photos

**Features to Implement:**
- [ ] Set up Supabase Storage bucket for user images
- [ ] Implement image upload component
- [ ] Add image compression/optimization
- [ ] Add image preview before upload
- [ ] Profile picture upload
- [ ] Post image upload
- [ ] Court photo upload (optional)

**Estimated Effort:** 1 week

---

### Priority 4: Enhanced AI Coach (Medium Impact)
**Goal:** Provide personalized training advice and motivation

**Implementation Options:**

**Option A: OpenAI Integration (Recommended)**
```typescript
// Use OpenAI API for dynamic responses
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY,
});

async function getCoachResponse(userMessage: string) {
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are an expert basketball coach and trainer..."
      },
      {
        role: "user",
        content: userMessage
      }
    ],
  });
  return completion.choices[0].message.content;
}
```

**Option B: Edge Functions with AI**
- Create Supabase Edge Function for AI requests
- Keeps API keys secure on server-side
- Can integrate with multiple AI providers

**Features to Implement:**
- [ ] Integrate AI API (OpenAI, Anthropic, or Gemini)
- [ ] Add conversation history/context
- [ ] Personalized responses based on user stats
- [ ] Training plan generation
- [ ] Workout recommendations
- [ ] Nutrition advice
- [ ] Mental coaching

**Estimated Effort:** 1-2 weeks

---

### Priority 5: Notifications System (Medium Impact)
**Goal:** Keep users engaged with timely updates

**Database Schema:**
```sql
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'like', 'comment', 'challenge', 'message', etc.
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT, -- Deep link to relevant page
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Features to Implement:**
- [ ] In-app notification center
- [ ] Real-time notification delivery
- [ ] Push notifications (PWA)
- [ ] Email notifications (optional)
- [ ] Notification preferences
- [ ] Mark as read/unread

**Estimated Effort:** 1-2 weeks

---

## Phase 3 & Beyond (Future Enhancements)

### Social Features
- [ ] Follow/Unfollow users
- [ ] User reputation/ranking system
- [ ] Team creation and management
- [ ] Friend requests
- [ ] Invite system
- [ ] Share to social media

### Advanced Challenge Features
- [ ] Video proof uploads for challenges
- [ ] Live challenge tracking
- [ ] Tournament brackets
- [ ] Team challenges
- [ ] Sponsored challenges with prizes
- [ ] Challenge history and analytics

### Court Features
- [ ] Court ratings and reviews
- [ ] Court photos gallery
- [ ] Court availability calendar
- [ ] Reserve court time slots
- [ ] Court weather conditions
- [ ] Nearby courts with geolocation

### Analytics & Insights
- [ ] Personal performance analytics
- [ ] Progress tracking over time
- [ ] Skill level assessment
- [ ] Training recommendations based on data
- [ ] Comparison with peers

### Monetization (Optional)
- [ ] Premium features subscription
- [ ] Sponsored courts
- [ ] Branded challenges
- [ ] Virtual coaching sessions
- [ ] Equipment marketplace

## Technical Debt & Improvements

### Code Quality
- [ ] Add comprehensive unit tests
- [ ] Add E2E tests with Playwright
- [ ] Improve TypeScript types coverage
- [ ] Add better error handling
- [ ] Implement proper loading states
- [ ] Add request rate limiting

### Performance
- [ ] Implement pagination for feeds
- [ ] Add virtual scrolling for long lists
- [ ] Optimize images with CDN
- [ ] Add caching strategies
- [ ] Implement lazy loading

### Security
- [ ] Add content moderation
- [ ] Implement report/block users
- [ ] Add input sanitization
- [ ] Implement rate limiting on API calls
- [ ] Add CAPTCHA for signup
- [ ] Security audit

### UX Improvements
- [ ] Add onboarding tutorial
- [ ] Improve empty states
- [ ] Add skeleton loaders
- [ ] Better error messages
- [ ] Add tooltips and help text
- [ ] Improve accessibility (ARIA labels)

## Recommended Implementation Order

1. **Week 1-3:** Posts & Feed System (Priority 1)
2. **Week 4-6:** Real-Time Messaging (Priority 2)
3. **Week 7:** Image Upload System (Priority 3)
4. **Week 8-9:** Enhanced AI Coach (Priority 4)
5. **Week 10-11:** Notifications System (Priority 5)
6. **Week 12+:** Phase 3 features based on user feedback

## Success Metrics

Track these metrics to measure success:
- Daily Active Users (DAU)
- Posts created per day
- Messages sent per day
- User engagement rate
- Retention rate (Day 7, Day 30)
- Challenge participation rate
- Average session duration

## Conclusion

The platform has a solid MVP Phase 1 foundation with Courts and Challenges. The next phase should focus on building out the social features (Posts, Messaging) to increase user engagement and retention. The AI Coach and Notifications will enhance the user experience and keep users coming back.

**Immediate Next Step:** Implement the Posts & Feed System with database schema and backend integration to move away from mock data.
