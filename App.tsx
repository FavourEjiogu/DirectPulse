
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Auth from './components/Auth';
import ClientPortal from './components/dashboards/ClientPortal';
import DoctorPortal from './components/dashboards/DoctorPortal';
import PharmacistPortal from './components/dashboards/PharmacistPortal';
import RiderPortal from './components/dashboards/RiderPortal';
import { appStore } from './services/store';
import { User, UserRole } from './types';
import { AlertTriangle, Phone, Activity, X } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(appStore.getCurrentUser());
  const [showEmergency, setShowEmergency] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
      // Initialize Toast Listener
      appStore.setToastListener((msg) => {
          setToastMsg(msg);
          setTimeout(() => setToastMsg(null), 3000);
      });
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    appStore.logout();
    setCurrentUser(null);
  };

  const handleEmergencyTrigger = () => {
      setShowEmergency(true);
      // No timeout: User must exit manually
  };

  const refreshUser = () => {
      setCurrentUser(appStore.getCurrentUser() ? { ...appStore.getCurrentUser()! } : null);
  }

  const renderDashboard = () => {
    if (!currentUser) return <Auth onLogin={handleLogin} />;

    const role = currentUser.role;

    if (role === 'client') {
        return <ClientPortal user={currentUser} onRefreshUser={refreshUser} />;
    }
    if (role === 'pharmacist') {
        return <PharmacistPortal />;
    }
    if (role === 'rider') {
        return <RiderPortal />;
    }
    // All doctor types use DoctorPortal
    if (role === 'doctor' || role === 'paediatrician' || role === 'dentist' || role === 'ent' || role === 'cardiologist' || role === 'dermatologist' || role === 'psychiatrist') {
        return <DoctorPortal role={role} />;
    }
    
    return <div className="p-8 text-center text-gray-500">Access Denied</div>;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 font-sans pb-20 relative">
      <Header user={currentUser} onLogout={handleLogout} onEmergency={handleEmergencyTrigger} />
      
      {/* Toast Notification */}
      {toastMsg && (
          <div className="fixed bottom-6 right-6 z-[200] bg-gray-900 text-white px-6 py-3 rounded-lg shadow-xl animate-slide-up flex items-center gap-3">
              <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
              <span className="font-medium text-sm">{toastMsg}</span>
          </div>
      )}

      {/* Emergency Overlay */}
      {showEmergency && (
          <div className="fixed inset-0 z-[100] bg-red-600 flex flex-col items-center justify-center text-white animate-fade-in text-center p-6">
              <button 
                onClick={() => setShowEmergency(false)} 
                className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                title="Exit Emergency Mode"
              >
                  <X size={32} />
              </button>

              <div className="bg-white text-red-600 p-8 rounded-full mb-6 animate-ping absolute opacity-20 w-64 h-64"></div>
              <div className="bg-white text-red-600 p-8 rounded-full mb-6 animate-pulse relative z-10">
                  <AlertTriangle size={64} />
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 uppercase tracking-wider">EMERGENCY PROTOCOL ACTIVE</h1>
              <p className="text-xl opacity-90 mb-8 max-w-lg">
                  Ambulance Dispatch has been notified. Location sharing is enabled. 
              </p>
              
              <div className="bg-red-800/50 p-6 rounded-xl border border-red-400/30 max-w-md w-full mb-8 backdrop-blur-sm">
                  <h3 className="font-bold text-lg mb-4 flex items-center justify-center gap-2"><Activity size={20}/> IMMEDIATE ACTIONS</h3>
                  <ul className="text-left space-y-3 text-sm font-medium">
                      <li>1. Stay calm and do not move if injured.</li>
                      <li>2. Unlock your front door for paramedics.</li>
                      <li>3. Gather any current medications.</li>
                      <li>4. Keep your phone line open.</li>
                  </ul>
              </div>

              <div className="flex items-center gap-2 text-3xl font-mono font-bold">
                  <Phone className="animate-bounce" />
                  <span>Connecting... 00:03</span>
              </div>
              
              <button 
                onClick={() => setShowEmergency(false)}
                className="mt-12 text-sm font-bold opacity-60 hover:opacity-100 underline"
              >
                  False Alarm? Return to Dashboard
              </button>
          </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderDashboard()}
      </main>
    </div>
  );
};

export default App;
