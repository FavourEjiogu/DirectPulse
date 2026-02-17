import React from 'react';
import { CheckCircle2, ShieldAlert, User, Activity, AlertOctagon } from 'lucide-react';
import { TriageResponse } from '../types';

interface AnalysisResultProps {
  result: TriageResponse;
  compact?: boolean;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ result, compact = false }) => {
  const isEmergency = result.emergency_override;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Emergency Banner */}
      {isEmergency && (
        <div className="bg-red-50 border-l-4 border-red-600 p-6 rounded-r-xl shadow-sm animate-pulse-soft">
          <div className="flex items-start gap-4">
            <div className="bg-red-100 p-2 rounded-full text-red-600">
              <AlertOctagon size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-red-800 mb-1">EMERGENCY OVERRIDE TRIGGERED</h3>
              <p className="text-red-700 font-medium text-lg leading-relaxed">
                {result.emergency_message || "Immediate physical emergency care required."}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Routing Card */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
             <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                <User size={18} className="text-gray-500" />
                <h3 className="font-semibold text-gray-800">Patient Summary</h3>
             </div>
             <div className="p-6">
               <p className="text-gray-700 leading-relaxed text-lg">
                 {result.patient_summary}
               </p>
             </div>
          </div>

           <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
             <div className="bg-teal-50 px-6 py-4 border-b border-teal-100 flex items-center gap-2">
                <Activity size={18} className="text-teal-600" />
                <h3 className="font-semibold text-gray-800">Preliminary Diagnostic Analysis</h3>
             </div>
             <div className="p-6">
               <ul className="space-y-3">
                 {result.ai_preliminary_analysis.map((item, idx) => (
                   <li key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                     <div className="mt-1 min-w-[20px]">
                       <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold">
                         {idx + 1}
                       </div>
                     </div>
                     <span className="text-gray-800 font-medium">{item}</span>
                   </li>
                 ))}
               </ul>
             </div>
          </div>
        </div>

        {/* Sidebar: Routing & Error Checks */}
        <div className="space-y-6">
          {/* Recommended Department */}
          <div className={`rounded-2xl shadow-sm border overflow-hidden ${isEmergency ? 'bg-red-50 border-red-200' : 'bg-teal-800 border-teal-900'}`}>
            <div className="p-6 text-center">
              <p className={`text-sm font-medium uppercase tracking-wider mb-2 ${isEmergency ? 'text-red-800' : 'text-teal-200'}`}>
                Recommended Routing
              </p>
              <h2 className={`text-2xl font-bold ${isEmergency ? 'text-red-900' : 'text-white'}`}>
                {result.recommended_department}
              </h2>
            </div>
          </div>

          {/* Human Error Checks - Gold Bordered Card */}
          <div className="bg-white rounded-2xl shadow-sm border-2 border-gold-400 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-12 h-12 bg-gold-400/10 rounded-bl-full"></div>
            <div className="bg-gold-50 px-5 py-3 border-b border-gold-200 flex items-center gap-2 text-gold-600">
               <ShieldAlert size={18} />
               <h3 className="font-bold text-sm uppercase tracking-wide text-gray-800">Human Error Checks</h3>
            </div>
            <div className="p-5">
              <p className="text-xs text-gray-500 mb-4 font-medium uppercase tracking-wider">
                Rule out the following:
              </p>
              <ul className="space-y-3">
                {result.human_error_checks.map((check, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-800">
                    <CheckCircle2 size={16} className="text-gold-500 mt-0.5 min-w-[16px]" />
                    <span>{check}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResult;