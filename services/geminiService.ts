
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, CreditCard } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getFinancialInsights = async (transactions: Transaction[], cards: CreditCard[]) => {
  const model = 'gemini-3-flash-preview';
  
  const prompt = `
    Analyze the following financial data and provide 3-4 concise, actionable insights or tips.
    
    Transactions: ${JSON.stringify(transactions.slice(-20))}
    Credit Cards: ${JSON.stringify(cards)}
    
    Current focus: Budget optimization and credit health.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: "You are a professional financial advisor. Keep advice professional, brief, and helpful.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            insights: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  category: { type: Type.STRING, description: "One of: Budget, Savings, Credit, General" }
                },
                required: ["title", "description", "category"]
              }
            }
          },
          required: ["insights"]
        }
      }
    });

    return JSON.parse(response.text).insights;
  } catch (error) {
    console.error("Gemini Error:", error);
    return [
      {
        title: "Track Your Spending",
        description: "Consistency is key to financial health. Keep logging every transaction.",
        category: "General"
      }
    ];
  }
};

export const categorizeTransaction = async (description: string) => {
  const model = 'gemini-3-flash-preview';
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Categorize this expense description into one of these categories: Food & Dining, Transport, Shopping, Entertainment, Utilities, Health, Salary, Investment, Other. Description: "${description}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING }
          },
          required: ["category"]
        }
      }
    });
    
    return JSON.parse(response.text).category;
  } catch (error) {
    return "Other";
  }
};
