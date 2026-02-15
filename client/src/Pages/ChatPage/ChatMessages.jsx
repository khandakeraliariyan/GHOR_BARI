import useAuth from '../../Hooks/useAuth';
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

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (!selectedConversation) {
        return (
            <div className="h-full flex items-center justify-center bg-[#e5ddd5]">
                <div className="text-center">
                    <p className="text-gray-600">Select a conversation to see messages</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center bg-[#e5ddd5]">
                <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (messages.length === 0) {
        return (
            <div className="h-full flex items-center justify-center bg-[#e5ddd5]">
                <div className="text-center">
                    <p className="text-gray-600 font-medium mb-1">No messages yet</p>
                    <p className="text-gray-500 text-sm">Send a message to start the conversation</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto bg-[#e5ddd5] bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23d4c4b0%22%20fill-opacity%3D%220.4%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] p-4 pb-2">
            {messages.map((message, index) => {
                const previousMessage = index > 0 ? messages[index - 1] : null;
                const isOwnMessage = message.senderEmail === user?.email;
                const showTimestamp = shouldShowTimestamp(message, previousMessage);
                const showSenderName = !isOwnMessage && (index === 0 || messages[index - 1]?.senderEmail !== message.senderEmail);

                return (
                    <div key={message._id} className="mb-1">
                        {showTimestamp && (
                            <div className="flex justify-center my-3">
                                <span className="text-xs text-gray-500 bg-white/80 px-3 py-1 rounded-full shadow-sm">
                                    {formatTime(message.createdAt)}
                                </span>
                            </div>
                        )}

                        <div className={`flex gap-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                            {!isOwnMessage && (
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-semibold mt-0.5">
                                    {getInitials(message.senderName)}
                                </div>
                            )}

                            <div className={`flex flex-col max-w-[75%] sm:max-w-md ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                                {showSenderName && (
                                    <span className="text-xs font-medium text-green-800 mb-0.5 ml-1">{message.senderName}</span>
                                )}
                                <div
                                    className={`rounded-lg px-3 py-2 break-words shadow-md ${
                                        isOwnMessage
                                            ? 'bg-[#d9fdd3] text-gray-900 rounded-br-none rounded-tl-lg rounded-tr-lg rounded-bl-lg'
                                            : 'bg-white text-gray-900 rounded-bl-none rounded-tl-lg rounded-tr-lg rounded-br-lg'
                                    }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                    <div className={`flex items-center gap-1 mt-0.5 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                                        <span className="text-[10px] text-gray-500">
                                            {formatTime(message.createdAt)}
                                        </span>
                                        {isOwnMessage && message.isRead && (
                                            <span className="text-[10px] text-blue-500" title="Read">✓✓</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
            <div ref={messagesEndRef} />
        </div>
    );
}
