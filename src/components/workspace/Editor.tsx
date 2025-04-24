import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import PDFViewer from '../PDFViewer/PDFViewer';
import { FileRecord } from '../../types/file.types';

interface Tab {
  id: string;
  title: string;
  type: 'notebook' | 'file';
  content?: string;
  file?: FileRecord;
}

interface EditorProps {
  onFileOpen?: (file: FileRecord) => void;
}

export interface EditorRef {
  openFileInTab: (file: FileRecord) => void;
}

const Editor = forwardRef<EditorRef, EditorProps>((props, ref) => {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [pdfViewer, setPdfViewer] = useState(false);
  const [currentPdfFile, setCurrentPdfFile] = useState<FileRecord | null>(null);

  // Function to open a file in a new tab
  const openFileInTab = (file: FileRecord) => {
    console.log('Opening file in tab:', file.file_name);
    
    // Create a unique identifier for the file using both file_id and file_name
    const fileIdentifier = `${file.file_id}-${file.file_name}`;
    
    // Check if file is already open in a tab
    const existingTab = tabs.find(tab => {
      if (!tab.file) return false;
      const tabIdentifier = `${tab.file.file_id}-${tab.file.file_name}`;
      return tabIdentifier === fileIdentifier;
    });
    
    if (existingTab) {
      // If file is already open, just activate that tab
      handleTabClick(existingTab.id);
    } else {
      // Create a new tab for the file
      const newTab: Tab = {
        id: `file-${fileIdentifier}`,
        title: file.file_name,
        type: 'file',
        file: file
      };
      
      // Add the new tab and activate it
      setTabs(prevTabs => [...prevTabs, newTab]);
      setActiveTab(newTab.id);
      
      // If it's a PDF file, show the PDF viewer
      if (file.file_name.toLowerCase().endsWith('.pdf')) {
        setCurrentPdfFile(file);
        setPdfViewer(true);
      }
    }
  };

  // Expose the openFileInTab method to parent components
  useImperativeHandle(ref, () => ({
    openFileInTab
  }));

  const handleTabClick = (tabId: string) => {
    console.log('Tab clicked:', tabId);
    setActiveTab(tabId);
    const tab = tabs.find((t) => t.id === tabId);
    
    if (tab) {
      if (tab.type === 'notebook') {
        setContent(tab.content || '');
        setPdfViewer(false);
        setCurrentPdfFile(null);
      } else if (tab.type === 'file' && tab.file) {
        if (tab.file.file_name.toLowerCase().endsWith('.pdf')) {
          setCurrentPdfFile(tab.file);
          setPdfViewer(true);
          setContent('');
        } else {
          // For other file types, show content if available
          setContent(tab.content || '');
          setPdfViewer(false);
          setCurrentPdfFile(null);
        }
      }
    }
  };

  const handleCloseTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTabs((prevTabs) => prevTabs.filter((tab) => tab.id !== tabId));
    
    if (activeTab === tabId) {
      const remainingTabs = tabs.filter((tab) => tab.id !== tabId);
      
      if (remainingTabs.length > 0) {
        // Activate the next tab
        setActiveTab(remainingTabs[0].id);
        handleTabClick(remainingTabs[0].id);
      } else {
        // No tabs left
        setActiveTab(null);
        setContent('');
        setPdfViewer(false);
        setCurrentPdfFile(null);
      }
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    if (activeTab) {
      setTabs((prevTabs) =>
        prevTabs.map((tab) =>
          tab.id === activeTab ? { ...tab, content: e.target.value } : tab
        )
      );
    }
  };

  const createNewNotebook = () => {
    const newTab: Tab = {
      id: `notebook-${Date.now()}`,
      title: `Notebook ${tabs.length + 1}`,
      type: 'notebook',
      content: ''
    };
    
    setTabs(prevTabs => [...prevTabs, newTab]);
    setActiveTab(newTab.id);
    setContent('');
    setPdfViewer(false);
    setCurrentPdfFile(null);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Tab Navigation */}
      <div className="flex border-stone-200 bg-white overflow-x-auto">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`flex items-center px-3 py-2 border-r border-stone-200 cursor-pointer min-w-[120px] max-w-[200px] ${
              activeTab === tab.id ? 'bg-stone-100' : 'hover:bg-stone-50'
            }`}
            onClick={() => handleTabClick(tab.id)}
          >
            <span className="text-xs truncate flex-1">{tab.title}</span>
            <button
              className="ml-1 p-1 hover:bg-stone-200 rounded"
              onClick={(e) => handleCloseTab(tab.id, e)}
            >
              <XMarkIcon className="w-3 h-3" />
            </button>
          </div>
        ))}
        
        {/* New Tab Button */}
        <button
          onClick={createNewNotebook}
          className="px-3 py-2 text-xs text-stone-600 hover:bg-stone-50"
        >
          + New
        </button>
      </div>

      {/* Editor Area */}
      <div className="flex-1 p-4 relative">
        {activeTab ? (
          pdfViewer && currentPdfFile ? (
            <PDFViewer 
              fileUrl={currentPdfFile.signed_url} 
              pdfTitle={currentPdfFile.file_name}
              pdfViewer={pdfViewer}
              setPdfViewer={setPdfViewer}
            />
          ) : (
            <textarea
              value={content}
              onChange={handleContentChange}
              className="w-full h-full p-4 resize-none focus:outline-none text-sm"
              placeholder="Start writing..."
            />
          )
        ) : (
          <div className="h-full flex items-center justify-center text-stone-400 text-sm">
            Select a file or create a new notebook to start
          </div>
        )}
      </div>
    </div>
  );
});

export default Editor; 