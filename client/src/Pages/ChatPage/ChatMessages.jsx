import { useAuth } from '../../Hooks/useAuth';
import { getInitials, formatTime, shouldShowTimestamp } from '../../Utilities/ChatHelpers';
import { useEffect, useRef } from 'react';

export default function ChatMessages({ 
    messages, 
    loading,
    onlineUsers,
    selectedConversation 
}) {
    const { user } = useAuth();
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (!selectedConversation) {
        return (
            <div className="h-full flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <p className="text-gray-500 text-lg">Select a conversation to start chatting</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center bg-gray-50">
                <div className="animate-spin">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
            </div>
        );
    }

    if (messages.length === 0) {
        return (
            <div className="h-full flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <p className="text-gray-500 text-lg mb-2">No messages yet</p>
                    <p className="text-gray-400 text-sm">Send your first message to start the conversation</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto bg-white p-4 space-y-3">
            {messages.map((message, index) => {
                const previousMessage = index > 0 ? messages[index - 1] : null;
                const isOwnMessage = message.senderEmail === user?.email;
                const showTimestamp = shouldShowTimestamp(message, previousMessage);

                return (
                    <div key={message._id}>
                        {showTimestamp && (
                            <div className="flex justify-center mb-3">
                                <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                                    {formatTime(message.createdAt)}
                                </span>
                            </div>
                        )}

                        <div className={`flex gap-3 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                            {!isOwnMessage && (
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                                    {getInitials(message.senderName)}
                                </div>
                            )}

                            <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-last' : ''}`}>
                                {index === 0 || messages[index - 1]?.senderEmail !== message.senderEmail && (
                                    <p className={`text-xs font-semibold mb-1 ${
                                        isOwnMessage ? 'text-right text-blue-600' : 'text-gray-600'
                                    }`}>
                                        {isOwnMessage ? 'You' : message.senderName}
                                    </p>
                                )}

                                <div
                                    className={`rounded-lg px-4 py-2 break-words ${
                                        isOwnMessage
                                            ? 'bg-blue-500 text-white rounded-br-none'
                                            : 'bg-gray-100 text-gray-900 rounded-bl-none'
                                    }`}
                                >
                                    <p className="text-sm">{message.content}</p>
                                </div>

                                {message.isRead && isOwnMessage && (
                                    <p className="text-xs text-gray-400 mt-1 text-right">✓ Read</p>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
            <div ref={messagesEndRef} />
        </div>
    );
}
