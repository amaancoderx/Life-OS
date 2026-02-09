
import { GoogleGenAI, Type, GenerateContentResponse, Modality } from "@google/genai";
import { DiagnosticResult, IngestedItem, ImageSize, IndustryMode, DailyBrief, AgentPlan } from "../types";

export const createAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `You are the Life OS Autonomous Strategist. 
Your job is to act as a long-term helper. 
TONE: Simple, direct, and honest. 
LANGUAGE: Avoid complex tech words. Say 'Problem' instead of 'Bottleneck'. Say 'Plan' instead of 'Architecture'. 
REASONING: Always explain WHY you are making a choice before giving the answer.`;

export const planAutonomousStrategy = async (goal: string, context: string): Promise<AgentPlan> => {
  const ai = createAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Plan a way to reach this goal: "${goal}". 
    Known info: "${context}".
    
    Show your thinking steps clearly.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          goalSummary: { type: Type.STRING },
          reasoningSteps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                thought: { type: Type.STRING, description: 'Why you chose this step' },
                action: { type: Type.STRING, description: 'What to actually do' }
              },
              required: ["thought", "action"]
            }
          },
          finalStrategy: { type: Type.STRING },
          potentialRisks: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["goalSummary", "reasoningSteps", "finalStrategy", "potentialRisks"]
      },
      systemInstruction: SYSTEM_INSTRUCTION + " You are a marathon agent that plans for the long term."
    }
  });
  return JSON.parse(response.text || '{}');
};

export const parseUnifiedInput = async (input: string, activeMode: IndustryMode): Promise<Partial<IngestedItem>> => {
  const ai = createAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Sort this info: "${input}" for ${activeMode} mode.
    
    JSON:
    {
      "type": "TASK" | "EVENT" | "NOTE",
      "content": "Simple summary",
      "metadata": {
        "priority": "LOW" | "MED" | "HIGH"
      }
    }`,
    config: {
      responseMimeType: "application/json",
      systemInstruction: SYSTEM_INSTRUCTION + " Simplify user input into data points."
    }
  });
  return JSON.parse(response.text || '{}');
};

export const generateDailyBrief = async (items: IngestedItem[], mode: IndustryMode): Promise<DailyBrief> => {
  const ai = createAI();
  const context = JSON.stringify(items.slice(0, 10));
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Create a simple daily plan from these notes: ${context}. 
    Use hours for durations (e.g. 'Project - 2 hours').`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          schedule: { type: Type.ARRAY, items: { type: Type.STRING } },
          bigWin: { type: Type.STRING },
          creativeTip: { type: Type.STRING }
        },
        required: ["schedule", "bigWin", "creativeTip"]
      },
      systemInstruction: SYSTEM_INSTRUCTION
    }
  });
  return JSON.parse(response.text || '{"schedule":[], "bigWin":"", "creativeTip":""}');
};

export const analyzeSystem = async (goals: string, constraints: string, failures: string): Promise<DiagnosticResult> => {
  const ai = createAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Review this situation:
    Goal: ${goals}
    Limits: ${constraints}
    History: ${failures}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          systemOverview: { type: Type.STRING },
          failureLoop: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              stages: { type: Type.ARRAY, items: { type: Type.STRING } },
              triggerPoints: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["name", "stages", "triggerPoints"]
          },
          minimalChange: { type: Type.STRING },
          brutalTruth: { type: Type.STRING }
        },
        required: ["systemOverview", "failureLoop", "minimalChange", "brutalTruth"]
      },
      systemInstruction: SYSTEM_INSTRUCTION + " Be honest but simple."
    }
  });
  return JSON.parse(response.text || '{}');
};

/**
 * Generates an architectural blueprint image using the high-quality gemini-3-pro-image-preview model.
 */
export const generateSystemVisual = async (prompt: string, imageSize: ImageSize): Promise<string> => {
  // CRITICAL: Fresh instance before every generation call to capture latest session API keys
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [
        {
          text: `A professional, clean, high-contrast architectural technical blueprint for: ${prompt}. Blue and white aesthetic.`,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9",
        imageSize: imageSize
      },
    },
  });
  
  const candidates = response.candidates;
  if (candidates && candidates.length > 0) {
    for (const part of candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  }
  throw new Error("Blueprint data not found in response.");
};

/**
 * Edits an existing system visual using the gemini-2.5-flash-image model.
 */
export const editVisual = async (imageUrl: string, prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const base64Data = imageUrl.includes(',') ? imageUrl.split(',')[1] : imageUrl;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Data,
            mimeType: 'image/png',
          },
        },
        {
          text: `Update this architectural visual: ${prompt}`,
        },
      ],
    },
  });
  
  const candidates = response.candidates;
  if (candidates && candidates.length > 0) {
    for (const part of candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  }
  throw new Error("Update data not found in response.");
};

/**
 * Generates a system simulation video using the veo-3.1-fast-generate-preview model.
 */
export const simulateVideo = async (prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: `An animated 3D simulation showing the internal logical process of: ${prompt}. Clean, cinematic, blue lighting.`,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  });
  
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({operation: operation});
  }
  
  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) {
    throw new Error("Simulation video URI not provided by engine.");
  }
  
  // Ensure the separator is correct based on existing params
  const separator = downloadLink.includes('?') ? '&' : '?';
  const response = await fetch(`${downloadLink}${separator}key=${process.env.API_KEY}`);
  if (!response.ok) {
    throw new Error(`Simulation download failed: ${response.statusText}`);
  }
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};
