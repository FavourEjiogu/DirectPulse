import { GoogleGenAI, Type } from "@google/genai";
import { TriageResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are the Chief Medical Triage and Diagnostic Copilot AI. Your job is to analyze patient symptoms provided in natural language, determine the severity, route the patient to the correct medical department, and provide a preliminary diagnostic analysis for the attending physician.

**Strict Safety & Emergency Protocol (Red Flags):**
1. You are NOT a final diagnostic tool. You are a copilot for licensed human doctors.
2. If the patient describes life-threatening symptoms (e.g., severe chest pain, left arm numbness, sudden facial drooping, severe bleeding, difficulty breathing, suicidal ideation), you MUST trigger the emergency override.

**Routing Logic:**
Route to "General Medical Doctor" for most initial diagnoses. Route to specialists (Paediatrician, Dentist, ENT, Pharmacist, Dermatologist, Cardiologist, Gastroenterologist, Allergist, Psychiatrist) ONLY if the symptoms are explicitly isolated to that specialty. *Note: If a specialty is marked as "Coming Soon" in the system, default the routing back to General Medical Doctor.*

**Output Format:**
You must respond strictly in valid JSON format.
`;

const TRIAGE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    emergency_override: {
      type: Type.BOOLEAN,
      description: "True if symptoms are life-threatening requiring immediate physical emergency care.",
    },
    emergency_message: {
      type: Type.STRING,
      description: "Critical warning message if emergency_override is true, otherwise null or empty string.",
      nullable: true,
    },
    recommended_department: {
      type: Type.STRING,
      description: "The name of the doctor/specialist department to route the patient to.",
    },
    patient_summary: {
      type: Type.STRING,
      description: "A concise, medical-grade summary of the patient's age (if provided) and symptoms.",
    },
    ai_preliminary_analysis: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of 2-3 highly probable conditions for the doctor to investigate.",
    },
    human_error_checks: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of 2-3 edge cases, rare conditions, or commonly misdiagnosed illnesses to rule out.",
    },
  },
  required: [
    "emergency_override",
    "recommended_department",
    "patient_summary",
    "ai_preliminary_analysis",
    "human_error_checks",
  ],
};

export const analyzeSymptoms = async (symptoms: string): Promise<TriageResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: symptoms,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: TRIAGE_SCHEMA,
      },
    });

    const text = response.text;
    if (!text) {
        throw new Error("No response from AI");
    }
    
    return JSON.parse(text) as TriageResponse;
  } catch (error) {
    console.error("Triage Analysis Failed:", error);
    // Fallback response to prevent app crash
    return {
        emergency_override: false,
        emergency_message: null,
        recommended_department: "General Medical Doctor",
        patient_summary: "Error processing symptoms. Please consult a doctor directly.",
        ai_preliminary_analysis: ["Analysis Unavailable"],
        human_error_checks: ["Manual Triage Required"]
    };
  }
};

export const getSymptomRefinement = async (currentInput: string): Promise<string | null> => {
  // Only suggest if input is substantial enough to have context but might be missing details
  if (currentInput.length < 8) return null; 
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `The user is typing medical symptoms: "${currentInput}". 
      Identify ONE specific missing detail (like duration, exact location, severity 1-10, or triggers) that would help a doctor. 
      Ask it as a short, friendly suggestion (max 10 words). 
      If the input is already detailed, return "Looks detailed enough."`,
    });
    
    const text = response.text?.trim();
    if (text === "Looks detailed enough." || !text) return null;
    return text;
  } catch (e) {
    return null;
  }
};

export const transcribeAudio = async (audioBase64: string, mimeType: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: audioBase64
            }
          },
          {
            text: "Transcribe the spoken language in this audio exactly. Return ONLY the text, no extra explanation."
          }
        ]
      }
    });

    return response.text || "";
  } catch (error) {
    console.error("Audio Transcription Failed:", error);
    return "";
  }
};