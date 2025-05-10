'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setTranscription(null);
    setError(null);
  };

  const handleTranscribe = async () => {
    if (!file) {
      setError('Please upload an audio file first');
      return;
    }

    setIsTranscribing(true);
    setError(null);
    
    try {
      // In a real implementation, you would send the file to your backend
      const formData = new FormData();
      formData.append('file', file);
      
      //This is commented out as per the request to not implement backend
      console.log("Making request to backend")
      const response = await fetch(`${process.env.NEXT_PUBLIC_FASTAPI_URL}/transcribe`, {
        method: 'POST',
        body: formData,
      });


      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Received data:", data);
      setIsTranscribing(false);
      setTranscription(data.transcription);
      
      
    } catch (error) {
      console.error('Error during transcription:', error);
      setError('Failed to transcribe the audio. Please try again.');
      setIsTranscribing(false);
    }
  };

  const handleDownload = () => {
    if (!transcription) return;
    
    const element = document.createElement('a');
    const file = new Blob([transcription], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = 'transcription.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen flex flex-col items-center pb-12 font-[family-name:var(--font-geist-sans)]">
      {/* Header */}
      <header className="w-full py-4 px-6 md:px-12 flex justify-between items-center border-b border-black/[.08] dark:border-white/[.08]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" fill="white"/>
              <path d="M19 12C19 12 16 18 12 18C8 18 5 12 5 12C5 12 8 6 12 6C16 6 19 12 19 12Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-xl font-semibold">Audscript</h1>
        </div>
        <a 
          href="https://github.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-colors"
        >
          GitHub
        </a>
      </header>
      
      {/* Main content */}
      <main className="w-full max-w-3xl mx-auto mt-10 px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Transform Audio to Text</h2>
          <p className="text-black/70 dark:text-white/70 max-w-xl mx-auto">
            Upload your audio file, hit transcribe, and get accurate text in seconds for call center audio.
          </p>
        </div>

        <div className="bg-white dark:bg-[#111] rounded-xl shadow-sm border border-black/[.08] dark:border-white/[.08] p-6 md:p-8">
          {/* File Upload Area */}
          <div 
            className={`border-2 border-dashed rounded-lg p-8 mb-6 flex flex-col items-center justify-center cursor-pointer transition-all 
            ${file ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/10' : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'}`}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept="audio/*"
              onChange={handleFileChange}
            />
            
            {file ? (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 16L15 16" stroke="#2563EB" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M12 7L12 13" stroke="#2563EB" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="#2563EB" strokeWidth="2"/>
                  </svg>
                </div>
                <p className="font-medium text-blue-600 dark:text-blue-400">{file.name}</p>
                <span className="text-sm text-black/50 dark:text-white/50 mt-1">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </span>
                <button 
                  className="mt-3 text-xs text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                >
                  Change file
                </button>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 15.5V8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8.5 12L12 8.5L15.5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="font-medium text-lg mb-1">Upload your audio file</h3>
                <p className="text-black/50 dark:text-white/50 text-sm mb-2">Drag and drop or click to browse</p>
                <span className="text-xs text-black/40 dark:text-white/40">
                  Supports MP3, WAV, M4A, FLAC (max 500MB)
                </span>
              </>
            )}
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Transcribe Button */}
          <button
            onClick={handleTranscribe}
            disabled={!file || isTranscribing}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
              !file || isTranscribing
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isTranscribing ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Transcribing...</span>
              </div>
            ) : (
              'Transcribe Audio'
            )}
          </button>

          {/* Transcription Result */}
          {transcription && (
            <div className="mt-8 border border-black/[.08] dark:border-white/[.08] rounded-lg bg-gray-50 dark:bg-gray-900">
              <div className="p-4 border-b border-black/[.08] dark:border-white/[.08] flex justify-between items-center">
                <h3 className="font-medium">Transcription Result</h3>
                <button
                  onClick={handleDownload}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Download
                </button>
              </div>
              <div className="p-4 max-h-60 overflow-y-auto">
                <p className="text-black/80 dark:text-white/80 whitespace-pre-line">
                  {transcription}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="mt-auto pt-12 w-full">
        <div className="max-w-3xl mx-auto px-6 text-center text-sm text-black/50 dark:text-white/50">
          <p>DomuAI demo</p>
          <p className="mt-1">Simple, fast, and accurate audio transcription.</p>
        </div>
      </footer>
    </div>
  );
}
