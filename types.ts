
export interface TriageResponse {
  emergency_override: boolean;
  emergency_message: string | null;
  recommended_department: string;
  patient_summary: string;
  ai_preliminary_analysis: string[];
  human_error_checks: string[];
}

export interface AnalysisState {
  loading: boolean;
  data: TriageResponse | null;
  error: string | null;
}

// Added specific doctor specialties to the union type
export type UserRole = 
  | 'client' 
  | 'pharmacist' 
  | 'rider'
  | 'doctor' // General
  | 'paediatrician'
  | 'dentist'
  | 'ent'
  | 'cardiologist'
  | 'dermatologist'
  | 'psychiatrist';

export interface PatientProfile {
  allergies: string;
  hmoProvider: string;
  hmoNumber: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  dob: string;
  pfpUrl?: string; // Unlocked feature
  privateNotes?: string; // Local user notes
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  phone?: string; // Added phone number
  password?: string; // For mock auth
  profile?: PatientProfile;
  hasDeliveredOrder?: boolean; // To unlock PFP
}

export type RequestStatus = 'pending_triage' | 'triaged' | 'prescribed' | 'awaiting_payment' | 'paid' | 'ready_for_pickup' | 'out_for_delivery' | 'delivered';
export type SeverityLevel = 'Low' | 'Medium' | 'High';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: number;
}

export interface TriageRequest {
  id: string;
  patientId: string;
  patientName: string;
  symptoms: string;
  timestamp: number;
  status: RequestStatus;
  severity: SeverityLevel;
  aiAnalysis?: TriageResponse;
  doctorNotes?: string;
  prescription?: string;
  drugImageUrl?: string;
  
  // Logistics
  deliveryCode?: string; // 4 digit code
  totalCost?: number;
  
  // Chat
  chatHistory: ChatMessage[];
}
