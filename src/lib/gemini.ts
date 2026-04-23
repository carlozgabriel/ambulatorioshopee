import { InventoryItem, Movement, Category } from "../types";

// Configurações do Google Gemini (Direto)
const getApiKey = () => {
  const key = (import.meta as any).env?.VITE_GEMINI_API_KEY || 
              (import.meta as any).env?.GEMINI_API_KEY ||
              ""; // Removida chave fixa para segurança
  return key?.trim();
};

const API_KEY = getApiKey();
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

async function callGemini(prompt: string): Promise<string> {
  if (!API_KEY) {
    console.error("Shopito: API Key do Gemini não encontrada.");
    throw new Error("Chave de API ausente.");
  }

  try {
    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1000 }
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(`Gemini Error: ${response.status} - ${err.error?.message || "Unknown error"}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch (error) {
    console.error("Shopito Call Error:", error);
    throw error;
  }
}

export const generateInventoryInsights = async (
  items: InventoryItem[],
  movements: Movement[],
  categories: Category[]
): Promise<string> => {
  if (items.length === 0) return "Adicione itens ao catálogo para gerar insights!";

  const stockSummary = items.map(i => ({
    nome: i.name,
    categoria: categories.find(c => c.id === i.categoryId)?.name || 'Geral',
    saldo: i.currentQuantity,
    minimo: i.minQuantity || 5
  }));

  const prompt = `
    Você é o Shopito, o assistente inteligente do Ambulatório Shopee. 
    Analise o estoque e gere um insight curto (max 280 caracteres).
    Foque em reposição e padrões. Seja direto e prestativo.
    
    ESTOQUE: ${JSON.stringify(stockSummary)}
    
    Responda em Português do Brasil de forma amigável.
  `;

  try {
    return await callGemini(prompt);
  } catch (error) {
    return "Ops! O Shopito teve um contratempo. Verifique se a chave do Gemini está correta na Vercel.";
  }
};

export const generateCustomReport = async (
  query: string,
  items: InventoryItem[],
  movements: Movement[],
  categories: Category[]
): Promise<string> => {
  const prompt = `
    Você é o Shopito, assistente do Ambulatório Shopee.
    O usuário quer: "${query}"
    
    DADOS:
    - Itens: ${JSON.stringify(items.map(i => ({
      nome: i.name,
      cat: categories.find(c => c.id === i.categoryId)?.name || 'Geral',
      saldo: i.currentQuantity
    })))}
    
    Responda de forma organizada em Markdown. Seja preciso.
  `;

  try {
    return await callGemini(prompt);
  } catch (error) {
    return "Erro ao gerar relatório com o Gemini.";
  }
};




