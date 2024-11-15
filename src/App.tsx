import React, { useState } from 'react';
import { Copy, Image } from 'lucide-react';
import { CopyPage } from './pages/CopyPage';
import { ImagePage } from './pages/ImagePage';
import { WKLogo } from './components/WKLogo';

function App() {
  const [activeTab, setActiveTab] = useState<'copy' | 'image'>('copy');

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#F8F9FD] to-[#F0F2FF] font-['Poppins',sans-serif] text-[#303B5F]">
      {/* Sidebar */}
      <div className="w-16 bg-[#F8F9FD] border-r border-gradient-to-b from-blue-100/50 to-purple-100/50 shadow-[2px_0_12px_-2px_rgba(99,102,241,0.1)] flex flex-col items-center py-4 space-y-4 relative z-10">
        <button
          onClick={() => setActiveTab('copy')}
          className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
            activeTab === 'copy' ? 'bg-[#4472CA] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Copy className="w-6 h-6" />
        </button>
        <button
          onClick={() => setActiveTab('image')}
          className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
            activeTab === 'image' ? 'bg-[#4472CA] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Image className="w-6 h-6" />
        </button>
      </div>

      {/* Main content - adjusted header height and background */}
      <div className="flex-1">
        <div className="p-7 bg-[#F8F9FD] border-b border-gradient-to-r from-blue-100/50 to-purple-100/50 shadow-md relative z-[5]">
          <WKLogo className="h-7 w-auto" />
        </div>
        
        <div className="p-6 relative">
          {activeTab === 'copy' ? <CopyPage /> : <ImagePage />}
        </div>
      </div>
    </div>
  );
}

export default App;