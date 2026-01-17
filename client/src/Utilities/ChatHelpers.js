// Format timestamp to readable format
export const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
    });
};

// Format date for messages
export const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const today = new Date();
    
    if (d.toDateString() === today.toDateString()) {
        return formatTime(date);
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (d.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    }
    
    return d.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
};

// Check if message should show timestamp
export const shouldShowTimestamp = (currentMessage, previousMessage, minuteThreshold = 5) => {
    if (!previousMessage) return true;
    
    const currentTime = new Date(currentMessage.createdAt).getTime();
    const previousTime = new Date(previousMessage.createdAt).getTime();
    const diffMinutes = (currentTime - previousTime) / (1000 * 60);
    
    return diffMinutes > minuteThreshold || currentMessage.senderEmail !== previousMessage.senderEmail;
};

// Truncate long text
export const truncateText = (text, maxLength = 50) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

// Get initials from name
export const getInitials = (name) => {
    if (!name) return '?';
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
};

// Check if user is online
export const isUserOnline = (userEmail, onlineUsers = []) => {
    return onlineUsers.includes(userEmail);
};

// Get status color
export const getStatusColor = (isOnline) => {
    return isOnline ? 'bg-green-500' : 'bg-gray-400';
};

// Format last message preview
export const getLastMessagePreview = (lastMessage, lastMessageSender, currentUserEmail) => {
    if (!lastMessage) return 'No messages yet';
    
    const isOwnMessage = lastMessageSender === currentUserEmail;
    const prefix = isOwnMessage ? 'You: ' : '';
    
    return prefix + truncateText(lastMessage, 40);
};
