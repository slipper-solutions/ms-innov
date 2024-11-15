import React, { useState, useRef } from 'react';
import { Upload, X, Tag, Sparkle, BarChart3, Camera, ArrowUpRight } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface DenseCaption {
  text: string;
  confidence: number;
}

interface UploadedImage {
  file: File;
  preview: string;
  score?: number;
  tags?: ImageTag[];
  captions?: DenseCaption[];
  suggestedPrompt?: string;
  generatedImageUrl?: string;
}

interface ImageTag {
  name: string;
  confidence: number;
}

interface ImageAnalysis {
  score: number;
  tags: ImageTag[];
  captions: DenseCaption[];
  suggestedPrompt?: string;
  generatedImageUrl?: string;
}

// Add a new component for scrollable content with max height
const ScrollableContent = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`overflow-y-auto pr-2 ${className}`} style={{ maxHeight: '280px' }}>
    {children}
  </div>
);

// Add loading states for each API call
interface LoadingStates {
  score: boolean;
  tags: boolean;
  captions: boolean;
  prompt: boolean;
  generation: boolean;
}

// Update the interface to match the correct API response
interface ScoreAndPromptResponse {
  score: number;
  imageGenerationPrompt: string;
}

// Add interface for the image generation response
interface ImageGenerationResponse {
  url: string;
}

export function ImagePage() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    score: false,
    tags: false,
    captions: false,
    prompt: false,
    generation: false,
  });

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

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Update the analyzeImage function with the correct endpoint
  const analyzeImage = async (formData: FormData): Promise<ImageAnalysis> => {
    const result: Partial<ImageAnalysis> = {};
    
    try {
      setLoadingStates(prev => ({ ...prev, score: true, prompt: true }));
      console.log('Requesting score and prompt analysis...');
      const scoreResponse = await fetch('https://recommendationapi-cebwf2ccf6cwgceq.swedencentral-01.azurewebsites.net/api/ImageRecommendation/analyze-file', {
        method: 'POST',
        body: formData,
      });

      if (!scoreResponse.ok) {
        throw new Error(`Score API error: ${scoreResponse.status} ${scoreResponse.statusText}`);
      }

      const scoreData: ScoreAndPromptResponse = await scoreResponse.json();
      console.log('Score and prompt response:', scoreData); // Debug log
      
      result.score = scoreData.score * 100;
      result.suggestedPrompt = scoreData.imageGenerationPrompt;

      setLoadingStates(prev => ({ ...prev, tags: true }));
      console.log('Requesting tags analysis...');
      const tagsResponse = await fetch('https://recommendationapi-cebwf2ccf6cwgceq.swedencentral-01.azurewebsites.net/api/ImageAnalysis/tags-file', {
        method: 'POST',
        body: formData,
      });

      if (!tagsResponse.ok) {
        throw new Error(`Tags API error: ${tagsResponse.status} ${tagsResponse.statusText}`);
      }

      const tagsData = await tagsResponse.json();
      result.tags = tagsData.values;

      setLoadingStates(prev => ({ ...prev, captions: true }));
      console.log('Requesting dense captions...');
      const captionsResponse = await fetch('https://recommendationapi-cebwf2ccf6cwgceq.swedencentral-01.azurewebsites.net/api/ImageAnalysis/dense-captions-file', {
        method: 'POST',
        body: formData,
      });

      if (!captionsResponse.ok) {
        throw new Error(`Captions API error: ${captionsResponse.status} ${captionsResponse.statusText}`);
      }

      const captionsData = await captionsResponse.json();
      result.captions = Array.isArray(captionsData) ? captionsData : captionsData.values;
    } catch (error) {
      console.error('Analysis error:', error);
      setError(error instanceof Error ? error.message : 'Failed to analyze image');
    } finally {
      setLoadingStates(prev => ({ ...prev, score: false, prompt: false, tags: false, captions: false }));
    }

    // Return the results, with default values for missing data
    return {
      score: result.score ?? 0,
      tags: result.tags ?? [],
      captions: result.captions ?? [],
      suggestedPrompt: result.suggestedPrompt
    };
  };

  const handleFiles = async (files: FileList) => {
    setIsAnalyzing(true);
    setError(null);
    
    const file = files[0];
    if (file && file.type.startsWith('image/')) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const { score, tags, captions, suggestedPrompt } = await analyzeImage(formData);
        
        console.log('Analysis complete:', { score, tags, captions, suggestedPrompt });
        
        setImages([{
          file,
          preview: URL.createObjectURL(file),
          score: score,
          tags: Array.isArray(tags) ? tags : tags.values,
          captions: captions,
          suggestedPrompt: suggestedPrompt
        }]);
      } catch (error) {
        console.error('Analysis error:', error);
        setError(error instanceof Error ? error.message : 'Failed to analyze image');
      }
    }
    
    setIsAnalyzing(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const renderConfidenceBar = (confidence: number) => {
    const width = confidence * 100;
    return (
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div 
          className="bg-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${width}%` }}
        />
      </div>
    );
  };

  const currentImage = images[0];

  // Update the cards to be more compact and add full analysis
  const renderTagsCard = () => (
    <Card>
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Tag className="w-5 h-5 text-blue-500" />
        </div>
        <h3 className="font-semibold text-gray-900">Detected Elements</h3>
      </div>
      
      {loadingStates.tags && <LoadingSpinner type="image" />}
      {Array.isArray(currentImage.tags) && currentImage.tags
        .filter(tag => tag.confidence > 0.7)
        .sort((a, b) => b.confidence - a.confidence)
        .map((tag, index) => (
          <div key={index} className="space-y-0.5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700 font-medium capitalize">{tag.name}</span>
              <span className="text-gray-500 ml-2">{(tag.confidence * 100).toFixed(1)}%</span>
            </div>
            {renderConfidenceBar(tag.confidence)}
          </div>
        ))}
    </Card>
  );

  const renderCaptionsCard = () => (
    <Card>
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Sparkle className="w-5 h-5 text-blue-500" />
        </div>
        <h3 className="font-semibold text-gray-900">Dense Captions</h3>
      </div>
      
      {loadingStates.captions && <LoadingSpinner type="image" />}
      {Array.isArray(currentImage.captions) && currentImage.captions
        .filter(caption => caption.confidence > 0.7)
        .sort((a, b) => b.confidence - a.confidence)
        .map((caption, index) => (
          <div key={index} className="space-y-0.5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700 font-medium">{caption.text}</span>
              <span className="text-gray-500 ml-2">{(caption.confidence * 100).toFixed(1)}%</span>
            </div>
            {renderConfidenceBar(caption.confidence)}
          </div>
        ))}
    </Card>
  );

  // Add a function to handle image generation
  const handleGenerateImage = async (prompt: string) => {
    setLoadingStates(prev => ({ ...prev, generation: true }));

    try {
      const generationResponse = await fetch('https://recommendationapi-cebwf2ccf6cwgceq.swedencentral-01.azurewebsites.net/api/ImageRecommendation/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': '*/*'
        },
        body: JSON.stringify(prompt)
      });

      if (!generationResponse.ok) {
        throw new Error(`Generation API error: ${generationResponse.status} ${generationResponse.statusText}`);
      }

      const generationData: ImageGenerationResponse = await generationResponse.json();
      
      setImages(prev => [{
        ...prev[0],
        generatedImageUrl: generationData.url
      }]);

    } catch (error) {
      console.error('Image generation failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate image');
    } finally {
      setLoadingStates(prev => ({ ...prev, generation: false }));
    }
  };

  // Update the recommendations card to include the new button and loading states
  const renderRecommendationsCard = () => (
    <Card>
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Sparkle className="w-5 h-5 text-blue-500" />
        </div>
        <h3 className="font-semibold text-gray-900">AI Recommendations</h3>
      </div>
      
      <div className="space-y-4">
        {loadingStates.prompt && <LoadingSpinner type="copy" />}
        {currentImage.suggestedPrompt ? (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Suggested Prompt</h4>
            <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
              {currentImage.suggestedPrompt}
            </p>
            {!loadingStates.generation && !currentImage.generatedImageUrl && (
              <Button
                onClick={() => handleGenerateImage(currentImage.suggestedPrompt!)}
                className="mt-2 w-full"
                icon={Sparkle}
              >
                Generate AI Alternative
              </Button>
            )}
          </div>
        ) : (
          <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg">
            No recommendations available for this image
          </div>
        )}
        
        {loadingStates.generation && <LoadingSpinner type="generation" />}
        {currentImage.generatedImageUrl && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">AI Generated Alternative</h4>
            <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-50">
              <img
                src={currentImage.generatedImageUrl}
                alt="AI Generated"
                className="w-full h-full object-contain"
              />
            </div>
            <a 
              href={currentImage.generatedImageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1"
            >
              View Full Size
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>
    </Card>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {!currentImage ? (
        <Card>
          <div 
            className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-colors
              ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {isAnalyzing ? (
              <div className="flex justify-center items-center min-h-[200px]">
                <LoadingSpinner type="image" className="scale-110" />
              </div>
            ) : (
              <>
                <div className="w-16 h-16 mx-auto bg-gray-50 rounded-full flex items-center justify-center">
                  <Camera className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Upload your image</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Drag and drop your image here, or{' '}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-500 hover:text-blue-600 font-medium"
                  >
                    browse
                  </button>
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Supported formats: JPG, PNG, GIF (max 10MB)
                </p>
              </>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-50 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-900">Image Analysis</h2>
            <Button
              variant="outline"
              onClick={() => setImages([])}
              icon={Upload}
            >
              Upload New Image
            </Button>
          </div>

          <div className="grid grid-cols-12 gap-6">
            {/* Image Preview */}
            <div className="col-span-5">
              <Card>
                <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-50">
                  <img
                    src={currentImage.preview}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                </div>
              </Card>
            </div>

            {/* Analysis Results */}
            <div className="col-span-7 grid grid-cols-2 gap-6">
              {/* Score Card - Full width */}
              <div className="col-span-2">
                <Card>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <BarChart3 className="w-5 h-5 text-blue-500" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Performance Score</h3>
                    </div>
                    <div className="text-3xl font-bold text-blue-600">
                      {currentImage.score?.toFixed(1)}%
                    </div>
                  </div>
                  {renderConfidenceBar(currentImage.score! / 100)}
                </Card>
              </div>

              {/* Tags Card - Half width */}
              <div className="col-span-1">
                {renderTagsCard()}
              </div>

              {/* Captions Card - Half width */}
              <div className="col-span-1">
                {renderCaptionsCard()}
              </div>

              {/* Recommendations Card - Full width */}
              <div className="col-span-2">
                {renderRecommendationsCard()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}