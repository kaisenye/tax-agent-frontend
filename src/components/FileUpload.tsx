import React, { useEffect, useState, useRef, DragEvent, useCallback } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { io, Socket } from 'socket.io-client';
import * as pdfjsLib from 'pdfjs-dist';

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

// Change the API_BASE_URL to match your Flask server exactly
const API_BASE_URL = 'http://127.0.0.1:5000';

// Create an axios instance with credentials to maintain session
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true  // Important to maintain session cookies
});

// DocumentAPI service for API interactions
class DocumentAPI {
  private baseUrl: string;
  private socketId: string;

  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.socketId = Math.random().toString(36).substring(2, 10); // Generate a random socketId
  }

  getSocketId(): string {
    return this.socketId;
  }

  async request(endpoint: string, method = 'GET', data: any = null) {
    try {
      // Ensure endpoint doesn't start with a slash if baseURL ends with one
      if (endpoint.startsWith('/') && this.baseUrl.endsWith('/')) {
        endpoint = endpoint.substring(1);
      }
      
      const config: any = {
        method,
        url: endpoint,
        baseURL: this.baseUrl,
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        }
      };

      if (data && method !== 'GET') {
        config.data = data;
      }

      console.log(`Making ${method} request to: ${this.baseUrl}${endpoint}`, config);
      const response = await api(config);
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
      formData.append('files[]', file);
    });
    
    formData.append('socket_id', this.socketId);
    
    try {
      const response = await axios.post(`${this.baseUrl}/organize`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: false // Set to false for cross-origin requests
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Upload error:', error);
      if (error.response) {
        throw new Error(error.response.data?.error || `Upload failed with status ${error.response.status}`);
      }
      throw error;
    }
  }
}

// Create singleton instance
const documentAPI = new DocumentAPI();

// API services
const uploadFiles = async (files: File[]) => {
  try {
    console.log(`Uploading with socket ID: ${documentAPI.getSocketId()}`);
    const result = await documentAPI.uploadFiles(files);
    console.log('Upload successful');
    return result;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
};

const getDownloadUrl = (filename: string) => {
  return `${API_BASE_URL}/downloads/${filename}`;
};

const getPdfUrl = (aggregatePath: string, outputFileName: string) => {
  return `${API_BASE_URL}/api/get_pdf?aggregate_path=${encodeURIComponent(aggregatePath)}&output_file_name=${encodeURIComponent(outputFileName)}`;
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

interface PageContent {
  content: string;
  tags: Record<string, string[]>;
  precompute_tax_relevant_info: string;
}

interface OutputFile {
  output_file_name: string;
  aggregate_path: string;
  file_contents: PageContent[];
}

// Main component
const TaxProcessing: React.FC = () => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [aggregatePath, setAggregatePath] = useState('');
  const [outputFileName, setOutputFileName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
  // PDF Viewer states
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [outputFiles, setOutputFiles] = useState<OutputFile[]>([]);
  const [selectedOutputFile, setSelectedOutputFile] = useState<OutputFile | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [metadataPanelWidth, setMetadataPanelWidth] = useState(300);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const pdfViewerRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const metadataPanelRef = useRef<HTMLDivElement>(null);
  const pageObserversRef = useRef<Record<number, IntersectionObserver>>({});
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  useEffect(() => {
    // Initialize Socket.IO connection
    initializeSocket();

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      // Clean up any page observers
      Object.values(pageObserversRef.current).forEach(observer => observer.disconnect());
    };
  }, []);
  
  const initializeSocket = () => {
    try {
      console.log("Initializing Socket.IO connection to:", API_BASE_URL);
      
      // Clear any existing socket
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      
      // Create Socket.IO connection with specific debugging options
      const socket = io(API_BASE_URL, {
        path: '/socket.io',
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        transports: ['polling'], // Try with only polling first to debug
        withCredentials: false, // Important: false for cross-origin without credentials
        autoConnect: true,
        forceNew: true,
        timeout: 20000 // Increase timeout
      });
      
      socketRef.current = socket;
      
      // Debug events
      socket.on('connect_error', (error) => {
        console.error("Socket.IO connection error:", error);
        console.log("Error details:", {
          message: error.message,
          description: error.description,
          type: error.type,
          stack: error.stack
        });
        setStatus('Connection error. Please check your network or server. Error: ' + error.message);
      });
      
      socket.on('connect', () => {
        console.log("Connected to server via Socket.IO with ID:", socket.id);
        console.log("Joining room:", documentAPI.getSocketId());
        socket.emit('join', { room: documentAPI.getSocketId() });
      });
      
      socket.on('disconnect', () => {
        console.log("Disconnected from server");
        // Don't automatically alert as it might be annoying
        setStatus('Connection lost. Please refresh the page if issues persist.');
      });

      socket.on('joined', (data) => {
        console.log("Joined room:", data);
        setIsConnected(true);
        setStatus('Connected to server');
      });
      
      // Listen for progress updates
      socket.on('progress', (data: any) => {
        console.log("Progress update:", data);
        setProgress(data.percentage || 0);
        setStatus(data.status || '');
        
        if (data.download_url) {
          setDownloadUrl(data.download_url);
        }
        
        // When processing is complete
        if (data.percentage === 100 && data.download_url) {
          // Update file selection if output_files are provided
          if (data.output_files) {
            setOutputFiles(data.output_files);
            if (data.output_files.length > 0) {
              setSelectedOutputFile(data.output_files[0]);
              
              // Set aggregate_path and output_file_name from the first output file
              setAggregatePath(data.output_files[0].aggregate_path);
              setOutputFileName(data.output_files[0].output_file_name);
              
              setShowPdfViewer(true);
            }
          }
        }
      });
    } catch (error) {
      console.error("Error initializing Socket.IO:", error);
      setError("Failed to initialize real-time connection. Progress updates may be delayed.");
    }
  };

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
      setDownloadUrl('');
      setError(null);
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
    setDownloadUrl('');
    setError(null);
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
    setShowPdfViewer(false);
    setDownloadUrl('');
    
    try {
      // Upload files with socket ID
      const uploadResult = await uploadFiles(files);
      console.log('Upload result:', uploadResult);
      
      // Processing will continue in the background
      // Progress updates will come via the socket connection
      
      // Clear file list after successful submission
      setFiles([]);
    } catch (error) {
      console.error('Upload failed:', error);
      setStatus('Upload failed');
      setError('Failed to upload files. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle PDF download button
  const handleDownloadPdf = useCallback(() => {
    if (aggregatePath && outputFileName) {
      window.open(getPdfUrl(aggregatePath, outputFileName), '_blank');
    }
  }, [aggregatePath, outputFileName]);

  // PDF viewer functions
  const loadPDF = useCallback((url: string) => {
    pdfjsLib.getDocument(url).promise.then(pdf => {
      setPdfDoc(pdf);
      renderPDF(pdf);
    }).catch(err => console.error("Error loading PDF:", err));
  }, []);

  const renderPDF = useCallback((pdf: pdfjsLib.PDFDocumentProxy) => {
    if (!pdfViewerRef.current) return;
    
    const pdfViewer = pdfViewerRef.current;
    pdfViewer.innerHTML = ''; // Clear previous renders
    
    // Observer options to detect when a page is at least 50% visible
    const observerOptions = {
      root: pdfViewer,
      threshold: 0.5
    };
    
    // Disconnect existing observers
    Object.values(pageObserversRef.current).forEach(observer => observer.disconnect());
    pageObserversRef.current = {};
    
    // Render each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      pdf.getPage(pageNum).then(page => {
        const viewport = page.getViewport({ scale: 1.0 });
        const canvas = document.createElement('canvas');
        canvas.className = 'mb-2 border border-gray'; // Add Tailwind classes
        canvas.dataset.pageNumber = pageNum.toString();
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        const context = canvas.getContext('2d');
        if (context) {
          page.render({ canvasContext: context, viewport: viewport });
        }
        
        pdfViewer.appendChild(canvas);
        
        // Observe page visibility to update metadata
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
              updateMetadata(parseInt(canvas.dataset.pageNumber || '1'));
            }
          });
        }, observerOptions);
        
        observer.observe(canvas);
        pageObserversRef.current[pageNum] = observer;
      });
    }
  }, []);

  const updateMetadata = useCallback((pageNum: number) => {
    if (!metadataPanelRef.current || !selectedOutputFile) return;
    
    const metadataPanel = metadataPanelRef.current;
    metadataPanel.innerHTML = '';
    
    // Since file_contents is an array, page number 1 corresponds to index 0
    const fileContent = selectedOutputFile.file_contents[pageNum - 1];
    if (fileContent) {
      // --- Tags: display only the first tag's first document ---
      const scheduleKeys = Object.keys(fileContent.tags);
      if (scheduleKeys.length > 0) {
        const firstSchedule = scheduleKeys[0];
        const docs = fileContent.tags[firstSchedule];
        if (docs && docs.length > 0) {
          const tagsDiv = document.createElement('div');
          tagsDiv.innerHTML = '<h3 class="text-lg font-500 mb-2">Tags</h3>';
          const tagsList = document.createElement('ul');
          tagsList.className = 'list-disc pl-6 mb-4';
          const li = document.createElement('li');
          li.textContent = `${firstSchedule}: ${docs[0]}`;
          tagsList.appendChild(li);
          tagsDiv.appendChild(tagsList);
          metadataPanel.appendChild(tagsDiv);
        }
      }
      
      // --- Precomputed Tax Relevant Info: split string into bullet list ---
      if (fileContent.precompute_tax_relevant_info &&
          fileContent.precompute_tax_relevant_info.trim() !== "") {
        const infoDiv = document.createElement('div');
        infoDiv.innerHTML = '<h3 class="text-lg font-500 mb-2">Precomputed Tax Relevant Info</h3>';
        const infoList = document.createElement('ul');
        infoList.className = 'list-disc pl-6 mb-4';
        
        // Assume each bullet is separated by a newline
        const infoItems = fileContent.precompute_tax_relevant_info
          .split("\n")
          .map(item => item.trim())
          .filter(item => item.length > 0);
        
        infoItems.forEach(info => {
          const li = document.createElement('li');
          li.textContent = info;
          infoList.appendChild(li);
        });
        
        infoDiv.appendChild(infoList);
        metadataPanel.appendChild(infoDiv);
      }
      
      // --- Content ---
      const contentDiv = document.createElement('div');
      contentDiv.innerHTML = '<h3 class="text-lg font-500 mb-2">Content</h3>';
      const contentPara = document.createElement('p');
      contentPara.textContent = fileContent.content;
      contentDiv.appendChild(contentPara);
      metadataPanel.appendChild(contentDiv);
    } else {
      metadataPanel.innerHTML = '<p>No metadata available for this page.</p>';
    }
  }, [selectedOutputFile]);

  // Load the initial PDF after the viewer is shown and when selected file changes
  useEffect(() => {
    if (showPdfViewer && selectedOutputFile) {
      const pdfUrl = getPdfUrl(selectedOutputFile.aggregate_path, selectedOutputFile.output_file_name);
      loadPDF(pdfUrl);
    }
  }, [showPdfViewer, selectedOutputFile, loadPDF]);

  // Reset divider drag state on mouseup
  useEffect(() => {
    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  // Handle file selection change
  const handleFileSelectionChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIndex = parseInt(e.target.value);
    const file = outputFiles[selectedIndex];
    setSelectedOutputFile(file);
  }, [outputFiles]);

  // PDF viewer control handlers
  const handleMaximizePdfViewer = useCallback(() => {
    setIsMaximized(true);
  }, []);

  const handleMinimizePdfViewer = useCallback(() => {
    setIsMaximized(false);
  }, []);

  const handleClosePdfViewer = useCallback(() => {
    setShowPdfViewer(false);
  }, []);

  // Divider dragging functionality
  const handleDividerMouseDown = useCallback((e: React.MouseEvent) => {
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    if (metadataPanelRef.current) {
      startWidthRef.current = parseInt(window.getComputedStyle(metadataPanelRef.current).width, 10);
    }
    e.preventDefault();
  }, []);

  // Update metadata panel width during dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      
      let newWidth = startWidthRef.current - (e.clientX - startXRef.current);
      // Set minimum width limit
      newWidth = Math.max(150, newWidth);
      
      setMetadataPanelWidth(newWidth);
    };

    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Add a fallback polling mechanism
  useEffect(() => {
    if (isUploading && !isConnected) {
      // Set up fallback polling if Socket.IO connection fails
      const pollInterval = setInterval(async () => {
        try {
          // Poll for progress via regular API endpoint - create this endpoint on your Flask server
          const progressData = await api.get(`/api/progress?socket_id=${documentAPI.getSocketId()}`);
          
          if (progressData.data) {
            setProgress(progressData.data.percentage || 0);
            setStatus(progressData.data.status || '');
            
            if (progressData.data.download_url) {
              setDownloadUrl(progressData.data.download_url);
              clearInterval(pollInterval);
            }
          }
        } catch (error) {
          console.error("Error polling for progress:", error);
        }
      }, 3000); // Poll every 3 seconds
      
      return () => clearInterval(pollInterval);
    }
  }, [isUploading, isConnected]);

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
      
      {(isUploading || status) && !showPdfViewer && (
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
      
      {downloadUrl && (
        <div className="bg-green bg-opacity-5 rounded-lg p-8 mt-8 text-center shadow-sm border border-green border-opacity-20 animate-slideUp">
          <div className="w-16 h-16 mx-auto mb-4 bg-green bg-opacity-10 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h3 className="text-2xl font-600 text-black mb-2">Processing Complete!</h3>
          <p className="text-black-light mb-6">Your tax documents have been successfully processed.</p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <a 
              href={downloadUrl} 
              download 
              className="py-3 px-6 bg-green text-white rounded-md inline-flex items-center transition-transform hover:scale-105 hover:shadow-md"
            >
              <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Results (.zip)
            </a>
            
            {aggregatePath && outputFileName && (
              <button 
                onClick={handleDownloadPdf}
                className="py-3 px-6 bg-blue text-white rounded-md inline-flex items-center transition-transform hover:scale-105 hover:shadow-md"
              >
                <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View PDF Report
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* PDF Viewer Component */}
      {showPdfViewer && (
        <div 
          className={`mt-8 border border-gray rounded-lg overflow-hidden bg-white animate-slideUp ${
            isMaximized ? 'fixed top-0 left-0 w-full h-full z-50 m-0' : ''
          }`}
        >
          <div className="flex justify-between items-center p-4 bg-gray-light">
            <div className="flex items-center">
              <label htmlFor="fileSelect" className="mr-2">Select PDF:</label>
              <select 
                id="fileSelect" 
                className="border border-gray rounded p-1"
                onChange={handleFileSelectionChange}
              >
                {outputFiles.map((file, index) => (
                  <option key={index} value={index}>
                    {file.output_file_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex space-x-2">
              {!isMaximized ? (
                <button onClick={handleMaximizePdfViewer} className="p-1 hover:bg-gray rounded" title="Maximize">
                  &#x26F6;
                </button>
              ) : (
                <button onClick={handleMinimizePdfViewer} className="p-1 hover:bg-gray rounded" title="Minimize">
                  &#x1F5D5;
                </button>
              )}
              <button onClick={handleClosePdfViewer} className="p-1 hover:bg-gray rounded" title="Close">
                &#x2715;
              </button>
            </div>
          </div>
          
          <div 
            className="flex" 
            style={{ height: isMaximized ? 'calc(100% - 50px)' : '600px' }}
          >
            <div 
              ref={pdfViewerRef}
              className="flex-1 overflow-auto p-4 bg-gray-100"
            ></div>
            
            <div 
              ref={dividerRef}
              className="w-1 bg-gray cursor-col-resize"
              onMouseDown={handleDividerMouseDown}
            ></div>
            
            <div 
              ref={metadataPanelRef}
              className="overflow-y-auto border-l border-gray p-4 bg-white"
              style={{ width: `${metadataPanelWidth}px` }}
            >
              <p>Scroll through the PDF. Metadata for the visible page will be displayed here.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaxProcessing; 