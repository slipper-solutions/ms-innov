import React, { useState } from 'react';
import { Copy, Image } from 'lucide-react';
import { CopyPage } from './pages/CopyPage';
import { ImagePage } from './pages/ImagePage';
import { WKLogo } from './components/WKLogo';

function App() {
  const [activeTab, setActiveTab] = useState<'copy' | 'image'>('copy');

  return (
    <div className="flex min-h-screen bg-[#F6F7FA] font-['Poppins',sans-serif] text-[#303B5F]">
      {/* Sidebar */}
      <div className="w-16 bg-white border-r flex flex-col items-center py-4 space-y-4">
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

      {/* Main content */}
      <div className="flex-1">
        {/* Header with logo */}
        <div className="p-6 bg-white border-b">
          <WKLogo className="h-6 w-auto" />
        </div>
        
        {/* Page content */}
        <div className="p-6">
          {activeTab === 'copy' ? <CopyPage /> : <ImagePage />}
        </div>
      </div>
    </div>
  );
}

export default App;