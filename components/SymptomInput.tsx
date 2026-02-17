import React, { useState, useEffect, useRef } from 'react';
import { Send, AlertCircle, Mic, Sparkles } from 'lucide-react';
import { getSymptomRefinement } from '../services/geminiService';

interface SymptomInputProps {
  onAnalyze: (symptoms: string) => void;
  isLoading: boolean;
}

const SymptomInput: React.FC<SymptomInputProps> = ({ onAnalyze, isLoading }) => {
  const [symptoms, setSymptoms] = useState('');
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  useEffect(() => {
    // Debounce AI suggestion call
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    
    if (symptoms.length > 10 && !isLoading) {
      debounceTimer.current = setTimeout(async () => {
        const hint = await getSymptomRefinement(symptoms);
        setSuggestion(hint);
      }, 1500); // Wait 1.5s after typing stops
    } else {
      setSuggestion(null);
    }

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [symptoms, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (symptoms.trim() && !isLoading) {
      onAnalyze(symptoms);
      setSymptoms('');
      setSuggestion(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8 transition-all">
      <div className="flex items-start gap-3 mb-4">
        <div className="mt-1">
          <AlertCircle className="w-5 h-5 text-teal-600" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-900">Describe Your Symptoms</h2>
          <p className="text-sm text-gray-500">
            Be as detailed as possible. Include duration, pain level (1-10), and any triggers.
          </p>
        </div>
        {suggestion && (
            <div className="hidden sm:flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-xs font-medium animate-fade-in">
                <Sparkles size={12} />
                AI Suggestion: {suggestion}
            </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <textarea
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          placeholder="e.g., 'I have had a throbbing headache on the left side for 2 days...'"
          className={`w-full h-32 sm:h-40 p-4 pr-12 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none text-gray-800 placeholder-gray-400 transition-all text-base border-gray-200`}
          disabled={isLoading}
        />
        
        {/* Voice Button (Coming Soon) */}
        <div className="absolute right-4 top-4 group">
            <button
                type="button"
                disabled
                className="bg-gray-100 text-gray-400 w-10 h-10 flex items-center justify-center rounded-full cursor-not-allowed"
                title="Voice Dictation (Coming Soon)"
            >
                <Mic size={18} />
            </button>
            <div className="absolute right-0 top-full mt-2 w-max bg-gray-800 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Coming Soon
            </div>
        </div>

        <div className="flex justify-between items-center mt-3">
           <div className="h-6">
                {suggestion && (
                    <div className="sm:hidden flex items-center gap-2 text-indigo-600 text-xs font-medium animate-fade-in">
                        <Sparkles size={12} />
                        {suggestion}
                    </div>
                )}
           </div>

          <button
            type="submit"
            disabled={!symptoms.trim() || isLoading}
            className={`
              flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all duration-200
              ${!symptoms.trim() || isLoading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-teal-700 hover:bg-teal-800 text-white shadow-md hover:shadow-lg active:transform active:scale-95'}
            `}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <span>Run Triage</span>
                <Send size={16} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SymptomInput;