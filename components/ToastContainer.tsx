import React, { useState, useEffect } from 'react';
import { toast, ToastMessage } from '../services/toastService';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    return toast.subscribe(setToasts);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="text-green-500" size={20} />;
      case 'error': return <AlertCircle className="text-red-500" size={20} />;
      default: return <Info className="text-blue-500" size={20} />;
    }
  };

  const getStyles = (type: string) => {
    switch (type) {
      case 'success': return 'border-l-4 border-green-500 bg-white';
      case 'error': return 'border-l-4 border-red-500 bg-white';
      default: return 'border-l-4 border-blue-500 bg-white';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-3">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 p-4 rounded-lg shadow-lg min-w-[300px] animate-fade-in ${getStyles(t.type)}`}
        >
          <div className="mt-0.5">{getIcon(t.type)}</div>
          <div className="flex-1 text-sm font-medium text-gray-800">{t.message}</div>
          <button onClick={() => toast.remove(t.id)} className="text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
