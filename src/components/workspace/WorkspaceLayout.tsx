import React, { useState, useRef, useEffect } from 'react';
import FileExplorer from './FileExplorer';
import Editor, { EditorRef } from './Editor';
import { FileRecord } from '../../types/file.types';

const WorkspaceLayout: React.FC = () => {
  // State for section widths
  const [leftWidth, setLeftWidth] = useState(256); // 16rem (w-64)
  const [rightWidth, setRightWidth] = useState(320); // 20rem (w-80)
  
  // Refs for drag handling
  const leftResizerRef = useRef<HTMLDivElement>(null);
  const rightResizerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<EditorRef>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startLeftWidth = useRef(0);
  const startRightWidth = useRef(0);
  
  // Function to handle file opening
  const handleFileOpen = (file: FileRecord) => {
    console.log('Opening file:', file.file_name);
    
    // Check if the file has a signed_url
    if (!file.signed_url) {
      console.error('File does not have a signed_url:', file.file_name);
      return;
    }
    
    // Open the file in a tab using the Editor component
    if (editorRef.current) {
      editorRef.current.openFileInTab(file);
    }
  };

  // Mouse event handlers for left resizer
  const handleLeftResizerMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.clientX;
    startLeftWidth.current = leftWidth;
    
    document.addEventListener('mousemove', handleLeftResizerMouseMove);
    document.addEventListener('mouseup', handleLeftResizerMouseUp);
  };

  const handleLeftResizerMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return;
    
    const deltaX = e.clientX - startX.current;
    const newWidth = Math.max(200, Math.min(600, startLeftWidth.current + deltaX));
    
    setLeftWidth(newWidth);
  };

  const handleLeftResizerMouseUp = () => {
    isDragging.current = false;
    document.removeEventListener('mousemove', handleLeftResizerMouseMove);
    document.removeEventListener('mouseup', handleLeftResizerMouseUp);
  };

  // Mouse event handlers for right resizer
  const handleRightResizerMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.clientX;
    startRightWidth.current = rightWidth;
    
    document.addEventListener('mousemove', handleRightResizerMouseMove);
    document.addEventListener('mouseup', handleRightResizerMouseUp);
  };

  const handleRightResizerMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return;
    
    const deltaX = startX.current - e.clientX;
    const newWidth = Math.max(200, Math.min(600, startRightWidth.current + deltaX));
    
    setRightWidth(newWidth);
  };

  const handleRightResizerMouseUp = () => {
    isDragging.current = false;
    document.removeEventListener('mousemove', handleRightResizerMouseMove);
    document.removeEventListener('mouseup', handleRightResizerMouseUp);
  };

  // Clean up event listeners on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleLeftResizerMouseMove);
      document.removeEventListener('mouseup', handleLeftResizerMouseUp);
      document.removeEventListener('mousemove', handleRightResizerMouseMove);
      document.removeEventListener('mouseup', handleRightResizerMouseUp);
    };
  }, []);

  return (
    <div className="flex h-screen bg-stone-100">
      {/* Left Sidebar - File Explorer */}
      <div 
        className="bg-white border-r border-stone-200 flex-shrink-0"
        style={{ width: `${leftWidth}px` }}
      >
        <FileExplorer onFileOpen={handleFileOpen} />
      </div>

      {/* Left Resizer */}
      <div
        ref={leftResizerRef}
        className="w-1 bg-stone-200 hover:bg-blue-500 cursor-col-resize flex-shrink-0"
        onMouseDown={handleLeftResizerMouseDown}
      />

      {/* Middle Section - Editor */}
      <div className="flex-1 flex flex-col">
        <Editor ref={editorRef} />
      </div>

      {/* Right Resizer */}
      <div
        ref={rightResizerRef}
        className="w-1 bg-stone-200 hover:bg-blue-500 cursor-col-resize flex-shrink-0"
        onMouseDown={handleRightResizerMouseDown}
      />

      {/* Right Sidebar - Chat Section */}
      <div 
        className="bg-white border-l border-stone-200 flex-shrink-0"
        style={{ width: `${rightWidth}px` }}
      >
        {/* Chat section */}
      </div>
    </div>
  );
};

export default WorkspaceLayout; 