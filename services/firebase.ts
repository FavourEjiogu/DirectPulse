import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase only if config is present, or return a mock/dummy
// to avoid immediate crash in dev environment without env vars
const app = initializeApp(firebaseConfig.apiKey ? firebaseConfig : { apiKey: 'mock' });
export const auth = getAuth(app);

// Optional: Connect to emulator if in dev mode
if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATOR) {
    connectAuthEmulator(auth, "http://localhost:9099");
}
