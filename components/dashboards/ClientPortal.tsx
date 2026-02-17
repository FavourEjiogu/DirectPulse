import React, { useState, useEffect, useRef } from 'react';
import SymptomInput from '../SymptomInput';
import AnalysisResult from '../AnalysisResult';
import { TriageRequest, User } from '../../types';
import { appStore } from '../../services/store';
import { analyzeSymptoms } from '../../services/geminiService';
import { Clock, CheckCircle, Share2, Download, CreditCard, Lock, Sparkles, MapPin, Truck, UserCircle, Save, FileText, X, Eye, Shield, MessageSquare, Send } from 'lucide-react';

interface ClientPortalProps {
  user: User;
  onRefreshUser: () => void;
}

const ClientPortal: React.FC<ClientPortalProps> = ({ user, onRefreshUser }) => {
  const [activeTab, setActiveTab] = useState<'new' | 'history' | 'profile'>('new');
  const [history, setHistory] = useState<TriageRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<TriageRequest | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState<string | null>(null);
  const [viewDiagnosis, setViewDiagnosis] = useState<TriageRequest | null>(null);
  
  // Chat State
  const [chatOpenId, setChatOpenId] = useState<string | null>(null);
  const [chatMsg, setChatMsg] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Profile Edit State
  const [profileForm, setProfileForm] = useState({
      allergies: user.profile?.allergies || '',
      hmoProvider: user.profile?.hmoProvider || '',
      hmoNumber: user.profile?.hmoNumber || '',
      emergencyContactName: user.profile?.emergencyContactName || '',
      emergencyContactPhone: user.profile?.emergencyContactPhone || '',
      privateNotes: user.profile?.privateNotes || ''
  });

  useEffect(() => {
    const update = () => setHistory(appStore.getRequests('client', user.id));
    update();
    const interval = setInterval(update, 2000); // Faster polling for chat
    return () => clearInterval(interval);
  }, [user.id, currentResult]);

  useEffect(() => {
      if (chatOpenId) chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, chatOpenId]);

  const handleAnalyze = async (symptoms: string) => {
    setLoading(true);
    try {
      const result = await analyzeSymptoms(symptoms);
      // Derive severity from emergency override or random for demo
      const severity = result.emergency_override ? 'High' : (Math.random() > 0.5 ? 'Medium' : 'Low');

      const newRequest: TriageRequest = {
        id: `req_${Date.now()}`,
        patientId: user.id,
        patientName: user.name,
        symptoms: symptoms,
        timestamp: Date.now(),
        status: 'pending_triage',
        severity: severity,
        aiAnalysis: result,
        chatHistory: [],
        deliveryCode: Math.floor(1000 + Math.random() * 9000).toString(),
        totalCost: 25.00 + (Math.random() * 50), // Mock cost
        drugImageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=300'
      };
      
      appStore.addRequest(newRequest);
      setCurrentResult(newRequest);
      setActiveTab('history');
    } catch (error) {
      console.error(error);
      alert("Failed to process triage request.");
    } finally {
      setLoading(false);
    }
  };

  const handlePay = (reqId: string) => {
      setPaymentProcessing(reqId);
      setTimeout(() => {
          appStore.updateRequest(reqId, { status: 'paid' });
          setPaymentProcessing(null);
      }, 2000);
  };

  const handleGeneratePfp = () => {
      const mockPfp = "https://api.dicebear.com/7.x/avataaars/svg?seed=" + Date.now();
      appStore.updateUserProfile(user.id, { profile: { ...user.profile!, pfpUrl: mockPfp } });
      onRefreshUser();
  };

  const handleShare = () => {
      navigator.clipboard.writeText(window.location.href).then(() => {
          alert("Consultation portal link copied to clipboard!");
      });
  }

  const handleDownload = (req: TriageRequest) => {
      // Create a printable HTML string
      const printContent = `
        <html>
        <head>
          <title>Medical Report - ${req.id}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #1a202c; max-width: 800px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #0f766e; }
            .section { margin-bottom: 25px; }
            .section-title { font-size: 14px; text-transform: uppercase; color: #64748b; font-weight: bold; margin-bottom: 8px; }
            .content { font-size: 16px; line-height: 1.6; }
            .highlight { background: #f0fdfa; padding: 15px; border-radius: 8px; border: 1px solid #ccfbf1; }
            ul { margin-top: 5px; }
            .footer { margin-top: 50px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">DirectPulse Medical Report</div>
            <div style="text-align: right;">
              <div>Date: ${new Date(req.timestamp).toLocaleDateString()}</div>
              <div>ID: ${req.id}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Patient Details</div>
            <div class="content">
              <strong>Name:</strong> ${req.patientName}<br/>
              <strong>Patient ID:</strong> ${req.patientId}
            </div>
          </div>

          <div class="section">
            <div class="section-title">Reported Symptoms</div>
            <div class="content highlight">${req.symptoms}</div>
          </div>

          <div class="section">
            <div class="section-title">AI Triage Analysis</div>
            <div class="content">
              <strong>Department:</strong> ${req.aiAnalysis?.recommended_department || 'N/A'}<br/>
              <p>${req.aiAnalysis?.patient_summary || 'N/A'}</p>
              <strong>Potential Conditions:</strong>
              <ul>
                ${req.aiAnalysis?.ai_preliminary_analysis.map(i => `<li>${i}</li>`).join('') || 'N/A'}
              </ul>
            </div>
          </div>

          <div class="footer">
            Generated by DirectPulse AI. Validated by Attending Physician. This document is a summary of digital triage.
          </div>
          <script>window.print();</script>
        </body>
        </html>
      `;

      const printWindow = window.open('', '_blank');
      if (printWindow) {
          printWindow.document.write(printContent);
          printWindow.document.close();
      } else {
          alert("Please allow popups to print the report.");
      }
  }

  const handleSaveProfile = () => {
      appStore.updateUserProfile(user.id, {
          profile: {
              ...user.profile!,
              allergies: profileForm.allergies,
              hmoProvider: profileForm.hmoProvider,
              hmoNumber: profileForm.hmoNumber,
              emergencyContactName: profileForm.emergencyContactName,
              emergencyContactPhone: profileForm.emergencyContactPhone,
              privateNotes: profileForm.privateNotes
          }
      });
      onRefreshUser();
  };

  const handleSendChat = (reqId: string) => {
      if (chatMsg.trim()) {
          appStore.addChatMessage(reqId, chatMsg, user.id, user.name);
          setChatMsg('');
      }
  };

  return (
    <div className="space-y-8 animate-fade-in relative">
      {/* Diagnosis Modal */}
      {viewDiagnosis && viewDiagnosis.aiAnalysis && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                      <h3 className="font-bold text-lg text-gray-900">Detailed Diagnostic Report</h3>
                      <button onClick={() => setViewDiagnosis(null)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
                  </div>
                  <div className="p-6">
                      <AnalysisResult result={viewDiagnosis.aiAnalysis} />
                      <div className="mt-8 flex justify-end">
                          <button onClick={() => handleDownload(viewDiagnosis)} className="flex items-center gap-2 text-teal-700 font-bold hover:bg-teal-50 px-4 py-2 rounded-lg">
                              <Download size={18} /> Print / Save PDF
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Action Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => { setActiveTab('new'); setCurrentResult(null); }}
          className={`px-6 py-3 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'new' ? 'border-b-2 border-teal-600 text-teal-700' : 'text-gray-500 hover:text-gray-700'}`}
        >
          New Consultation
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-6 py-3 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'history' ? 'border-b-2 border-teal-600 text-teal-700' : 'text-gray-500 hover:text-gray-700'}`}
        >
          My History
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-6 py-3 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'profile' ? 'border-b-2 border-teal-600 text-teal-700' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Profile & Notes
        </button>
      </div>

      {activeTab === 'new' && (
        <div className="max-w-3xl mx-auto">
          {user.hasDeliveredOrder && !user.profile?.pfpUrl && (
              <div className="mb-6 p-4 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl text-white flex items-center justify-between shadow-lg">
                  <div>
                      <h3 className="font-bold text-lg">Achievement Unlocked!</h3>
                      <p className="text-purple-100 text-sm">You completed a delivery. Generate your AI Medical ID Avatar now.</p>
                  </div>
                  <button onClick={handleGeneratePfp} className="px-4 py-2 bg-white text-purple-600 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-purple-50">
                      <Sparkles size={16} />
                      Generate PFP
                  </button>
              </div>
          )}
          <SymptomInput onAnalyze={handleAnalyze} isLoading={loading} />
          
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
              <div className="mt-1 text-blue-600"><Sparkles size={18} /></div>
              <div>
                  <h4 className="font-bold text-blue-900 text-sm">AI Triage Tips</h4>
                  <p className="text-sm text-blue-800 opacity-90">
                      Be specific about when the symptoms started and any medications you are currently taking. The more detail, the better the routing.
                  </p>
              </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-6">
          {currentResult && currentResult.aiAnalysis && (
            <div className="mb-8">
              <div className="bg-teal-50 border border-teal-200 p-4 rounded-lg flex items-center gap-3 mb-6 text-teal-800">
                 <CheckCircle className="text-teal-600" />
                 <span className="font-semibold">Triage Complete. Routed to {currentResult.aiAnalysis.recommended_department}.</span>
              </div>
              <AnalysisResult result={currentResult.aiAnalysis} />
            </div>
          )}
          
          <h3 className="text-lg font-bold text-gray-900">Active & Past Consultations</h3>
          
          <div className="grid gap-6">
              {history.map(req => (
                <div key={req.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <span className="text-xs font-bold text-gray-500">{new Date(req.timestamp).toLocaleDateString()} at {new Date(req.timestamp).toLocaleTimeString()}</span>
                    <div className="flex gap-2">
                         <button onClick={() => setViewDiagnosis(req)} className="text-gray-400 hover:text-teal-600" title="View Diagnosis"><Eye size={16} /></button>
                        <button onClick={handleShare} className="text-gray-400 hover:text-teal-600" title="Share"><Share2 size={16} /></button>
                        <button onClick={() => handleDownload(req)} className="text-gray-400 hover:text-teal-600" title="Download Report"><Download size={16} /></button>
                    </div>
                  </div>
                  
                  <div className="p-4">
                      <p className="text-gray-900 font-medium mb-3 text-base">{req.symptoms}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                           <span className={`text-[10px] px-2 py-1 rounded-full uppercase font-bold tracking-wide ${req.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                             {req.status.replace('_', ' ')}
                           </span>
                           {req.aiAnalysis && (
                             <span className="text-[10px] px-2 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">
                               Dept: {req.aiAnalysis.recommended_department}
                             </span>
                           )}
                      </div>
                      
                      {/* Doctor Chat Preview / Toggle */}
                      <div className="border-t border-gray-100 pt-3 mt-3">
                         <button 
                            onClick={() => setChatOpenId(chatOpenId === req.id ? null : req.id)}
                            className="w-full text-left flex items-center justify-between text-xs font-bold text-teal-700 hover:bg-teal-50 p-2 rounded-lg transition-colors"
                         >
                            <span className="flex items-center gap-2"><MessageSquare size={14} /> Talk to Doctor</span>
                            <span>{chatOpenId === req.id ? 'Close Chat' : `${req.chatHistory.length} messages`}</span>
                         </button>
                         
                         {chatOpenId === req.id && (
                             <div className="mt-3 bg-gray-50 rounded-xl p-3 border border-gray-200">
                                 <div className="h-48 overflow-y-auto space-y-3 mb-3 pr-1 scrollbar-thin">
                                     {req.chatHistory.length === 0 && <p className="text-center text-gray-400 text-xs mt-4">Start messaging...</p>}
                                     {req.chatHistory.map(msg => (
                                         <div key={msg.id} className={`flex flex-col ${msg.senderId === 'system' ? 'items-center' : (msg.senderId === user.id ? 'items-end' : 'items-start')}`}>
                                             {msg.senderId === 'system' ? (
                                                <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full my-1">{msg.message}</span>
                                             ) : (
                                                 <div className={`max-w-[85%] p-2 rounded-lg text-xs ${
                                                     msg.senderId === user.id ? 'bg-teal-600 text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                                                 }`}>
                                                     <p className="font-bold text-[9px] opacity-75 mb-0.5">{msg.senderName}</p>
                                                     <p>{msg.message}</p>
                                                 </div>
                                             )}
                                         </div>
                                     ))}
                                     <div ref={chatEndRef}></div>
                                 </div>
                                 <div className="flex gap-2">
                                     <input 
                                        type="text" 
                                        placeholder="Type a message..." 
                                        className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-teal-500 outline-none"
                                        value={chatMsg}
                                        onChange={e => setChatMsg(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleSendChat(req.id)}
                                     />
                                     <button onClick={() => handleSendChat(req.id)} className="bg-teal-600 text-white p-2 rounded-lg hover:bg-teal-700"><Send size={16} /></button>
                                 </div>
                             </div>
                         )}
                      </div>

                      {/* Payment & Logistics Flow */}
                      {(req.status === 'awaiting_payment' || req.status === 'prescribed') && req.prescription && (
                          <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                              <div className="flex justify-between items-center mb-3">
                                  <span className="text-sm font-bold text-yellow-800">Bill Total (Consult + Meds + Delivery)</span>
                                  <span className="text-lg font-bold text-gray-900">${req.totalCost?.toFixed(2)}</span>
                              </div>
                              <button 
                                onClick={() => handlePay(req.id)}
                                disabled={!!paymentProcessing}
                                className="w-full py-2 bg-gray-900 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-black"
                              >
                                {paymentProcessing === req.id ? 'Processing...' : (
                                    <>
                                        <CreditCard size={16} />
                                        Pay Securely
                                    </>
                                )}
                              </button>
                          </div>
                      )}

                      {(req.status === 'paid' || req.status === 'ready_for_pickup' || req.status === 'out_for_delivery') && (
                          <div className="mt-4 p-4 bg-teal-50 rounded-lg border border-teal-100 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                  <div className="p-2 bg-white rounded-full text-teal-600"><Lock size={18} /></div>
                                  <div>
                                      <p className="text-xs text-teal-600 font-bold uppercase">Secure Delivery Code</p>
                                      <p className="text-lg font-mono font-bold text-gray-900 tracking-widest">{req.deliveryCode}</p>
                                  </div>
                              </div>
                              {req.status === 'out_for_delivery' && (
                                  <div className="flex items-center gap-1 text-xs font-bold text-orange-600 animate-pulse">
                                      <Truck size={14} />
                                      Arriving Soon
                                  </div>
                              )}
                          </div>
                      )}
                  </div>
                </div>
              ))}
              {history.length === 0 && <p className="text-center text-gray-400 py-8">No history found.</p>}
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                  <div className="bg-teal-100 p-2 rounded-full text-teal-700">
                      <UserCircle size={24} />
                  </div>
                  <div>
                      <h2 className="text-xl font-bold text-gray-900">Patient Profile</h2>
                      <p className="text-sm text-gray-500">Update your medical and emergency details.</p>
                  </div>
                  {user.hasDeliveredOrder && !user.profile?.pfpUrl && (
                      <button onClick={handleGeneratePfp} className="ml-auto text-xs bg-purple-600 text-white px-3 py-1 rounded-full hover:bg-purple-700">Generate Avatar</button>
                  )}
              </div>

              <div className="mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-start gap-3">
                  <Shield size={20} className="text-indigo-600 mt-1" />
                  <div>
                      <h4 className="text-sm font-bold text-indigo-900">Advanced Data Protection</h4>
                      <p className="text-xs text-indigo-800 leading-relaxed mt-1">
                          DirectPulse employs AES-256 encryption for all stored data. Your private notes and medical history are encrypted locally and only accessible by authorized medical personnel during active triage.
                      </p>
                  </div>
              </div>

              <div className="space-y-6">
                  <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Known Allergies</label>
                      <textarea 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                        value={profileForm.allergies}
                        onChange={e => setProfileForm({...profileForm, allergies: e.target.value})}
                      />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">HMO Provider</label>
                          <input 
                            type="text" 
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                            value={profileForm.hmoProvider}
                            onChange={e => setProfileForm({...profileForm, hmoProvider: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">HMO Number</label>
                          <input 
                            type="text" 
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                            value={profileForm.hmoNumber}
                            onChange={e => setProfileForm({...profileForm, hmoNumber: e.target.value})}
                          />
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Emergency Contact Name</label>
                          <input 
                            type="text" 
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                            value={profileForm.emergencyContactName}
                            onChange={e => setProfileForm({...profileForm, emergencyContactName: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Emergency Contact Phone</label>
                          <input 
                            type="text" 
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                            value={profileForm.emergencyContactPhone}
                            onChange={e => setProfileForm({...profileForm, emergencyContactPhone: e.target.value})}
                          />
                      </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                          <FileText size={16} className="text-gray-500"/>
                          <label className="block text-sm font-bold text-gray-700">Private Notes (Personal Diary)</label>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">These notes are for your eyes only.</p>
                      <textarea 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-yellow-50/30"
                        rows={4}
                        placeholder="Track daily symptoms or personal health observations here..."
                        value={profileForm.privateNotes}
                        onChange={e => setProfileForm({...profileForm, privateNotes: e.target.value})}
                      />
                  </div>

                  <div className="pt-4 flex justify-end">
                      <button 
                        onClick={handleSaveProfile}
                        className="bg-teal-700 hover:bg-teal-800 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-transform active:scale-95"
                      >
                          <Save size={18} />
                          Save Changes
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default ClientPortal;