import { TriageResponse } from "../types";

export const analyzeSymptoms = async (symptoms: string): Promise<TriageResponse> => {
  try {
    const response = await fetch('/api/analyze-symptoms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symptoms }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
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
    const response = await fetch('/api/refine-symptoms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentInput }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.result;
  } catch (e) {
    console.error("Symptom Refinement Failed:", e);
    return null;
  }
};

export const transcribeAudio = async (audioBase64: string, mimeType: string): Promise<string> => {
  try {
    const response = await fetch('/api/transcribe-audio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audioBase64, mimeType }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.text || "";
  } catch (error) {
    console.error("Audio Transcription Failed:", error);
    return "";
  }
};
