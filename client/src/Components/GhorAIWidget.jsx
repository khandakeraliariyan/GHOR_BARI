import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, Sparkles } from "lucide-react";
import useAxiosSecure from "../Hooks/useAxiosSecure";

const WELCOME = "Hi! I'm Ghor AI. Ask me anything about finding properties, areas, prices, or how to use GhorBari. How can I help?";

export default function GhorAIWidget() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: "assistant", content: WELCOME }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const axiosSecure = useAxiosSecure();

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    useEffect(() => { if (open) scrollToBottom(); }, [open, messages]);

    const handleSend = async (e) => {
        e?.preventDefault();
        const text = input.trim();
        if (!text || loading) return;

        setInput("");
        setMessages((prev) => [...prev, { role: "user", content: text }]);
        setLoading(true);

        try {
            const res = await axiosSecure.post("/ghor-ai/chat", { message: text });
            const reply = res.data?.reply ?? "Something went wrong. Please try again.";
            setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
        } catch (err) {
            const msg =
                err.response?.data?.message ||
                err.message ||
                "Ghor AI is unavailable. Try again later.";
            setMessages((prev) => [...prev, { role: "assistant", content: msg, error: true }]);
        } finally {
            setLoading(false);
        }
    };

    const formatContent = (content) => {
        if (!content) return "";
        return content
            .split(/\n/g)
            .map((line, i) => <span key={i}>{line}{i < content.split(/\n/g).length - 1 ? <br /> : null}</span>);
    };

    return (
        <>
            {/* Floating button */}
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="fixed bottom-6 right-6 z-[9998] flex items-center justify-center w-14 h-14 rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/40 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
                aria-label="Open Ghor AI"
            >
                {open ? <X size={24} /> : <MessageCircle size={24} />}
            </button>

            {/* Chat panel */}
            {open && (
                <div className="fixed bottom-24 right-6 z-[9999] w-[calc(100vw-3rem)] max-w-md h-[min(70vh,520px)] flex flex-col rounded-2xl bg-white border border-gray-200 shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                            <Sparkles size={18} />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg">Ghor AI</h2>
                            <p className="text-xs text-white/90">Your property & GhorBari assistant</p>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                                        msg.role === "user"
                                            ? "bg-orange-500 text-white rounded-br-md"
                                            : msg.error
                                                ? "bg-red-50 text-red-800 border border-red-200"
                                                : "bg-white text-gray-800 border border-gray-100 shadow-sm rounded-bl-md"
                                    }`}
                                >
                                    {formatContent(msg.content)}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-md px-4 py-2.5 flex items-center gap-2 text-gray-500">
                                    <Loader2 size={18} className="animate-spin" />
                                    <span className="text-sm">Ghor AI is thinking...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} className="p-3 border-t border-gray-200 bg-white">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about properties, areas, or GhorBari..."
                                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                                disabled={loading}
                            />
                            <button
                                type="submit"
                                disabled={loading || !input.trim()}
                                className="p-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
}
