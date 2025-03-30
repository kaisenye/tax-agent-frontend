import React, { useState, useEffect } from 'react';
import AnimatedContainer from '../components/Containers/AnimatedContainer';
import { Link, useParams, useNavigate } from 'react-router-dom';
import PDFViewer from '../components/PDFViewer/PDFViewerPro';
import { useAuth } from "../context/AuthContext"; // Import useAuth hook

import { IoMdArrowBack } from "react-icons/io";
import { TbDownload } from "react-icons/tb";
import { RxPencil2 } from "react-icons/rx";

import FileUpload from '../components/FileUpload';
import * as documentAPI from '../api/documentAPI';
import * as s3API from '../aws/s3API';
import { DocumentItem } from '../types/document.types';
import { getCaseDetails, deleteCase } from '../api/caseAPI';
import { Case } from '../types/case.types';

const CaseDetail = () => {
    // Get userId from AuthContext
    const { userId, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    
    // Get case ID from URL params
    const { caseId } = useParams<{ caseId: string }>();
    
    // Case data state
    const [caseData, setCaseData] = useState<Case | null>(null);
    const [caseLoading, setCaseLoading] = useState<boolean>(true);
    const [caseError, setCaseError] = useState<string | null>(null);
    
    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated && !userId) {
            navigate('/login', { replace: true });
        }
    }, [isAuthenticated, userId, navigate]);
    
    // Fetch case details
    useEffect(() => {
        const fetchCaseDetails = async () => {
            if (!caseId) return;
            
            try {
                setCaseLoading(true);
                const fetchedCase = await getCaseDetails(caseId);
                setCaseData(fetchedCase);
                setCaseError(null);
            } catch (err) {
                console.error('Error fetching case details:', err);
                setCaseError('Failed to load case details');
            } finally {
                setCaseLoading(false);
            }
        };
        
        if (caseId && userId) {
            fetchCaseDetails();
        }
    }, [caseId, userId]);
    
    // PDF Viewer State
    const [pdfTitle, setPdfTitle] = useState<string>("");
    const [pdfViewer, setPdfViewer] = useState<boolean>(false);
    const [currentDocument, setCurrentDocument] = useState<DocumentItem | null>(null);
    const [fileUrl, setFileUrl] = useState<string>("");
    const [activeTab, setActiveTab] = useState<'upload' | 'binder' | 'deliverables'>('upload');
    
    // Document state from DynamoDB
    const [documents, setDocuments] = useState<DocumentItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    
    // Fetch documents from DynamoDB
    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                setLoading(true);
                // Get all documents
                const docs = await documentAPI.getAllDocuments();
                setDocuments(docs);
                setError(null);
            } catch (err) {
                console.error('Error fetching documents:', err);
                setError('Failed to load documents from database');
            } finally {
                setLoading(false);
            }
        };
        
        if (activeTab === 'binder') {
            fetchDocuments();
        }
    }, [activeTab]);
    
    // Get signed URL from S3 when document changes
    useEffect(() => {
        const getSignedUrl = async () => {
            if (currentDocument && currentDocument.original_file_path) {
                try {
                    // Extract bucket name and key from the original_file_path
                    // Assuming format like: uploads/bucket-name/key-path
                    const path = currentDocument.original_file_path;
                    
                    // Use the original_file_path as the key
                    const url = await s3API.getDocumentSignedUrl(path, 3600);

                    console.log('Generated signed URL for document:', {
                        key: path,
                        url: url.substring(0, 100) + '...' // Log truncated URL for security
                    });
                    
                    setFileUrl(url);
                } catch (err) {
                    console.error('Error generating signed URL:', err);
                    // Fallback to a default PDF for demonstration
                    setFileUrl("https://tax-agent-assets.s3.us-east-1.amazonaws.com/w2_filled.pdf");
                }
            } else {
                // Default PDF for deliverables or when no document is selected
                setFileUrl("https://tax-agent-assets.s3.us-east-1.amazonaws.com/w2_filled.pdf");
            }
        };
        
        getSignedUrl();
    }, [currentDocument]);
    
    const handleOpenPDFViewer = (title: string, document?: DocumentItem) => {
        setPdfTitle(title);
        setCurrentDocument(document || null);
        setPdfViewer(true);
    }
    
    const handleOpenDocumentDetail = (doc: DocumentItem) => {
        handleOpenPDFViewer(doc.name, doc);
    }

    // Mock data for deliverables only
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

    const renderTabContent = () => {
        switch(activeTab) {
            case 'upload':
                return (
                    <FileUpload />
                );
            case 'binder':
                return (
                    <div className="bg-white rounded-xl p-6">
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <p className="text-lg text-black-light">Loading documents...</p>
                            </div>
                        ) : error ? (
                            <div className="flex justify-center items-center h-64 bg-red-50 rounded-lg">
                                <p className="text-lg text-red-500">{error}</p>
                            </div>
                        ) : (
                            <div className="overflow-hidden rounded-lg">
                                {/* Table Header - Using the same padding as rows and exact same structure */}
                                <div className="grid grid-cols-12 px-2 py-2 bg-gray-light text-black-light text-lg font-500">
                                    <div className="col-span-6 pl-2 text-left">File Name</div>
                                    <div className="col-span-3 text-left">Belongs To</div>
                                    <div className="col-span-2 text-left">Category</div>
                                    <div className="col-span-1 text-right pr-1">Actions</div>
                                </div>
                                
                                {/* Table Body */}
                                <div>
                                    {documents.map((doc, index) => (
                                        <div 
                                            key={doc.id} 
                                            className={`grid grid-cols-12 px-3 py-3 cursor-pointer hover:bg-gray-light-light items-center transition-all duration-150 ${index !== documents.length - 1 ? 'border-b border-gray' : ''}`}
                                            onClick={() => handleOpenDocumentDetail(doc)}
                                        >
                                            <div className="col-span-6 font-400 text-black flex items-center text-left">
                                                <svg className="w-4 h-4 text-black-light mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <span className="truncate text-lg">{doc.name}</span>
                                            </div>
                                            
                                            <div className="col-span-3 flex items-center text-left">
                                                <div className="flex items-center text-left bg-gray-light-light border border-gray rounded-md px-2 py-1">
                                                    <span 
                                                        className={`w-2 h-2 rounded-full mr-2 flex-shrink-0  
                                                        ${doc.category === 'Schedule A: Itemized Deductions' ? 'bg-green' : 
                                                         doc.category === 'Income' ? 'bg-blue' : 
                                                         doc.category === 'Investments' ? 'bg-purple' : 
                                                         doc.category === 'Financial' ? 'bg-yellow' : 
                                                         doc.category === 'Business' ? 'bg-orange' : 
                                                         doc.category === 'Expenses' ? 'bg-red' : 'bg-gray'}`}
                                                    />
                                                    <span className="text-black-light text-base truncate">{doc.category || 'Uncategorized'}</span>
                                                </div>
                                            </div>
                                            
                                            <div className="col-span-2 flex items-center text-left">
                                                <div className="flex items-center text-left bg-gray-light-light border border-gray rounded-md px-2 py-1">
                                                    <span 
                                                        className={`w-2 h-2 rounded-full mr-2 flex-shrink-0  
                                                        ${doc.tags.includes('Property Tax Bill') ? 'bg-blue' : 
                                                         doc.tags.includes('Income') ? 'bg-blue' : 
                                                         doc.tags.includes('Investments') ? 'bg-purple' : 
                                                         doc.tags.includes('Financial') ? 'bg-yellow' : 
                                                         doc.tags.includes('Business') ? 'bg-orange' : 
                                                         doc.tags.includes('Expenses') ? 'bg-red' : 'bg-gray'}`}
                                                    />
                                                    <span className="text-black-light text-base truncate">{doc.tags.length > 0 ? doc.tags.join(', ') : 'No tags'}</span>
                                                </div>
                                            </div>
                                            
                                            <div className="col-span-1 flex justify-end">
                                                ...
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
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
                                        onClick={() => handleOpenPDFViewer(form.name, undefined)}
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
        <AnimatedContainer>
            <div className="w-full h-screen flex flex-col bg-gray-50 p-4 gap-4">
                {/* Back Button - reduced margin and padding */}
                <Link to="/case" className="w-fit flex flex-row items-center gap-2 bg-gray-light border border-gray-dark rounded-md text-black-light px-3 py-1 sticky top-0 bg-gray-50 z-10 hover:text-black hover:bg-gray transition-colors duration-150">
                    <IoMdArrowBack className="rotate-270" />
                    <span>Back</span>
                </Link>

                {/* Top Section - Client Details - text aligned left */}
                <div className="bg-white rounded-xl p-6">
                    {caseLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <p className="text-lg">Loading case details...</p>
                        </div>
                    ) : caseError ? (
                        <div className="text-center py-4">
                            <p className="text-red-500">{caseError}</p>
                        </div>
                    ) : caseData ? (
                        <>
                            <h2 className="text-2xl font-600 text-black mb-4 text-left">
                                {caseData.title}
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="space-y-1 text-left">
                                    <p className="text-black-light text-sm">Client Name:</p>
                                    <p className="text-left text-lg">{caseData.clientName || "Not provided"}</p>
                                </div>
                                <div className="space-y-1 text-left">
                                    <p className="text-black-light text-sm">Email:</p>
                                    <p className="text-left text-lg">{caseData.clientEmail || "Not provided"}</p>
                                </div>
                                <div className="space-y-1 text-left">
                                    <p className="text-black-light text-sm">Phone:</p>
                                    <p className="text-left text-lg">{caseData.clientPhone || "Not provided"}</p>
                                </div>
                                <div className="space-y-1 text-left">
                                    <p className="text-black-light text-sm">Tax ID:</p>
                                    <p className="text-left text-lg">{caseData.ssn || "Not provided"}</p>
                                </div>
                                <div className="space-y-1 text-left">
                                    <p className="text-black-light text-sm">Address:</p>
                                    <p className="text-left text-lg">{caseData.clientAddress || "Not provided"}</p>
                                </div>
                                <div className="space-y-1 text-left">
                                    <p className="text-black-light text-sm">Filing Status:</p>
                                    <p className="text-left text-lg">{caseData.filingStatus || "Not provided"}</p>
                                </div>
                                <div className="space-y-1 text-left">
                                    <p className="text-black-light text-sm">Occupation:</p>
                                    <p className="text-left text-lg">{caseData.occupation || "Not provided"}</p>
                                </div>
                                <div className="space-y-1 text-left">
                                    <p className="text-black-light text-sm">Description:</p>
                                    <p className="text-left text-lg">{caseData.description || "Not provided"}</p>
                                </div>
                                <div className="space-y-1 text-left">
                                    <p className="text-black-light text-sm">Status:</p>
                                    <p className="font-500 text-left inline-block px-3 py-1 rounded-full bg-yellow text-white text-base">
                                        {caseData.status}
                                    </p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-4">
                            <p className="text-lg text-gray-dark">No case found</p>
                        </div>
                    )}
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
                    fileUrl={fileUrl}
                    pdfTitle={pdfTitle}
                    pdfViewer={pdfViewer}
                    setPdfViewer={setPdfViewer}
                    document={currentDocument}
                />
                
            </div>
        </AnimatedContainer>
    );
};

export default CaseDetail;