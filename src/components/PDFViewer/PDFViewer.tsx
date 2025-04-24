import { useEffect } from 'react';
import './PDFViewerElement'; // Import the web component

interface PDFViewerProps {
    fileUrl: string;
    pdfTitle: string;
    pdfViewer: boolean;
    setPdfViewer: (pdfViewer: boolean) => void;
}

const PDFViewer = ({ fileUrl, pdfTitle, pdfViewer, setPdfViewer }: PDFViewerProps) => {
    // Log the fileUrl to verify it's being passed correctly
    useEffect(() => {
        console.log('PDFViewer rendering with URL:', fileUrl);
    }, [fileUrl]);

    return (
        <div className="h-full w-full flex flex-col">
            <div className="flex-1 flex flex-col items-center justify-start relative bg-white border border-stone-200 overflow-hidden">
                {/* @ts-ignore - custom element */}
                <pdf-viewer 
                    src={fileUrl || "https://tax-agent-assets.s3.us-east-1.amazonaws.com/w2_filled.pdf"}
                    style={{ width: '100%', height: '100%' }}
                />
            </div>
        </div>
    );
};

export default PDFViewer;