
import React, { useState, useEffect } from 'react';
import { UserRole, User } from '../types';
import SpecialistGrid from './SpecialistGrid';
import { appStore } from '../services/store';
import { User as UserIcon, Lock, Mail, Phone, HeartPulse, CreditCard, ArrowRight, Upload, Sparkles, Check, Play, Star, ShieldCheck, HelpCircle, Activity, ChevronDown, Stethoscope, Pill, Truck, Brain, CheckCircle } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'landing' | 'how_it_works' | 'login' | 'signup' | 'staff_selection'>('landing');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Signup State
  const [step, setStep] = useState(1);
  const [selectedPfp, setSelectedPfp] = useState<string>('https://api.dicebear.com/7.x/avataaars/svg?seed=Felix');
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '',
    allergies: '', hmoProvider: '', hmoNumber: '',
    emergencyContactName: '', emergencyContactPhone: '', dob: ''
  });
  
  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = appStore.login(email, password);
    if (user) {
        if (selectedRole && user.role !== selectedRole && selectedRole !== 'client') {
            setError(`Incorrect role. This account is not a ${selectedRole}.`);
            return;
        }
        onLogin(user);
    } else {
        setError('Invalid credentials.');
    }
  };

  const handleSignupSubmit = () => {
    const newUser = appStore.signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: 'client',
        profile: {
            allergies: formData.allergies,
            hmoProvider: formData.hmoProvider,
            hmoNumber: formData.hmoNumber,
            emergencyContactName: formData.emergencyContactName,
            emergencyContactPhone: formData.emergencyContactPhone,
            dob: formData.dob,
            pfpUrl: selectedPfp,
            privateNotes: ''
        }
    });
    onLogin(newUser);
  };

  const pfpOptions = [
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice'
  ];

  const wholesomeImages = [
    "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=500",
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=500",
    "https://images.unsplash.com/photo-1551884170-09fb70a3a2ed?auto=format&fit=crop&q=80&w=500",
    "https://images.unsplash.com/photo-1516574187841-69301976e499?auto=format&fit=crop&q=80&w=500",
    "https://images.unsplash.com/photo-1576091160550-2187d80aeff2?auto=format&fit=crop&q=80&w=500",
    "https://images.unsplash.com/photo-1536682932055-dc022a8a34a8?auto=format&fit=crop&q=80&w=500",
    "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&q=80&w=500",
    "https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&q=80&w=500",
  ];

  // --- Views ---

  if (mode === 'landing') {
    return (
      <div className="bg-white min-h-screen font-sans text-gray-900">
        
        {/* Navbar */}
        <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => setMode('landing')}>
                    <div className="bg-teal-700 p-2 rounded-lg text-white">
                        <HeartPulse className="w-6 h-6" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-gray-900">DirectPulse</span>
                </div>
                <div className="flex items-center gap-6">
                    <button onClick={() => setMode('how_it_works')} className="hidden md:block text-sm font-semibold text-gray-600 hover:text-teal-700 transition-colors">How it Works</button>
                    <button onClick={() => setMode('staff_selection')} className="hidden md:block text-sm font-semibold text-gray-600 hover:text-teal-700 transition-colors">Staff Portal</button>
                    <button onClick={() => setMode('login')} className="px-5 py-2.5 bg-gray-900 text-white rounded-full font-bold text-sm hover:bg-gray-800 transition-all shadow-lg shadow-gray-200">Patient Login</button>
                </div>
            </div>
        </nav>

        {/* Hero Section */}
        <div className="relative pt-16 pb-20 lg:pt-24 lg:pb-32 overflow-hidden bg-gradient-to-b from-white to-gray-50/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div className="animate-fade-in-up">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-xs font-bold uppercase tracking-wider mb-6">
                            <Star size={12} className="fill-current" />
                            #1 Rated AI Triage System
                        </div>
                        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-6">
                            Expert care, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-400">instantly delivered.</span>
                        </h1>
                        <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-lg">
                            Skip the waiting room. Our AI routes you to the right specialist in seconds, coordinates your prescription, and delivers medication to your door.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button onClick={() => setMode('login')} className="px-8 py-4 bg-teal-600 text-white rounded-xl font-bold text-lg hover:bg-teal-700 transition-all shadow-xl shadow-teal-100 flex items-center justify-center gap-2">
                                Start Triage
                                <ArrowRight size={20} />
                            </button>
                            <button onClick={() => setMode('how_it_works')} className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                                <Play size={20} className="fill-gray-900" />
                                How it Works
                            </button>
                        </div>
                        <div className="mt-10 flex items-center gap-4 text-sm text-gray-500 font-medium">
                            <div className="flex -space-x-3">
                                {[1,2,3,4].map(i => (
                                    <img key={i} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i+20}`} className="w-10 h-10 rounded-full border-2 border-white bg-gray-100" />
                                ))}
                            </div>
                            <p>Trusted by 12,000+ patients</p>
                        </div>
                    </div>
                    <div className="relative animate-fade-in" style={{animationDelay: '0.2s'}}>
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-teal-900/10 border border-gray-100">
                             <img src="https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&q=80&w=1000" alt="Hospital Doctor" className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700" />
                             <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
                                 <p className="text-white font-bold text-lg">Dr. Sarah Jenkins</p>
                                 <p className="text-gray-200 text-sm">Head of Cardiology</p>
                             </div>
                        </div>
                        {/* Floating Cards */}
                        <div className="absolute -left-6 top-20 bg-white p-4 rounded-xl shadow-xl border border-gray-100 animate-slide-up">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 text-red-600 rounded-full"><HeartPulse size={20} /></div>
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase">Vitals</p>
                                    <p className="font-bold text-gray-900">Stable</p>
                                </div>
                            </div>
                        </div>
                         <div className="absolute -right-6 bottom-20 bg-white p-4 rounded-xl shadow-xl border border-gray-100 animate-slide-up" style={{animationDelay: '0.2s'}}>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-teal-100 text-teal-600 rounded-full"><Check size={20} /></div>
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase">Diagnosis</p>
                                    <p className="font-bold text-gray-900">Complete</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white py-16 border-y border-gray-100">
             <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                 <div>
                     <p className="text-4xl font-extrabold text-teal-700">2.5s</p>
                     <p className="text-sm text-gray-500 mt-2 font-medium uppercase tracking-wide">Avg. Triage Time</p>
                 </div>
                 <div>
                     <p className="text-4xl font-extrabold text-teal-700">99.8%</p>
                     <p className="text-sm text-gray-500 mt-2 font-medium uppercase tracking-wide">Accuracy Rate</p>
                 </div>
                 <div>
                     <p className="text-4xl font-extrabold text-teal-700">24/7</p>
                     <p className="text-sm text-gray-500 mt-2 font-medium uppercase tracking-wide">Doctor Availability</p>
                 </div>
                 <div>
                     <p className="text-4xl font-extrabold text-teal-700">15m</p>
                     <p className="text-sm text-gray-500 mt-2 font-medium uppercase tracking-wide">Prescription Delivery</p>
                 </div>
             </div>
        </div>

        {/* Wholesome Infinite Scroll Section */}
        <div className="py-20 bg-gray-50 overflow-hidden">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Compassionate Care, Everywhere</h2>
                <p className="text-gray-500 max-w-2xl mx-auto text-lg">We are connecting real people with real care. Every smile tells a story of a recovery made faster.</p>
            </div>
            
            <div className="relative w-full overflow-hidden">
                <div className="flex gap-8 animate-marquee w-max">
                    {[...wholesomeImages, ...wholesomeImages, ...wholesomeImages].map((url, idx) => (
                        <div key={idx} className="w-80 h-56 rounded-2xl overflow-hidden shadow-lg flex-shrink-0 group">
                            <img src={url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Wholesome medical moment" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                <span className="text-white font-medium text-sm">Patient Recovery #{2034 + idx}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Features Deep Dive */}
        <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-20">
                <div className="inline-block px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-4">Core Technology</div>
                <h2 className="text-4xl font-extrabold text-gray-900 mb-6">Built on the world's most advanced medical AI.</h2>
                <p className="text-xl text-gray-500">DirectPulse integrates Google's Gemini 3.0 Pro models to understand context, medical history, and severity in real-time.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 hover:-translate-y-2 transition-transform duration-300">
                    <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-700 mb-8">
                        <Brain size={28} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Neural Diagnostics</h3>
                    <p className="text-gray-500 leading-relaxed mb-6">Our system doesn't just keyword match. It understands symptoms like a doctor, identifying rare conditions and red flags instantly.</p>
                    <ul className="space-y-3">
                         <li className="flex items-center gap-2 text-sm text-gray-700"><CheckCircle size={16} className="text-teal-500"/> Context Aware</li>
                         <li className="flex items-center gap-2 text-sm text-gray-700"><CheckCircle size={16} className="text-teal-500"/> Voice Analysis</li>
                         <li className="flex items-center gap-2 text-sm text-gray-700"><CheckCircle size={16} className="text-teal-500"/> Multi-modal Input</li>
                    </ul>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 hover:-translate-y-2 transition-transform duration-300 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <ShieldCheck size={120} />
                    </div>
                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-700 mb-8 relative z-10">
                        <Lock size={28} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 relative z-10">Zero-Trust Privacy</h3>
                    <p className="text-gray-500 leading-relaxed mb-6 relative z-10">Your health data is your own. We utilize client-side encryption for private notes and strictly regulated access controls for staff.</p>
                    <ul className="space-y-3 relative z-10">
                         <li className="flex items-center gap-2 text-sm text-gray-700"><CheckCircle size={16} className="text-indigo-500"/> AES-256 Encryption</li>
                         <li className="flex items-center gap-2 text-sm text-gray-700"><CheckCircle size={16} className="text-indigo-500"/> HIPAA Compliant Architecture</li>
                         <li className="flex items-center gap-2 text-sm text-gray-700"><CheckCircle size={16} className="text-indigo-500"/> Audit Logging</li>
                    </ul>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 hover:-translate-y-2 transition-transform duration-300">
                    <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-700 mb-8">
                        <CreditCard size={28} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Unified Logistics</h3>
                    <p className="text-gray-500 leading-relaxed mb-6">The first platform to combine telemedicine with last-mile logistics. One click to pay for consultation and medication delivery.</p>
                    <ul className="space-y-3">
                         <li className="flex items-center gap-2 text-sm text-gray-700"><CheckCircle size={16} className="text-purple-500"/> Real-time Tracking</li>
                         <li className="flex items-center gap-2 text-sm text-gray-700"><CheckCircle size={16} className="text-purple-500"/> Secure OTP Handover</li>
                         <li className="flex items-center gap-2 text-sm text-gray-700"><CheckCircle size={16} className="text-purple-500"/> Insurance Integration</li>
                    </ul>
                </div>
            </div>
        </div>

        {/* Testimonials */}
        <div className="bg-teal-900 py-24 text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-teal-500 rounded-full blur-[100px]"></div>
            </div>
            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-4xl font-bold mb-6">Don't just take our word for it.</h2>
                        <p className="text-teal-200 text-lg mb-8">Thousands of patients have switched to DirectPulse for faster, more reliable healthcare access.</p>
                        <div className="flex gap-4">
                            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/10">
                                <div className="flex text-yellow-400 mb-2">
                                    {[1,2,3,4,5].map(i => <Star key={i} size={16} fill="currentColor" />)}
                                </div>
                                <p className="text-sm leading-relaxed mb-4">"I woke up with severe pain and DirectPulse routed me to a specialist in 3 minutes. The meds arrived an hour later."</p>
                                <div className="flex items-center gap-3">
                                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica" className="w-8 h-8 rounded-full bg-white/20" />
                                    <span className="text-xs font-bold">Jessica M.</span>
                                </div>
                            </div>
                             <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/10 hidden md:block">
                                <div className="flex text-yellow-400 mb-2">
                                    {[1,2,3,4,5].map(i => <Star key={i} size={16} fill="currentColor" />)}
                                </div>
                                <p className="text-sm leading-relaxed mb-4">"The doctor chat feature is amazing. It feels like having a hospital in my pocket."</p>
                                <div className="flex items-center gap-3">
                                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus" className="w-8 h-8 rounded-full bg-white/20" />
                                    <span className="text-xs font-bold">Marcus T.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="h-[400px] bg-gray-200 rounded-3xl overflow-hidden relative">
                        <img src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-8">
                            <div>
                                <p className="text-2xl font-bold">Partners in Health</p>
                                <p className="text-gray-300 text-sm">Working with top-tier hospitals nationwide.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* FAQ Section */}
        <div className="py-24 max-w-3xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Frequently Asked Questions</h2>
            <div className="space-y-4">
                {[
                    { q: "Is DirectPulse a replacement for 911?", a: "No. While we have emergency detection protocols that can alert authorities, DirectPulse is designed for non-critical triage. Always call 911 in life-threatening situations." },
                    { q: "How accurate is the AI diagnosis?", a: "Our AI is powered by Gemini 3.0 and validated by medical professionals. However, it provides a preliminary analysis that is always reviewed by a licensed doctor before any prescription is issued." },
                    { q: "Do you accept insurance?", a: "Yes, we partner with major HMO providers. You can enter your policy details in your profile for direct billing." },
                    { q: "Is my data safe?", a: "Absolutely. We use enterprise-grade encryption for all medical records and adhere to strict privacy standards." }
                ].map((item, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden">
                        <button 
                            onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                            className="w-full flex justify-between items-center p-5 text-left bg-white hover:bg-gray-50 transition-colors"
                        >
                            <span className="font-bold text-gray-800">{item.q}</span>
                            <ChevronDown size={20} className={`transform transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                        </button>
                        {openFaq === idx && (
                            <div className="p-5 pt-0 bg-white text-gray-600 leading-relaxed text-sm border-t border-gray-100">
                                {item.a}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>

        {/* CTA */}
        <div className="bg-gray-900 py-20 text-center">
             <h2 className="text-3xl font-bold text-white mb-6">Ready to experience the future?</h2>
             <button onClick={() => setMode('login')} className="px-8 py-4 bg-teal-600 text-white rounded-full font-bold text-lg hover:bg-teal-500 transition-all shadow-lg shadow-teal-900/50">
                 Get Started Now
             </button>
        </div>
        
        <footer className="bg-white border-t border-gray-100 py-12">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <div className="flex justify-center items-center gap-2 mb-4">
                    <HeartPulse className="text-teal-700" size={24} />
                    <span className="text-xl font-bold text-gray-900">DirectPulse</span>
                </div>
                <p className="text-gray-500 text-sm">&copy; 2024 DirectPulse Health Systems. All rights reserved.</p>
            </div>
        </footer>
      </div>
    );
  }

  // --- How It Works Page ---
  if (mode === 'how_it_works') {
      return (
        <div className="bg-white min-h-screen font-sans text-gray-900">
             {/* Navbar */}
             <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => setMode('landing')}>
                        <div className="bg-teal-700 p-2 rounded-lg text-white">
                            <HeartPulse className="w-6 h-6" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-gray-900">DirectPulse</span>
                    </div>
                    <button onClick={() => setMode('landing')} className="text-sm font-bold text-gray-500 hover:text-gray-900">
                        &larr; Back to Home
                    </button>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto px-4 py-16">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">How DirectPulse Works</h1>
                    <p className="text-xl text-gray-500">From symptom to cure in 4 simple steps.</p>
                </div>

                <div className="space-y-24 relative">
                    {/* Vertical Line */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gray-100 hidden md:block -z-10 transform -translate-x-1/2"></div>

                    {/* Step 1 */}
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="text-right pr-8 hidden md:block">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">1. Input Symptoms</h3>
                            <p className="text-gray-500">Describe your condition using text or voice. Our system supports natural language, so just speak as if you were talking to a doctor.</p>
                        </div>
                        <div className="relative flex justify-center md:justify-start">
                            <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold text-2xl z-10 border-4 border-white shadow-xl">1</div>
                            <div className="md:hidden mt-4 text-center">
                                <h3 className="text-xl font-bold text-gray-900">Input Symptoms</h3>
                                <p className="text-gray-500 text-sm mt-2">Describe your condition using text or voice. Natural language supported.</p>
                            </div>
                        </div>
                        <div className="md:hidden">
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                                <Activity className="text-teal-600 mb-4" size={32}/>
                                <div className="text-sm font-mono bg-white p-3 rounded border border-gray-200 text-gray-500">"I have a sharp pain in my left side..."</div>
                            </div>
                        </div>
                        <div className="hidden md:block pl-8">
                             <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 transform hover:scale-105 transition-transform">
                                <Activity className="text-teal-600 mb-4" size={32}/>
                                <div className="text-sm font-mono bg-white p-3 rounded border border-gray-200 text-gray-500">"I have a sharp pain in my left side..."</div>
                            </div>
                        </div>
                    </div>

                     {/* Step 2 */}
                     <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="hidden md:block pr-8">
                             <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 transform hover:scale-105 transition-transform">
                                <Brain className="text-indigo-600 mb-4" size={32}/>
                                <div className="space-y-2">
                                    <div className="h-2 w-3/4 bg-indigo-200 rounded animate-pulse"></div>
                                    <div className="h-2 w-1/2 bg-indigo-200 rounded animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                         <div className="relative flex justify-center md:justify-start order-first md:order-none">
                            <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-2xl z-10 border-4 border-white shadow-xl">2</div>
                        </div>
                        <div className="pl-8 hidden md:block">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">2. AI Analysis & Routing</h3>
                            <p className="text-gray-500">The Gemini 3.0 engine analyzes your input for severity and specialty match. It creates a preliminary report and routes you to the exact right specialist queue.</p>
                        </div>
                         <div className="md:hidden text-center mt-[-40px]">
                            <h3 className="text-xl font-bold text-gray-900">AI Analysis & Routing</h3>
                            <p className="text-gray-500 text-sm mt-2">Gemini 3.0 analyzes severity and matches you to the right specialist instantly.</p>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="text-right pr-8 hidden md:block">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">3. Doctor Consultation</h3>
                            <p className="text-gray-500">A human doctor reviews the AI findings, connects with you via chat or secure call, and issues a digital prescription if needed.</p>
                        </div>
                        <div className="relative flex justify-center md:justify-start">
                            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl z-10 border-4 border-white shadow-xl">3</div>
                        </div>
                        <div className="hidden md:block pl-8">
                             <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 transform hover:scale-105 transition-transform">
                                <Stethoscope className="text-purple-600 mb-4" size={32}/>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                                    <div className="text-xs text-gray-500">Dr. Smith is typing...</div>
                                </div>
                            </div>
                        </div>
                        <div className="md:hidden text-center mt-[-40px]">
                            <h3 className="text-xl font-bold text-gray-900">Doctor Consultation</h3>
                            <p className="text-gray-500 text-sm mt-2">Chat or call with a specialist who reviews your AI report and prescribes treatment.</p>
                        </div>
                    </div>

                    {/* Step 4 */}
                     <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="hidden md:block pr-8">
                             <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 transform hover:scale-105 transition-transform">
                                <Truck className="text-orange-600 mb-4" size={32}/>
                                <div className="flex justify-between items-center bg-white p-2 rounded border border-gray-100">
                                    <span className="text-xs font-bold">Order #1024</span>
                                    <span className="text-xs text-green-600 font-bold">Out for Delivery</span>
                                </div>
                            </div>
                        </div>
                         <div className="relative flex justify-center md:justify-start order-first md:order-none">
                            <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-2xl z-10 border-4 border-white shadow-xl">4</div>
                        </div>
                        <div className="pl-8 hidden md:block">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">4. Fulfillment & Delivery</h3>
                            <p className="text-gray-500">Pay securely in the app. A pharmacist prepares your order, and a rider delivers it to your doorstep. Verify receipt with a secure OTP.</p>
                        </div>
                         <div className="md:hidden text-center mt-[-40px]">
                            <h3 className="text-xl font-bold text-gray-900">Fulfillment & Delivery</h3>
                            <p className="text-gray-500 text-sm mt-2">Pay securely. A rider brings meds to your door. Verify with OTP.</p>
                        </div>
                    </div>
                </div>

                <div className="mt-24 text-center">
                    <button onClick={() => setMode('login')} className="px-12 py-5 bg-gray-900 text-white rounded-full font-bold text-xl hover:bg-black transition-all shadow-xl">
                        Experience It Now
                    </button>
                </div>
            </div>
            
             <footer className="bg-white border-t border-gray-100 py-12">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <div className="flex justify-center items-center gap-2 mb-4">
                        <HeartPulse className="text-teal-700" size={24} />
                        <span className="text-xl font-bold text-gray-900">DirectPulse</span>
                    </div>
                    <p className="text-gray-500 text-sm">&copy; 2024 DirectPulse Health Systems. All rights reserved.</p>
                </div>
            </footer>
        </div>
      );
  }

  if (mode === 'staff_selection') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 animate-fade-in bg-white min-h-screen">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Staff Portal</h2>
          <p className="text-gray-500 mt-2">Select your department to authenticate.</p>
          <button onClick={() => setMode('landing')} className="mt-4 text-sm text-teal-600 hover:underline">&larr; Back to Home</button>
        </div>
        <SpecialistGrid onSelectRole={(role) => { setSelectedRole(role); setMode('login'); }} />
      </div>
    );
  }

  if (mode === 'signup') {
      return (
          <div className="max-w-lg mx-auto px-4 py-8 animate-fade-in bg-white shadow-xl rounded-2xl mt-10 border border-gray-100">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
                <div className="flex gap-2 mt-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full ${step >= i ? 'bg-teal-600' : 'bg-gray-200'} transition-all duration-500`} />
                    ))}
                </div>
              </div>

              {step === 1 && (
                  <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800">Personal Credentials</h3>
                      <input type="text" placeholder="Full Name" className="w-full p-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                      <input type="email" placeholder="Email Address" className="w-full p-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                      
                      <div className="relative">
                          <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                          <input type="tel" placeholder="Phone Number" className="w-full pl-10 p-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                      </div>

                      <input type="password" placeholder="Create Password" className="w-full p-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                      <input type="date" placeholder="Date of Birth" className="w-full p-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
                      
                      <div className="pt-4">
                           <h4 className="text-sm font-bold text-gray-700 mb-3">Choose your Avatar</h4>
                           <div className="flex gap-3 overflow-x-auto pb-2">
                               {pfpOptions.map(url => (
                                   <button 
                                     key={url} 
                                     onClick={() => setSelectedPfp(url)}
                                     className={`relative w-12 h-12 rounded-full border-2 ${selectedPfp === url ? 'border-teal-600 ring-2 ring-teal-100' : 'border-gray-200'}`}
                                   >
                                       <img src={url} className="w-full h-full rounded-full" />
                                       {selectedPfp === url && <div className="absolute -bottom-1 -right-1 bg-teal-600 text-white rounded-full p-0.5"><Check size={10} /></div>}
                                   </button>
                               ))}
                           </div>
                      </div>

                      <button onClick={() => setStep(2)} disabled={!formData.email || !formData.password || !formData.name || !formData.phone} className="w-full py-3 bg-teal-600 text-white rounded-lg font-bold mt-4 disabled:opacity-50">Next Step</button>
                  </div>
              )}

              {step === 2 && (
                   <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800">Medical Profile</h3>
                      <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-100 rounded-lg text-yellow-800 text-sm">
                          <HeartPulse size={16} />
                          <span>Information kept strictly confidential and encrypted.</span>
                      </div>
                      <textarea placeholder="Known Allergies (e.g., Peanuts, Penicillin)" className="w-full p-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" value={formData.allergies} onChange={e => setFormData({...formData, allergies: e.target.value})} />
                      <input type="text" placeholder="HMO Provider (Optional)" className="w-full p-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" value={formData.hmoProvider} onChange={e => setFormData({...formData, hmoProvider: e.target.value})} />
                      <input type="text" placeholder="HMO Number" className="w-full p-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" value={formData.hmoNumber} onChange={e => setFormData({...formData, hmoNumber: e.target.value})} />
                      <div className="flex justify-between mt-4">
                        <button onClick={() => setStep(1)} className="text-gray-500 font-medium">Back</button>
                        <button onClick={() => setStep(3)} className="py-3 px-6 bg-teal-600 text-white rounded-lg font-bold">Next Step</button>
                      </div>
                  </div>
              )}

              {step === 3 && (
                   <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800">Emergency Contact</h3>
                      <input type="text" placeholder="Contact Name" className="w-full p-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" value={formData.emergencyContactName} onChange={e => setFormData({...formData, emergencyContactName: e.target.value})} />
                      <input type="tel" placeholder="Contact Phone" className="w-full p-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" value={formData.emergencyContactPhone} onChange={e => setFormData({...formData, emergencyContactPhone: e.target.value})} />
                      
                      <div className="mt-6 pt-6 border-t border-gray-100">
                          <button onClick={handleSignupSubmit} className="w-full py-3 bg-teal-800 text-white rounded-lg font-bold hover:bg-teal-900 shadow-lg">Complete Registration</button>
                      </div>
                      <button onClick={() => setStep(2)} className="w-full mt-2 text-gray-500 font-medium">Back</button>
                  </div>
              )}
              
              <div className="mt-6 text-center">
                  <button onClick={() => setMode('login')} className="text-sm text-teal-600 font-bold hover:underline">Already have an account? Sign In</button>
              </div>
          </div>
      )
  }

  // Login View
  return (
    <div className="max-w-md mx-auto px-4 py-12 animate-fade-in bg-white shadow-xl rounded-2xl mt-10 border border-gray-100">
        <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
                {selectedRole ? `${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Login` : 'Sign In'}
            </h2>
            <p className="text-gray-500 text-sm">Enter your credentials to access DirectPulse.</p>
        </div>

        <form onSubmit={handleLoginSubmit} className="space-y-4">
            {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center font-medium border border-red-100">{error}</div>}
            
            <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 uppercase">Email</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input 
                        type="email" 
                        required
                        className="w-full pl-10 p-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                        placeholder={selectedRole ? `${selectedRole}@directpulse.com` : "you@email.com"}
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 uppercase">Password</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input 
                        type="password" 
                        required
                        className="w-full pl-10 p-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                </div>
                {selectedRole && <p className="text-[10px] text-gray-400 text-right">Default staff password: "staff"</p>}
            </div>

            <button type="submit" className="w-full py-3 bg-teal-700 text-white rounded-lg font-bold hover:bg-teal-800 transition-colors shadow-md">
                Authenticate
            </button>
        </form>

        <div className="mt-6 text-center space-y-2">
            {!selectedRole && (
                <button onClick={() => setMode('signup')} className="text-sm text-teal-600 font-bold hover:underline">
                    New Patient? Create Account
                </button>
            )}
            <br />
            <button onClick={() => {setMode('landing'); setSelectedRole(null); setError('')}} className="text-xs text-gray-400 hover:text-gray-600">
                &larr; Return to Home
            </button>
        </div>
    </div>
  );
};

export default Auth;
