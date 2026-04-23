import { InventoryItem, Movement, Category } from "../types";

// Configurações do Google Gemini (Direto)
const getApiKey = () => {
  // Tenta várias fontes possíveis para a chave
  const key = (import.meta as any).env?.VITE_GEMINI_API_KEY || 
              process.env.VITE_GEMINI_API_KEY ||
              process.env.GEMINI_API_KEY ||
              ""; // Chave fixa removida por segurança (leaked)
  
  if (key && key.trim().startsWith("AIza")) {
    console.log("Shopito: Conexão com Google Gemini preparada.");
    return key.trim();
  }
  return "";
};


const API_KEY = getApiKey();
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`;







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
    Você é o Analista Chefe do Ambulatório Shopee. 
    Sua tarefa é gerar um RELATÓRIO TÉCNICO E DETALHADO em Markdown.
    
    PERGUNTA DO USUÁRIO: "${query}"
    
    DADOS DISPONÍVEIS:
    - Itens no Catálogo: ${JSON.stringify(items.map(i => ({
      nome: i.name,
      cat: categories.find(c => c.id === i.categoryId)?.name || 'Geral',
      saldo: i.currentQuantity,
      unidade: i.unit,
      minimo: i.minQuantity
    })))}
    - Histórico de Movimentações: ${JSON.stringify(movements.slice(0, 50))}
    
    REGRAS OBRIGATÓRIAS:
    1. Não comece com "Olá" ou introduções longas. Vá direto aos dados.
    2. USE TABELAS MARKDOWN para comparar saldos e categorias.
    3. Identifique itens com "REPOSIÇÃO NECESSÁRIA" se o saldo for menor que o mínimo.
    4. Se o usuário pedir um resumo, faça uma análise profunda, não apenas uma frase.
    5. O relatório deve ser profissional, limpo e rico em informações.
    
    RESPONDA EM PORTUGUÊS DO BRASIL.
  `;

  try {
    return await callGemini(prompt);
  } catch (error) {
    return "Erro ao gerar relatório com o Gemini.";
  }
};





