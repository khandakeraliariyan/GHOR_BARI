import { useState, useRef, useEffect } from 'react';
import { getSocket } from '../../Utilities/socketClient';

export default function MessageInput({ 
    conversationId, 
    onSendMessage,
    disabled = false 
}) {
    const [message, setMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const textareaRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const socket = getSocket();

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
        }
    }, [message]);

    // Emit typing event
    const handleTyping = (e) => {
        const value = e.target.value;
        setMessage(value);

        if (!isTyping && socket?.connected) {
            setIsTyping(true);
            socket.emit('typing:start', conversationId);

            typingTimeoutRef.current = setTimeout(() => {
                setIsTyping(false);
                socket.emit('typing:stop', conversationId);
            }, 3000);
        } else if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                setIsTyping(false);
                socket.emit('typing:stop', conversationId);
            }, 3000);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!message.trim() || !conversationId || disabled) return;

        try {
            const content = message.trim();
            setMessage('');

            // Reset textarea height
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }

            // Stop typing indicator
            if (isTyping) {
                setIsTyping(false);
                socket?.emit('typing:stop', conversationId);
            }

            await onSendMessage(content);
        } catch (error) {
            console.error('Error sending message:', error);
            setMessage(message); // Restore message on error
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
        }
    };

    return (
        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
            <div className="flex gap-3 items-end">
                <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={handleTyping}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message... (Shift+Enter for new line)"
                    disabled={disabled}
                    rows="1"
                    className="flex-1 resize-none border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed max-h-32"
                />

                <button
                    type="submit"
                    disabled={!message.trim() || disabled}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg px-6 py-2 font-semibold transition-colors flex-shrink-0"
                >
                    Send
                </button>
            </div>

            {/* Character count and tips */}
            <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
                <span>{message.length} characters</span>
                <span>Shift+Enter to add new line</span>
            </div>
        </form>
    );
}
