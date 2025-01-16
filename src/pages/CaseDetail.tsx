import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PDFViewer from '../components/PDFViewer';

import { FaArrowUp, FaUser } from "react-icons/fa";
import { IoMdArrowBack } from "react-icons/io";
import { TbDownload } from "react-icons/tb";
import { RxPencil2 } from "react-icons/rx";
import { BiTrash } from "react-icons/bi";
import { SiRobotframework } from "react-icons/si";
import TypewriterEffect from '../utils/TypewriterEffect';

interface ChatMessage {
    type: 'user' | 'bot' | 'account';
    content: string;
    name?: string;
}

const CaseDetail = () => {
    // Chat state management
    const [input, setInput] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isTyping, setIsTyping] = useState<boolean>(false);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
        {
            type: 'bot',
            content: "Hello! I'm here to help with your tax preparation. How can I assist you today?"
        },
        {
            type: 'user',
            content: "I need help with my W-2 forms"
        },
        {
            type: 'bot',
            content: "I'll be happy to help you with your W-2 forms. Could you please upload them to the documents section on the left?"
        },
        {
            type: 'account',
            name: 'Joe',
            content: "I've reviewed the W-2 forms. Everything looks correct, but we're still missing the 1099-INT statement."
        }
    ]);
    
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // Mock data - expanded list
    const uploadedDocs = [
        { id: 1, name: "W-2 Form 2023", date: "2024-03-15" },
        { id: 2, name: "1099-INT Statement", date: "2024-03-14" },
        { id: 3, name: "Bank Statement - January", date: "2024-03-13" },
        { id: 4, name: "Bank Statement - February", date: "2024-03-13" },
        { id: 5, name: "Investment Statement Q4", date: "2024-03-12" },
        { id: 6, name: "Mortgage Interest Statement", date: "2024-03-11" },
        { id: 7, name: "Property Tax Statement", date: "2024-03-10" },
        { id: 8, name: "Charitable Contributions", date: "2024-03-09" },
        { id: 9, name: "Medical Expenses Summary", date: "2024-03-08" },
        { id: 10, name: "Student Loan Interest", date: "2024-03-07" },
        { id: 11, name: "Business Expenses Log", date: "2024-03-06" },
        { id: 12, name: "Vehicle Registration", date: "2024-03-05" },
    ];

    const requiredForms = [
        { id: 1, name: "Form 1040", status: "pending" },
        { id: 2, name: "Schedule A", status: "pending" },
        { id: 3, name: "Schedule B", status: "completed" },
        { id: 4, name: "Schedule C", status: "pending" },
        { id: 5, name: "Schedule D", status: "completed" },
        { id: 6, name: "Schedule E", status: "pending" },
        { id: 7, name: "Form 8949", status: "pending" },
        { id: 8, name: "Form 4562", status: "completed" },
        { id: 9, name: "Form 8829", status: "pending" },
        { id: 10, name: "Form 2106", status: "pending" },
    ];

    // Add mock client data
    const clientDetails = {
        name: "John Doe",
        email: "john.doe@email.com",
        phone: "(555) 123-4567",
        taxId: "XXX-XX-1234",
        caseStatus: "In Progress"
    };

    const handleSubmit = async () => {
        if (!input.trim()) return;
        
        // Add account message to chat
        const accountMessage: ChatMessage = { 
            type: 'account', 
            name: 'Joe', 
            content: input 
        };
        setChatHistory(prev => [...prev, accountMessage]);
        setInput('');
        
        setIsLoading(true);
        
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
                            content: "You are a tax preparation assistant helping with document collection and tax filing questions."
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
                const botMessage: ChatMessage = { 
                    type: 'bot', 
                    content: data.choices[0].message.content 
                };
                setChatHistory(prev => [...prev, botMessage]);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // PDF Viewer State
    const [pdfViewer, setPdfViewer] = useState<boolean>(false);
    const handleOpenPDFViewer = () => {
        setPdfViewer(true);
    }

    return (
        <div className="w-full h-screen flex bg-gray-50 p-8 gap-8">
            {/* Left Column - Make scrollable */}
            <div className="w-1/2 pr-4 flex flex-col gap-4 overflow-y-auto">
                {/* Back Button */}
                <Link to="/case" className="w-fit flex flex-row items-center gap-2 bg-gray-light border border-gray-dark rounded-md text-black-light px-4 sticky top-0 bg-gray-50 py-2 z-10 hover:text-black hover:bg-gray transition-colors duration-150">
                    <IoMdArrowBack className="rotate-270" />
                    <span>Back</span>
                </Link>

                {/* Client Details Section */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h2 className="text-3xl font-600 text-black mb-4 text-left">
                        {clientDetails.name}
                    </h2>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-black-light">Name:</span>
                            <span>{clientDetails.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-black-light">Email:</span>
                            <span>{clientDetails.email}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-black-light">Phone:</span>
                            <span>{clientDetails.phone}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-black-light">Tax ID:</span>
                            <span>{clientDetails.taxId}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-black-light">Status:</span>
                            <span className="px-3 py-1 rounded-full bg-yellow text-black-light">
                                {clientDetails.caseStatus}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Update Documents Section title alignment */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h2 className="text-xl font-600 text-black mb-4 text-left">Uploaded Documents</h2>
                    <div className="space-y-3">
                        {uploadedDocs.map(doc => (
                            <div 
                                key={doc.id} 
                                className="flex items-center justify-between cursor-pointer p-3 bg-gray rounded-lg hover:bg-gray-light transition-all duration-150"
                                onClick={handleOpenPDFViewer}
                            >
                                <div className="flex items-center flex-1">
                                    <span className="text-black-light">{doc.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-black-light">{doc.date}</span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            // Add delete handler here
                                        }}
                                        className="p-2 text-black-light hover:text-black hover:bg-gray rounded-lg transition-colors duration-150"
                                    >
                                        <BiTrash size={18} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            window.open('_blank');
                                        }}
                                        className="p-2 text-black-light hover:text-black hover:bg-gray rounded-lg transition-colors duration-150"
                                    >
                                        <TbDownload size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* PDF Viewer */}
                <PDFViewer 
                    fileUrl={""}
                    pdfViewer={pdfViewer}
                    setPdfViewer={setPdfViewer}
                />

                {/* Update Required Forms Section title alignment */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h2 className="text-xl font-600 text-black mb-4 text-left">Required Forms</h2>
                    <div className="space-y-3">
                        {requiredForms.map(form => (
                            <div 
                                key={form.id} 
                                className="flex items-center justify-between cursor-pointer p-3 bg-gray rounded-lg hover:bg-gray-light transition-all duration-150"
                                onClick={handleOpenPDFViewer}
                            >
                                <span className="text-black-light">{form.name}</span>
                                <div className="flex items-center gap-2">
                                    <span className={`px-3 py-1 rounded-full text-sm ${
                                        form.status === 'completed' ? 'bg-green text-white' : 'bg-yellow text-black-light'
                                    }`}>
                                        {form.status}
                                    </span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            // Add modify handler here
                                        }}
                                        className="p-2 text-black-light hover:text-black hover:bg-gray rounded-lg transition-colors duration-150"
                                    >
                                        <RxPencil2 size={18} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            window.open('_blank');
                                        }}
                                        className="p-2 text-black-light hover:text-black hover:bg-gray rounded-lg transition-colors duration-150"
                                    >
                                        <TbDownload size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Column - Chat Interface (fixed) */}
            <div className="w-1/2 pl-4 flex flex-col bg-white rounded-xl border border-gray-dark h-[calc(100vh-4rem)]">
                {/* Chat Messages Area */}
                <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-2xl mx-auto space-y-4 mb-24">
                        {chatHistory.map((message, index) => (
                            <div 
                                key={index}
                                className={`flex ${
                                    message.type === 'account' ? 'justify-end' : 'justify-start'
                                } animate-slideUp`}
                            >
                                <div className={`flex items-start max-w-[80%] ${
                                    message.type === 'account' ? 'flex-row-reverse' : 'flex-row'
                                } gap-2`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                        message.type === 'account' ? 'bg-blue-500' : 'bg-gray-500'
                                    }`}>
                                        {message.type === 'account' ? <FaUser /> : 
                                         message.type === 'user' ? <FaUser /> : <SiRobotframework />}
                                    </div>
                                    <div className={`rounded-lg px-3 py-2 text-left ${
                                        message.type === 'account' ? 'bg-gray text-black-light' : 
                                        message.type === 'user' ? 'bg-gray-light text-black-light' : 'bg-gray-light text-black-light'
                                    }`}>
                                        {message.type === 'account' && (
                                            <div className="text-sm text-black-light mb-1 text-left">{message.name}</div>
                                        )}
                                        <div className="text-left">
                                            {message.type === 'bot' ? (
                                                <TypewriterEffect 
                                                    text={message.content} 
                                                    setIsTyping={setIsTyping} 
                                                    onTypingComplete={() => setIsTyping(false)}
                                                />
                                            ) : (
                                                message.content
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start animate-slideUp">
                                <div className="flex items-start gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center">
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

                {/* Chat Input Area */}
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
        </div>
    );
};

export default CaseDetail;