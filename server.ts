
import { createServer } from 'node:http';
import { GoogleGenAI, Type } from '@google/genai';

const PORT = 3001;
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error('GEMINI_API_KEY is not set in environment variables.');
}

const ai = new GoogleGenAI({ apiKey: API_KEY || '' });

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

const server = createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const data = JSON.parse(body);

        if (req.url === '/api/analyze-symptoms') {
          const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: data.symptoms,
            config: {
              systemInstruction: SYSTEM_INSTRUCTION,
              responseMimeType: "application/json",
              responseSchema: TRIAGE_SCHEMA,
            },
          });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(JSON.parse(response.text)));
        } else if (req.url === '/api/refine-symptoms') {
          const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `The user is typing medical symptoms: "${data.currentInput}".
            Identify ONE specific missing detail (like duration, exact location, severity 1-10, or triggers) that would help a doctor.
            Ask it as a short, friendly suggestion (max 10 words).
            If the input is already detailed, return "Looks detailed enough."`,
          });
          const text = response.text?.trim();
          const result = (text === "Looks detailed enough." || !text) ? null : text;
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ result }));
        } else if (req.url === '/api/transcribe-audio') {
          const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: {
              parts: [
                {
                  inlineData: {
                    mimeType: data.mimeType,
                    data: data.audioBase64
                  }
                },
                {
                  text: "Transcribe the spoken language in this audio exactly. Return ONLY the text, no extra explanation."
                }
              ]
            }
          });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ text: response.text || "" }));
        } else {
          res.writeHead(404);
          res.end('Not Found');
        }
      } catch (error) {
        console.error('Proxy Error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to process request' }));
      }
    });
  } else {
    res.writeHead(405);
    res.end('Method Not Allowed');
  }
});

server.listen(PORT, () => {
  console.log(`Proxy server listening on port ${PORT}`);
});
