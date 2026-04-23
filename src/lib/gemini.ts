import { InventoryItem, Movement, Category } from "../types";

// Configurações do OpenRouter
const OPENROUTER_API_KEY = "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";
const OPENROUTER_MODEL = "openai/gpt-oss-120b:free";

async function callOpenRouter(prompt: string): Promise<string> {
  if (!OPENROUTER_API_KEY) {
    console.error("OpenRouter API Key não configurada.");
    throw new Error("API Key não configurada.");
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Ambulatório Shopee"
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [{ role: "user", content: prompt }],
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenRouter error: ${response.status} - ${err}`);
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



