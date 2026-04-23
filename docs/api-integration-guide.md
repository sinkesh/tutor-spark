# API Integration Guide for Chat System

This guide shows how to integrate the new ChatGPT-style chat system with your existing backend API.

## 🔄 API Mapping

The new chat system has been adapted to work with your existing API endpoints. Here's the mapping:

### Chat Sessions Management

| Frontend Function | Backend Endpoint | Purpose |
|------------------|------------------|---------|
| `getChatSessions()` | `GET /student/{student_id}/chat-sessions` | List all chat sessions |
| `createChatSession()` | `POST /student/{student_id}/chat-sessions` | Create new chat session |
| `updateChatSession()` | `PUT /student/{student_id}/chat-sessions/{session_id}` | Update session title |
| `deleteChatSession()` | `DELETE /student/{student_id}/chat-sessions/{session_id}` | Delete session |
| `getChatMessages()` | `GET /student/{student_id}/chat-sessions/{session_id}/history` | Get session messages |

### Chat & Conversation

| Frontend Function | Backend Endpoint | Purpose |
|------------------|------------------|---------|
| `sendChatMessage()` | `POST /student/agent-query` | Send message to AI |
| `updateMessageFeedback()` | `POST /student/feedback` | Submit feedback |

## 📝 Request/Response Formats

### Create Chat Session

**Request:**
```typescript
{
  "student_id": "student123",
  "title": "Math Homework Help"
}
```

**Response:**
```typescript
{
  "chat_session": {
    "id": "session-uuid",
    "title": "Math Homework Help",
    "created_at": "2026-03-12T10:00:00Z",
    "updated_at": "2026-03-12T10:00:00Z"
  }
}
```

### Send Message (Agent Query)

**Request:**
```typescript
{
  "student_id": "student123",
  "subject": "Mathematics",
  "class_name": "Class10A",
  "query": "What is quadratic equation?",
  "chat_session_id": "session-uuid" // Optional for session tracking
}
```

**Response:**
```typescript
{
  "response": "AI response here...",
  "conversation_id": "conv-123",
  "session_id": "session-uuid"
}
```

### Get Chat History

**Request:** `GET /student/{student_id}/chat-sessions/{session_id}/history?limit=50`

**Response:**
```typescript
{
  "messages": [
    {
      "id": "msg-1",
      "query": "What is quadratic equation?",
      "response": "A quadratic equation is...",
      "conversation_id": "conv-123",
      "timestamp": "2026-03-12T10:01:00Z"
    }
  ]
}
```

### Submit Feedback

**Request:**
```typescript
{
  "conversation_id": "conv-123",
  "feedback": "👍",
  "rating": 5
}
```

## 🚀 How It Works

### 1. Creating a New Chat Session

When a user clicks "New Chat":

```typescript
// Frontend calls:
const response = await createChatSession({
  student_id: user.id,
  title: "New Mathematics Chat"
});

// Backend creates session and returns session ID
const sessionId = response.chat_session.id;
```

### 2. Sending Messages

When a user sends a message:

```typescript
// Frontend calls:
const response = await sendChatMessage({
  student_id: user.id,
  subject: currentSession.agent_name || 'General',
  class_name: user.class || 'General',
  query: userMessage,
  chat_session_id: currentSession.id
});

// Backend processes with AI and returns response
const aiResponse = response.response;
```

### 3. Loading Conversation History

When opening a session:

```typescript
// Frontend calls:
const response = await getChatMessages(user.id, sessionId);

// Backend returns message history
const messages = response.messages;
```

## 🔧 Backend Implementation Notes

### Required Backend Changes

Your backend already has most endpoints, but ensure:

1. **Chat Session Creation**: Returns session with proper structure
2. **Agent Query**: Supports optional `chat_session_id` parameter
3. **History Endpoint**: Returns messages in expected format
4. **Feedback**: Handles both text feedback and ratings

### Session Management

The chat system expects sessions to have these properties:
```typescript
interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  // Optional: agent_name, message_count, last_message_at
}
```

### Message Format

Messages should include:
```typescript
interface ChatMessage {
  id: string;
  query?: string;        // User message
  response?: string;     // AI response
  conversation_id: string;
  timestamp: string;
}
```

## 🎯 Usage Examples

### Example 1: Start New Math Chat

```typescript
// 1. Create session
const session = await createChatSession({
  student_id: "student123",
  title: "Mathematics Help"
});

// 2. Send message
const response = await sendChatMessage({
  student_id: "student123",
  subject: "Mathematics",
  class_name: "Class10A",
  query: "Explain Pythagorean theorem",
  chat_session_id: session.chat_session.id
});

// 3. Display response
console.log(response.response);
```

### Example 2: Load Existing Chat

```typescript
// 1. Get session list
const sessions = await getChatSessions("student123");

// 2. Load specific session
const session = sessions.find(s => s.id === "session-456");

// 3. Load message history
const history = await getChatMessages("student123", "session-456");

// 4. Display messages
history.messages.forEach(msg => {
  console.log("User:", msg.query);
  console.log("AI:", msg.response);
});
```

### Example 3: Continue Conversation

```typescript
// Continue existing conversation
const response = await sendChatMessage({
  student_id: "student123",
  subject: "Mathematics",
  class_name: "Class10A",
  query: "Can you give me an example?",
  chat_session_id: "session-456"
});
```

## 🔍 Error Handling

The frontend handles these common errors:

- **Authentication**: Redirects to login if 401
- **Network**: Shows toast notifications
- **Validation**: Handles malformed responses
- **Session Not Found**: Redirects to chat list

## 📱 Frontend-Backend Flow

```
User Action → Frontend → API Call → Backend Processing → Response → Frontend Update

Example:
1. User types message
2. Frontend calls sendChatMessage()
3. API sends POST /student/agent-query
4. Backend processes with AI
5. Backend returns response
6. Frontend updates UI with AI response
```

## 🛠️ Testing the Integration

### Test Checklist

- [ ] Create new chat session
- [ ] Send message and receive AI response
- [ ] Load conversation history
- [ ] Switch between sessions
- [ ] Rename session
- [ ] Delete session
- [ ] Submit feedback

### Test Commands

```bash
# Start frontend
npm run dev

# Test API endpoints
curl -X POST "https://your-api.com/api/v1/student/student123/chat-sessions" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Chat"}'

curl -X POST "https://your-api.com/api/v1/student/agent-query" \
  -H "Content-Type: application/json" \
  -d '{"student_id": "student123", "subject": "Math", "class_name": "Class10A", "query": "Test message"}'
```

## 🔐 Security Considerations

- **Authentication**: All endpoints require valid JWT token
- **Authorization**: Students can only access their own sessions
- **Input Validation**: Backend should validate all inputs
- **Rate Limiting**: Consider rate limiting for message sending

## 📈 Performance Optimization

- **Pagination**: Use `limit` parameter for large histories
- **Caching**: Cache session lists and recent messages
- **Lazy Loading**: Load messages on demand
- **Compression**: Enable gzip for API responses

---

This integration ensures your existing API works seamlessly with the new ChatGPT-style interface while maintaining backward compatibility.
