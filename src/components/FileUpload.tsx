import React, { useEffect, useState, useRef, DragEvent } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import httpClient from '../api/httpClient';
import { useParams } from 'react-router-dom';

// PDF.js worker configuration
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Suppress PDF.js warnings
(function() {
  const originalWarn = console.warn;
  console.warn = function(msg: any, ...args: any[]) {
    if (typeof msg === 'string' && msg.includes("AnnotationBorderStyle.setWidth")) {
      return;
    }
    originalWarn.apply(console, [msg, ...args]);
  };
})();

// API endpoints (without base URL since httpClient already includes it)
const API_ENDPOINTS = {
  UPLOAD: '/file/upload',
  TASK_STATUS: '/task/status/'
};

// DocumentAPI service for API interactions
class DocumentAPI {
  private taskId: string | null;
  private caseId: string;

  constructor(caseId: string) {
    this.taskId = null;
    this.caseId = caseId;
  }

  getTaskId(): string | null {
    return this.taskId;
  }

  getCaseId(): string {
    return this.caseId;
  }

  async request(endpoint: string, method = 'GET', data: any = null) {
    try {
      const config: any = {
        method,
        url: endpoint,
        headers: {
          'Content-Type': 'application/json',
        }
      };

      if (data && method !== 'GET') {
        config.data = data;
      }

      console.log(`Making ${method} request to: ${endpoint}`, config);
      const response = await httpClient(config);
      console.log(`Response from ${endpoint}:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error('API error:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
        throw new Error(error.response.data?.error || `API request failed with status ${error.response.status}`);
      }
      throw error;
    }
  }

  async uploadFiles(files: File[]) {
    const formData = new FormData();
    
    files.forEach(file => {
      formData.append('files', file);
    });
    
    // Add case_id to the form data (required by new API)
    formData.append('case_id', this.caseId);
    console.log('Uploading files to Case ID:', this.caseId);
    
    try {
      // Use the httpClient for consistent request handling
      const response = await httpClient.post(API_ENDPOINTS.UPLOAD, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      
      // Store the task_id from the response
      if (response.data && response.data.task_id) {
        this.taskId = response.data.task_id;
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Upload error:', error);
      if (error.response) {
        throw new Error(error.response.data?.error || `Upload failed with status ${error.response.status}`);
      }
      throw error;
    }
  }

  async getTaskStatus() {
    if (!this.taskId) {
      throw new Error('No task ID available');
    }
    
    try {
      const response = await this.request(`${API_ENDPOINTS.TASK_STATUS}${this.taskId}`, 'GET');
      return response;
    } catch (error) {
      console.error('Error getting task status:', error);
      throw error;
    }
  }
}

// Create singleton instance with a default case ID that will be updated
let documentAPI = new DocumentAPI("");

// API services
const uploadFiles = async (files: File[]) => {
  try {
    console.log(`Uploading with case ID: ${documentAPI.getCaseId()}`);
    const result = await documentAPI.uploadFiles(files);
    console.log('Upload successful');
    return result;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
};

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

interface FileWithPreview extends File {
  preview?: string;
}

// Main component
const TaxProcessing: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  
  // Update documentAPI with the case ID from URL params
  useEffect(() => {
    if (caseId) {
      documentAPI = new DocumentAPI(caseId);
    }
  }, [caseId]);

  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [processingComplete, setProcessingComplete] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate previews for PDF files
  useEffect(() => {
    const newFiles = [...files];
    let changed = false;
    
    newFiles.forEach(file => {
      if (!file.preview && file.type === 'application/pdf') {
        // Create PDF previews using PDF.js
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target && e.target.result) {
            const typedarray = new Uint8Array(e.target.result as ArrayBuffer);
            
            pdfjsLib.getDocument({ data: typedarray }).promise.then(pdf => {
              pdf.getPage(1).then(page => {
                const viewport = page.getViewport({ scale: 1 });
                const scale = Math.min(120 / viewport.width, 120 / viewport.height);
                const scaledViewport = page.getViewport({ scale });
                
                const canvas = document.createElement('canvas');
                canvas.width = scaledViewport.width;
                canvas.height = scaledViewport.height;
                
                const context = canvas.getContext('2d');
                if (context) {
                  page.render({ canvasContext: context, viewport: scaledViewport });
                  
                  // Convert canvas to data URL
                  const dataUrl = canvas.toDataURL();
                  
                  // Update the file preview
                  const fileIndex = newFiles.findIndex(f => f === file);
                  if (fileIndex !== -1) {
                    newFiles[fileIndex].preview = dataUrl;
                    setFiles([...newFiles]);
                  }
                }
              }).catch(console.error);
            }).catch(err => {
              console.error('Error loading PDF for preview:', err);
              file.preview = '/pdf-icon.svg';
              changed = true;
            });
          }
        };
        reader.readAsArrayBuffer(file);
      }
    });
    
    if (changed) {
      setFiles(newFiles);
    }
    
    // Cleanup
    return () => {
      files.forEach(file => {
        if (file.preview && file.preview !== '/pdf-icon.svg' && file.preview.startsWith('data:')) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [files]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files) as FileWithPreview[];
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
      // Reset states when new files are selected
      setError(null);
      setProcessingComplete(false);
      setPdfUrl(null);
    }
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isUploading) {
      setIsDragging(true);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (isUploading) return;
    
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      file => file.type === 'application/pdf'
    ) as FileWithPreview[];
    
    if (droppedFiles.length === 0) {
      setError('Please drop PDF files only');
      return;
    }
    
    setFiles(prevFiles => [...prevFiles, ...droppedFiles]);
    setError(null);
    setProcessingComplete(false);
    setPdfUrl(null);
  };

  const handleDeleteFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (files.length === 0) {
      setError('Please select at least one file');
      return;
    }
    
    setIsUploading(true);
    setProgress(0);
    setStatus('Starting upload...');
    setError(null);
    setProcessingComplete(false);
    setPdfUrl(null);
    
    try {
      // Upload files with case ID
      const uploadResult = await uploadFiles(files);
      console.log('Upload result:', uploadResult);
      
      if (uploadResult.task_id) {
        setStatus(`Processing started. Task ID: ${uploadResult.task_id}`);
      } else {
        setStatus('Upload successful, but no task ID was returned.');
      }
      
      // Clear file list after successful submission
      setFiles([]);
    } catch (error: any) {
      console.error('Upload failed:', error);
      setStatus('Upload failed');
      setError(`Failed to upload files: ${error.message || 'Unknown error'}`);
      setIsUploading(false);
    }
  };

  // Add a polling mechanism for task status
  useEffect(() => {
    if (isUploading) {
      // Set up polling to check task status
      const pollInterval = setInterval(async () => {
        try {
          // Only poll if we have a task ID
          if (documentAPI.getTaskId()) {
            const statusData = await documentAPI.getTaskStatus();
            
            if (statusData) {
              setProgress(statusData.percentage || 0);
              setStatus(statusData.status || '');
              
              // Handle completed task
              if (statusData.percentage === 100) {
                setProcessingComplete(true);
                setIsUploading(false);
                
                // If there's a PDF URL in the response, display it
                if (statusData.pdf_url) {
                  setPdfUrl(statusData.pdf_url);
                }
                
                clearInterval(pollInterval);
              }
            }
          }
        } catch (error) {
          console.error("Error polling for progress:", error);
        }
      }, 2000); // Poll every 2 seconds
      
      return () => clearInterval(pollInterval);
    }
  }, [isUploading]);

  return (
    <div className="max-w-144 mx-auto p-8 animate-slideUp">
      <h1 className="text-3xl font-500 text-black mb-4">Upload Tax Documents</h1>
      <p className="text-lg text-black-light mb-8">
        Upload your tax documents (PDF format) and we'll organize them for you.
      </p>
      
      <div className="bg-gray-light rounded-lg p-8 mb-8 shadow">
        <form onSubmit={handleSubmit}>
          <div 
            className={`mb-6 border-2 border-dashed rounded-lg p-8 text-center transition-all
              ${isDragging ? 'border-black bg-black bg-opacity-5' : 'border-gray-dark'}
              ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-black'}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              id="file-input"
              accept=".pdf"
              multiple
              onChange={handleFileChange}
              disabled={isUploading}
              className="sr-only"
            />
            
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-dark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            
            <p className="mb-2 text-xl font-500">Drag & Drop files here</p>
            <p className="text-sm text-black-light mb-4">or click to browse</p>
            
            <p className="text-sm text-black-light">
              Accepted file formats: <span className="font-600">.PDF</span>
            </p>
          </div>
          
          {files.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-500">Selected Files ({files.length})</h3>
                <button 
                  type="button"
                  onClick={() => setFiles([])}
                  disabled={isUploading}
                  className="text-sm text-red hover:underline"
                >
                  Clear All
                </button>
              </div>
              
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <ul className="divide-y divide-gray">
                  {files.map((file, index) => (
                    <li key={index} className="p-4 flex items-center justify-between animate-slideUp" style={{ animationDelay: `${index * 50}ms` }}>
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-gray rounded-md flex items-center justify-center">
                          <svg className="w-6 h-6 text-black-light" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col items-start gap-1">
                          <p className="text-base font-500 truncate">{file.name}</p>
                          <p className="text-sm text-black-light">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => handleDeleteFile(index)}
                        disabled={isUploading}
                        className="flex-shrink-0 text-red-500 hover:text-red-700 transition-colors p-1"
                      >
                        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={isUploading || files.length === 0}
            className={`w-full py-2 px-4 bg-black-light text-lg text-white rounded-md font-500 transition-colors flex items-center justify-center
              ${isUploading || files.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-black'}`}
            style={isUploading ? { background: `linear-gradient(to right, darkgrey ${progress}%, grey ${progress}%)` } : {}}
          >
            {isUploading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {progress > 0 ? `${progress}%` : 'Processing...'}
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload and Process
              </>
            )}
          </button>
        </form>
      </div>
      
      {error && (
        <div className="bg-red text-white px-4 py-3 rounded-md mb-6 border-l-4 border-red animate-slideUp flex items-center">
          <svg className="w-5 h-5 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}
      
      {(isUploading || status) && (
        <div className="mb-8 animate-slideUp bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-500 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Processing Status: {status}
          </h3>
          <div className="h-3 bg-gray rounded-full overflow-hidden mb-2">
            <div 
              className="h-full bg-green transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-black-light">
            <span>Processing</span>
            <span>{progress}%</span>
          </div>
        </div>
      )}
      
      {processingComplete && (
        <div className="bg-green bg-opacity-5 rounded-lg p-8 mt-8 text-center shadow-sm border border-green border-opacity-20 animate-slideUp">
          <div className="w-16 h-16 mx-auto mb-4 bg-green bg-opacity-10 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h3 className="text-2xl font-600 text-black mb-2">Processing Complete!</h3>
          <p className="text-black-light mb-6">Your tax documents have been successfully processed.</p>
        </div>
      )}
      
      {/* Simple PDF viewer */}
      {pdfUrl && (
        <div className="mt-8 border border-gray rounded-lg overflow-hidden bg-white animate-slideUp">
          <div className="bg-gray-light p-4 flex justify-between items-center">
            <h3 className="text-xl font-500">Generated Tax Document</h3>
          </div>
          <iframe 
            src={pdfUrl} 
            className="w-full" 
            style={{ height: '600px' }} 
            title="Generated Tax Document"
          ></iframe>
        </div>
      )}
    </div>
  );
};

export default TaxProcessing; 