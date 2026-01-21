import { createContext, useState, useCallback } from 'react';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [typingUser, setTypingUser] = useState(null);
    const [isTyping, setIsTyping] = useState(false);

    const selectConversation = useCallback((conversation) => {
        setSelectedConversation(conversation);
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedConversation(null);
    }, []);

    const setUserTyping = useCallback((userEmail) => {
        setTypingUser(userEmail);
    }, []);

    const clearTyping = useCallback(() => {
        setTypingUser(null);
    }, []);

    const value = {
        selectedConversation,
        typingUser,
        isTyping,
        selectConversation,
        clearSelection,
        setUserTyping,
        clearTyping,
        setIsTyping
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};
