import { useEffect, useState } from 'react';
import './PDFViewerElement'; // Import the web component
import { DocumentItem } from '../../types/document.types';
import { FilePageContent } from '../../types/file.types';
import { getLabelColor } from '../../types/label.types';

interface PDFViewerProps {
    fileUrl: string;
    pdfTitle: string;
    pdfViewer: boolean;
    setPdfViewer: (pdfViewer: boolean) => void;
    document?: DocumentItem | null;
    filePageContents?: FilePageContent[];
}

const PDFViewer = ({ fileUrl, pdfTitle, pdfViewer, setPdfViewer, document, filePageContents }: PDFViewerProps) => {
    const [pdfError, setPdfError] = useState<boolean>(false);
    
    useEffect(() => {
        // Reset error state when the fileUrl changes
        setPdfError(false);
    }, [fileUrl]);
    
    const renderTaxInfo = (taxInfoJson: string) => {
        if (!taxInfoJson) return null;
        
        try {
            const taxInfo = JSON.parse(taxInfoJson);
            
            return (
                <div className="bg-blue-50 p-4 rounded-xl shadow-sm border border-blue-100">
                    <div className="overflow-auto max-h-[300px]">
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap text-left">
                            {JSON.stringify(taxInfo, null, 2)}
                        </pre>
                    </div>
                </div>
            );
        } catch (error) {
            console.error("Error parsing tax info:", error);
            return null;
        }
    };
    
    return (
        <div className={`fixed top-0 right-0 h-full w-[1200px] bg-white shadow-2xl 
            transform transition-transform duration-300 ease-in-out z-100 px-4
            ${pdfViewer ? 'translate-x-0' : 'translate-x-full'}`}
        >
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex justify-between items-center py-2 bg-white border-b border-gray">
                    <h2 className="text-lg font-500">{pdfTitle}</h2>
                    <button
                        onClick={() => setPdfViewer(false)}
                        className="text-gray-dark hover:text-black p-2 rounded-full hover:bg-gray-100"
                    >
                        ✕
                    </button>
                </div>
                
                {/* Content */}
                <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
                    {!fileUrl && !filePageContents ? (
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
                        <div className="flex flex-col space-y-8">
                            {filePageContents && filePageContents.length > 0 ? (
                                // Display all pages in a vertical column
                                filePageContents.map((page, index) => (
                                    <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                        <div className="flex justify-start bg-gray-100 px-4 py-2 border-b border-gray-200">
                                            <h3 className="text-lg font-medium">Page {parseInt(page.page_num) + 1}</h3>
                                        </div>
                                        <div className="flex">
                                            {/* Page Metadata - Left Side */}
                                            <div className="w-[400px] p-6 border-r border-gray-200 overflow-y-auto max-h-[800px]">
                                                {/* Category */}
                                                <div className="flex flex-col items-start mb-8">
                                                    <p className="text-base font-500 text-gray-600 mb-2 text-left">Category</p>
                                                    <div className="flex flex-wrap gap-1 mb-4">
                                                        {page.file_type_tag.length > 0 ? (
                                                            page.file_type_tag.map((tagItem, index) => (
                                                                <div 
                                                                    key={index} 
                                                                    className={`flex items-center px-2 py-1 rounded-full text-xs text-white ${getLabelColor(tagItem.label)}`}
                                                                >
                                                                    <span className="w-2 h-2 rounded-full mr-1 bg-white opacity-70"></span>
                                                                    {tagItem.label}
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="flex items-center px-2 py-1 rounded-full text-xs text-white bg-gray-500">
                                                                <span className="w-2 h-2 rounded-full mr-1 bg-white opacity-70"></span>
                                                                Uncategorized
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p className="text-base font-500 text-gray-600 mb-2 text-left">Reason</p>
                                                    <span className="text-base text-left text-black-light">
                                                        {page.file_type_tag.length > 0 ? page.file_type_tag[0].reason : "No reason provided"}
                                                    </span>
                                                </div>
                                                
                                                {/* Tax Information */}
                                                {page.precompute_tax_relevant_info && (
                                                    <div className="mb-6">
                                                        <h3 className="text-xl font-semibold mb-3 text-left">Tax Information</h3>
                                                        {renderTaxInfo(page.precompute_tax_relevant_info)}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* PDF Viewer - Right Side */}
                                            <div className="flex-1 h-[800px]">
                                                {/* @ts-ignore - custom element */}
                                                <pdf-viewer 
                                                    src={page.signed_url}
                                                    cors-mode="cors"
                                                    style={{ width: '100%', height: '100%' }}
                                                    onError={() => setPdfError(true)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                // Single document view
                                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                                    <div className="flex">
                                        {/* Document Metadata - Left Side */}
                                        <div className="w-[600px] p-6 border-r border-gray-200">
                                            {/* Category */}
                                            <div className="mb-4">
                                                <h3 className="text-xl font-semibold mb-3 text-left">Document Details</h3>
                                                <div className="bg-gray-50 p-4 rounded-lg">
                                                    <div className="mb-4">
                                                        <p className="text-base font-medium text-gray-600 mb-2 text-left">Category</p>
                                                        <div className="flex items-center">
                                                            {document?.tags && document.tags.length > 0 ? (
                                                                document.tags.map((tag, index) => (
                                                                    <span 
                                                                        key={index}
                                                                        className={`w-3 h-3 rounded-full mr-3 ${getLabelColor(tag)}`}
                                                                    />
                                                                ))
                                                            ) : (
                                                                <span className="w-3 h-3 rounded-full mr-3 bg-gray-500" />
                                                            )}
                                                            <span className="text-base text-left">
                                                                {document?.tags && typeof document.tags[0] === 'string' 
                                                                    ? document.tags.join(', ') 
                                                                    : document?.tags && document.tags.map((tag: any) => tag.label).join(', ') || 'Uncategorized'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Tax Information */}
                                            {document?.precompute_tax_relevant_info && (
                                                <div className="mb-6">
                                                    <h3 className="text-xl font-semibold mb-3 text-left">Tax Information</h3>
                                                    {renderTaxInfo(document.precompute_tax_relevant_info)}
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* PDF Viewer - Right Side */}
                                        <div className="flex-1 h-[800px]">
                                            {/* @ts-ignore - custom element */}
                                            <pdf-viewer 
                                                src={fileUrl}
                                                cors-mode="cors"
                                                style={{ width: '100%', height: '100%' }}
                                                onError={() => setPdfError(true)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PDFViewer;