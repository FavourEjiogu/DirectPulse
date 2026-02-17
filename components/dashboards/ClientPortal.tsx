import React, { useState, useEffect } from 'react';
import SymptomInput from '../SymptomInput';
import AnalysisResult from '../AnalysisResult';
import { TriageRequest, User } from '../../types';
import { appStore } from '../../services/store';
import { toast } from '../../services/toastService';
import { analyzeSymptoms } from '../../services/geminiService';
import { Clock, CheckCircle, Share2, Download, CreditCard, Lock, Sparkles, MapPin, Truck } from 'lucide-react';

interface ClientPortalProps {
  user: User;
  onRefreshUser: () => void;
}

const ClientPortal: React.FC<ClientPortalProps> = ({ user, onRefreshUser }) => {
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  const [history, setHistory] = useState<TriageRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<TriageRequest | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState<string | null>(null);

  useEffect(() => {
    const update = () => setHistory(appStore.getRequests('client', user.id));
    update();
    const interval = setInterval(update, 5000);
    return () => clearInterval(interval);
  }, [user.id, currentResult]);

  const handleAnalyze = async (symptoms: string) => {
    setLoading(true);
    try {
      const result = await analyzeSymptoms(symptoms);
      // Derive severity from emergency override or random
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
      toast.error("Failed to process triage request.");
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
      toast.success("AI Avatar Generated Successfully!");
  };

  const handleShare = async (req: TriageRequest) => {
      const shareText = `DirectPulse Consultation Summary\nDate: ${new Date(req.timestamp).toLocaleDateString()}\nPatient: ${req.patientName}\nSymptoms: ${req.symptoms}\nStatus: ${req.status}\nPrescription: ${req.prescription || 'Pending'}`;
      try {
          await navigator.clipboard.writeText(shareText);
          toast.success("Consultation summary copied to clipboard!");
      } catch (err) {
          toast.error("Failed to copy to clipboard.");
      }
  }

  const handleDownload = (req: TriageRequest) => {
      toast.info("Downloading medical report...");
      const report = `
DIRECTPULSE MEDICAL REPORT
==========================
Date: ${new Date(req.timestamp).toLocaleString()}
Patient ID: ${req.patientId}
Patient Name: ${req.patientName}

SYMPTOMS
--------
${req.symptoms}

AI TRIAGE ANALYSIS
------------------
Severity: ${req.severity}
Recommended Dept: ${req.aiAnalysis?.recommended_department || 'N/A'}
Summary: ${req.aiAnalysis?.patient_summary || 'N/A'}

PRESCRIPTION
------------
${req.prescription || 'None prescribed yet.'}

DOCTOR NOTES
------------
${req.doctorNotes || 'None.'}

STATUS
------
${req.status}
      `;

      const blob = new Blob([report], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Medical_Report_${req.id}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Action Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => { setActiveTab('new'); setCurrentResult(null); }}
          className={`px-6 py-3 font-medium text-sm transition-colors ${activeTab === 'new' ? 'border-b-2 border-teal-600 text-teal-700' : 'text-gray-500 hover:text-gray-700'}`}
        >
          New Consultation
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-6 py-3 font-medium text-sm transition-colors ${activeTab === 'history' ? 'border-b-2 border-teal-600 text-teal-700' : 'text-gray-500 hover:text-gray-700'}`}
        >
          My History
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
                        <button onClick={() => handleShare(req)} className="text-gray-400 hover:text-teal-600" title="Share"><Share2 size={16} /></button>
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

                      {/* Prescription Display */}
                      {req.prescription && (
                          <div className="mt-3 mb-4 p-3 bg-gray-50 border border-gray-100 rounded-lg flex gap-3 items-start">
                              {req.drugImageUrl && (
                                  <img src={req.drugImageUrl} alt="Medication" className="w-16 h-16 object-cover rounded-md border border-gray-200 bg-white" />
                              )}
                              <div>
                                  <p className="text-xs font-bold text-gray-500 uppercase">Prescribed Medication</p>
                                  <p className="text-sm font-medium text-gray-900">{req.prescription}</p>
                              </div>
                          </div>
                      )}

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
    </div>
  );
};

export default ClientPortal;