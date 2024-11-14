import React, { useState } from 'react';
import { BarChart2, Info, ThumbsUp, MessageSquare, Share2, X } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';

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
  const [isAnalyzing, setIsAnalyzing] = useState({
    headline: false,
    linkDescription: false
  });
  const [scores, setScores] = useState<{
    headline: PerformanceScore | null;
    linkDescription: PerformanceScore | null;
  }>({
    headline: null,
    linkDescription: null
  });

  const handleAnalyze = async (content: string, type: 'headline' | 'linkDescription') => {
    if (!content.trim()) return;

    setIsAnalyzing(prev => ({ ...prev, [type]: true }));
    
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
      setIsAnalyzing(prev => ({ ...prev, [type]: false }));
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
          disabled={isAnalyzing[type]}
          icon={BarChart2}
        >
          {isAnalyzing[type] ? "Analyzing..." : "Analyze"}
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
    <div className="p-8 flex space-x-8">
      <div className="flex-1">
        <Card>
          <h2 className="text-2xl font-bold mb-6">Create your ad copy</h2>
          {renderInputField('headline', 'Headline')}
          {renderInputField('linkDescription', 'Link Description')}
        </Card>
      </div>

      <div className="w-96">
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Preview</h2>
            <Button variant="ghost" size="sm" icon={Info} />
          </div>

          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                <div className="font-semibold">Company Name</div>
              </div>
              
              <h3 className="font-semibold mb-2">{headline || 'Your headline will appear here'}</h3>
              <p className="text-sm text-[#303B5F] mb-4">{linkDescription || 'Your link description will appear here'}</p>
              
              <div className="flex justify-between text-sm text-[#303B5F] border-t pt-2">
                <Button variant="ghost" size="sm" icon={ThumbsUp}>Like</Button>
                <Button variant="ghost" size="sm" icon={MessageSquare}>Comment</Button>
                <Button variant="ghost" size="sm" icon={Share2}>Share</Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}