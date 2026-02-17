import React, { useState, useEffect } from 'react';
import { TriageRequest } from '../../types';
import { appStore } from '../../services/store';
import { Truck, MapPin, CheckCircle, Lock, Phone } from 'lucide-react';

const RiderPortal: React.FC = () => {
  const [deliveries, setDeliveries] = useState<TriageRequest[]>([]);
  const [inputCode, setInputCode] = useState<Record<string, string>>({});

  useEffect(() => {
    const update = () => setDeliveries(appStore.getRequests('rider'));
    update();
    const interval = setInterval(update, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusUpdate = (id: string, newStatus: 'out_for_delivery' | 'delivered') => {
    if (newStatus === 'delivered') {
        // Validate code
        const code = inputCode[id];
        if (!appStore.verifyDeliveryCode(id, code)) {
            alert("Invalid Delivery Code. Ask customer for the 4-digit pin.");
            return;
        }
    }
    appStore.updateRequest(id, { status: newStatus });
    setDeliveries(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d));
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-teal-100 text-teal-800 rounded-xl">
          <Truck size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dispatch Rider</h2>
          <p className="text-gray-500">Active deliveries.</p>
        </div>
      </div>

      <div className="space-y-4">
        {deliveries.length === 0 && (
          <p className="text-center py-12 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">No deliveries pending.</p>
        )}
        {deliveries.map(delivery => (
          <div key={delivery.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 left-0 w-1 h-full bg-teal-500"></div>
             <div className="flex justify-between items-start mb-4">
               <div>
                 <h3 className="font-bold text-gray-900">{delivery.patientName}</h3>
                 <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                   <MapPin size={14} />
                   <span>123 Main St, Apt 4B</span>
                 </div>
                 <div className="flex items-center gap-1 text-sm text-teal-600 mt-1">
                   <Phone size={14} />
                   <span>Tap to Call</span>
                 </div>
               </div>
               <span className="text-[10px] font-bold uppercase bg-gray-100 text-gray-600 px-2 py-1 rounded">
                 {delivery.status.replace('_', ' ')}
               </span>
             </div>

             {delivery.drugImageUrl && (
                 <div className="mb-4 bg-gray-50 p-2 rounded-lg flex items-center gap-3">
                     <img src={delivery.drugImageUrl} className="w-12 h-12 rounded object-cover" />
                     <span className="text-xs text-gray-500 font-medium">Verify Package Contents</span>
                 </div>
             )}

             <div className="mt-4 pt-4 border-t border-gray-100">
               {delivery.status === 'ready_for_pickup' && (
                 <button 
                   onClick={() => handleStatusUpdate(delivery.id, 'out_for_delivery')}
                   className="w-full bg-teal-600 text-white py-3 rounded-lg font-bold text-sm hover:bg-teal-700 shadow-md transition-all"
                 >
                   Start Delivery Route
                 </button>
               )}
               {delivery.status === 'out_for_delivery' && (
                 <div className="space-y-3">
                     <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                         <Lock size={16} className="text-gray-400" />
                         <input 
                            type="text" 
                            maxLength={4}
                            placeholder="Enter 4-Digit Code"
                            className="bg-transparent outline-none flex-1 text-sm font-mono tracking-widest text-gray-900"
                            value={inputCode[delivery.id] || ''}
                            onChange={(e) => setInputCode({...inputCode, [delivery.id]: e.target.value})}
                         />
                     </div>
                     <button 
                        onClick={() => handleStatusUpdate(delivery.id, 'delivered')}
                        className="w-full bg-gray-900 text-white py-3 rounded-lg font-bold text-sm hover:bg-black flex justify-center items-center gap-2 shadow-md"
                     >
                        <CheckCircle size={16} />
                        Confirm Delivery
                     </button>
                 </div>
               )}
               {delivery.status === 'delivered' && (
                 <div className="w-full text-center py-2 text-teal-600 font-bold text-sm bg-teal-50 rounded-lg flex items-center justify-center gap-2">
                   <CheckCircle size={16} />
                   Delivered Successfully
                 </div>
               )}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RiderPortal;