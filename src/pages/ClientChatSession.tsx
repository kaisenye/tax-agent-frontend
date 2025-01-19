import React, { useState, useRef } from 'react';

// Icons
import { FaArrowUp, FaUser, FaPlus } from "react-icons/fa";
import { TbDownload } from "react-icons/tb";
import { BiTrash } from "react-icons/bi";
import { SiRobotframework } from "react-icons/si";

// Components
import FileUploadModal from '../components/Modals/FileUploadModal';

interface ChatMessage {
    type: 'user' | 'bot' | 'account';
    content: string;
    name?: string;
}

interface UploadedDoc {
    id: number;
    name: string;
    date: string;
}

const ClientChatSession = () => {
    const [input, setInput] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
        {
            type: 'bot',
            content: "Hello! How can I assist you today?"
        }
    ]);
    
    const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([
        { id: 1, name: "Document 1.pdf", date: "2024-03-15" },
        { id: 2, name: "Document 2.pdf", date: "2024-03-14" },
    ]);

    const chatContainerRef = useRef<HTMLDivElement>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleFileUpload = (files: File[]) => {
        const newDocs: UploadedDoc[] = files.map((file, index) => ({
            id: uploadedDocs.length + index + 1,
            name: file.name,
            date: new Date().toISOString().split('T')[0]
        }));
        setUploadedDocs([...uploadedDocs, ...newDocs]);
    };

    const handleSubmit = async () => {
        if (!input.trim()) return;
        
        const userMessage: ChatMessage = { 
            type: 'user', 
            content: input 
        };
        setChatHistory(prev => [...prev, userMessage]);
        setInput('');
        
        // Add your chat submission logic here
    };

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
                        {uploadedDocs.map(doc => (
                            <div key={doc.id} className="flex items-center justify-between p-3 bg-gray rounded-md hover:bg-gray-light transition-all duration-150">
                                <span className="text-black-light">{doc.name}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-black-light">{doc.date}</span>
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
                    <div className="max-w-2xl mx-auto space-y-4 mb-24">
                        {chatHistory.map((message, index) => (
                            <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex items-start max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-2`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.type === 'user' ? 'bg-blue-500' : 'bg-gray-500'}`}>
                                        {message.type === 'user' ? <FaUser /> : <SiRobotframework />}
                                    </div>
                                    <div className={`rounded-md px-3 py-2 ${message.type === 'user' ? 'bg-gray text-black-light' : 'bg-gray-light text-black-light'}`}>
                                        {message.content}
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

            {/* File Upload Modal */}
            <FileUploadModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onUpload={handleFileUpload}
            />
        </div>
    );
};

export default ClientChatSession;