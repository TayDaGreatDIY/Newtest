# Feed Page UI/UX Changes - Visual Guide

## Post Card Layout Changes

### BEFORE:
```
┌─────────────────────────────────────────┐
│  🏀  Username              [Challenge]  │  ← Entire card clickable → Profile
│      2h ago                              │
│                                          │
│  Post content text here...               │  ← Clicking anywhere → Profile
│                                          │
│  ┌────────────────────────────────────┐ │
│  │                                    │ │
│  │        [HUGE IMAGE]                │ │  ← Image not size-limited
│  │                                    │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ❤️ 10    💬 5    🔄 2                   │  ← Buttons work but propagate
└─────────────────────────────────────────┘

Issues:
❌ Clicking post content goes to profile
❌ No way to delete own posts
❌ No way to report posts
❌ Images display huge
❌ Button clicks also trigger card click
```

### AFTER:
```
┌─────────────────────────────────────────┐
│  🏀  [Username]        ⋮  [Challenge]   │  ← Username → Profile, ⋮ → Menu
│      [2h ago]                            │
│  ┌─────────────────────────────────────┐│
│  │                                      ││
│  │  Post content text here...           ││  ← Click content → Post Detail
│  │                                      ││
│  │  ┌────────────────────────────────┐ ││
│  │  │                                │ ││
│  │  │    [Image max 600px height]    │ ││  ← Standardized size
│  │  │                                │ ││
│  │  └────────────────────────────────┘ ││
│  └─────────────────────────────────────┘│
│                                          │
│  ❤️ 10    💬 5    🔄 2                   │  ← Each button isolated
└─────────────────────────────────────────┘

Improvements:
✅ Username area → Profile (with visual feedback)
✅ Content area → Post Detail (with visual feedback)
✅ ⋮ Menu button → Delete or Report options
✅ Images standardized (1080x1350 max, display 600px)
✅ All buttons use stopPropagation
```

## 3-Dot Menu Modal

### For Post Owners:
```
┌─────────────────────────────┐
│      Post Options           │
├─────────────────────────────┤
│                             │
│  🗑️  Delete Post            │  ← RED text, functional
│                             │
│  ✏️  Edit Post              │  ← Coming soon
│                             │
└─────────────────────────────┘
```

### For Other Users:
```
┌─────────────────────────────┐
│      Post Options           │
├─────────────────────────────┤
│                             │
│  🚨  Report Post            │  ← Functional
│                             │
│  🔒  Privacy Settings       │  ← Coming soon
│                             │
│  👁️  Hide Post              │  ← Coming soon
│                             │
└─────────────────────────────┘
```

## Click Target Map

### Feed Page Post Card:
```
┌─────────────────────────────────────────┐
│  [Profile] [Profile]      [Menu][Action]│  Profile: Navigate to user profile
│                                          │  Menu: Open post options
│  ┌─────────────────────────────────────┐│  Action: Challenge user
│  │                                      ││
│  │    [Post Detail Area]                ││  Post Detail: Navigate to comments
│  │                                      ││
│  │    [Post Detail: Image]              ││
│  │                                      ││
│  └─────────────────────────────────────┘│
│                                          │
│  [Like]  [Comment]  [Repost]            │  Isolated action buttons
└─────────────────────────────────────────┘
```

## Navigation Flow

```
Feed Page
    │
    ├─ Click Username/Avatar ──→ User Profile Page
    │
    ├─ Click Post Content ────→ Post Detail Page
    │                              │
    │                              ├─ View all comments
    │                              ├─ Add new comment
    │                              └─ Like/Repost from detail
    │
    ├─ Click ⋮ Menu ──→ Modal (Owner)
    │                      ├─ Delete Post ──→ Confirm ──→ Remove & Refresh
    │                      └─ Edit Post (placeholder)
    │
    ├─ Click ⋮ Menu ──→ Modal (Non-Owner)
    │                      ├─ Report Post ──→ Confirm Toast
    │                      ├─ Privacy Settings (placeholder)
    │                      └─ Hide Post (placeholder)
    │
    ├─ Click ❤️ ──→ Toggle Like (optimistic update)
    │
    ├─ Click 💬 ──→ Navigate to Post Detail Page
    │
    ├─ Click 🔄 ──→ Toggle Repost (optimistic update)
    │    Right-click ──→ Show users who reposted
    │
    └─ Click Challenge ──→ Navigate to Challenges Page
```

## Image Sizing Workflow

```
User Uploads Image
    │
    ├─ Validation
    │   ├─ Check file type (image/*)
    │   └─ Check size (< 5MB)
    │
    ├─ Resize (if needed)
    │   ├─ Max width: 1080px
    │   ├─ Max height: 1350px
    │   ├─ Maintain aspect ratio
    │   └─ Compress at 92% quality
    │
    ├─ Upload to Supabase
    │   └─ Store in post-images bucket
    │
    └─ Display in Feed
        ├─ Max height: 600px
        ├─ object-cover mode
        └─ Rounded corners + border
```

## Event Propagation Fix

### Before (Problematic):
```javascript
<Card>                              // onClick → navigate to profile
  <Username />                      // No onClick
  <Content>                         // No onClick
    <Image />                       // No onClick
  </Content>
  <Actions>
    <LikeButton onClick={...} />    // Click bubbles up to Card!
  </Actions>
</Card>
```

### After (Fixed):
```javascript
<Card>                              // No onClick
  <Username onClick={
    (e) => {
      e.stopPropagation();          // Don't bubble
      navigate(profile)
    }
  } />
  <Content onClick={
    () => navigate(postDetail)      // Direct navigation
  }>
    <Image />
  </Content>
  <Actions>
    <LikeButton onClick={
      (e) => {
        e.stopPropagation();        // Don't bubble
        handleLike()
      }
    } />
  </Actions>
</Card>
```

## Toast Notifications

Users receive clear feedback for all actions:

```
Action                  Toast Message                    Type
─────────────────────────────────────────────────────────────
Like post              (none - optimistic update)       -
Unlike post            (none - optimistic update)       -
Repost                 "Reposted!"                      success
Unrepost               "Unreposted"                     success
Delete post            "Post deleted successfully!"     success
Report post            "Post reported. We will..."      success
Upload image error     "Failed to process image..."     error
Delete post error      "Failed to delete post: ..."     error
```

## Responsive Behavior

All improvements work on mobile and desktop:

- Touch-friendly click targets (48px minimum)
- Modal overlays with proper backdrop
- Images scale properly on all screens
- Menu buttons accessible on mobile
- Swipe gestures not affected
- Bottom navigation not blocked

## Accessibility Features

- `title` attributes for hover tooltips
- Semantic HTML maintained
- Keyboard navigation supported
- Focus states on interactive elements
- Clear visual feedback on actions
- ARIA labels where appropriate
