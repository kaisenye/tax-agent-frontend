import React, { useState, useEffect } from 'react';
import { FolderIcon, DocumentIcon, PlusIcon, ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { FileRecord, FilePageContent } from '../../types/file.types';
import { getAllFilesByTag } from '../../api/fileAPI';

interface FileGroup {
  [key: string]: FilePageContent[];
}

interface FolderState {
  [key: string]: boolean;
}

interface FileExplorerProps {
  onFileOpen?: (file: FileRecord) => void;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ onFileOpen }) => {
  const [fileGroups, setFileGroups] = useState<FileGroup>({});
  const [expandedFolders, setExpandedFolders] = useState<FolderState>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const caseId = "CASE12345"; // TODO: Get this from context or props
        const response = await getAllFilesByTag(caseId);
        
        // The response structure is an array of objects with fileTypeTag and files
        console.log("Response data:", response.data.data);
        
        // Convert the array to a FileGroup object
        const groupedFiles: FileGroup = {};
        
        if (Array.isArray(response.data.data)) {
          // Process each item in the array
          response.data.data.forEach((item: any) => {
            // Check if the item has the expected structure
            if (item && typeof item === 'object' && 'fileTypeTag' in item && 'files' in item) {
              // Clean up the fileTypeTag (remove any newlines or extra spaces)
              const cleanTag = item.fileTypeTag.trim();
              
              // Initialize the array for this tag if it doesn't exist
              if (!groupedFiles[cleanTag]) {
                groupedFiles[cleanTag] = [];
              }
              
              // Add all file_page_contents from each file to this tag's array
              item.files.forEach((file: FileRecord) => {
                if (file.file_page_contents && Array.isArray(file.file_page_contents)) {
                  groupedFiles[cleanTag] = [...groupedFiles[cleanTag], ...file.file_page_contents];
                }
              });
            }
          });
        }
        
        console.log("Grouped files by tag:", groupedFiles);
        setFileGroups(groupedFiles);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching files:', error);
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  const handleNewNotebook = () => {
    // TODO: Implement new notebook creation
    if (onFileOpen) {
      // Create a dummy file record for a new notebook
      const newNotebook: FileRecord = {
        case_id: "CASE12345",
        file_id: `notebook-${Date.now()}`,
        file_name: `New Notebook ${Object.keys(fileGroups).length + 1}`,
        file_page_contents: [],
        file_type_tag: ["Notebook"],
        signed_url: "",
        status: "new",
        uploaded_path: ""
      };
      
      onFileOpen(newNotebook);
    }
  };

  const toggleFolder = (folderName: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderName]: !prev[folderName]
    }));
  };

  const handleFileClick = (filePage: FilePageContent) => {
    console.log('Opening file page:', filePage);
    if (onFileOpen) {
      // Create a FileRecord from the FilePageContent
      const fileRecord: FileRecord = {
        case_id: filePage.case_id,
        file_id: filePage.file_id,
        file_name: filePage.file_name,
        file_page_contents: [filePage],
        file_type_tag: filePage.file_type_tag.map(tag => tag.label),
        signed_url: filePage.signed_url,
        status: "viewing",
        uploaded_path: filePage.uploaded_path
      };
      
      // Log the file details to verify it's being passed correctly
      console.log('File details:', {
        name: fileRecord.file_name,
        url: fileRecord.signed_url
      });
      
      onFileOpen(fileRecord);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-stone-500 text-sm">Loading files...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-stone-200 bg-white shadow-sm">
        <button
          onClick={handleNewNotebook}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs bg-stone-600 text-white rounded-md hover:bg-stone-700 transition-colors shadow-sm"
        >
          <PlusIcon className="w-4 h-4" />
          New Notebook
        </button>
      </div>

      {/* File Explorer */}
      <div className="flex-1 overflow-y-auto p-3">
        {Object.entries(fileGroups).map(([folderName, filePages]) => (
          <div key={folderName} className="mb-3">
            <div
              className="flex items-center gap-2 text-xs font-medium text-stone-700 cursor-pointer hover:bg-stone-100 p-2 rounded-md transition-colors select-none"
              onClick={() => toggleFolder(folderName)}
            >
              {expandedFolders[folderName] ? (
                <ChevronDownIcon className="w-3 h-3 text-blue-500" />
              ) : (
                <ChevronRightIcon className="w-3 h-3 text-stone-400" />
              )}
              <FolderIcon className="w-3 h-3 text-stone-500" />
              <span className="truncate">{folderName}</span>
              <span className="ml-auto text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
                {filePages.length}
              </span>
            </div>
            {expandedFolders[folderName] && (
              <div className="pl-6 mt-1 space-y-1">
                {filePages.map((filePage) => (
                  <div
                    key={`${filePage.file_name}-${filePage.page_num}`}
                    className="flex items-center gap-2 py-1.5 text-xs text-stone-600 hover:bg-stone-100 rounded-md cursor-pointer px-2 transition-colors select-none"
                    onClick={() => handleFileClick(filePage)}
                  >
                    <DocumentIcon className="w-3 h-3 text-stone-400" />
                    <span className="truncate">
                      {filePage.file_name} {filePage.page_num !== "0" ? `(Page ${parseInt(filePage.page_num) + 1})` : ''}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {Object.keys(fileGroups).length === 0 && (
          <div className="text-center py-8 text-stone-500">
            <DocumentIcon className="w-12 h-12 mx-auto mb-3 text-stone-300" />
            <p className="text-sm">No files available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileExplorer; 