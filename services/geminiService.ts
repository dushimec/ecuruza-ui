import { GoogleGenAI, Type } from "@google/genai";
import { MOCK_PRODUCTS } from '../constants';
import { GeminiSearchResponse } from '../types';

// Initialize Gemini Client
// Note: In a real app, ensure process.env.API_KEY is set.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const searchProductsWithAI = async (userQuery: string): Promise<GeminiSearchResponse> => {
  try {
    const model = 'gemini-2.5-flash';
    
    // Create a simplified catalog string for the AI to understand context
    const catalogDescription = MOCK_PRODUCTS.map(p => 
      `ID: ${p.id}, Name: ${p.name}, Category: ${p.category}, Description: ${p.description}, Seller: ${p.sellerName}`
    ).join('\n');

    const prompt = `
      You are an intelligent shopping assistant for Ecuruza, an African marketplace.
      
      User Query: "${userQuery}"
      
      Available Product Catalog:
      ${catalogDescription}
      
      Task:
      1. Analyze the user's intent.
      2. Select the most relevant Product IDs from the catalog that match the intent.
      3. Provide a very short, friendly reasoning (max 1 sentence) explaining why you picked these.
      
      Return JSON.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendedProductIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of matching product IDs"
            },
            reasoning: {
              type: Type.STRING,
              description: "Why these products were chosen"
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as GeminiSearchResponse;

  } catch (error) {
    console.error("Gemini Search Error:", error);
    return {
      recommendedProductIds: [],
      reasoning: "We couldn't connect to our smart assistant right now, but here are some popular items."
    };
  }
};
