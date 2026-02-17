import React, { useState } from 'react';
import { UserRole, User, PatientProfile } from '../types';
import SpecialistGrid from './SpecialistGrid';
import { appStore } from '../services/store';
import { auth } from '../services/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, updateProfile } from 'firebase/auth';
import { User as UserIcon, Lock, Mail, Phone, HeartPulse, CreditCard, ArrowRight, Upload, Sparkles, Check, Play, Star, Loader2 } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'landing' | 'login' | 'signup' | 'staff_selection'>('landing');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Signup State
  const [step, setStep] = useState(1);
  const [selectedPfp, setSelectedPfp] = useState<string>('https://api.dicebear.com/7.x/avataaars/svg?seed=Felix');
  const [verificationSent, setVerificationSent] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '',
    allergies: '', hmoProvider: '', hmoNumber: '',
    emergencyContactName: '', emergencyContactPhone: '', dob: ''
  });

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
        // 1. Attempt Firebase Login
        // We only attempt Firebase login if it's a client OR if we have setup staff accounts in Firebase.
        // For this demo, we assume staff accounts are still mocked in appStore unless explicitly migrated.
        // However, to support mixed mode, we try Firebase first, then fallback to mock.

        let firebaseUser = null;
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            firebaseUser = userCredential.user;
        } catch (fbError: any) {
            // Ignore if user not found, might be a mock user
            if (fbError.code !== 'auth/user-not-found' && fbError.code !== 'auth/invalid-credential' && fbError.code !== 'auth/invalid-email') {
                 console.error("Firebase Login Error:", fbError);
            }
        }

        if (firebaseUser) {
             // We don't have custom claims easily accessible without cloud functions,
             // so we assume Firebase users are Clients for this demo unless we store role in DB.
             // For simplicity, we construct a client user.

             // Note: In a real app, you'd fetch the user profile from Firestore here.
             // We will mock the profile part or use what we can get from Auth (displayName).

             const user: User = {
                 id: firebaseUser.uid,
                 email: firebaseUser.email!,
                 name: firebaseUser.displayName || email.split('@')[0],
                 role: 'client', // Default for Firebase users
                 profile: {
                     allergies: '', // Would come from DB
                     hmoProvider: '',
                     hmoNumber: '',
                     emergencyContactName: '',
                     emergencyContactPhone: '',
                     dob: '',
                     pfpUrl: firebaseUser.photoURL || undefined
                 }
             };

             if (selectedRole && user.role !== selectedRole && selectedRole !== 'client') {
                 setError(`Incorrect role. This account is not a ${selectedRole}.`);
                 setLoading(false);
                 return;
             }

             onLogin(user);
             return;
        }

        // 2. Fallback to Mock Login if Firebase fails or returns no user
        const mockUser = appStore.login(email, password);
        if (mockUser) {
             if (selectedRole && mockUser.role !== selectedRole && selectedRole !== 'client') {
                setError(`Incorrect role. This account is not a ${selectedRole}.`);
                setLoading(false);
                return;
            }
            onLogin(mockUser);
            return;
        }

        setError('Invalid credentials.');

    } catch (err: any) {
        console.error(err);
        setError(err.message || 'Login failed.');
    } finally {
        setLoading(false);
    }
  };

  const handleSignupSubmit = async () => {
    setLoading(true);
    setError('');

    try {
        // Attempt Firebase Signup
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;

        // Update Profile
        await updateProfile(user, {
            displayName: formData.name,
            photoURL: selectedPfp
        });

        // Send Verification Email
        await sendEmailVerification(user);
        setVerificationSent(true);

        // Note: In a real app, we would save the extra profile data (allergies, etc.) to Firestore here.
        // For this demo, we will rely on the local store for the session or just basic auth data.

    } catch (err: any) {
        console.error("Firebase Signup Error:", err);
        // Fallback to local store if Firebase is not configured (e.g. invalid API key)
        if (err.code === 'auth/invalid-api-key' || err.message?.includes('apiKey')) {
             const newUser = appStore.signup({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: 'client',
                profile: {
                    allergies: formData.allergies,
                    hmoProvider: formData.hmoProvider,
                    hmoNumber: formData.hmoNumber,
                    emergencyContactName: formData.emergencyContactName,
                    emergencyContactPhone: formData.emergencyContactPhone,
                    dob: formData.dob,
                    pfpUrl: selectedPfp
                }
            });
            onLogin(newUser);
        } else {
            setError(err.message);
        }
    } finally {
        setLoading(false);
    }
  };

  const pfpOptions = [
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice'
  ];

  // --- Views ---

  if (mode === 'landing') {
    return (
      <div className="bg-white">
        {/* Hero Section */}
        <div className="relative isolate overflow-hidden bg-gradient-to-b from-teal-100/20 pt-14">
            <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-32 flex flex-col lg:flex-row items-center gap-16">
                <div className="lg:w-1/2 text-center lg:text-left">
                    <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold text-teal-600 ring-1 ring-inset ring-teal-600/20 bg-teal-50 mb-6">
                        <Sparkles size={16} className="mr-2" />
                        AI-Powered Triage v2.0 Live
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl mb-6">
                        Healthcare at the Speed of Life.
                    </h1>
                    <p className="text-lg leading-8 text-gray-600 mb-8">
                        DirectPulse connects you to world-class diagnosis, instant specialist routing, and rapid pharmacy delivery—all powered by advanced AI Copilots.
                    </p>
                    <div className="flex items-center justify-center lg:justify-start gap-x-6">
                        <button
                            onClick={() => setMode('login')}
                            className="rounded-full bg-teal-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 transition-all active:scale-95"
                        >
                            Get Started
                        </button>
                        <button onClick={() => setMode('staff_selection')} className="text-sm font-semibold leading-6 text-gray-900 flex items-center gap-1 group">
                            Staff Login <span aria-hidden="true" className="group-hover:translate-x-1 transition-transform">→</span>
                        </button>
                    </div>
                </div>
                <div className="lg:w-1/2 relative">
                    <img 
                        src="https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&q=80&w=2000" 
                        alt="Hospital" 
                        className="rounded-2xl shadow-2xl ring-1 ring-gray-900/10 object-cover w-full h-[400px] lg:h-[500px]"
                    />
                    <div className="absolute -bottom-10 -left-10 bg-white p-6 rounded-xl shadow-xl border border-gray-100 max-w-xs hidden md:block animate-slide-up">
                        <div className="flex items-center gap-2 mb-2">
                             <div className="flex -space-x-2">
                                <img className="w-8 h-8 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100" alt="" />
                                <img className="w-8 h-8 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=100" alt="" />
                                <img className="w-8 h-8 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80&w=100" alt="" />
                             </div>
                             <span className="text-xs font-bold text-gray-500">+2k Patients served</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">"DirectPulse saved my life. The triage was accurate and the ambulance arrived in minutes."</p>
                        <div className="flex text-yellow-400 mt-2">
                            <Star size={12} fill="currentColor" />
                            <Star size={12} fill="currentColor" />
                            <Star size={12} fill="currentColor" />
                            <Star size={12} fill="currentColor" />
                            <Star size={12} fill="currentColor" />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Feature Grid */}
        <div className="bg-gray-50 py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl lg:text-center">
                    <h2 className="text-base font-semibold leading-7 text-teal-600">Faster Care</h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Everything you need for your health</p>
                </div>
                <div className="mx-auto mt-16 max-w-7xl sm:mt-20 lg:mt-24">
                    <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-3">
                        <div className="relative pl-16">
                            <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-teal-600">
                                <HeartPulse className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-base font-semibold leading-7 text-gray-900">AI Triage</h3>
                            <p className="mt-2 text-base leading-7 text-gray-600">Describe symptoms in plain English. Our AI analyzes severity and routes you instantly.</p>
                        </div>
                        <div className="relative pl-16">
                            <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-teal-600">
                                <CreditCard className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-base font-semibold leading-7 text-gray-900">Seamless Payments</h3>
                            <p className="mt-2 text-base leading-7 text-gray-600">Pay for consults and prescriptions in one tap. Transparent billing with insurance support.</p>
                        </div>
                        <div className="relative pl-16">
                             <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-teal-600">
                                <Lock className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-base font-semibold leading-7 text-gray-900">Secure Delivery</h3>
                            <p className="mt-2 text-base leading-7 text-gray-600">Prescriptions delivered to your door with 2FA code verification for maximum safety.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        {/* Visual Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            <img src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600" className="h-64 w-full object-cover hover:opacity-90 transition-opacity" alt="Ward" />
            <img src="https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&q=80&w=600" className="h-64 w-full object-cover hover:opacity-90 transition-opacity" alt="Pharmacy" />
            <img src="https://images.unsplash.com/photo-1617347454431-f49d7ff5c3b1?auto=format&fit=crop&q=80&w=600" className="h-64 w-full object-cover hover:opacity-90 transition-opacity" alt="Rider" />
            <img src="https://images.unsplash.com/photo-1516574187841-693018f54746?auto=format&fit=crop&q=80&w=600" className="h-64 w-full object-cover hover:opacity-90 transition-opacity" alt="Lab" />
        </div>

        <footer className="bg-gray-900 text-white py-12 text-center">
             <p className="text-gray-500">© 2024 DirectPulse Health Systems. All rights reserved.</p>
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
      if (verificationSent) {
          return (
              <div className="max-w-md mx-auto px-4 py-12 animate-fade-in bg-white shadow-xl rounded-2xl mt-10 border border-gray-100 text-center">
                  <div className="bg-teal-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Mail size={40} className="text-teal-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
                  <p className="text-gray-500 mb-6">We've sent a verification link to <span className="font-bold text-gray-900">{formData.email}</span>.</p>
                  <p className="text-sm text-gray-400 mb-6">Please verify your email to continue accessing DirectPulse.</p>
                  <button onClick={() => setMode('login')} className="text-teal-600 font-bold hover:underline">Back to Login</button>
              </div>
          );
      }

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

                      <button onClick={() => setStep(2)} disabled={!formData.email || !formData.password || !formData.name} className="w-full py-3 bg-teal-600 text-white rounded-lg font-bold mt-4 disabled:opacity-50">Next Step</button>
                  </div>
              )}

              {step === 2 && (
                   <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800">Medical Profile</h3>
                      <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-100 rounded-lg text-yellow-800 text-sm">
                          <HeartPulse size={16} />
                          <span>Information kept strictly confidential.</span>
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
                          <button onClick={handleSignupSubmit} disabled={loading} className="w-full py-3 bg-teal-800 text-white rounded-lg font-bold hover:bg-teal-900 shadow-lg flex items-center justify-center gap-2">
                              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Complete Registration'}
                          </button>
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

            <button type="submit" disabled={loading} className="w-full py-3 bg-teal-700 text-white rounded-lg font-bold hover:bg-teal-800 transition-colors shadow-md flex justify-center items-center gap-2">
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Authenticate'}
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