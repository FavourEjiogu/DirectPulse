
import React, { useState, useEffect, useRef } from 'react';
import { TriageRequest, ChatMessage, UserRole, SeverityLevel } from '../../types';
import { appStore } from '../../services/store';
import AnalysisResult from '../AnalysisResult';
import { User, ClipboardList, Stethoscope, ArrowRight, MessageSquare, Save, Edit2, X, Send, Phone, Clock, FileText, ArrowRightLeft, PhoneCall } from 'lucide-react';

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
  const [transferTarget, setTransferTarget] = useState<string>('');
  
  // Chat & Call state
  const [chatMsg, setChatMsg] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [isCalling, setIsCalling] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    const updateQueue = () => setQueue(appStore.getRequests(role));
    updateQueue();
    const interval = setInterval(updateQueue, 3000);
    return () => clearInterval(interval);
  }, [role]);

  useEffect(() => {
    // Scroll chat to bottom
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedPatient?.chatHistory]);

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

  // Call timer effect
  useEffect(() => {
      let timer: any;
      if (isCalling) {
          timer = setInterval(() => setCallDuration(prev => prev + 1), 1000);
      } else {
          setCallDuration(0);
      }
      return () => clearInterval(timer);
  }, [isCalling]);

  const handlePrescribe = (reqId: string) => {
    appStore.updateRequest(reqId, { status: 'prescribed', prescription: 'Amoxicillin 500mg (3x Daily), Paracetamol', doctorNotes: notes });
    // Add system note to chat
    const user = appStore.getCurrentUser();
    appStore.addChatMessage(reqId, `Prescription issued by ${user?.name}.`, 'system', 'System');
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
      setIsCalling(true);
  };

  const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTransfer = () => {
      if (!selectedPatient || !transferTarget) return;
      if (!selectedPatient.aiAnalysis) return;

      const currentUser = appStore.getCurrentUser();
      
      const updatedAnalysis = { 
          ...selectedPatient.aiAnalysis, 
          recommended_department: transferTarget 
      };

      appStore.updateRequest(selectedPatient.id, { aiAnalysis: updatedAnalysis });
      appStore.addChatMessage(selectedPatient.id, `Patient transferred to ${transferTarget} by ${currentUser?.name}.`, 'system', 'System');
      
      alert(`Patient transferred to ${transferTarget}.`);
      setSelectedPatient(null); // Clear selection as they leave the queue
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

  const specialistsList = [
      'General Medical Doctor',
      'Paediatrician',
      'Dentist',
      'ENT Doctor',
      'Cardiologist',
      'Dermatologist',
      'Psychiatrist'
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-8rem)] relative">
      
      {/* Call Overlay */}
      {isCalling && selectedPatient && (
          <div className="absolute inset-0 z-50 bg-gray-900/95 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center text-white animate-fade-in">
              <div className="w-32 h-32 rounded-full bg-teal-600/20 flex items-center justify-center mb-6 animate-pulse">
                  <div className="w-24 h-24 rounded-full bg-teal-600 flex items-center justify-center">
                      <User size={48} />
                  </div>
              </div>
              <h2 className="text-3xl font-bold mb-2">{selectedPatient.patientName}</h2>
              <div className="flex items-center gap-2 text-teal-300 mb-8">
                  <PhoneCall size={20} className="animate-bounce" />
                  <span className="font-mono text-xl">{formatTime(callDuration)}</span>
              </div>
              
              {/* Patient Phone Display if available */}
              {(() => {
                  const patientUser = appStore.getUserById(selectedPatient.patientId);
                  return patientUser?.phone ? (
                      <p className="mb-8 text-gray-400 text-lg">{patientUser.phone}</p>
                  ) : <p className="mb-8 text-gray-400">Audio Only Connection</p>;
              })()}

              <div className="flex gap-6">
                  <button className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors">
                      <Stethoscope size={24} />
                  </button>
                  <button 
                    onClick={() => setIsCalling(false)}
                    className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition-colors shadow-lg hover:shadow-red-500/30 transform hover:scale-110"
                  >
                      <Phone size={24} className="rotate-[135deg]" />
                  </button>
              </div>
          </div>
      )}

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
          {filteredQueue.length === 0 && (
              <p className="text-center text-gray-400 text-xs py-10">Queue is empty.</p>
          )}
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

                {/* Delegation / Transfer Tool */}
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex items-center gap-3 mb-4">
                    <ArrowRightLeft size={16} className="text-gray-500" />
                    <span className="text-xs font-bold text-gray-600 uppercase">Refer Patient:</span>
                    <select 
                        className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block p-2 flex-1 outline-none"
                        value={transferTarget}
                        onChange={(e) => setTransferTarget(e.target.value)}
                    >
                        <option value="">Select Specialist...</option>
                        {specialistsList.filter(s => s !== selectedPatient.aiAnalysis?.recommended_department).map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                    <button 
                        disabled={!transferTarget}
                        onClick={handleTransfer}
                        className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50 hover:bg-black transition-colors"
                    >
                        Transfer
                    </button>
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
                Live Chat
            </h3>
            <p className="text-[10px] text-gray-500">Messaging: {selectedPatient ? selectedPatient.patientName : 'No selection'}</p>
         </div>
         
         <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/30">
            {!selectedPatient && <p className="text-center text-gray-400 text-xs mt-10">Select a patient to message.</p>}
            
            {selectedPatient && selectedPatient.chatHistory.map(msg => (
                <div key={msg.id} className={`flex flex-col ${msg.senderId === 'system' ? 'items-center' : (msg.senderId.startsWith('staff_doctor') ? 'items-end' : 'items-start')}`}>
                    {msg.senderId === 'system' ? (
                        <div className="bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-[10px] font-bold my-2">
                            {msg.message}
                        </div>
                    ) : (
                        <div className={`max-w-[85%] p-3 rounded-xl text-xs shadow-sm ${
                            msg.senderId.startsWith('staff_doctor') 
                            ? 'bg-teal-600 text-white rounded-tr-none' 
                            : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                        }`}>
                            <p className="font-bold mb-1 opacity-80 text-[10px] uppercase tracking-wide">{msg.senderName}</p>
                            <p>{msg.message}</p>
                        </div>
                    )}
                    {msg.senderId !== 'system' && (
                        <span className="text-[9px] text-gray-400 mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                    )}
                </div>
            ))}
            <div ref={chatEndRef} />
         </div>

         <div className="p-3 border-t border-gray-100">
             <div className="flex gap-2">
                 <input 
                    type="text" 
                    disabled={!selectedPatient}
                    value={chatMsg}
                    onChange={(e) => setChatMsg(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                    placeholder="Type message to patient..."
                    className="flex-1 bg-gray-100 border-0 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none text-gray-900"
                 />
                 <button 
                    disabled={!selectedPatient || !chatMsg.trim()}
                    onClick={handleSendChat}
                    className="p-2 bg-teal-600 text-white rounded-lg disabled:opacity-50 hover:bg-teal-700 transition-colors"
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
