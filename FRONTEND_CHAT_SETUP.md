# GhorBari Chat System - Frontend Implementation Guide

## 📦 Frontend Files Created

### **Utilities**
1. **[src/Utilities/socketClient.js](src/Utilities/socketClient.js)** - Socket.io client initialization and connection management
2. **[src/Utilities/ChatHelpers.js](src/Utilities/ChatHelpers.js)** - Helper functions for formatting, timestamps, etc.

### **Custom Hooks**
3. **[src/Hooks/useSocket.jsx](src/Hooks/useSocket.jsx)** - Socket connection hook with status tracking
4. **[src/Hooks/useChat.jsx](src/Hooks/useChat.jsx)** - Chat operations hook (send, receive, delete messages)

### **Context**
5. **[src/context/ChatContext.jsx](src/context/ChatContext.jsx)** - Global state management for selected conversations

### **Components**
6. **[src/Pages/ChatPage/ChatPage.jsx](src/Pages/ChatPage/ChatPage.jsx)** - Main chat page container
7. **[src/Pages/ChatPage/ConversationList.jsx](src/Pages/ChatPage/ConversationList.jsx)** - List of all conversations
8. **[src/Pages/ChatPage/ChatMessages.jsx](src/Pages/ChatPage/ChatMessages.jsx)** - Message display area
9. **[src/Pages/ChatPage/MessageInput.jsx](src/Pages/ChatPage/MessageInput.jsx)** - Message input form with typing indicator
10. **[src/Pages/ChatPage/ChatHeader.jsx](src/Pages/ChatPage/ChatHeader.jsx)** - Chat header with user info and actions

### **Modified Files**
11. **[src/Router.jsx](src/Router.jsx)** - Added `/chat` route
12. **[src/Components/NavBar.jsx](src/Components/NavBar.jsx)** - Added chat link to navigation

---

## 🚀 Setup & Configuration

### **1. Install Socket.io Client**
```bash
cd client
npm install socket.io-client
```

### **2. Update Environment Variables (.env.local)**
Add to your `client/.env.local`:
```
VITE_SERVER_URL=http://localhost:5000
```

### **3. Ensure useAxiosSecure Hook Exists**
The chat system depends on `useAxiosSecure` for API calls. Make sure you have this hook that:
- Includes JWT token in Authorization header
- Is already implemented in your project

---

## 🎯 Features Implemented

### **Chat Functionality**
✅ **Real-Time Messaging**
- Send messages via HTTP and Socket.io
- Auto-scrolling to latest messages
- Message timestamps with smart formatting

✅ **Conversation Management**
- View all conversations
- Create new conversations
- Search conversations by user name/email
- Delete conversations with confirmation

✅ **User Presence**
- Online/offline status indicators
- Green dot for online users
- Real-time online user list

✅ **Message Features**
- Read receipts (✓ Read status)
- Typing indicators (client-side setup)
- Message sender info with avatars
- Delete individual messages

✅ **UI/UX**
- Responsive design (mobile & desktop)
- Auto-expand textarea for longer messages
- Smooth message animations
- Loading states and error handling
- Toast notifications

---

## 📱 Component Architecture

```
ChatPage (Main Container)
├── ConversationList
│   └── Search conversations
├── ChatWindow
│   ├── ChatHeader
│   │   ├── User info & status
│   │   └── Actions menu (delete)
│   ├── ChatMessages
│   │   └── Message display with formatting
│   └── MessageInput
│       └── Send message & typing indicator
└── ChatContext (Global State)
    └── Selected conversation & typing status
```

---

## 🔌 Socket.io Events

### **Events the Frontend Listens to**
- `connect` - Socket connected
- `disconnect` - Socket disconnected
- `users:online` - List of online users
- `message:received` - New message from other user
- `typing:active` - Typing indicator
- `message:read` - Messages marked as read
- `chat:joined` - Confirmation of joining room

### **Events the Frontend Emits**
- `chat:join` - Join a conversation room
- `chat:leave` - Leave a conversation room
- `message:send` - Send message via socket
- `typing:start` - Start typing
- `typing:stop` - Stop typing
- `message:markRead` - Mark messages as read
- `users:getOnline` - Get online users

---

## 📡 API Endpoints Used

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/create-conversation` | Start/get conversation |
| GET | `/conversations` | List all conversations |
| GET | `/conversations/:id/messages` | Load messages |
| POST | `/send-message` | Send message (HTTP) |
| GET | `/unread-count` | Unread message count |
| DELETE | `/message/:id` | Delete message |
| DELETE | `/conversation/:id` | Delete conversation |

---

## 🔑 Key Hooks Usage

### **useSocket()**
```javascript
const { socket, isConnected, onlineUsers } = useSocket();

// Use in components to:
// - Check connection status
// - Get list of online users
// - Access socket instance
```

### **useChat()**
```javascript
const {
    conversations,
    messages,
    fetchConversations,
    fetchMessages,
    sendMessage,
    deleteMessage,
    deleteConversation,
    listenToMessages
} = useChat();

// Use in components to:
// - Manage conversation data
// - Send/receive messages
// - Delete messages/conversations
```

---

## 🎨 Styling

The chat UI uses:
- **Tailwind CSS** for utility classes
- **Gradients** for user avatars
- **Custom hover states** for interactions
- **Responsive breakpoints** (mobile/tablet/desktop)
- **Smooth transitions** and animations

---

## ⚡ Performance Optimizations

1. **Lazy Message Loading** - Messages loaded with pagination (default: 50 per page)
2. **Auto-scroll** - Only scrolls when new messages arrive
3. **Debounced Typing** - Typing indicators debounced (3 second timeout)
4. **Textarea Auto-resize** - Limits height to 120px max
5. **Memoized Callbacks** - useCallback hooks to prevent unnecessary re-renders

---

## 🧪 Testing the Chat

### **Prerequisites**
1. Backend server running on port 5000
2. Two test users registered in the system
3. JWT tokens available for both users

### **Quick Test Steps**
1. Login with user 1
2. Navigate to `/chat`
3. Click "Start a conversation" or search for user 2
4. Send a message
5. Open another browser tab/window
6. Login with user 2
7. See real-time message delivery

---

## 🐛 Troubleshooting

### **Socket Connection Issues**
**Problem:** "Connection lost" message in UI
**Solution:**
- Check backend is running on port 5000
- Verify VITE_SERVER_URL in .env.local
- Check browser console for errors

### **Messages Not Sending**
**Problem:** Messages stuck on "sending"
**Solution:**
- Ensure socket is connected (green indicator)
- Check browser console for API errors
- Verify JWT token is valid

### **Can't See Other User's Messages**
**Problem:** One-way communication
**Solution:**
- Both users must be logged in
- Conversation must exist for both users
- Check browser console for connection errors

### **Typing Indicator Not Working**
**Problem:** Typing status doesn't show
**Solution:**
- This is a client-side feature
- Implementation ready but needs Socket.io event listener
- Add `socket.on('typing:active', ...)` to ConversationList if needed

---

## 🔐 Security Features

✅ **JWT Authentication** - All API calls authenticated
✅ **Socket Authentication** - Socket connection requires token
✅ **User Verification** - Can only view own conversations
✅ **Message Ownership** - Can only delete own messages
✅ **Verified Badge** - Shows NID verified status

---

## 📝 Next Steps

1. **Test with Postman** (backend endpoints first)
2. **Test in browser** (both users)
3. **Check browser console** for any errors
4. **Verify Socket connection** (green indicator shows connection status)
5. **Optional:** Implement typing indicator display in ConversationList

---

## 🎓 Code Examples

### **Starting a Chat**
```javascript
// In any component
const { createConversation } = useChat();

const startChat = async (ownerEmail) => {
    const conversation = await createConversation(ownerEmail);
    selectConversation(conversation);
};
```

### **Listening to Socket Events**
```javascript
const { listenToMessages } = useChat();

useEffect(() => {
    const unsubscribe = listenToMessages(conversationId, (newMessage) => {
        console.log('New message:', newMessage);
    });
    return unsubscribe;
}, [conversationId, listenToMessages]);
```

### **Handling Message Send**
```javascript
const handleSendMessage = async (content) => {
    try {
        await sendMessage(conversationId, content);
        await fetchMessages(conversationId); // Refresh
    } catch (error) {
        console.error('Error:', error);
    }
};
```

---

Good luck! 🚀 Your chat system is ready to use!
