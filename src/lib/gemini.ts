import { InventoryItem, Movement, Category } from "../types";

const OPENROUTER_API_KEY = "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";
const OPENROUTER_MODEL = "openai/gpt-4o-mini"; // Rápido, barato e muito capaz

async function callOpenRouter(prompt: string): Promise<string> {
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
      max_tokens: 1024,
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenRouter error: ${response.status} - ${err}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

export const generateInventoryInsights = async (
  items: InventoryItem[],
  movements: Movement[],
  categories: Category[]
): Promise<string> => {
  const lowStockItems = items.filter(i => (i.currentQuantity || 0) <= (i.minQuantity || 5));
  const recentMovements = movements
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 20);

  const stockSummary = items.map(i => ({
    nome: i.name,
    categoria: categories.find(c => c.id === i.categoryId)?.name || 'Geral',
    saldo: i.currentQuantity,
    minimo: i.minQuantity || 5
  }));

  const movementSummary = recentMovements.map(m => ({
    tipo: m.type,
    item: items.find(i => i.id === m.itemId)?.name || 'Desconhecido',
    qtd: m.quantity,
    data: m.timestamp
  }));

  const prompt = `
    Você é o Shopito, o assistente inteligente do Ambulatório Shopee. 
    Sua personalidade é prestativa, profissional, mas leve e atenciosa.
    Abaixo estão os dados atuais do estoque e as movimentações recentes.
    
    ESTOQUE ATUAL:
    ${JSON.stringify(stockSummary)}
    
    MOVIMENTAÇÕES RECENTES:
    ${JSON.stringify(movementSummary)}
    
    TAREFA:
    Gere um insight curto e acionável (máximo 300 caracteres). 
    Foque em:
    1. Itens críticos que precisam de reposição imediata.
    2. Padrões de consumo anormais (se houver).
    3. Uma dica amigável de gestão.
    
    Responda em Português do Brasil. Comece com uma saudação curta do Shopito.
  `;

  try {
    return await callOpenRouter(prompt);
  } catch (error) {
    console.error("OpenRouter Error:", error);
    return "Ops! O Shopito teve um pequeno contratempo ao analisar os dados. Mas não se preocupe, o estoque físico continua seguro!";
  }
};

export const generateCustomReport = async (
  query: string,
  items: InventoryItem[],
  movements: Movement[],
  categories: Category[]
): Promise<string> => {
  const prompt = `
    Você é o Shopito, assistente de ambulatório do Ambulatório Shopee.
    O usuário solicitou o seguinte relatório/informação: "${query}"
    
    DADOS DO SISTEMA:
    - Itens em estoque: ${JSON.stringify(items.map(i => ({
      nome: i.name,
      categoria: categories.find(c => c.id === i.categoryId)?.name || 'Geral',
      saldo: i.currentQuantity,
      unidade: i.unit,
      minimo: i.minQuantity
    })))}
    - Movimentações Recentes (últimas 100): ${JSON.stringify(movements.slice(0, 100))}
    - Categorias: ${JSON.stringify(categories.map(c => c.name))}
    
    INSTRUÇÕES:
    1. Responda de forma organizada, usando Markdown (tabelas, listas, negrito).
    2. Seja preciso com os cálculos se solicitado.
    3. Mantenha o tom profissional e prestativo do Shopito.
    4. Se a pergunta não tiver relação com o ambulatório ou os dados fornecidos, educadamente direcione o usuário para o assunto correto.
    
    Responda em Português do Brasil.
  `;

  try {
    return await callOpenRouter(prompt);
  } catch (error) {
    console.error("OpenRouter Report Error:", error);
    return "Erro ao gerar relatório com IA. Verifique a conexão e tente novamente.";
  }
};
