
import { TriageRequest, User, UserRole, ChatMessage } from "../types";

// Mock Data Store
class Store {
  private requests: TriageRequest[] = [];
  private users: User[] = [];
  private currentUser: User | null = null;
  private toastListener: ((message: string) => void) | null = null;

  constructor() {
    this.seedData();
  }

  setToastListener(listener: (message: string) => void) {
      this.toastListener = listener;
  }

  triggerToast(message: string) {
      if (this.toastListener) {
          this.toastListener(message);
      }
  }

  private seedData() {
    // Medical Staff (Default password: staff)
    const specialties: UserRole[] = ['doctor', 'paediatrician', 'dentist', 'ent', 'cardiologist', 'dermatologist', 'psychiatrist', 'pharmacist', 'rider'];
    
    specialties.forEach(role => {
      this.users.push({
        id: `staff_${role}`,
        name: role === 'doctor' ? 'Dr. Sarah General' : `Staff ${role.charAt(0).toUpperCase() + role.slice(1)}`,
        role: role,
        email: `${role}@directpulse.com`,
        password: 'staff'
      });
    });

    // Existing Patient
    this.users.push({
      id: 'user_patient',
      name: 'John Doe',
      role: 'client',
      email: 'john@example.com',
      phone: '+1 (555) 012-3456',
      password: 'password123',
      profile: {
        allergies: 'Penicillin',
        hmoProvider: 'Axa Mansard',
        hmoNumber: 'AX99281',
        emergencyContactName: 'Jane Doe',
        emergencyContactPhone: '555-0199',
        dob: '1985-04-12',
        privateNotes: 'I feel anxious when visiting hospitals.'
      },
      hasDeliveredOrder: true // Can generate PFP
    });

    // Seed Request
    this.requests.push({
      id: 'req_123',
      patientId: 'user_patient',
      patientName: 'John Doe',
      symptoms: 'Mild fever and dry cough for 2 days.',
      timestamp: Date.now() - 10000000,
      status: 'pending_triage',
      severity: 'Medium',
      chatHistory: [],
      deliveryCode: '1234',
      totalCost: 50.00,
      drugImageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=300'
    });

    // Add a completed historical request for John Doe
    this.requests.push({
      id: 'req_old_1',
      patientId: 'user_patient',
      patientName: 'John Doe',
      symptoms: 'Severe migraine and light sensitivity.',
      timestamp: Date.now() - 500000000,
      status: 'delivered',
      severity: 'High',
      aiAnalysis: {
        emergency_override: false,
        emergency_message: null,
        recommended_department: 'General Medical Doctor',
        patient_summary: '45-year-old male with migraine.',
        ai_preliminary_analysis: ['Migraine', 'Tension Headache'],
        human_error_checks: ['Check BP', 'Hydration levels']
      },
      prescription: 'Sumatriptan 50mg',
      chatHistory: [],
      totalCost: 35.00,
      drugImageUrl: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&q=80&w=300'
    });
  }

  // --- Auth ---

  signup(user: Omit<User, 'id'>): User {
    const newUser = { ...user, id: `user_${Date.now()}` };
    this.users.push(newUser);
    this.currentUser = newUser;
    this.triggerToast(`Welcome to DirectPulse, ${newUser.name}!`);
    return newUser;
  }

  login(email: string, password: string):User | undefined {
    const user = this.users.find(u => u.email === email && u.password === password);
    if (user) {
      this.currentUser = user;
      this.triggerToast("Successfully logged in.");
    }
    return user;
  }

  logout() {
    this.currentUser = null;
    this.triggerToast("Logged out successfully.");
  }

  getCurrentUser() {
    return this.currentUser;
  }

  getUserById(id: string): User | undefined {
      return this.users.find(u => u.id === id);
  }

  updateUserProfile(userId: string, updates: Partial<User>) {
    const idx = this.users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      // Merge logic carefully for nested profile
      const currentProfile = this.users[idx].profile || {};
      const newProfile = updates.profile ? { ...currentProfile, ...updates.profile } : currentProfile;
      
      this.users[idx] = { ...this.users[idx], ...updates, profile: newProfile as any };
      
      if (this.currentUser?.id === userId) {
        this.currentUser = this.users[idx];
      }
      this.triggerToast("Profile updated successfully.");
    }
  }

  // --- Request Management ---

  getRequests(role: UserRole, userId?: string): TriageRequest[] {
    if (role === 'client') {
      return this.requests.filter(r => r.patientId === userId).sort((a,b) => b.timestamp - a.timestamp);
    }
    
    if (role === 'pharmacist') {
      return this.requests.filter(r => ['prescribed', 'awaiting_payment', 'paid', 'ready_for_pickup'].includes(r.status));
    }
    
    if (role === 'rider') {
      return this.requests.filter(r => ['ready_for_pickup', 'out_for_delivery', 'delivered'].includes(r.status));
    }

    // Doctors logic
    if (role === 'doctor' || ['paediatrician', 'dentist', 'ent', 'cardiologist', 'dermatologist', 'psychiatrist'].includes(role)) {
      return this.requests.filter(r => {
        // Base statuses for doctors
        const visibleStatus = ['pending_triage', 'triaged', 'prescribed', 'awaiting_payment', 'paid'].includes(r.status);
        if (!visibleStatus) return false;

        // "General Doctor" sees unassigned or General
        if (role === 'doctor') {
            return !r.aiAnalysis || r.aiAnalysis.recommended_department === 'General Medical Doctor';
        }

        // Specialists only see their department
        const departmentMap: Record<string, string> = {
            'paediatrician': 'Paediatrician',
            'dentist': 'Dentist',
            'ent': 'ENT Doctor',
            'cardiologist': 'Cardiologist',
            'dermatologist': 'Dermatologist',
            'psychiatrist': 'Psychiatrist'
        };
        
        return r.aiAnalysis?.recommended_department === departmentMap[role];
      }).sort((a,b) => b.timestamp - a.timestamp);
    }
    
    return [];
  }

  getPatientHistory(patientId: string): TriageRequest[] {
      return this.requests.filter(r => r.patientId === patientId).sort((a,b) => b.timestamp - a.timestamp);
  }

  addRequest(request: TriageRequest) {
    this.requests.unshift(request);
    this.triggerToast("Triage analysis started.");
  }

  updateRequest(id: string, updates: Partial<TriageRequest>) {
    const index = this.requests.findIndex(r => r.id === id);
    if (index !== -1) {
      this.requests[index] = { ...this.requests[index], ...updates };
      // Check for delivery completion to unlock PFP
      if (updates.status === 'delivered') {
        const patientId = this.requests[index].patientId;
        this.updateUserProfile(patientId, { hasDeliveredOrder: true });
      }
      if (updates.status) {
          this.triggerToast(`Request status updated: ${updates.status.replace('_', ' ')}`);
      }
    }
  }

  // --- Chat & Logistics ---

  addChatMessage(requestId: string, message: string, senderId: string, senderName: string) {
    const req = this.requests.find(r => r.id === requestId);
    if (req) {
      const newMsg: ChatMessage = {
        id: `msg_${Date.now()}`,
        senderId,
        senderName,
        message,
        timestamp: Date.now()
      };
      req.chatHistory = [...req.chatHistory, newMsg];
    }
  }

  verifyDeliveryCode(requestId: string, code: string): boolean {
    const req = this.requests.find(r => r.id === requestId);
    return req?.deliveryCode === code;
  }
}

export const appStore = new Store();
