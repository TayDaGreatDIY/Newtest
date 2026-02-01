# AI Coach Feature Flow

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Thinking Corner Page                         │
│                                                                   │
│  ┌──────────────┐                              ┌──────────────┐ │
│  │   Header     │                              │ Goals Button │ │
│  └──────────────┘                              └──────────────┘ │
│                                                        │          │
│  ┌──────────────────────────────────────────────────┐│          │
│  │           Quick Prompts                          ││          │
│  │  💪 Motivation  │  🏋️ Workout                  ││          │
│  │  🥗 Nutrition   │  🧠 Mental Reset             ││          │
│  └──────────────────────────────────────────────────┘│          │
│                                                        ▼          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Chat Messages                               │   │
│  │  👤 User: "Help me improve my shooting"                 │   │
│  │  🤖 AI: "Based on your goal to improve shooting..."     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │   Chat Input Box                                    [Send]│   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┴──────────────────┐
        ▼                                      ▼
┌────────────────┐                    ┌─────────────────┐
│ Preferences    │                    │  AI Coach       │
│ Modal          │                    │  Library        │
│                │                    │                 │
│ • Primary Goal │◄───────────────────│ • Get Response  │
│ • Fitness Level│                    │ • Save History  │
│ • Training Days│                    │ • Load Context  │
│ • Equipment    │                    └────────┬────────┘
│ • Goals        │                             │
│ • Nutrition    │                             │
│ • Mental Focus │                             │
│ • Injuries     │                             │
└────────┬───────┘                             │
         │                                      │
         ▼                                      ▼
┌─────────────────────────────────────────────────────┐
│              Supabase Database                      │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │  ai_coach_preferences                        │  │
│  │  • user_id                                   │  │
│  │  • primary_goal                              │  │
│  │  • fitness_level                             │  │
│  │  • training_days_per_week                    │  │
│  │  • available_equipment                       │  │
│  │  • shooting_goal, defense_goal, etc.         │  │
│  │  • nutrition_goal                            │  │
│  │  • dietary_restrictions                      │  │
│  │  • mental_focus_areas                        │  │
│  │  • injuries_or_limitations                   │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │  ai_coach_conversations                      │  │
│  │  • user_id                                   │  │
│  │  • message_role (user/assistant)             │  │
│  │  • message_content                           │  │
│  │  • conversation_context (JSON)               │  │
│  │  • created_at                                │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
             ┌─────────────────────┐
             │   OpenAI API        │
             │   (GPT-3.5-turbo)   │
             │                     │
             │  + System Prompt    │
             │  + User Context     │
             │  + Conversation     │
             └─────────────────────┘
```

## User Journey Flow

### First Time User

```
User Opens Thinking Corner
         │
         ▼
See Welcome Message
         │
         ▼
Clicks "Goals" Button ────────┐
         │                     │
         ▼                     │
Opens Preferences Modal        │
         │                     │
         ▼                     │
Fills in:                      │
• Primary Goal                 │
• Fitness Level                │
• Training Frequency           │
• Equipment Available          │
• Specific Goals               │
• Nutrition Preferences        │
• Mental Focus Areas           │
• Injuries/Limitations         │
         │                     │
         ▼                     │
Clicks "Save Goals"            │
         │                     │
         ▼                     │
Preferences Saved to DB ◄──────┘
         │
         ▼
See Confirmation Message
         │
         ▼
Start Chatting with AI
         │
         ▼
AI Uses Preferences
for Personalized Response
         │
         ▼
Conversation Saved to DB
```

### Returning User

```
User Opens Thinking Corner
         │
         ▼
Load User Data:
• Preferences from DB
• Recent Conversations
         │
         ▼
See "Welcome Back" Message
+ Last 10 Messages
         │
         ▼
Continue Chatting
         │
         ▼
AI References:
• User Goals
• Past Conversations
• Progress Made
         │
         ▼
Provides Adaptive Coaching
         │
         ▼
Conversation Saved to DB
```

## Message Flow

```
User Types Message
         │
         ▼
Message Sent to getCoachResponse()
         │
         ├─────────────────────────┐
         │                         │
         ▼                         ▼
Load User Preferences    Build Conversation Context
         │                         │
         ▼                         │
Build User Context String         │
         │                         │
         └─────────┬───────────────┘
                   │
                   ▼
         Construct System Prompt:
         • Base Coach Instructions
         • + User Context
         • + Conversation History
                   │
                   ▼
         Send to OpenAI API
                   │
                   ▼
         Receive AI Response
                   │
         ┌─────────┴─────────┐
         │                   │
         ▼                   ▼
Save User Message    Save AI Response
  to Database          to Database
         │                   │
         └─────────┬─────────┘
                   │
                   ▼
         Display AI Response
         in Chat Interface
```

## Key Features

### 1. Personalization
- AI receives full user context with every message
- Responses tailored to fitness level, goals, and equipment
- References user's specific goals in recommendations

### 2. Memory & Learning
- All conversations saved to database
- Recent history loaded on page load
- AI can reference past discussions
- Tracks progress over time

### 3. Comprehensive Coaching
- **Motivation**: Personalized encouragement
- **Workouts**: Custom plans based on goals
- **Nutrition**: Meal plans for dietary needs
- **Mental**: Visualization and breathing techniques

### 4. User Experience
- Simple "Goals" button for easy access
- Comprehensive form for detailed preferences
- Smooth modal animations
- Clear feedback on save
- Chat box always accessible
- Quick prompts for common questions

## Data Flow

```
User Input ──► UI Component ──► AI Library ──► Database
                     │              │              │
                     │              ▼              │
                     │         OpenAI API          │
                     │              │              │
                     │              ▼              │
                     ◄──────── AI Response ────────┘
                     │
                     ▼
              Display to User
```

## Security Layers

```
┌─────────────────────────────────┐
│   Browser (Client Side)         │
│   • Input Validation            │
│   • Type Safety (TypeScript)    │
└───────────┬─────────────────────┘
            │
            ▼
┌─────────────────────────────────┐
│   Supabase (Database)           │
│   • Row Level Security (RLS)    │
│   • Users see only their data   │
│   • Foreign Key Constraints     │
└───────────┬─────────────────────┘
            │
            ▼
┌─────────────────────────────────┐
│   OpenAI API                    │
│   • API Key (server-side rec.)  │
│   • Rate Limiting               │
└─────────────────────────────────┘
```
