import { InventoryItem, Movement, Category } from "../types";

// Configurações do OpenRouter
const getApiKey = () => {
  const key = (import.meta as any).env?.VITE_OPENROUTER_API_KEY || 
              (import.meta as any).env?.OPENROUTER_API_KEY || 
              "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";
  
  if (key && key.trim().startsWith("sk-or-v1")) {

    console.log("Shopito: Chave de API carregada com sucesso.");
    return key.trim();
  }
  console.warn("Shopito: Chave de API não encontrada ou inválida.");
  return key?.trim();
};

const OPENROUTER_API_KEY = getApiKey();
const OPENROUTER_MODEL = "google/gemini-2.0-flash-exp:free";


async function callOpenRouter(prompt: string): Promise<string> {
  if (!OPENROUTER_API_KEY) {
    console.error("OpenRouter API Key não encontrada.");
    throw new Error("Chave de API ausente.");
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": typeof window !== 'undefined' ? window.location.origin : "http://localhost:3000",
        "X-Title": "Ambulatorio Shopee AI"
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [{ role: "user", content: prompt }],
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: { message: "Unknown error" } }));
      console.error("OpenRouter Error Details:", err);
      throw new Error(`OpenRouter error: ${response.status} - ${err.error?.message || "Unknown error"}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
  } catch (error) {
    console.error("OpenRouter Call Error:", error);
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

  const recentMovements = movements
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 15)
    .map(m => ({
      tipo: m.type,
      item: items.find(i => i.id === m.itemId)?.name || 'Desconhecido',
      qtd: m.quantity
    }));

  const prompt = `
    Você é o Shopito, o assistente inteligente do Ambulatório Shopee. 
    Abaixo estão os dados do estoque. Gere um insight curto (max 280 caracteres).
    Foque em reposição e padrões. Seja direto e prestativo.
    
    ESTOQUE: ${JSON.stringify(stockSummary)}
    MOVIMENTAÇÕES: ${JSON.stringify(recentMovements)}
    
    Responda em Português do Brasil.
  `;

  try {
    return await callOpenRouter(prompt);
  } catch (error) {
    return "Ops! O Shopito teve um contratempo ao analisar os dados no OpenRouter.";
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
    - Movimentações (últimas 30): ${JSON.stringify(movements.slice(0, 30))}
    
    Responda de forma organizada em Markdown. Seja preciso.
  `;

  try {
    return await callOpenRouter(prompt);
  } catch (error) {
    return "Erro ao gerar relatório via OpenRouter.";
  }
};



