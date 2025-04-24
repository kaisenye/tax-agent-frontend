import React, { useState, useEffect } from 'react';
import AnimatedContainer from '../components/containers/AnimatedContainer';
import { Link, useParams, useNavigate } from 'react-router-dom';
import PDFViewer from '../components/PDFViewer/PDFViewerPro';
import { useAuth } from "../context/AuthContext"; // Import useAuth hook

import { IoMdArrowBack } from "react-icons/io";
import { TbDownload } from "react-icons/tb";
import { RxPencil2 } from "react-icons/rx";

import FileUpload from '../components/FileUpload';
// Removed document and s3 API imports
import { DocumentItem } from '../types/document.types';
import { getCaseDetails } from '../api/caseAPI';
import { Case } from '../types/case.types';
import { getAllFiles } from '../api/fileAPI';
import { FileRecord, FilePageContent } from '../types/file.types';
import { getLabelColor } from '../types/label.types';

// Mock data for documents
const mockDocuments: DocumentItem[] = [
  {
    id: "1",
    content: "Sample content for W2",
    name: "W2 Form 2023",
    original_file_path: "documents/w2_2023.pdf",
    page_location: "page1",
    precompute_tax_relevant_info: "Income: $75,000, Federal Tax: $12,000",
    tags: ["Income", "Tax Form"],
    category: "Income"
  },
  {
    id: "2",
    content: "Sample content for property tax",
    name: "Property Tax Bill 2023",
    original_file_path: "documents/property_tax_2023.pdf",
    page_location: "page1",
    precompute_tax_relevant_info: "Property Tax: $3,500",
    tags: ["Property Tax Bill", "Deductions"],
    category: "Schedule A: Itemized Deductions"
  },
  {
    id: "3",
    content: "Sample content for investment statement",
    name: "Investment Statement Q4 2023",
    original_file_path: "documents/investment_q4_2023.pdf",
    page_location: "page1",
    precompute_tax_relevant_info: "Capital Gains: $2,500, Dividends: $800",
    tags: ["Investments", "Capital Gains"],
    category: "Investments"
  },
  {
    id: "4",
    content: "Sample content for business expense",
    name: "Business Expenses 2023",
    original_file_path: "documents/business_expenses_2023.pdf",
    page_location: "page1",
    precompute_tax_relevant_info: "Office Supplies: $1,200, Travel: $3,500",
    tags: ["Business", "Expenses"],
    category: "Business"
  },
  {
    id: "5",
    content: "Sample content for charitable donations",
    name: "Charitable Donations 2023",
    original_file_path: "documents/charitable_2023.pdf",
    page_location: "page1",
    precompute_tax_relevant_info: "Total Donations: $2,000",
    tags: ["Financial", "Deductions"],
    category: "Financial"
  }
];

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
        console.log('Fetching case details for case ID:', caseId);
        
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
    const [currentFilePageContents, setCurrentFilePageContents] = useState<FilePageContent[] | undefined>(undefined);
    
    // Document state - using mock data instead of DynamoDB
    const [documents, setDocuments] = useState<DocumentItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null); 
    
    // Original files state
    const [originalFiles, setOriginalFiles] = useState<FileRecord[]>([]);
    const [originalFilesLoading, setOriginalFilesLoading] = useState<boolean>(true);
    const [originalFilesError, setOriginalFilesError] = useState<string | null>(null);
    
    // Fetch documents from mock data instead of DynamoDB
    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                setLoading(true);
                // Simulate API delay
                setTimeout(() => {
                    setDocuments(mockDocuments);
                    setError(null);
                    setLoading(false);
                }, 500);
            } catch (err) {
                console.error('Error fetching documents:', err);
                setError('Failed to load documents');
                setLoading(false);
            }
        };
        
        if (activeTab === 'binder') {
            fetchDocuments();
        }
    }, [activeTab]);
    
    // Fetch original files
    useEffect(() => {
        const fetchOriginalFiles = async () => {
            if (!caseId) return;
            
            try {
                setOriginalFilesLoading(true);
                const files = await getAllFiles(caseId);
                setOriginalFiles(files);
                setOriginalFilesError(null);
            } catch (err) {
                console.error('Error fetching original files:', err);
                setOriginalFilesError('Failed to load original files');
            } finally {
                setOriginalFilesLoading(false);
            }
        };
        
        if (activeTab === 'binder' && caseId) {
            fetchOriginalFiles();
        }
    }, [activeTab, caseId]);
    
    // Set file URL directly instead of getting signed URL from S3
    useEffect(() => {
        if (currentDocument) {
            // Use a default PDF URL for all documents
            setFileUrl("https://tax-agent-assets.s3.us-east-1.amazonaws.com/w2_filled.pdf");
            setCurrentFilePageContents(undefined);
        } else if (activeTab === 'binder' && originalFiles.length > 0) {
            // If we're in the original files tab and have files, use the first file's signed URL
            setFileUrl(originalFiles[0].signed_url);
            
            // Set file page contents if available
            if (originalFiles[0].file_page_contents && originalFiles[0].file_page_contents.length > 0) {
                setCurrentFilePageContents(originalFiles[0].file_page_contents);
            } else {
                setCurrentFilePageContents(undefined);
            }
        } else {
            // Default PDF for deliverables or when no document is selected
            setFileUrl("https://tax-agent-assets.s3.us-east-1.amazonaws.com/w2_filled.pdf");
            setCurrentFilePageContents(undefined);
        }
    }, [currentDocument, activeTab, originalFiles]);
    
    const handleOpenPDFViewer = (title: string, document?: DocumentItem, filePageContents?: FilePageContent[]) => {
        setPdfTitle(title);
        setCurrentDocument(document || null);
        
        // If we're in the original files tab, find the file by name and use its signed URL
        if (activeTab === 'binder' && !document) {
            const file = originalFiles.find(f => f.file_name === title);
            if (file) {
                if (file.signed_url) {
                    setFileUrl(file.signed_url);
                }
                
                // Set file page contents if available
                if (file.file_page_contents && file.file_page_contents.length > 0) {
                    setCurrentFilePageContents(file.file_page_contents);
                } else {
                    setCurrentFilePageContents(undefined);
                }
            }
        } else {
            setCurrentFilePageContents(undefined);
        }
        
        setPdfViewer(true);
    }

    const renderTabContent = () => {
        switch(activeTab) {
            case 'upload':
                return (
                    <FileUpload />
                );
            case 'binder':
                return (
                    <div className="size-full bg-white rounded-xl px-6">
                        {originalFilesLoading ? (
                            <div className="flex justify-center items-center h-64">
                                <p className="text-lg text-black-light">Loading files...</p>
                            </div>
                        ) : originalFilesError ? (
                            <div className="text-center py-4">
                                <p className="text-red-500">{originalFilesError}</p>
                            </div>
                        ) : (
                            <div className="overflow-hidden rounded-lg">
                                {/* Table Header - Using the same padding as rows and exact same structure */}
                                <div className="grid grid-cols-12 px-2 py-2 bg-gray-light text-black-light text-lg font-500">
                                    <div className="col-span-5 pl-2 text-left">File Name</div>
                                    <div className="col-span-5 text-left">Category</div>
                                    <div className="col-span-2 text-right pr-1">Actions</div>
                                </div>
                                
                                {/* Table Body */}
                                <div>
                                    {originalFiles.map((file, index) => (
                                        <div 
                                            key={file.file_id} 
                                            className={`grid grid-cols-12 px-3 py-3 cursor-pointer hover:bg-gray-light-light items-center transition-all duration-150 ${index !== originalFiles.length - 1 ? 'border-b border-gray' : ''}`}
                                            onClick={() => handleOpenPDFViewer(file.file_name, undefined, file.file_page_contents)}
                                        >
                                            <div className="col-span-5 font-400 text-black flex items-center text-left">
                                                <svg className="w-4 h-4 text-black-light mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <span className="truncate text-lg">{file.file_name}</span>
                                            </div>
                                            
                                            <div className="col-span-5 flex items-center text-left">
                                                <div className="flex items-center text-left">
                                                    {file.file_type_tag && file.file_type_tag.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {file.file_type_tag.map((tag, index) => (
                                                                <div 
                                                                    key={index} 
                                                                    className={`flex items-center px-2 py-1 rounded-full text-base text-black-dark bg-gray-light-light border border-gray rounded-md`}
                                                                >
                                                                    <span className={`w-2 h-2 rounded-full mr-1 opacity-70 ${getLabelColor(tag)}`}></span>
                                                                    {tag}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center px-2 py-1 rounded-full text-xs text-white bg-gray-500">
                                                            <span className="w-2 h-2 rounded-full mr-1 bg-white opacity-70"></span>
                                                            Uncategorized
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div className="col-span-2 flex justify-end">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        // Open the file in a new tab using the signed URL
                                                        if (file.signed_url) {
                                                            window.open(file.signed_url, '_blank');
                                                        }
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
            <div className="size-full flex flex-col bg-gray-50 p-4">
                <nav className="flex border-b border-gray pb-4" aria-label="Breadcrumb">
                    <ol className="inline-flex items-center">
                        <li className="inline-flex items-center">
                            <Link to="/case" className="inline-flex items-center text-lg gap-2 font-medium text-black-light hover:text-black">
                                Cases
                            </Link>
                        </li>
                        <li>
                            <div className="flex items-center">
                                <span className="mx-2 text-gray-400">/</span>
                                <span className="text-base font-medium text-gray-500">{caseData?.title}</span>
                            </div>
                        </li>
                    </ol>
                </nav>

                {/* Top Section - Client Details - text aligned left */}
                <div className="bg-white rounded-xl px-6 py-4">
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
                <div className="flex-1 flex flex-col">
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
                    filePageContents={currentFilePageContents}
                />
                
            </div>
        </AnimatedContainer>
    );
};

export default CaseDetail;