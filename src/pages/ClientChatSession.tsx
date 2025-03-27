import React, { useState, useRef, useEffect, useCallback } from 'react';

// Icons
import { FaArrowUp, FaUser, FaPlus } from "react-icons/fa";
import { TbDownload } from "react-icons/tb";
import { BiTrash } from "react-icons/bi";
import { SiRobotframework } from "react-icons/si";

// Components
import FileUploadModal from '../components/Modals/FileUploadModal';
import PDFViewer from '../components/PDFViewer/PDFViewer';

// API
import { getAllFiles } from '../api/fileApi';
import { FileRecord } from '../types/file.types';

// Effect and Formatter
import TypewriterEffect from '../utils/TypewriterEffect';

// ChatAPI
import { ChatMessage } from '../types/chat.types';
import { sendChatMessage } from '../api/chatAPI';

const ClientChatSession = () => {
    const [input, setInput] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isThinking, setIsThinking] = useState<boolean>(false);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
        {
            type: 'bot',
            content: "Hello! How can I assist you today?"
        }
    ]);

    // Chat Container
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // File Upload Modal
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Add an interval ref to handle continuous scrolling
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

    // Update the event parameter type
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    // Handle Chat Submission
    const handleSubmit = async () => {
        if (!input.trim()) return;
        
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

    // Get all files
    const [allFiles, setAllFiles] = useState<Array<FileRecord>>([]);

    useEffect(() => {
        const fetchAllFiles = async () => {
            const files = await getAllFiles();
            console.log("Files", files);
            setAllFiles(files as Array<FileRecord>);
        };
        fetchAllFiles();
    }, []);

    // PDF Viewer state
    const [pdfViewer, setPdfViewer] = useState<boolean>(false);

    return (
        <div className="w-full h-screen flex bg-gray-50 p-8 gap-8">
            {/* Left Column */}
            <div className="w-1/2 pr-4 flex flex-col gap-4 overflow-y-auto">
                {/* Uploaded Documents Section */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-600 text-black">Uploaded Documents</h2>
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 bg-black-light text-sm text-white px-4 py-2 rounded-md hover:bg-black transition-colors duration-150"
                        >
                            <FaPlus size={14} />
                            <span>Add File</span>
                        </button>
                    </div>
                    <div className="space-y-3">
                        {allFiles.slice(0, 1).map((file: FileRecord) => (
                            <div key={file.id} 
                                className="flex items-center justify-between p-3 bg-gray rounded-md hover:bg-gray-light transition-all duration-150 cursor-pointer"
                                onClick={() => setPdfViewer(true)}
                            >   
                                <span className="text-black-light">W2.pdf</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-black-light">January 19, 2025</span>
                                    <button className="p-2 text-black-light hover:text-black hover:bg-gray rounded-md transition-colors duration-150">
                                        <BiTrash size={18} />
                                    </button>
                                    <button className="p-2 text-black-light hover:text-black hover:bg-gray rounded-md transition-colors duration-150">
                                        <TbDownload size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Column - Chat Interface */}
            <div className="w-1/2 pl-4 flex flex-col bg-white rounded-xl border border-gray-dark h-[calc(100vh-4rem)]">
                <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-2xl mx-auto space-y-10 mb-24">
                        {chatHistory.map((message, index) => (
                            <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex items-start max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-2`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.type === 'user' ? 'bg-blue-500' : 'bg-gray-500'}`}>
                                        {message.type === 'user' ? <FaUser /> : <SiRobotframework />}
                                    </div>
                                    <div className={`rounded-md px-3 py-2 text-left ${message.type === 'user' ? 'bg-gray text-black-light' : 'bg-gray-light text-black-light'}`}>
                                        {message.type === 'user' ? 
                                            message.content 
                                            : 
                                            <TypewriterEffect 
                                                text={message.content} 
                                                setIsTyping={setIsThinking} 
                                                onTypingComplete={() => setIsThinking(false)}
                                            />
                                        }
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chat Input */}
                <div className="p-4 border-t border-gray">
                    <div className="relative">
                        <input 
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Type your message here..."
                            className="w-full px-6 py-3 pr-12 rounded-3xl bg-gray text-black-light focus:outline-none focus:ring-1 focus:ring-gray-dark"
                        />
                        <button 
                            disabled={isLoading || !input}
                            onClick={handleSubmit}
                            className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full text-white ${
                                input && !isLoading ? 'bg-black-light hover:bg-black' : 'bg-gray-dark'
                            }`}
                        >
                            <FaArrowUp />
                        </button>
                    </div>
                </div>
            </div>

            {/* PDF Viewer */}
            <PDFViewer 
                fileUrl={""}
                pdfViewer={pdfViewer}
                setPdfViewer={setPdfViewer}
                pdfTitle={""}
            />

            {/* File Upload Modal */}
            <FileUploadModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
};

export default ClientChatSession;