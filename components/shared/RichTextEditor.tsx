import React from 'react';
import dynamic from 'next/dynamic';

const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => <div className="h-40 w-full flex items-center justify-center bg-gray-950 border border-gray-800 rounded-xl text-gray-500">Loading editor...</div>,
});

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const modules = {
    toolbar: [
      [
        // { 'header': [1, 2, 3, false] },
        { 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image', 'video', 'clean']
    ],
  };

  return (
    <div className={`rich-text-container ${className || ''}`}>
      <ReactQuill 
        theme="snow" 
        value={value} 
        onChange={onChange} 
        modules={modules}
        placeholder={placeholder || 'Write your content here...'}
        className="bg-gray-950 text-white rounded-xl overflow-hidden border border-gray-800"
      />
      <style jsx global>{`
        .rich-text-container .ql-toolbar {
          background-color: #111827;
          border-color: #1f2937;
          border-top-left-radius: 0.75rem;
          border-top-right-radius: 0.75rem;
        }
        .rich-text-container .ql-container {
          border-color: #1f2937;
          border-bottom-left-radius: 0.75rem;
          border-bottom-right-radius: 0.75rem;
          min-height: 200px;
          font-size: 1rem;
        }
        .rich-text-container .ql-editor {
          min-height: 200px;
        }
        .rich-text-container .ql-stroke {
          stroke: #9ca3af;
        }
        .rich-text-container .ql-fill {
          fill: #9ca3af;
        }
        .rich-text-container .ql-picker {
          color: #9ca3af;
        }
        .rich-text-container .ql-picker-options {
          background-color: #1f2937;
          border-color: #374151;
        }
      `}</style>
    </div>
  );
}
