import { GoogleGenAI } from "@google/genai";
import { TriageResponse } from "../types";
import { GEMINI_MODEL, SYSTEM_INSTRUCTION, TRIAGE_SCHEMA } from "./aiConfig";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeSymptoms = async (symptoms: string): Promise<TriageResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
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
      model: GEMINI_MODEL,
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
      model: GEMINI_MODEL,
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
