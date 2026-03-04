
# DirectPulse: AI-Powered Medical Triage & Logistics Platform

DirectPulse is a next-generation healthcare platform that leverages Artificial Intelligence to streamline the patient journey—from initial symptom analysis to specialist routing, prescription fulfillment, and last-mile delivery.

## 🚀 Key Features

### 1. **Intelligent Triage Engine (Gemini 3.0 Flash)**
*   **Natural Language Analysis:** Patients describe symptoms in plain English/Voice.
*   **Real-time Routing:** AI determines severity (Low/Medium/High) and routes to the correct specialist (Cardiologist, ENT, etc.).
*   **Emergency Override:** Detects life-threatening keywords and triggers immediate UI overrides.

### 2. **Multi-Role Portals**
*   **Patient Portal:** Symptom check, history, profile management, private notes.
*   **Doctor Portal:** Patient queue, medical history review, live chat, calling overlay, prescription issuance, and referral/delegation system.
*   **Pharmacist Portal:** View incoming prescriptions and mark for pickup.
*   **Rider Portal:** Manage last-mile delivery with secure OTP verification.

### 3. **Surreal UI/UX**
*   Immersive landing page with glassmorphism and animated gradients.
*   Clean, accessible dashboard interfaces using Tailwind CSS.
*   Real-time feedback loops (loading states, toasts, animations).

### 4. **Safety & Security**
*   **Data Protection:** Simulated AES-256 encryption for private notes.
*   **Delivery Verification:** 4-digit secure pins for drug handover.
*   **Human-in-the-loop:** Explicit "Human Error Checks" provided by AI to doctors.

## 🛠 Tech Stack

*   **Frontend:** React 19, TypeScript
*   **Styling:** Tailwind CSS, Lucide React (Icons)
*   **AI:** Google GenAI SDK (@google/genai) - Gemini 1.5/3.0 Models
*   **Build:** Parcel / ESM

## 🏃‍♂️ How to Run

1.  Clone the repository.
2.  Install dependencies: `npm install`
3.  Set your API Key in environment variables or hardcode for demo purposes (not recommended for prod).
4.  Run locally: `npm start`

## 🧪 Simulation Data (Credentials)

**Patients:**
*   Signup via the Landing Page.

**Staff (Password: `staff`):**
*   `doctor@directpulse.com` (General MD)
*   `cardiologist@directpulse.com`
*   `pharmacist@directpulse.com`
*   `rider@directpulse.com`

## 📱 Mobile Features
*   **Voice Input:** Web Speech API integration for dictating symptoms.
*   **Calling Screen:** Simulated secure audio connection between Doctor and Patient.

## ⚠️ Disclaimer
This is a demonstration prototype. It is not a certified medical device. The AI responses are for assistance only and must be verified by licensed professionals.
