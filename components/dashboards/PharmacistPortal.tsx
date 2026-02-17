import React, { useState, useEffect } from 'react';
import { TriageRequest } from '../../types';
import { appStore } from '../../services/store';
import { Pill, Check, Package } from 'lucide-react';

const PharmacistPortal: React.FC = () => {
  const [orders, setOrders] = useState<TriageRequest[]>([]);

  useEffect(() => {
    const update = () => setOrders(appStore.getRequests('pharmacist'));
    update();
    const interval = setInterval(update, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleReady = (id: string) => {
    appStore.updateRequest(id, { status: 'ready_for_pickup' });
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'ready_for_pickup' } : o));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-teal-100 text-teal-800 rounded-xl">
          <Pill size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pharmacy Dashboard</h2>
          <p className="text-gray-500">Manage prescription fulfillment.</p>
        </div>
      </div>

      <div className="space-y-4">
        {orders.length === 0 && (
          <p className="text-center py-12 text-gray-400 bg-gray-50 rounded-2xl">No active prescriptions.</p>
        )}
        {orders.map(order => (
          <div key={order.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-gray-900 text-lg">{order.patientName}</span>
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded uppercase font-bold">{order.status.replace('_', ' ')}</span>
              </div>
              <p className="text-gray-800 text-sm font-medium mt-2">Rx: {order.prescription || "Standard Protocol"}</p>
              <p className="text-xs text-gray-400 mt-1">Prescribed by Dr. Smith</p>
              
              {order.drugImageUrl && (
                  <div className="mt-4">
                      <p className="text-xs text-gray-400 mb-1 uppercase font-bold">Reference Image</p>
                      <img src={order.drugImageUrl} alt="Drug" className="w-24 h-24 object-cover rounded-lg border border-gray-200" />
                  </div>
              )}
            </div>
            
            <div className="flex flex-col items-end gap-2">
                {order.status === 'prescribed' ? (
                <button 
                    onClick={() => handleReady(order.id)}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                    <Package size={18} />
                    Mark Ready
                </button>
                ) : (
                <div className="flex items-center gap-2 text-teal-600 font-medium bg-teal-50 px-3 py-2 rounded-lg">
                    <Check size={20} />
                    <span>Ready for Pickup</span>
                </div>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PharmacistPortal;