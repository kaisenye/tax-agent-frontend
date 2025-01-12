import React, { useState, useCallback, useRef, useEffect } from 'react';

// Icons
import { FaArrowUp } from "react-icons/fa";
import { FaUser } from "react-icons/fa6";
import { SiRobotframework } from "react-icons/si";

// Typewriter effect
import TypewriterEffect from '../utils/TypewriterEffect';

// Add proper types for the chat history
interface ChatMessage {
    type: 'user' | 'bot';
    content: string;
}

const Research = () => {
    const [input, setInput] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isTyping, setIsTyping] = useState<boolean>(false);
    const [showInitialContent, setShowInitialContent] = useState<boolean>(true);

    const chatContainerRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = useCallback(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, []);

    // Type the event parameter
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    // Type the response data
    interface ApiResponse {
        choices: Array<{
            message: {
                content: string;
            };
        }>;
    }

    const handleSubmit = async () => {
        if (!input.trim()) return;
        
        setShowInitialContent(false);
        
        const userMessage: ChatMessage = { type: 'user', content: input };
        setChatHistory(prev => [...prev, userMessage]);
        setInput('');
        
        scrollToBottom();
        
        setIsLoading(true);
        setIsTyping(true);
        
        try {
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Accept": "*/*",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
                    "User-Agent": "TaxAgent/1.0"
                },
                body: JSON.stringify({ 
                    model: "gpt-4o-mini",   
                    messages: [
                        {
                            role: "system",
                            content: "You are a tax accountant assisting a new client with their tax preparation. Your task is to guide the client through providing all relevant tax-related information and documents in a structured and professional manner, focusing on one piece of information at a time."
                        },
                        ...chatHistory.map(msg => ({
                            role: msg.type === 'user' ? 'user' : 'assistant',
                            content: msg.content
                        })),
                        {
                            role: "user",
                            content: input
                        },
                    ]
                })
            });

            if (response.ok) {
                const data = await response.json();
                console.log(data);
                const botMessage: ChatMessage = { type: 'bot', content: data.choices[0].message.content };
                setChatHistory(prev => [...prev, botMessage]);
                scrollToBottom();
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
            setIsTyping(false);
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory, scrollToBottom]);

    return (
        <div className="w-full h-screen flex flex-col bg-gray-50 p-12">
            {/* Title section - only show when no messages */}
            {showInitialContent && (
                <div className="wp-8 pb-4 pt-12">
                    <h1 className="text-2xl text-black font-600 text-gray-800 text-center">
                        Research
                    </h1>
                </div>
            )}

            {/* Chat content area */}
            <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto px-8 pt-12"
            >
                {/* Tips section - only show when no messages */}
                {showInitialContent && (
                    <div className="max-w-2xl mx-auto text-center mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-white rounded-lg border-2 border-gray text-black-light cursor-pointer hover:bg-gray-light hover:text-black transition-all duration-150">
                                Summarize the latest policy changes on 1040 form
                            </div>
                            <div className="p-4 bg-white rounded-lg border-2 border-gray text-black-light cursor-pointer hover:bg-gray-light hover:text-black transition-all duration-150">
                                Find papers about quantum computing from 2023
                            </div>
                            <div className="p-4 bg-white rounded-lg border-2 border-gray text-black-light cursor-pointer hover:bg-gray-light hover:text-black transition-all duration-150">
                                Explain the key findings of [paper title]
                            </div>
                        </div>
                    </div>
                )}

                {/* Chat messages */}
                <div className="max-w-2xl mx-auto space-y-4 mb-24">
                    {chatHistory.map((message, index) => (
                        <div 
                            key={index}
                            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-slideUp`}
                        >
                            <div className={`flex items-start max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-2`}>
                                <div className={`w-8 h-8 rounded-full ${message.type === 'user' ? 'bg-blue-500' : 'pt-4 bg-gray-500'} flex text-black-light text-left`}>
                                    {message.type === 'user' ? <FaUser /> : <SiRobotframework />}
                                </div>
                                <div className={`rounded-lg px-3 py-2 ${message.type === 'user' ? 'bg-gray text-black-light' : 'bg-transparent text-black-light text-left'}`}>
                                    {message.type === 'bot' ? (
                                        <TypewriterEffect text={message.content} />
                                    ) : (
                                        message.content
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start animate-slideUp">
                            <div className="flex items-start gap-2">
                                <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-black-light">
                                    <SiRobotframework />
                                </div>
                                <div className="rounded-lg px-3 py-2 bg-transparent text-black-light text-left">
                                    Thinking<span className="typing-dot"></span><span className="typing-dot"></span><span className="typing-dot"></span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Input section */}
            <div className="w-6/12 flex flex-row justify-center items-center max-w-4xl mx-auto p-4">
                <div className="relative flex-1">
                    <input 
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Type your research question here..."
                        className="w-full px-6 py-3 pr-12 rounded-3xl bg-gray text-black-light focus:outline-none focus:ring-1 focus:ring-gray-dark transition-all duration-150"
                    />
                    <button 
                        onClick={handleSubmit}
                        disabled={isLoading || !input}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full text-white transition-colors duration-150 ${
                            input && !isLoading ? 'bg-black-light hover:bg-black' : 'bg-gray-dark'
                        }`}
                    >
                        <FaArrowUp />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Research;