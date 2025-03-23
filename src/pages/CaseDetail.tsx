import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PDFViewer from '../components/PDFViewer/PDFViewer';

import { IoMdArrowBack } from "react-icons/io";
import { TbDownload } from "react-icons/tb";
import { RxPencil2 } from "react-icons/rx";
import { BiTrash } from "react-icons/bi";

import FileUpload from './FileUpload';

const CaseDetail = () => {
    // PDF Viewer State
    const [pdfTitle, setPdfTitle] = useState<string>("");
    const [pdfViewer, setPdfViewer] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<'upload' | 'binder' | 'deliverables'>('upload');
    
    const handleOpenPDFViewer = (title: string) => {
        setPdfTitle(title);
        setPdfViewer(true);
    }

    // Mock data - expanded list with added category labels
    const uploadedDocs = [
        { id: 1, name: "W-2 Form 2023", date: "2024-03-15", category: "Income" },
        { id: 2, name: "1099-INT Statement", date: "2024-03-14", category: "Income" },
        { id: 3, name: "Bank Statement - January", date: "2024-03-13", category: "Financial" },
        { id: 4, name: "Bank Statement - February", date: "2024-03-13", category: "Financial" },
        { id: 5, name: "Investment Statement Q4", date: "2024-03-12", category: "Investments" },
        { id: 6, name: "Mortgage Interest Statement", date: "2024-03-11", category: "Deductions" },
        { id: 7, name: "Property Tax Statement", date: "2024-03-10", category: "Deductions" },
        { id: 8, name: "Charitable Contributions", date: "2024-03-09", category: "Deductions" },
        { id: 9, name: "Medical Expenses Summary", date: "2024-03-08", category: "Deductions" },
        { id: 10, name: "Student Loan Interest", date: "2024-03-07", category: "Deductions" },
        { id: 11, name: "Business Expenses Log", date: "2024-03-06", category: "Business" },
        { id: 12, name: "Vehicle Registration", date: "2024-03-05", category: "Expenses" },
    ];

    const deliverables = [
        { id: 1, name: "Form 1040", status: "pending", modifiedDate: "2024-03-01" },
        { id: 2, name: "Schedule A", status: "pending", modifiedDate: "2024-03-02" },
        { id: 3, name: "Schedule B", status: "completed", modifiedDate: "2024-03-03" },
        { id: 4, name: "Schedule C", status: "pending", modifiedDate: "2024-03-04" },
        { id: 5, name: "Schedule D", status: "completed", modifiedDate: "2024-03-05" },
        { id: 6, name: "Schedule E", status: "pending", modifiedDate: "2024-03-06" },
        { id: 7, name: "Form 8949", status: "pending", modifiedDate: "2024-03-06" },
        { id: 8, name: "Form 4562", status: "completed", modifiedDate: "2024-03-07" },
        { id: 9, name: "Form 8829", status: "pending", modifiedDate: "2024-03-08" },
        { id: 10, name: "Form 2106", status: "pending", modifiedDate: "2024-03-09" },
    ];

    // Add mock client data
    const clientDetails = {
        name: "John Doe",
        email: "john.doe@email.com",
        phone: "(555) 123-4567",
        taxId: "XXX-XX-1234",
        caseStatus: "In Progress",
        address: "123 Main Street, Anytown, CA 94001",
        filingStatus: "Married filing jointly",
        occupation: "Software Engineer",
        employer: "Tech Solutions Inc."
    };

    const renderTabContent = () => {
        switch(activeTab) {
            case 'upload':
                return (
                    <FileUpload />
                );
            case 'binder':
                return (
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <div className="overflow-hidden rounded-lg">
                            {/* Table Header - Using the same padding as rows and exact same structure */}
                            <div className="grid grid-cols-12 px-2 py-2 bg-gray-light text-black-light text-lg font-500">
                                <div className="col-span-4 pl-2 text-left">File Name</div>
                                <div className="col-span-2 text-left">Category</div>
                                <div className="col-span-2 text-left">Type</div>
                                <div className="col-span-2 text-left">Uploaded Date</div>
                                <div className="col-span-1 text-left">Size</div>
                                <div className="col-span-1 text-right pr-1">Actions</div>
                            </div>
                            
                            {/* Table Body */}
                            <div>
                                {uploadedDocs.map((doc, index) => (
                                    <div 
                                        key={doc.id} 
                                        className={`grid grid-cols-12 px-3 py-3 cursor-pointer hover:bg-gray-light-light hover:translate-x-1 items-center transition-all duration-150 ${index !== deliverables.length - 1 ? 'border-b border-gray' : ''}`}
                                        onClick={() => handleOpenPDFViewer(doc.name)}
                                    >
                                        <div className="col-span-4 font-400 text-black flex items-center text-left">
                                            <svg className="w-4 h-4 text-black-light mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <span className="truncate text-lg">{doc.name}</span>
                                        </div>
                                        
                                        <div className="col-span-2 flex items-center text-left">
                                            <div className="flex items-center text-left bg-gray-light-light border border-gray rounded-md px-2 py-1">
                                                <span 
                                                    className={`w-2 h-2 rounded-full mr-2 flex-shrink-0  
                                                    ${doc.category === 'Income' ? 'bg-blue' : 
                                                     doc.category === 'Deductions' ? 'bg-green' : 
                                                     doc.category === 'Investments' ? 'bg-purple' : 
                                                     doc.category === 'Financial' ? 'bg-yellow' : 
                                                     doc.category === 'Business' ? 'bg-orange' : 
                                                     doc.category === 'Expenses' ? 'bg-red' : 'bg-gray'}`}
                                                />
                                                <span className="text-black-light text-base">{doc.category}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="col-span-2 text-black-light text-lg text-left">
                                            PDF
                                        </div>
                                        
                                        <div className="col-span-2 text-black-light text-lg text-left">
                                            {doc.date}
                                        </div>
                                        
                                        <div className="col-span-1 text-black-light text-lg text-left">
                                            {Math.floor(Math.random() * 10) + 1} MB
                                        </div>
                                        
                                        <div className="col-span-1 flex justify-end">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    // Add delete handler here
                                                }}
                                                className="p-1 text-black-light hover:text-black hover:bg-gray-200 rounded transition-colors duration-150 mr-1"
                                            >
                                                <BiTrash size={18} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.open('_blank');
                                                }}
                                                className="p-1 text-black-light hover:text-black hover:bg-gray-200 rounded transition-colors duration-150"
                                            >
                                                <TbDownload size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case 'deliverables':
                return (
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <div className="overflow-hidden rounded-lg">
                            {/* Table Header - Using the same padding as rows and exact same structure */}
                            <div className="grid grid-cols-12 px-2 py-2 bg-gray-light text-black-light text-lg font-500">
                                <div className="col-span-4 pl-2 text-left">Name</div>
                                <div className="col-span-2 text-left">Status</div>
                                <div className="col-span-2 text-left">Type</div>
                                <div className="col-span-2 text-left">Modified Date</div>
                                <div className="col-span-1 text-left">Size</div>
                                <div className="col-span-1 text-right pr-1">Actions</div>
                            </div>
                            
                            {/* Table Body */}
                            <div>
                                {deliverables.map((form, index) => (
                                    <div 
                                        key={form.id} 
                                        className={`grid grid-cols-12 px-3 py-3 cursor-pointer hover:bg-gray-light-light hover:translate-x-1 items-center transition-all duration-150 ${index !== deliverables.length - 1 ? 'border-b border-gray' : ''}`}
                                        onClick={() => handleOpenPDFViewer(form.name)}
                                    >
                                        <div className="col-span-4 font-400 text-black flex items-center text-left">
                                            <svg className="w-4 h-4 text-black-light mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <span className="truncate text-lg">{form.name}</span>
                                        </div>
                                        
                                        <div className="col-span-2 flex items-center text-left">
                                            <div className="flex items-center text-left bg-gray-light-light border border-gray rounded-md px-2 py-1">
                                                <span 
                                                    className={`w-2 h-2 rounded-full mr-2 flex-shrink-0 
                                                        ${form.status === 'completed' ? 'bg-green' : 'bg-yellow'}`}
                                                />
                                                <span className="text-black-light text-base capitalize">{form.status}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="col-span-2 text-black-light text-lg text-left">
                                            PDF
                                        </div>
                                        
                                        <div className="col-span-2 text-black-light text-lg text-left">
                                            {/* Add a mock date matching the format in binder */}
                                            {`2024-${Math.floor(Math.random() * 12) + 1}-${Math.floor(Math.random() * 28) + 1}`}
                                        </div>
                                        
                                        <div className="col-span-1 text-black-light text-lg text-left">
                                            {Math.floor(Math.random() * 10) + 1} MB
                                        </div>
                                        
                                        <div className="col-span-1 flex justify-end">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    // Add modify handler here
                                                }}
                                                className="p-1 text-black-light hover:text-black hover:bg-gray-200 rounded transition-colors duration-150 mr-1"
                                            >
                                                <RxPencil2 size={18} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.open('_blank');
                                                }}
                                                className="p-1 text-black-light hover:text-black hover:bg-gray-200 rounded transition-colors duration-150"
                                            >
                                                <TbDownload size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="w-full h-screen flex flex-col bg-gray-50 p-4 gap-4">
            {/* Back Button - reduced margin and padding */}
            <Link to="/case" className="w-fit flex flex-row items-center gap-2 bg-gray-light border border-gray-dark rounded-md text-black-light px-3 py-1 sticky top-0 bg-gray-50 z-10 hover:text-black hover:bg-gray transition-colors duration-150">
                <IoMdArrowBack className="rotate-270" />
                <span>Back</span>
            </Link>

            {/* Top Section - Client Details - text aligned left */}
            <div className="bg-white rounded-xl p-6">
                <h2 className="text-2xl font-600 text-black mb-4 text-left">
                    {clientDetails.name}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-1 text-left">
                        <p className="text-black-light text-sm">Email:</p>
                        <p className="text-left text-lg">{clientDetails.email}</p>
                    </div>
                    <div className="space-y-1 text-left">
                        <p className="text-black-light text-sm">Phone:</p>
                        <p className="text-left text-lg">{clientDetails.phone}</p>
                    </div>
                    <div className="space-y-1 text-left">
                        <p className="text-black-light text-sm">Tax ID:</p>
                        <p className="text-left text-lg">{clientDetails.taxId}</p>
                    </div>
                    <div className="space-y-1 text-left">
                        <p className="text-black-light text-sm">Address:</p>
                        <p className="text-left text-lg">{clientDetails.address}</p>
                    </div>
                    <div className="space-y-1 text-left">
                        <p className="text-black-light text-sm">Filing Status:</p>
                        <p className="text-left text-lg">{clientDetails.filingStatus}</p>
                    </div>
                    <div className="space-y-1 text-left">
                        <p className="text-black-light text-sm">Status:</p>
                        <p className="text-left inline-block px-3 py-1 rounded-full bg-yellow text-white text-base">
                            {clientDetails.caseStatus}
                        </p>
                    </div>
                    <div className="space-y-1 text-left">
                        <p className="text-black-light text-sm">Occupation:</p>
                        <p className="text-left text-lg">{clientDetails.occupation}</p>
                    </div>
                    <div className="space-y-1 text-left">
                        <p className="text-black-light text-sm">Employer:</p>
                        <p className="text-left text-lg">{clientDetails.employer}</p>
                    </div>
                </div>
            </div>

            {/* Bottom Section - Navigation Tabs and Content */}
            <div className="flex-1 flex flex-col pb-16">
                {/* Navigation Tabs */}
                <div className="flex border-b border-gray mb-4 gap-6 text-lg">
                    <button 
                        className={`px-6 py-3 font-500 ${activeTab === 'upload' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-black-light'}`}
                        onClick={() => setActiveTab('upload')}
                    >
                        Upload Files
                    </button>
                    <button 
                        className={`px-6 py-3 font-500 ${activeTab === 'binder' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-black-light'}`}
                        onClick={() => setActiveTab('binder')}
                    >
                        Binder
                    </button>
                    <button 
                        className={`px-6 py-3 font-500 ${activeTab === 'deliverables' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-black-light'}`}
                        onClick={() => setActiveTab('deliverables')}
                    >
                        Deliverables
                    </button>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto">
                    {renderTabContent()}
                </div>
            </div>

            {/* PDF Viewer */}
            <PDFViewer 
                fileUrl={""}
                pdfTitle={pdfTitle}
                pdfViewer={pdfViewer}
                setPdfViewer={setPdfViewer}
            />
        </div>
    );
};

export default CaseDetail;