import { GoogleGenAI } from "@google/genai";
import { API_KEY_ERROR_MESSAGE } from '../constants';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn(API_KEY_ERROR_MESSAGE);
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

export const suggestPlanName = async (productName: string, quantityKg: number, flourType?: string): Promise<string> => {
  if (!ai) {
    throw new Error(API_KEY_ERROR_MESSAGE);
  }

  const itemDescription = productName || flourType || "product";

  const prompt = `Suggest a short, catchy, and professional production batch name for ${quantityKg} kg of ${itemDescription}. 
  Focus on creativity and industry relevance. Examples: 'Alpha Run - ${itemDescription} ${quantityKg}kg', '${itemDescription} Prime Batch #${Math.floor(Math.random()*100)} - ${quantityKg}kg', 'Harvest ${itemDescription} ${quantityKg}'. 
  Provide only the name itself, with no introductory phrases or explanations. Ensure the name includes the quantity and a product identifier if appropriate.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: prompt,
      config: {
        temperature: 0.7, 
        topP: 0.95,
        topK: 40,
      }
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error suggesting plan name:", error);
    if (error instanceof Error && error.message.includes('API_KEY_INVALID')) {
        throw new Error("Invalid API Key. Please check your API_KEY environment variable.");
    }
    throw new Error("Failed to get suggestion from AI. Please try again.");
  }
};
