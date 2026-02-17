import React from 'react';
import { Activity, LogOut, User as UserIcon, ShieldAlert } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  onEmergency?: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onEmergency }) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="bg-teal-700 p-2 rounded-lg text-white shadow-lg shadow-teal-700/20">
            <Activity size={24} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight leading-none">DirectPulse</h1>
            <p className="text-[10px] text-teal-600 font-bold uppercase tracking-wider">Intelligent Triage</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {user && user.role === 'client' && (
             <button 
               onClick={onEmergency}
               className="hidden sm:flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full text-sm font-bold shadow-md transition-transform active:scale-95 animate-pulse"
             >
               <ShieldAlert size={16} />
               EMERGENCY
             </button>
          )}

          {user && (
             <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
               <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center overflow-hidden border border-teal-200">
                 {user.profile?.pfpUrl ? (
                   <img src={user.profile.pfpUrl} alt="PFP" className="w-full h-full object-cover" />
                 ) : (
                   <UserIcon size={16} className="text-teal-700" />
                 )}
               </div>
               <div className="hidden md:block text-xs">
                 <span className="font-bold text-gray-900 block">{user.name}</span>
                 <span className="text-gray-500 uppercase text-[10px] tracking-wider">{user.role}</span>
               </div>
             </div>
          )}
          
          {user && (
            <button 
              onClick={onLogout}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;