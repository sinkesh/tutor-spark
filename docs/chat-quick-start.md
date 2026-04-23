# Chat System Quick Start Guide

## 🚀 Quick Start

This guide helps you get the new ChatGPT-style chat system running in minutes.

## Prerequisites

- Node.js 18+
- React 18+
- TypeScript 5+
- Existing student portal setup

## 1. Database Setup

Run the migration to create the new tables:

```bash
# Using psql
psql -d your_database -f migrations/001_create_chat_sessions.sql

# Or using your preferred database tool
# Copy and run the SQL from migrations/001_create_chat_sessions.sql
```

## 2. Backend API Setup

Ensure your backend implements these endpoints:

```typescript
// Session Management
GET    /api/v1/chat/sessions
POST   /api/v1/chat/sessions
GET    /api/v1/chat/sessions/:sessionId
PUT    /api/v1/chat/sessions/:sessionId
DELETE /api/v1/chat/sessions/:sessionId

// Message Management
GET    /api/v1/chat/sessions/:sessionId/messages
POST   /api/v1/chat/sessions/:sessionId/messages
PUT    /api/v1/chat/messages/:messageId/feedback
```

## 3. Frontend Integration

The chat components are already integrated. Just navigate to:

- `/student/chat` - Main chat interface
- `/student/chat/session/:sessionId` - Specific session
- `/student/chat/new/:agentType/:agentId` - New chat with agent

## 4. Test the System

### Basic Test Flow

1. **Start the App**
   ```bash
   npm run dev
   ```

2. **Navigate to Chat**
   - Go to `/student/chat`
   - Click "New Chat"

3. **Create a Session**
   - Choose an agent or start general chat
   - Send a test message
   - Verify AI response

4. **Test Session Management**
   - Create multiple sessions
   - Switch between sessions
   - Rename a session
   - Archive/delete a session

## 5. Key Components

### Using ChatLayout Directly

```tsx
import ChatLayout from '@/components/chat/ChatLayout';

function MyChatPage() {
  return (
    <ChatLayout
      agentType="subject"
      agentName="Mathematics Tutor"
      agentId="math-001"
      defaultTitle="Math Chat"
    />
  );
}
```

### Using Chat Context

```tsx
import { useChat } from '@/components/chat/ChatLayout';

function MyComponent() {
  const { 
    sessions, 
    currentSession, 
    messages, 
    sendMessage,
    createSession 
  } = useChat();

  const handleNewChat = () => {
    createSession('subject', 'Physics Tutor');
  };

  const handleSend = (content: string) => {
    sendMessage(content);
  };
}
```

## 6. Customization

### Adding New Message Types

1. **Update Types**
   ```typescript
   // src/types/chat.ts
   export interface ChatMessage {
     message_type: 'text' | 'notes' | 'study_plan' | 'quiz' | 'your_new_type';
     metadata?: {
       your_new_type?: {
         // your metadata structure
       };
     };
   }
   ```

2. **Add Rendering Logic**
   ```typescript
   // src/components/chat/ChatWindow.tsx
   const renderMessageContent = (message: ChatMessage) => {
     if (message.message_type === 'your_new_type') {
       return <YourNewTypeComponent data={message.metadata?.your_new_type} />;
     }
     // ... existing logic
   };
   ```

### Custom AI Agents

```typescript
// src/pages/student/NewAgentChatPage.tsx
const getAgentInfo = (type: string, id: string) => {
  const agentNames = {
    'your-agent': 'Your Custom Agent',
    // ... existing agents
  };

  return {
    agentType: 'custom',
    agentName: agentNames[id] || `${id} Tutor`,
    agentId: id,
    defaultTitle: `New ${agentNames[id] || id} Chat`,
  };
};
```

## 7. Common Issues & Solutions

### Sessions Not Loading
**Problem**: Chat sessions list is empty
**Solution**: 
- Check user authentication
- Verify API endpoints are working
- Check browser console for errors

### Messages Not Sending
**Problem**: Can't send messages
**Solution**:
- Check network connectivity
- Verify backend API status
- Ensure session is selected

### Styling Issues
**Problem**: Chat interface looks broken
**Solution**:
- Ensure TailwindCSS is properly configured
- Check CSS imports
- Verify responsive breakpoints

## 8. Development Tips

### Debug Mode
```javascript
// Enable debug logging
localStorage.debug = 'chat:*';
```

### Performance Monitoring
```typescript
// Monitor message loading performance
console.time('loadMessages');
await loadMessages(sessionId);
console.timeEnd('loadMessages');
```

### Testing State Changes
```typescript
// Test chat context changes
const { sessions, createSession } = useChat();

// Create test session
await createSession('test', 'Test Agent');
console.log('Sessions after creation:', sessions);
```

## 9. API Response Examples

### Create Session Response
```json
{
  "session": {
    "id": "uuid-string",
    "user_id": "user-uuid",
    "title": "New Mathematics Chat",
    "agent_type": "subject",
    "agent_name": "Mathematics Tutor",
    "created_at": "2026-03-12T10:00:00Z",
    "message_count": 0,
    "is_archived": false
  }
}
```

### Send Message Response
```json
{
  "message": {
    "id": "uuid-string",
    "session_id": "session-uuid",
    "conversation_id": "conv-123",
    "role": "assistant",
    "content": "AI response here",
    "message_type": "text",
    "created_at": "2026-03-12T10:01:00Z"
  }
}
```

## 10. Next Steps

1. **Explore Features**: Try all session management features
2. **Test Mobile**: Check responsive design on mobile devices
3. **Customize**: Add your own message types or agents
4. **Extend**: Add new features like file sharing or voice messages
5. **Monitor**: Check performance and optimize as needed

## Need Help?

- Check the full documentation: `/docs/chat-system-README.md`
- Review component code in `/src/components/chat/`
- Look at type definitions in `/src/types/chat.ts`
- Test with the examples in this guide

---

**Happy Chatting! 🤖**
