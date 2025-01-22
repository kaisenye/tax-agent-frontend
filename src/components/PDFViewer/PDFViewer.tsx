import { useEffect } from 'react';
import './PDFViewerElement'; // Import the web component

interface PDFViewerProps {
    fileUrl: string;
    pdfViewer: boolean;
    setPdfViewer: (pdfViewer: boolean) => void;
}

const PDFViewer = ({ fileUrl, pdfViewer, setPdfViewer }: PDFViewerProps) => {
    return (
        <div className={`fixed top-0 right-0 h-full w-[800px] bg-white shadow-2xl 
            transform transition-transform duration-300 ease-in-out z-50 px-6
            ${pdfViewer ? 'translate-x-0' : 'translate-x-full'}`}
        >
            <div className="flex justify-between items-center mb-2 py-4 bg-white">
                <h2 className="text-xl font-600">PDF Viewer</h2>
                <button
                    onClick={() => setPdfViewer(false)}
                    className="text-gray-dark hover:text-black"
                >
                    ✕
                </button>
            </div>
            <div className="flex flex-col items-center justify-start relative bg-white h-[90%] border border-gray-dark overflow-hidden pb-200">
                {/* @ts-ignore - custom element */}
                <pdf-viewer 
                    src={"https://tax-agent-assets.s3.us-east-1.amazonaws.com/w2_filled.pdf"}
                    style={{ width: '100%', height: '100%' }}
                />
            </div>
        </div>
    );
};

export default PDFViewer;