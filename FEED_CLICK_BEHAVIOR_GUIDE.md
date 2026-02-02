# Feed Page Click Behavior Visual Guide

```
┌──────────────────────────────────────────────────────────────────┐
│                        POST CARD (Click → Post Detail)            │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  🏀  [USERNAME] ← Click here → Profile      ⋮  [Challenge] │  │
│  │      12h ago                                                │  │
│  ├────────────────────────────────────────────────────────────┤  │
│  │                                                             │  │
│  │  This is the post content. Clicking anywhere              │  │
│  │  in this area will take you to the post detail page.      │  │
│  │                                                             │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │                                                       │  │  │
│  │  │              [Post Image if present]                 │  │  │
│  │  │                                                       │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  │                                                             │  │
│  ├────────────────────────────────────────────────────────────┤  │
│  │  ❤️ 42    💬 12    🔄 8                                    │  │
│  │  (Like)  (Comment) (Repost)                                │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

## Click Behavior Map

### 1. Username Area
```
┌─────────────────────┐
│ 🏀  [USERNAME]      │ ← Only this text is clickable for profile
│     12h ago         │ ← This timestamp is NOT clickable
└─────────────────────┘
```
- **Click on username text**: Navigate to user profile
- **Click on timestamp**: Navigate to post detail (card default)

### 2. Action Buttons
```
┌────────────────────────────────────────┐
│  ❤️ 42    💬 12    🔄 8                │
└────────────────────────────────────────┘
```
- **❤️ Like**: Toggle like status (stays on feed)
- **💬 Comment**: Navigate to post detail page
- **🔄 Repost**: Toggle repost status (stays on feed)
- **🔄 Right-click/Long-press**: Show repost modal

### 3. Header Buttons
```
┌──────────────────────────────┐
│  [Username]  ⋮  [Challenge]  │
└──────────────────────────────┘
```
- **⋮ Menu**: Open post options modal
- **Challenge**: Navigate to challenges page

### 4. Post Content Area
```
┌─────────────────────────────────────┐
│  This is the post content...        │
│                                     │
│  [Image if present]                 │
└─────────────────────────────────────┘
```
- **Click anywhere**: Navigate to post detail page

### 5. Challenge Card (if present)
```
┌────────────────────────────────────┐
│  Challenge Post                     │
│  View Challenge Details    [View]  │ ← Click button to go to challenge
└────────────────────────────────────┘
```
- **Click "View" button**: Navigate to challenge detail
- **Click elsewhere on card**: Navigate to post detail

## Color Coding

### Hover States
- 🟪 **Username hover**: Text turns purple
- ⬜ **Post card hover**: Background lightens (white/5 opacity)
- 🔴 **Like button hover**: White (or pink if already liked)
- 🟢 **Repost button hover**: White (or green if already reposted)

### Active States
- 🔴 **Liked**: Heart icon is red/pink (❤️)
- 🟢 **Reposted**: Repost icon is green (🔄)

## Event Propagation Flow

```
Card Click Event
│
├─→ Did user click username?
│   └─→ YES: Navigate to profile (stop propagation)
│
├─→ Did user click a button (⋮, Challenge, ❤️, 💬, 🔄)?
│   └─→ YES: Execute button action (stop propagation)
│
├─→ Did user click Challenge "View" button?
│   └─→ YES: Navigate to challenge (stop propagation)
│
└─→ None of the above?
    └─→ Navigate to post detail (card default action)
```

## Mobile vs Desktop

### Desktop
- **Hover effects**: Visible on username and card
- **Right-click repost**: Shows repost modal

### Mobile
- **Tap**: All click behaviors work the same
- **Long-press repost**: Shows repost modal (500ms)
- **No hover effects**: Uses native touch feedback

## Accessibility

- All clickable elements have proper cursor pointers
- Username has title="View profile"
- Buttons have descriptive aria labels
- Keyboard navigation supported (Tab to focus, Enter to activate)

## Common User Scenarios

### Scenario 1: "I want to read the full post"
✅ Click anywhere on the post card

### Scenario 2: "I want to see who posted this"
✅ Click on the username (bold text at top)

### Scenario 3: "I want to like the post"
✅ Click the heart icon (❤️/🤍)

### Scenario 4: "I want to add a comment"
✅ Click the comment icon (💬) or click anywhere on post card

### Scenario 5: "I want to repost"
✅ Click the repost icon (🔄)

### Scenario 6: "I want to see who reposted"
✅ Right-click (desktop) or long-press (mobile) the repost icon

### Scenario 7: "I want to accept a challenge"
✅ Click the "Challenge" button in the header

### Scenario 8: "I want to view a challenge mentioned in the post"
✅ Click the "View" button in the purple challenge card

### Scenario 9: "I want to delete/report a post"
✅ Click the three-dot menu (⋮) and select an option
