import React, { useState, useRef } from 'react';

// File API
import { uploadFile } from '../../api/fileApi';
import { CustomFile } from '../../types/file.types';

// Add new modal component
const FileUploadModal = ({ isOpen, onClose, onUpload }: { 
    isOpen: boolean, 
    onClose: () => void, 
    onUpload: (files: File[]) => void 
}) => {
    const [dragActive, setDragActive] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            setUploadedFiles(prev => [...prev, ...files]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files) as unknown as File[];
            setUploadedFiles(prev => [...prev, ...files]);
        }
    };

    const handleSubmit = async () => {
        if (uploadedFiles.length === 0) return;
        setIsUploading(true);

        try {
            for (const file of uploadedFiles) {
                await uploadFile(file as File);
            }
            onUpload(uploadedFiles);
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setIsUploading(false);
        }
    };

    // Add file removal handler
    const handleRemoveFile = (indexToRemove: number) => {
        setUploadedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    // Add mouse handlers
    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    // HTML ======================================================================================
    return (
        <div 
            className={`fixed top-0 right-0 h-full w-[750px] bg-white shadow-2xl 
            transform transition-transform duration-300 ease-in-out z-50
            ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
            {/* Header */}
            <div className="p-6 border-gray-200">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-600 text-black">Upload documents</h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 hover:text-black transition-colors"
                    >
                        ✕
                    </button>
                </div>
            </div>

            {/* Body - Scrollable */}
            <div className="p-6 h-[calc(100vh-180px)] overflow-y-auto">
                {/* Upload Area */}
                <div
                    className={`relative border-4 border-dashed rounded-lg p-8 text-center cursor-pointer mb-6
                        transition-all duration-150 ease-in-out
                        ${dragActive || isHovering 
                            ? 'border-black-light bg-gray-light' 
                            : 'border-gray-dark'}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    {/* Overlay */}
                    {(dragActive || isHovering) && (
                        <div className="absolute inset-0 bg-black opacity-[0.03] rounded-lg 
                            transition-opacity duration-200 ease-in-out" 
                        />
                    )}

                    {/* Content */}
                    <div className="relative z-10 flex flex-col items-center justify-center h-[200px]">
                        <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-600 mb-2">
                            Drag and drop files here or click to select files
                        </p>
                        <p className="text-sm text-gray-500">
                            Supported formats: PDF, JPG, PNG
                        </p>
                    </div>
                    <input
                        ref={inputRef}
                        type="file"
                        multiple
                        onChange={handleChange}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.xls,.xlsx"
                    />
                </div>

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                    <div className="mb-6">
                        <div className="space-y-2">
                            {uploadedFiles.map((file, index) => (
                                <div 
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-gray rounded-lg group"
                                >
                                    <div className="flex items-center flex-1 min-w-0">
                                        <svg className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <span className="text-sm text-gray-700 truncate">
                                            {file.name}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 ml-2">
                                        <span className="text-sm text-gray-500 flex-shrink-0">
                                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                                        </span>
                                        <button
                                            onClick={() => handleRemoveFile(index)}
                                            className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 transition-colors duration-150"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer - Fixed at bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-6 pb-10">
                <div className="flex justify-between gap-3">
                    <button
                        onClick={onClose}
                        disabled={isUploading}
                        className="w-1/2 px-4 py-2 text-sm font-medium text-black font-600 bg-white border border-gray-300 rounded-md 
                        hover:bg-gray-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50
                        transition-colors duration-150"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={uploadedFiles.length === 0 || isUploading}
                        className={`w-1/2 px-4 py-2 text-sm font-medium text-white rounded-md cursor-pointer
                            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                            transition-colors duration-150
                            ${(uploadedFiles.length === 0 || isUploading)
                                ? 'bg-gray-dark cursor-not-allowed' 
                                : 'bg-black-light hover:bg-black'}`}
                    >
                        {isUploading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Uploading...
                            </span>
                        ) : 'Upload files'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FileUploadModal;
