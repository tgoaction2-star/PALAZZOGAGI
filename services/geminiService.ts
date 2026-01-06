
import { GoogleGenAI, Type } from "@google/genai";
import { MandalartData, FocusArea } from "../types";
import { SYSTEM_PROMPT, GENERATE_FULL_PROMPT, REGENERATE_BLOCK_PROMPT } from "../constants";

const responseSchema = {
  type: Type.OBJECT,
  required: ["mainGoal", "subGoals"],
  properties: {
    mainGoal: { type: Type.STRING },
    subGoals: {
      type: Type.ARRAY,
      minItems: 8,
      maxItems: 8,
      items: {
        type: Type.OBJECT,
        required: ["id", "title", "actions"],
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          actions: {
            type: Type.ARRAY,
            minItems: 8,
            maxItems: 8,
            items: { type: Type.STRING }
          }
        }
      }
    }
  }
};

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  }

  async generateMandalart(mainGoal: string, focusArea: FocusArea): Promise<MandalartData> {
    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: GENERATE_FULL_PROMPT(mainGoal, focusArea),
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const data = JSON.parse(response.text || "{}");
    return data as MandalartData;
  }

  async regenerateBlock(
    existing: MandalartData,
    focusArea: FocusArea,
    targetSubGoalId: string,
    userFeedback?: string
  ): Promise<MandalartData> {
    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: REGENERATE_BLOCK_PROMPT(existing, focusArea, targetSubGoalId, userFeedback),
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const data = JSON.parse(response.text || "{}");
    return data as MandalartData;
  }
}

export const geminiService = new GeminiService();
