import React from 'react';
import { Stethoscope, Pill, Truck, Activity, Heart, Baby, Ear, Brain, Syringe } from 'lucide-react';
import { UserRole } from '../types';

interface SpecialistGridProps {
  onSelectRole: (role: UserRole) => void;
}

const SpecialistGrid: React.FC<SpecialistGridProps> = ({ onSelectRole }) => {
  const specialists = [
    { id: 'doctor', role: 'doctor' as UserRole, name: 'General Medical Doctor', icon: Stethoscope },
    { id: 'paediatrician', role: 'paediatrician' as UserRole, name: 'Paediatrician', icon: Baby },
    { id: 'dentist', role: 'dentist' as UserRole, name: 'Dentist', icon: Activity },
    { id: 'ent', role: 'ent' as UserRole, name: 'ENT Doctor', icon: Ear },
    { id: 'cardiologist', role: 'cardiologist' as UserRole, name: 'Cardiologist', icon: Heart },
    { id: 'dermatologist', role: 'dermatologist' as UserRole, name: 'Dermatologist', icon: Syringe },
    { id: 'psychiatrist', role: 'psychiatrist' as UserRole, name: 'Psychiatrist', icon: Brain },
    { id: 'pharmacist', role: 'pharmacist' as UserRole, name: 'Pharmacist', icon: Pill },
    { id: 'rider', role: 'rider' as UserRole, name: 'Dispatch Rider', icon: Truck },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {specialists.map((spec) => (
        <button
          key={spec.id}
          onClick={() => onSelectRole(spec.role)}
          className="relative group flex flex-col items-center p-6 sm:p-8 rounded-2xl border border-gray-100 bg-white hover:border-teal-500 hover:shadow-xl hover:shadow-teal-900/5 transition-all duration-300 text-center"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300 bg-teal-50 text-teal-700">
            <spec.icon size={28} className="sm:w-8 sm:h-8" />
          </div>
          
          <h3 className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-teal-700 transition-colors">
            {spec.name}
          </h3>
          
          <span className="mt-2 text-xs text-teal-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
            Access Portal &rarr;
          </span>
        </button>
      ))}
    </div>
  );
};

export default SpecialistGrid;