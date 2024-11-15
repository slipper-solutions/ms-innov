import React, { useState } from 'react';
import { BarChart2, Info, ThumbsUp, MessageSquare, Share2, X } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { LoadingSpinner } from '../components/LoadingSpinner';
import defaultPreview from '../assets/default-preview.jpeg';

interface PerformanceScore {
  score: number;
  recommendations: string[];
  aiAnalysis: {
    keywords: string[];
    sentiment: string;
    performanceScore: number;
    engagementLevel: string;
    emojiCount: number;
  };
  improvedVersion: string | null;
}

const dynamicTags = ['company', 'salary', 'job_title', 'location', 'requirements', 'benefits'];

export function CopyPage() {
  const [headline, setHeadline] = useState('');
  const [linkDescription, setLinkDescription] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scores, setScores] = useState<{
    headline: PerformanceScore | null;
    linkDescription: PerformanceScore | null;
  }>({
    headline: null,
    linkDescription: null
  });

  const handleAnalyze = async (content: string, type: 'headline' | 'linkDescription') => {
    if (!content.trim()) return;

    setIsAnalyzing(true);
    
    const url = type === 'headline' 
      ? 'https://recommendationapi-cebwf2ccf6cwgceq.swedencentral-01.azurewebsites.net/api/Copy/headline'
      : 'https://recommendationapi-cebwf2ccf6cwgceq.swedencentral-01.azurewebsites.net/api/Copy/description';

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(content)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      setScores(prev => ({
        ...prev,
        [type]: {
          score: data.analysis.performanceScore,
          recommendations: data.suggestions,
          aiAnalysis: data.analysis,
          improvedVersion: data.improvedVersion.content
        }
      }));
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const insertDynamicTag = (tag: string, type: 'headline' | 'linkDescription') => {
    const tagToInsert = `%${tag}%`;
    if (type === 'headline') {
      setHeadline(prev => prev + tagToInsert);
    } else {
      setLinkDescription(prev => prev + tagToInsert);
    }
  };

  const renderInputField = (type: 'headline' | 'linkDescription', label: string) => (
    <div className="mb-6">
      <Input
        label={label}
        value={type === 'headline' ? headline : linkDescription}
        onChange={(e) => type === 'headline' ? setHeadline(e.target.value) : setLinkDescription(e.target.value)}
        onFocus={() => setFocusedField(type)}
        placeholder={`Enter your ${type}`}
      />
      
      {focusedField === type && (
        <div className="mt-2 flex flex-wrap gap-2">
          {dynamicTags.map(tag => (
            <button
              key={tag}
              onClick={() => insertDynamicTag(tag, type)}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      <div className="mt-2 flex justify-end">
        <Button
          onClick={() => handleAnalyze(type === 'headline' ? headline : linkDescription, type)}
          disabled={isAnalyzing}
          icon={BarChart2}
        >
          Analyze
        </Button>
      </div>

      {scores[type] && (
        <Card className="mt-4 bg-[#EBF3FF] border border-[#4472CA]">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold text-[#4472CA]">Analysis Results</h3>
            <Button
              variant="ghost"
              size="sm"
              icon={X}
              onClick={() => setScores(prev => ({ ...prev, [type]: null }))}
            />
          </div>
          
          <div className="mt-4">
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-[#4472CA]">{scores[type]?.score}%</span>
              <div className="flex-1 h-2 bg-[#B3CFFF] rounded-full">
                <div
                  className="h-full bg-[#4472CA] rounded-full transition-all"
                  style={{ width: `${scores[type]?.score}%` }}
                />
              </div>
            </div>

            {scores[type]?.recommendations.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold text-[#4472CA]">Recommendations:</h4>
                <ul className="mt-2 space-y-2">
                  {scores[type]?.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-[#4472CA]">• {rec}</li>
                  ))}
                </ul>
              </div>
            )}

            {scores[type]?.improvedVersion && (
              <div className="mt-4">
                <h4 className="font-semibold text-[#4472CA]">Improved Version:</h4>
                <p className="mt-2 text-sm text-[#4472CA]">{scores[type]?.improvedVersion}</p>
                <Button
                  className="mt-2"
                  onClick={() => {
                    if (type === 'headline') {
                      setHeadline(scores.headline?.improvedVersion || '');
                    } else {
                      setLinkDescription(scores.linkDescription?.improvedVersion || '');
                    }
                    setScores(prev => ({ ...prev, [type]: null }));
                  }}
                >
                  Apply Improved Version
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );

  return (
    <div className="grid grid-cols-[1fr,400px] gap-6">
      <div className="space-y-4">
        {renderInputField('headline', 'Headline')}
        {renderInputField('linkDescription', 'Link Description')}
      </div>

      <div className="relative">
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold bg-gradient-to-r from-[#4472CA] via-[#5E4BB6] to-[#6366F1] bg-clip-text text-transparent">Preview</h2>
            <Button variant="ghost" size="sm" icon={Info} />
          </div>

          <div className="border rounded-lg p-4 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30">
            <div className="bg-white rounded-lg shadow-[0_4px_12px_-2px_rgba(99,102,241,0.1)] hover:shadow-[0_8px_16px_-4px_rgba(99,102,241,0.15)] transition-shadow duration-300 p-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                <div className="font-semibold">Company Name</div>
              </div>
              
              <h3 className="font-semibold mb-2">{headline || 'Your headline will appear here'}</h3>
              <p className="text-sm text-[#303B5F] mb-4">{linkDescription || 'Your link description will appear here'}</p>
              
              <div 
                className="w-full aspect-[1.91/2] mb-4 rounded-lg overflow-hidden"
                style={{
                  backgroundImage: `url(${defaultPreview})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
              
              <div className="flex justify-between text-sm text-[#303B5F] border-t pt-2">
                <Button variant="ghost" size="sm" icon={ThumbsUp}>Like</Button>
                <Button variant="ghost" size="sm" icon={MessageSquare}>Comment</Button>
                <Button variant="ghost" size="sm" icon={Share2}>Share</Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {isAnalyzing && (
        <div className="fixed inset-0 bg-white/50 flex items-center justify-center z-50">
          <LoadingSpinner type="copy" className="scale-110" />
        </div>
      )}
    </div>
  );
}