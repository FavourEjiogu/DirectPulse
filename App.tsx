import React, { useState } from 'react';
import Header from './components/Header';
import Auth from './components/Auth';
import ClientPortal from './components/dashboards/ClientPortal';
import DoctorPortal from './components/dashboards/DoctorPortal';
import PharmacistPortal from './components/dashboards/PharmacistPortal';
import RiderPortal from './components/dashboards/RiderPortal';
import { appStore } from './services/store';
import { User, UserRole } from './types';
import { AlertTriangle } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(appStore.getCurrentUser());
  const [showEmergency, setShowEmergency] = useState(false);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    appStore.logout();
    setCurrentUser(null);
  };

  const handleEmergencyTrigger = () => {
      setShowEmergency(true);
      setTimeout(() => {
          alert("Emergency Services Dispatched to your location (Simulated).");
          setShowEmergency(false);
      }, 3000);
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
    <div className="min-h-screen bg-slate-50 text-gray-900 font-sans pb-20">
      <Header user={currentUser} onLogout={handleLogout} onEmergency={handleEmergencyTrigger} />
      
      {showEmergency && (
          <div className="fixed inset-0 z-[100] bg-red-600 bg-opacity-90 flex flex-col items-center justify-center text-white animate-fade-in">
              <div className="bg-white text-red-600 p-8 rounded-full mb-6 animate-pulse">
                  <AlertTriangle size={64} />
              </div>
              <h1 className="text-4xl font-bold mb-2">EMERGENCY PROTOCOL ACTIVE</h1>
              <p className="text-xl opacity-90">Contacting Ambulance Services...</p>
              <p className="mt-4 font-mono text-2xl">00:03</p>
          </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderDashboard()}
      </main>
    </div>
  );
};

export default App;