# ChatGPT-Style Chat System Implementation

## Overview

This document describes the implementation of a ChatGPT-style chat system for the Student Portal, allowing students to create multiple chat sessions with individual conversation history.

## Features

### 🎯 Core Features
- **Multiple Chat Sessions**: Students can create and manage separate conversations
- **Conversation History**: Each session maintains its own complete message history
- **Session Management**: Create, rename, delete, and archive chat sessions
- **Search & Filtering**: Find specific sessions and conversations
- **Responsive Design**: ChatGPT-style interface that works on all devices
- **AI Integration**: Context-aware responses that include conversation history

### 🔧 Technical Features
- **Real-time Updates**: Immediate UI feedback for all actions
- **Message Types**: Support for text, notes, study plans, and quizzes
- **Feedback System**: Like/dislike responses for AI messages
- **Mobile Optimized**: Collapsible sidebar and touch-friendly interface
- **Backward Compatible**: Existing subject-based chats still work

## Architecture

### Database Schema

#### `chat_sessions` Table
```sql
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  agent_type VARCHAR(50) NOT NULL CHECK (agent_type IN ('subject', 'class', 'course', 'teacher')),
  agent_name VARCHAR(255) NOT NULL,
  agent_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  message_count INTEGER DEFAULT 0,
  is_archived BOOLEAN DEFAULT FALSE
);
```

#### `chat_messages` Table
```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  conversation_id VARCHAR(100),
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT,
  message_type VARCHAR(50) DEFAULT 'text' CHECK (message_type IN ('text', 'notes', 'study_plan', 'quiz')),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  feedback VARCHAR(20) CHECK (feedback IN ('like', 'dislike')),
  feedback_updated_at TIMESTAMP
);
```

### Frontend Components

#### ChatLayout (`/src/components/chat/ChatLayout.tsx`)
Main container component that manages:
- Session state and context
- Message sending and receiving
- Session switching and management
- Responsive layout with sidebar

#### ChatSidebar (`/src/components/chat/ChatSidebar.tsx`)
Left sidebar component that displays:
- List of chat sessions
- Search functionality
- Session management options (rename, delete, archive)
- New chat button

#### ChatWindow (`/src/components/chat/ChatWindow.tsx`)
Main conversation area that handles:
- Message display with proper formatting
- Different message types (text, notes, study plans, quizzes)
- User input and message sending
- Feedback buttons for AI responses

### API Endpoints

#### Session Management
- `GET /api/v1/chat/sessions` - List user's chat sessions
- `POST /api/v1/chat/sessions` - Create new chat session
- `GET /api/v1/chat/sessions/:sessionId` - Get session details
- `PUT /api/v1/chat/sessions/:sessionId` - Update session (title, archive)
- `DELETE /api/v1/chat/sessions/:sessionId` - Delete session

#### Message Management
- `GET /api/v1/chat/sessions/:sessionId/messages` - Get session messages
- `POST /api/v1/chat/sessions/:sessionId/messages` - Send message
- `PUT /api/v1/chat/messages/:messageId/feedback` - Update message feedback

### Routing Structure

#### New Chat Interface Routes
- `/student/chat` - Main chat interface with sidebar
- `/student/chat/session/:sessionId` - Specific chat session
- `/student/chat/new/:agentType/:agentId` - Start new chat with specific agent

#### Legacy Routes (Backward Compatibility)
- `/student/chat/:subjectName` - Original subject-based chat

## Usage Guide

### For Students

#### Starting a New Chat
1. Click "New Chat" from the dashboard or chat interface
2. Choose an AI agent from the explore page
3. Start conversing immediately

#### Managing Sessions
- **Rename**: Click the three-dot menu on a session and select "Rename"
- **Delete**: Permanently remove a session and its messages
- **Archive**: Hide a session from the main list (can be restored later)
- **Search**: Use the search bar to find specific conversations

#### Message Features
- **Feedback**: Like/dislike AI responses to help improve the system
- **Copy**: Copy message content to clipboard
- **History**: Each session maintains its complete conversation history
- **Context**: AI responses consider the conversation history

### For Developers

#### Adding New Message Types
1. Update the `message_type` enum in the database
2. Extend the `ChatMessage` interface in `/src/types/chat.ts`
3. Add rendering logic in `ChatWindow.tsx`
4. Update backend processing as needed

#### Custom AI Agents
1. Define agent types in the `agent_type` enum
2. Create agent-specific routing in `NewAgentChatPage.tsx`
3. Add agent metadata handling in the backend
4. Test with different agent configurations

#### State Management
The chat system uses React Context for state management:
```typescript
const chatContext = useChat();
// Access: sessions, currentSession, messages, isLoading
// Actions: createSession, switchSession, sendMessage, etc.
```

## Installation & Setup

### Database Migration
Run the SQL migration to create the new tables:
```bash
psql -d your_database -f migrations/001_create_chat_sessions.sql
```

### Frontend Setup
The chat components are already integrated into the existing React application. No additional setup is required.

### Backend Configuration
Update your backend API to handle the new endpoints:
1. Implement the chat session management endpoints
2. Add conversation history context to AI responses
3. Handle message metadata for different types
4. Implement proper error handling and validation

## Migration Strategy

### Data Migration
Existing subject-based chats will be automatically migrated to the new session format:
1. Create a session for each unique user-subject combination
2. Migrate messages to the new `chat_messages` table
3. Preserve conversation IDs for feedback tracking

### Backward Compatibility
- Existing `/student/chat/:subjectName` routes continue to work
- Legacy chats are automatically converted to sessions on first access
- Users can gradually transition to the new interface

## Performance Considerations

### Database Optimization
- Proper indexes on frequently queried columns
- Pagination for message loading in long conversations
- Connection pooling for high concurrency

### Frontend Optimization
- Virtual scrolling for large message lists
- Lazy loading of session history
- Efficient state updates with React Context

### Caching Strategy
- Recent sessions cached in localStorage
- Message history cached per session
- API responses cached with appropriate TTL

## Security Considerations

- Session isolation between users
- Input sanitization for message content
- Rate limiting for message creation
- Audit logging for session management
- Proper authentication and authorization

## Testing

### Unit Tests
- Component testing with React Testing Library
- API endpoint testing
- Database migration testing

### Integration Tests
- End-to-end chat flow testing
- Multi-session management testing
- AI integration with history testing

### Performance Tests
- Load testing for concurrent users
- Database query optimization
- Frontend rendering performance

## Future Enhancements

### Planned Features
- **Real-time Collaboration**: Multiple users in same session
- **Voice Messages**: Audio input/output support
- **File Sharing**: Document and image sharing
- **Advanced Search**: Full-text search across conversations
- **Analytics**: Conversation insights and learning patterns

### Technical Improvements
- **WebSocket Integration**: Real-time message updates
- **Offline Support**: PWA capabilities for offline chatting
- **AI Model Selection**: Choose different AI models per session
- **Export Features**: Download conversation history

## Troubleshooting

### Common Issues

#### Sessions Not Loading
- Check authentication status
- Verify API endpoint connectivity
- Check browser console for errors

#### Messages Not Sending
- Verify network connectivity
- Check backend API status
- Validate message content format

#### Performance Issues
- Check database query performance
- Monitor frontend rendering time
- Verify network latency

### Debug Mode
Enable debug mode by setting `localStorage.debug = 'chat:*'` to see detailed logging.

## Support

For technical support or questions about the chat system implementation:
1. Check this documentation first
2. Review the code comments and type definitions
3. Test with the provided examples
4. Contact the development team for specific issues

---

**Last Updated**: March 2026  
**Version**: 1.0.0  
**Compatibility**: React 18+, TypeScript 5+, Node.js 18+
