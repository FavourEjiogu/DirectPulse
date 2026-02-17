import React, { useState } from 'react';
import { Send, AlertCircle } from 'lucide-react';

interface SymptomInputProps {
  onAnalyze: (symptoms: string) => void;
  isLoading: boolean;
}

const SymptomInput: React.FC<SymptomInputProps> = ({ onAnalyze, isLoading }) => {
  const [symptoms, setSymptoms] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (symptoms.trim() && !isLoading) {
      onAnalyze(symptoms);
      setSymptoms(''); // Clear input after send
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex items-start gap-3 mb-4">
        <div className="mt-1">
          <AlertCircle className="w-5 h-5 text-teal-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Describe Your Symptoms</h2>
          <p className="text-sm text-gray-500">
            Please provide detailed information including age and duration of symptoms.
            <span className="block mt-1 text-xs text-gray-400 italic">Example: "45-year-old male presenting with dull headache for 3 days, sensitivity to light, and slight nausea."</span>
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <textarea
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          placeholder="Describe symptoms here..."
          className="w-full h-32 sm:h-40 p-4 pr-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none text-gray-800 placeholder-gray-400 transition-all text-base"
          disabled={isLoading}
        />
        <div className="flex justify-end mt-3">
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