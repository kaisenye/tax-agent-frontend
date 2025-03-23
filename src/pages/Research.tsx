import React, { useState, useCallback, useRef, useEffect } from 'react';

// Icons
import { FaArrowUp } from "react-icons/fa";
import { FaUser } from "react-icons/fa6";
import { SiRobotframework } from "react-icons/si";
import { LuPaperclip } from "react-icons/lu";
import { FiThumbsUp, FiThumbsDown, FiCopy, FiPrinter } from "react-icons/fi";
import { TbMessageReport } from "react-icons/tb";

// Effect and Formatter
import TypewriterEffect from '../utils/TypewriterEffect';

// ChatAPI
import { ChatMessage } from '../types/chat.types';
import { sendChatMessage } from '../api/chatAPI';

const Research = () => {
    const [input, setInput] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isThinking, setIsThinking] = useState<boolean>(false);
    const [isTyping, setIsTyping] = useState<boolean>(false);
    const [showInitialContent, setShowInitialContent] = useState<boolean>(true);

    const chatContainerRef = useRef<HTMLDivElement>(null);

    // Add an interval ref to handle continuous scrolling
    const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const scrollToBottom = useCallback(() => {
        if (chatContainerRef.current) {
            const element = chatContainerRef.current;
            // Ensure we're actually at the bottom by checking scroll position
            const isAtBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 100;
            if (isAtBottom) {
                element.scrollTop = element.scrollHeight;
            }
        }
    }, []);

    // Type the event parameter
    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        if (!input.trim()) return;
        
        setShowInitialContent(false);
        
        const userMessage: ChatMessage = { type: 'user', content: input };
        setChatHistory(prev => [...prev, userMessage]);
        setInput('');
        
        scrollToBottom();
        
        setIsLoading(true);
        setIsThinking(true);
        
        try {
            const botResponse = await sendChatMessage(chatHistory, input);
            const botMessage: ChatMessage = { 
                type: 'bot', 
                content: botResponse 
            };
            setChatHistory(prev => [...prev, botMessage]);
            scrollToBottom();
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
            setIsThinking(false);
        }
    };

    useEffect(() => {
        if (isTyping) {
            // Scroll immediately when typing starts
            scrollToBottom();
            // Start continuous scrolling
            scrollIntervalRef.current = setInterval(scrollToBottom, 5);
        }

        return () => {
            if (scrollIntervalRef.current) {
                clearInterval(scrollIntervalRef.current);
                scrollIntervalRef.current = null;
            }
        };
    }, [isTyping, scrollToBottom]);

    return (
        <div className="w-full h-screen flex flex-col bg-transparent">
            <div className="flex flex-row h-full bg-transparent pl-16">
                {/* Main chat container */}
                <div className="flex-1 flex flex-col bg-transparent">
                    {/* Title section - only show when no messages */}
                    {showInitialContent && (
                        <div className="pb-32 pt-12">
                            <h1 className="text-3xl text-black font-500 leading-relaxed text-left">
                                Tax Research
                                <p className="block text-lg font-400 text-black-light mt-2 text-left">
                                    Ask anything about tax laws, regulations, or specific tax scenarios.
                                </p>
                            </h1>
                        </div>
                    )}

                    {/* Tips section - only show when no messages */}
                    {showInitialContent && (
                        <div className="mb-12 w-[760px]">
                            <h2 className="text-xl font-500 text-black mb-6 text-left">Suggestions</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 rounded-lg border-2 border-gray bg-white shadow-sm text-black-light cursor-pointer hover:bg-gray-light hover:border-gray hover:text-black transition-all duration-300 transform">
                                    <h3 className="font-500 mb-2 text-left">Tax Law Updates</h3>
                                    <p className="text-left">Latest changes in federal tax regulations</p>
                                </div>
                                <div className="p-6 rounded-lg border-2 border-gray bg-white shadow-sm text-black-light cursor-pointer hover:bg-gray-light hover:border-gray hover:text-black transition-all duration-300 transform">
                                    <h3 className="font-500 mb-2 text-left">Deductions & Credits</h3>
                                    <p className="text-left">Explore available tax benefits for 2024</p>
                                </div>
                                <div className="p-6 rounded-lg border-2 border-gray bg-white shadow-sm text-black-light cursor-pointer hover:bg-gray-light hover:border-gray hover:text-black transition-all duration-300 transform">
                                    <h3 className="font-500 mb-2 text-left">Business Taxation</h3>
                                    <p className="text-left">Small business tax obligations and benefits</p>
                                </div>
                                <div className="p-6 rounded-lg border-2 border-gray bg-white shadow-sm text-black-light cursor-pointer hover:bg-gray-light hover:border-gray hover:text-black transition-all duration-300 transform">
                                    <h3 className="font-500 mb-2 text-left">State Tax Guidance</h3>
                                    <p className="text-left">State-specific tax regulations and filing</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Chat messages container */}
                    <div 
                        ref={chatContainerRef}
                        className="flex-1 overflow-y-auto space-y-6 pr-16 pt-16 pb-48"
                    >
                        {/* Group messages into conversation sections */}
                        {chatHistory.reduce((sections: JSX.Element[], message, index, array) => {
                            if (message.type === 'user') {
                                // Start a new section with user message
                                const botResponse = array[index + 1];
                                sections.push(
                                    <div key={index} className="space-y-6 text-left text-lg">
                                        {/* User message */}
                                        <div className="flex items-start gap-2">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center">
                                                <FaUser />
                                            </div>
                                            <div className="rounded-lg px-3 py-2 bg-gray">
                                                {message.content}
                                            </div>
                                        </div>

                                        {/* Bot response with references */}
                                        {botResponse && botResponse.type === 'bot' && (
                                            <div className="flex gap-6">
                                                {/* Bot message */}
                                                <div className="flex-1 flex items-start gap-2">
                                                    <div className="w-8 h-8 flex items-center justify-center">
                                                        <SiRobotframework />
                                                    </div>
                                                    <div className="w-4/5 rounded-lg pl-2 py-1">
                                                        <TypewriterEffect 
                                                            text={botResponse.content} 
                                                            setIsTyping={setIsTyping} 
                                                            onTypingComplete={() => setIsTyping(false)}
                                                        />
                                                        {!isTyping && (
                                                            <div className="flex gap-2 mt-4">
                                                                {[
                                                                    { icon: <FiThumbsUp />, label: "Good" },
                                                                    { icon: <FiThumbsDown />, label: "Bad" },
                                                                    { icon: <TbMessageReport />, label: "Report" },
                                                                    { icon: <FiCopy />, label: "Copy" },
                                                                    { icon: <FiPrinter />, label: "Print" }
                                                                ].map((item, index) => (
                                                                    <button 
                                                                        key={index}
                                                                        className="p-2 rounded-full text-black-light hover:text-black-light hover:bg-gray transition-all duration-150 group relative"
                                                                    >
                                                                        {item.icon}
                                                                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black-light text-white text-sm px-2 py-1 rounded-md 
                                                                               opacity-0 group-hover:opacity-100 
                                                                               translate-y-1 group-hover:translate-y-0
                                                                               transition-all duration-200 whitespace-nowrap">
                                                                            {item.label}
                                                                        </span>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* References section */}
                                                <div className="w-72">
                                                    <div className="p-4 rounded-lg border border-gray-200 shadow-sm">
                                                        <h3 className="font-medium text-gray-500 mb-3">References</h3>
                                                        <ul className="space-y-2">
                                                            {/* Dummy references for visualization */}
                                                            {[1, 2, 3].map((num) => (
                                                                <li key={num} className="text-sm">
                                                                    <a 
                                                                        href="#" 
                                                                        className="text-blue-600 hover:underline"
                                                                    >
                                                                        [#{num}] Sample Reference Title
                                                                    </a>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            }
                            return sections;
                        }, [])}

                        {/* Typing indicator */}
                        {isThinking && (
                            <div className="flex items-start gap-2">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center">
                                    <SiRobotframework />
                                </div>
                                <div className="rounded-lg px-3 py-2">
                                    Thinking<span className="typing-dot"></span><span className="typing-dot"></span><span className="typing-dot"></span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input section */}
                    <div className="relative">
                        <div className="relative w-[60%] left-[0] bottom-[60%]">
                            <textarea 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Type your research question here..."
                                rows={2}
                                className="w-full px-6 py-4 pr-24 rounded-xl bg-gray-light text-black text-lg font-400
                                           ring-1 ring-gray-light shadow-md
                                           focus:outline-none focus:ring-gray-dark focus:ring-3 transition-all duration-150 resize-none"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                <label 
                                    htmlFor="file-upload"
                                    className="cursor-pointer p-2 rounded-full bg-gray-dark hover:bg-black-light transition-colors duration-150"
                                >
                                    <input
                                        id="file-upload"
                                        type="file"
                                        className="hidden"
                                        onChange={(e) => {/* Handle file upload */}}
                                    />
                                    <LuPaperclip className="text-white text-lg" />
                                </label>
                                <button 
                                    onClick={handleSubmit}
                                    disabled={isLoading || !input}
                                    className={`p-2 rounded-full text-white transition-colors duration-150 ${
                                        input && !isLoading ? 'bg-black-light hover:bg-black' : 'bg-gray-dark'
                                    }`}
                                >
                                    <FaArrowUp className="text-lg" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Research;