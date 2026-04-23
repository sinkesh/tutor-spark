# Conversation History Feature

## Overview

The Conversation History feature allows students to view their chat history organized by AI teachers (agents) and sessions. This provides a structured way to review past learning conversations.

## API Endpoint

**Endpoint:** `/api/v1/student/conversation-history/{student_id}`

**Response Structure:**
```json
{
  "student_id": "std_EA9MG",
  "agents": [
    {
      "agent_id": "agent_VR8FA",
      "subject": "Science",
      "sessions": [
        {
          "session_id": "chat_uhpzc3rp",
          "title": "New AI Tutor Chat",
          "created_at": "2026-03-18T13:25:12.754000",
          "updated_at": "2026-03-18T14:01:33.222000",
          "message_count": 2,
          "conversations": [...]
        }
      ],
      "total_conversations": 2
    }
  ],
  "total_conversations": 2,
  "total_sessions": 1
}
```

## UI Structure

The conversation history page uses a three-panel layout:

### 1. Agent Sidebar (Left)
- Lists all AI teachers the student has interacted with
- Shows total conversation count per agent
- Click to filter sessions by agent
- Auto-selects first agent on load

### 2. Session List (Middle)
- Shows sessions for the selected agent
- Displays session title, message count, and creation date
- Click to view conversation details
- Empty state when agent has no sessions

### 3. Conversation Panel (Right)
- Shows full conversation history for selected session
- Displays user queries and AI responses chronologically
- Shows timestamps and feedback indicators
- Empty state when session has no messages

## Navigation

Access the conversation history via:
- Sidebar navigation: "Chat History" menu item
- Direct URL: `/student/conversation-history`
- Requires student authentication

## State Management

The component manages the following state:
- `conversationData`: Full API response
- `selectedAgentId`: Currently selected agent
- `selectedSessionId`: Currently selected session
- `isLoading`: Loading state
- `error`: Error state

## Features

### Filtering Logic
- **Agent filtering**: Click agent → show only its sessions
- **Session filtering**: Click session → show only its conversations
- **Auto-selection**: First agent auto-selected on load

### Empty States
- **No agents**: "No agents found" message
- **No sessions**: "No sessions for [Subject]" message  
- **No conversations**: "No messages in this session" message

### Error Handling
- API failure handling with retry option
- Loading states with skeleton screens
- Toast notifications for errors

## User Flow

1. User navigates to Conversation History page
2. System loads conversation history data
3. First agent is auto-selected
4. User can:
   - Click different agents to see their sessions
   - Click sessions to view conversation details
   - Scroll through conversation messages
   - Navigate back to agent/session selection

## Technical Implementation

### Components
- `ConversationHistoryPage`: Main page component
- Uses existing UI components from `@/components/ui/`
- Integrates with `StudentLayout`
- Uses `useAuth` for authentication

### API Integration
- `getConversationHistory()` service function
- Proper error handling and logging
- TypeScript interfaces for type safety

### Styling
- Responsive design with scroll areas
- Consistent with existing design system
- Proper visual hierarchy and selection states

## Future Enhancements

Potential improvements for Phase 2:
- URL parameter persistence for sharing
- Search functionality within conversations
- Export conversation history
- Mobile-optimized view
- Conversation analytics and insights
