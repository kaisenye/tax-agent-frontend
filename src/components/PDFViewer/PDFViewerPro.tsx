import { useEffect, useState } from 'react';
import './PDFViewerElement'; // Import the web component
import { DocumentItem } from '../../types/document.types';

interface PDFViewerProps {
    fileUrl: string;
    pdfTitle: string;
    pdfViewer: boolean;
    setPdfViewer: (pdfViewer: boolean) => void;
    document?: DocumentItem | null;
}

const PDFViewer = ({ fileUrl, pdfTitle, pdfViewer, setPdfViewer, document }: PDFViewerProps) => {
    const [pdfError, setPdfError] = useState<boolean>(false);
    
    useEffect(() => {
        // Reset error state when the fileUrl changes
        setPdfError(false);
    }, [fileUrl]);
    
    return (
        <div className={`fixed top-0 right-0 h-full w-[1400px] bg-white shadow-2xl 
            transform transition-transform duration-300 ease-in-out z-50 px-6
            ${pdfViewer ? 'translate-x-0' : 'translate-x-full'}`}
        >
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex justify-between items-center py-4 bg-white border-b border-gray">
                    <h2 className="text-2xl font-500">{pdfTitle}</h2>
                    <button
                        onClick={() => setPdfViewer(false)}
                        className="text-gray-dark hover:text-black p-2 rounded-full hover:bg-gray-100"
                    >
                        ✕
                    </button>
                </div>
                
                {/* Content */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Document details section */}
                    {document && (
                        <div className="w-[500px] border-r border-gray overflow-y-auto p-6 bg-white">
                            <div className="">
                                {/* Category */}
                                <div >
                                    <h3 className="text-xl font-semibold mb-3 text-left">Document Details</h3>
                                    <div className="bg-gray-50">
                                        <div className="mb-4">
                                            <p className="text-base font-medium text-gray-600 mb-2 text-left">Category</p>
                                            <div className="flex items-center">
                                                <span 
                                                    className={`w-3 h-3 rounded-full mr-3 
                                                    ${document.category === 'Schedule A: Itemized Deductions' ? 'bg-green' : 
                                                     document.category === 'Income' ? 'bg-blue' : 
                                                     document.category === 'Investments' ? 'bg-purple' : 
                                                     document.category === 'Financial' ? 'bg-yellow' : 
                                                     document.category === 'Business' ? 'bg-orange' : 
                                                     document.category === 'Expenses' ? 'bg-red' : 'bg-gray'}`}
                                                />
                                                <span className="text-base text-left">{document.category || 'Uncategorized'}</span>
                                            </div>
                                        </div>
                                        
                                        {/* Tags */}
                                        <div className="mb-4">
                                            <p className="text-base font-medium text-gray-600 mb-2 text-left">Tags</p>
                                            <div className="flex flex-wrap gap-2">
                                                {document.tags.length > 0 ? (
                                                    document.tags.map((tag, index) => (
                                                        <span 
                                                            key={index}
                                                            className="bg-gray-200 text-gray-700 py-1 rounded-full text-sm font-medium hover:bg-gray-300 transition-colors text-left"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-gray-500 italic text-left">No tags</span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Original file */}
                                        <div className="mb-4">
                                            <p className="text-base font-medium text-gray-600 mb-2 text-left">Original File</p>
                                            <p className="text-base text-gray-700 break-all font-mono bg-gray-100 rounded text-left">{document.original_file_path}</p>
                                        </div>
                                        
                                        {/* Page */}
                                        <div className="mb-4">
                                            <p className="text-base font-medium text-gray-600 mb-2 text-left">Page</p>
                                            <p className="text-base text-gray-700 text-left">{document.page_location}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Extracted Tax Information */}
                                <div>
                                    <h3 className="text-xl font-semibold mb-3 text-left">Tax Information</h3>
                                    <div className="bg-blue-50 p-4 rounded-xl shadow-sm border border-blue-100">
                                        <pre className="whitespace-pre-wrap text-sm text-gray-700 font-normal text-left">
                                            {document.precompute_tax_relevant_info}
                                        </pre>
                                    </div>
                                </div>
                                
                                {/* Document Content */}
                                <div>
                                    <h3 className="text-xl font-semibold mb-3 text-left">Document Content</h3>
                                    <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
                                        <pre className="whitespace-pre-wrap text-sm text-gray-700 font-normal max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 text-left">
                                            {document.content}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* PDF Viewer section */}
                    <div className="flex-1 flex flex-col items-center justify-start relative bg-gray-50 overflow-hidden">
                        {!fileUrl ? (
                            <div className="flex items-center justify-center w-full h-full">
                                <div className="animate-pulse text-gray-600">Loading document...</div>
                            </div>
                        ) : pdfError ? (
                            <div className="flex flex-col items-center justify-center w-full h-full p-6 text-center">
                                <p className="text-red-500 text-lg mb-4">Error loading PDF due to CORS restrictions</p>
                                <a 
                                    href={fileUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
                                >
                                    Open PDF in new tab
                                </a>
                            </div>
                        ) : (
                            /* @ts-ignore - custom element */
                            <pdf-viewer 
                                src={fileUrl}
                                cors-mode="cors"
                                style={{ width: '100%', height: '100%' }}
                                onError={() => setPdfError(true)}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PDFViewer;