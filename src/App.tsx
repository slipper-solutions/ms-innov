import React, { useState } from 'react';
import { Copy, Image } from 'lucide-react';
import { CopyPage } from './pages/CopyPage';
import { ImagePage } from './pages/ImagePage';
import { WKLogo } from './components/WKLogo';

function App() {
  const [activeTab, setActiveTab] = useState<'copy' | 'image'>('copy');

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#F8F9FD] to-[#F0F2FF] font-['Poppins',sans-serif] text-[#303B5F]">
      {/* Sidebar - updated button styles */}
      <div className="w-16 bg-[#F8F9FD] border-r border-gradient-to-b from-blue-100/50 to-purple-100/50 shadow-[2px_0_12px_-2px_rgba(99,102,241,0.1)] flex flex-col items-center py-4 space-y-4 relative z-10">
        <button
          onClick={() => setActiveTab('copy')}
          className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
            activeTab === 'copy' 
              ? 'bg-gradient-to-br from-[#4472CA] to-[#6366F1] text-white' 
              : 'bg-gradient-to-br from-gray-100 to-gray-100 hover:from-gray-200 hover:to-purple-100/30 text-gray-600'
          }`}
        >
          <Copy className="w-6 h-6" />
        </button>
        <button
          onClick={() => setActiveTab('image')}
          className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
            activeTab === 'image' 
              ? 'bg-gradient-to-br from-[#4472CA] to-[#6366F1] text-white' 
              : 'bg-gradient-to-br from-gray-100 to-gray-100 hover:from-gray-200 hover:to-purple-100/30 text-gray-600'
          }`}
        >
          <Image className="w-6 h-6" />
        </button>
      </div>

      {/* Main content - added headers */}
      <div className="flex-1">
        <div className="p-7 bg-[#F8F9FD] border-b border-gradient-to-r from-blue-100/50 to-purple-100/50 shadow-md relative z-[5]">
          <WKLogo />
        </div>
        
        <div className="p-6 relative">
          <h1 className="text-2xl font-semibold mb-6 text-[#303B5F]">
            {activeTab === 'copy' ? 'Copy Analysis' : 'Image Analysis'}
          </h1>
          {activeTab === 'copy' ? <CopyPage /> : <ImagePage />}
        </div>
      </div>
    </div>
  );
}

export default App;