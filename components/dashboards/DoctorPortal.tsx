import React, { useState, useEffect } from 'react';
import { TriageRequest, ChatMessage, UserRole, SeverityLevel } from '../../types';
import { appStore } from '../../services/store';
import AnalysisResult from '../AnalysisResult';
import { User, ClipboardList, Stethoscope, ArrowRight, MessageSquare, Save, Edit2, X, Send, Phone, Clock, FileText } from 'lucide-react';

interface DoctorPortalProps {
    role: UserRole;
}

const DoctorPortal: React.FC<DoctorPortalProps> = ({ role }) => {
  const [queue, setQueue] = useState<TriageRequest[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<TriageRequest | null>(null);
  const [patientHistory, setPatientHistory] = useState<TriageRequest[]>([]);
  
  // Filters
  const [filter, setFilter] = useState<'all' | 'pending_triage' | 'triaged' | 'prescribed'>('all');
  const [severityFilter, setSeverityFilter] = useState<'All' | 'Low' | 'Medium' | 'High'>('All');
  
  // Local states
  const [editingSymptoms, setEditingSymptoms] = useState(false);
  const [editingSummary, setEditingSummary] = useState(false);
  const [symptomText, setSymptomText] = useState('');
  const [summaryText, setSummaryText] = useState('');
  const [notes, setNotes] = useState('');
  
  // Chat state
  const [chatMsg, setChatMsg] = useState('');

  useEffect(() => {
    const updateQueue = () => setQueue(appStore.getRequests(role));
    updateQueue();
    const interval = setInterval(updateQueue, 3000);
    return () => clearInterval(interval);
  }, [role]);

  useEffect(() => {
      // Sync local state when selected patient changes or queue updates
      if (selectedPatient) {
          const freshData = queue.find(q => q.id === selectedPatient.id);
          if (freshData) {
              if (freshData !== selectedPatient) {
                 setSelectedPatient(freshData); // Update ref
              }
              // Only update text fields if not currently editing to avoid overwriting user input
              if (!editingSymptoms) setSymptomText(freshData.symptoms);
              if (!editingSummary) setSummaryText(freshData.aiAnalysis?.patient_summary || '');
              
              // Always sync notes from store if it changes remotely (or initialize)
              // We only set it if the user hasn't typed anything yet or if we just switched patients.
              // For simplicity, we assume one doctor editing at a time.
              if (freshData.doctorNotes !== undefined && notes === '') {
                 setNotes(freshData.doctorNotes);
              }
          }
          
          // Fetch History
          const history = appStore.getPatientHistory(selectedPatient.patientId).filter(r => r.id !== selectedPatient.id);
          setPatientHistory(history);
      } else {
          setNotes('');
          setSymptomText('');
          setSummaryText('');
          setPatientHistory([]);
      }
  }, [queue, selectedPatient, editingSymptoms, editingSummary]);

  const handlePrescribe = (reqId: string) => {
    appStore.updateRequest(reqId, { status: 'prescribed', prescription: 'Amoxicillin 500mg (3x Daily), Paracetamol', doctorNotes: notes });
  };

  const handleSaveNotes = () => {
     if (selectedPatient) {
         appStore.updateRequest(selectedPatient.id, { doctorNotes: notes });
         alert("Notes saved successfully.");
     }
  };

  const handleSaveSymptoms = () => {
      if (selectedPatient) {
          appStore.updateRequest(selectedPatient.id, { symptoms: symptomText });
          setEditingSymptoms(false);
      }
  };

  const handleSaveSummary = () => {
      if (selectedPatient && selectedPatient.aiAnalysis) {
          const updatedAnalysis = { ...selectedPatient.aiAnalysis, patient_summary: summaryText };
          appStore.updateRequest(selectedPatient.id, { aiAnalysis: updatedAnalysis });
          setEditingSummary(false);
      }
  };

  const handleSendChat = () => {
      if (selectedPatient && chatMsg.trim()) {
          const currentUser = appStore.getCurrentUser();
          appStore.addChatMessage(selectedPatient.id, chatMsg, currentUser!.id, currentUser!.name);
          setChatMsg('');
      }
  };

  const handleStartAudio = () => {
      alert("Starting secure audio session with patient...");
  };

  const filteredQueue = queue.filter(q => {
      const statusMatch = filter === 'all' ? true : q.status === filter;
      const severityMatch = severityFilter === 'All' ? true : q.severity === severityFilter;
      return statusMatch && severityMatch;
  });

  const getSeverityColor = (level: SeverityLevel) => {
      switch(level) {
          case 'High': return 'bg-red-500 text-white';
          case 'Medium': return 'bg-orange-400 text-white';
          case 'Low': return 'bg-green-500 text-white';
          default: return 'bg-gray-400';
      }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-8rem)]">
      {/* 1. Patient Queue (Left) - 3 Columns */}
      <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2 mb-3">
            <ClipboardList className="text-teal-700" size={20} />
            <h2 className="font-bold text-gray-800">Queue</h2>
          </div>
          <div className="space-y-2">
            <div className="flex gap-1 bg-gray-200 p-1 rounded-lg">
                {['all', 'pending_triage', 'triaged'].map(f => (
                    <button 
                        key={f}
                        onClick={() => setFilter(f as any)}
                        className={`flex-1 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${filter === f ? 'bg-white text-teal-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        {f.replace('_', ' ')}
                    </button>
                ))}
            </div>
            <div className="flex gap-1">
                {['All', 'High', 'Medium', 'Low'].map(s => (
                     <button
                        key={s}
                        onClick={() => setSeverityFilter(s as any)}
                        className={`flex-1 py-1 text-[10px] font-bold rounded-md border ${severityFilter === s ? 'bg-teal-50 border-teal-200 text-teal-800' : 'border-transparent text-gray-400'}`}
                     >
                         {s}
                     </button>
                ))}
            </div>
          </div>
        </div>
        
        <div className="overflow-y-auto p-2 space-y-2 flex-1">
          {filteredQueue.map(req => (
            <button
              key={req.id}
              onClick={() => { setSelectedPatient(req); setNotes(req.doctorNotes || ''); }}
              className={`w-full text-left p-3 rounded-lg border transition-all group relative ${
                selectedPatient?.id === req.id 
                ? 'bg-teal-50 border-teal-500 ring-1 ring-teal-500' 
                : 'bg-white border-gray-100 hover:border-teal-200 hover:bg-gray-50'
              }`}
            >
              <div className="absolute right-2 top-2 w-2 h-2 rounded-full" style={{ backgroundColor: req.severity === 'High' ? '#ef4444' : req.severity === 'Medium' ? '#f97316' : '#22c55e' }}></div>
              <div className="flex justify-between items-center mb-1">
                <span className={`font-semibold text-sm ${selectedPatient?.id === req.id ? 'text-teal-900' : 'text-gray-900'}`}>{req.patientName}</span>
              </div>
              <div className="flex gap-1 mb-1">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${getSeverityColor(req.severity)}`}>
                      {req.severity}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded uppercase font-bold bg-gray-100 text-gray-500">
                      {req.status === 'pending_triage' ? 'New' : req.status}
                  </span>
              </div>
              <p className="text-xs text-gray-500 line-clamp-1 group-hover:text-gray-700">{req.symptoms}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Main Workspace (Center) - 6 Columns */}
      <div className="lg:col-span-6 flex flex-col h-full overflow-y-auto pr-2">
        {selectedPatient ? (
          <div className="space-y-6">
            {/* Patient Header */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold text-xl">
                            {selectedPatient.patientName.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{selectedPatient.patientName}</h2>
                            <p className="text-xs text-gray-500">ID: #{selectedPatient.patientId.slice(-4)}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={handleStartAudio}
                            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm"
                        >
                            <Phone size={16} />
                            Call
                        </button>
                        {(selectedPatient.status === 'pending_triage' || selectedPatient.status === 'triaged') && (
                            <button 
                            onClick={() => handlePrescribe(selectedPatient.id)}
                            className="bg-teal-700 hover:bg-teal-800 text-white px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-md active:scale-95"
                            >
                            <Stethoscope size={18} />
                            Prescribe
                            </button>
                        )}
                    </div>
                </div>

                {/* Patient Summary (Editable) */}
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-4">
                     <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xs font-bold text-blue-800 uppercase flex items-center gap-2">
                            <User size={14} />
                            AI Patient Summary
                        </h3>
                        <button onClick={() => setEditingSummary(!editingSummary)} className="text-blue-600 hover:text-blue-800 text-xs font-bold">
                            {editingSummary ? 'Cancel' : 'Edit Summary'}
                        </button>
                    </div>
                    {editingSummary ? (
                        <div className="space-y-2">
                            <textarea 
                                value={summaryText}
                                onChange={(e) => setSummaryText(e.target.value)}
                                className="w-full p-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white text-gray-900"
                                rows={3}
                            />
                            <button onClick={handleSaveSummary} className="text-xs bg-blue-600 text-white px-3 py-1 rounded">Save Changes</button>
                        </div>
                    ) : (
                        <p className="text-gray-800 text-sm leading-relaxed">
                            {selectedPatient.aiAnalysis?.patient_summary || "No summary available."}
                        </p>
                    )}
                </div>

                {/* Symptoms Edit Section */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xs font-bold text-gray-500 uppercase">Reported Symptoms</h3>
                        <button onClick={() => setEditingSymptoms(!editingSymptoms)} className="text-teal-600 hover:text-teal-800">
                            {editingSymptoms ? <X size={16}/> : <Edit2 size={16} />}
                        </button>
                    </div>
                    {editingSymptoms ? (
                        <div className="space-y-2">
                            <textarea 
                                value={symptomText}
                                onChange={(e) => setSymptomText(e.target.value)}
                                className="w-full p-2 border border-teal-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm bg-white text-gray-900"
                                rows={3}
                            />
                            <button onClick={handleSaveSymptoms} className="text-xs bg-teal-600 text-white px-3 py-1 rounded">Save Changes</button>
                        </div>
                    ) : (
                        <p className="text-gray-800 text-sm leading-relaxed">{selectedPatient.symptoms}</p>
                    )}
                </div>
            </div>

            {/* Past History */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock size={20} className="text-teal-600" />
                    Medical History
                </h3>
                {patientHistory.length > 0 ? (
                    <div className="space-y-3">
                        {patientHistory.map(h => (
                            <div key={h.id} className="p-3 border border-gray-100 rounded-lg bg-gray-50 flex justify-between items-center">
                                <div>
                                    <p className="text-xs text-gray-500 font-bold">{new Date(h.timestamp).toLocaleDateString()}</p>
                                    <p className="text-sm text-gray-800 line-clamp-1">{h.symptoms}</p>
                                </div>
                                <span className="text-[10px] bg-white border border-gray-200 px-2 py-1 rounded text-gray-600">{h.status}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-400 italic">No previous consultation records.</p>
                )}
            </div>

            {/* AI Analysis */}
            {selectedPatient.aiAnalysis ? (
              <AnalysisResult result={selectedPatient.aiAnalysis} compact={true} />
            ) : (
              <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500">Analysis pending...</p>
              </div>
            )}

            {/* Doctor Notes */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText size={20} className="text-teal-600" />
                    Doctor's Clinical Notes
                </h3>
                <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter clinical observations, internal notes, or specific instructions..."
                    className="w-full h-32 p-4 bg-yellow-50/50 border border-yellow-200 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none text-sm text-gray-900 resize-none"
                />
                <div className="flex justify-end mt-2">
                    <button onClick={handleSaveNotes} className="flex items-center gap-2 text-sm text-gray-600 hover:text-teal-700 font-medium">
                        <Save size={16} /> Save Note
                    </button>
                </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
            <ArrowRight size={48} className="mb-4 opacity-20" />
            <p>Select a patient from the queue to view details.</p>
          </div>
        )}
      </div>

      {/* 3. Communication Sidebar (Right) - 3 Columns */}
      <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col h-full">
         <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <MessageSquare size={18} className="text-teal-600" />
                Staff Chat
            </h3>
            <p className="text-[10px] text-gray-500">Context: {selectedPatient ? selectedPatient.patientName : 'No selection'}</p>
         </div>
         
         <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/30">
            {!selectedPatient && <p className="text-center text-gray-400 text-xs mt-10">Select a patient to chat with Pharmacists or other specialists regarding their case.</p>}
            
            {selectedPatient && selectedPatient.chatHistory.map(msg => (
                <div key={msg.id} className={`flex flex-col ${msg.senderId.startsWith('staff_doctor') ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-xl text-xs ${
                        msg.senderId.startsWith('staff_doctor') 
                        ? 'bg-teal-600 text-white rounded-tr-none' 
                        : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                    }`}>
                        <p className="font-bold mb-1 opacity-80">{msg.senderName}</p>
                        <p>{msg.message}</p>
                    </div>
                    <span className="text-[9px] text-gray-400 mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                </div>
            ))}
         </div>

         <div className="p-3 border-t border-gray-100">
             <div className="flex gap-2">
                 <input 
                    type="text" 
                    disabled={!selectedPatient}
                    value={chatMsg}
                    onChange={(e) => setChatMsg(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                    placeholder="Type message..."
                    className="flex-1 bg-gray-100 border-0 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none text-gray-900"
                 />
                 <button 
                    disabled={!selectedPatient || !chatMsg.trim()}
                    onClick={handleSendChat}
                    className="p-2 bg-teal-600 text-white rounded-lg disabled:opacity-50 hover:bg-teal-700"
                 >
                     <Send size={16} />
                 </button>
             </div>
         </div>
      </div>
    </div>
  );
};

export default DoctorPortal;