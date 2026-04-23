import { InventoryItem, Movement, Category } from "../types";

// Configurações do OpenRouter
// IMPORTANTE: Nunca coloque a chave diretamente aqui. Configure no Vercel/Ambiente.
const OPENROUTER_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || "";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

async function callAI(prompt: string): Promise<string> {
  if (!OPENROUTER_KEY) {
    console.error("AI Assistant: API Key não encontrada em VITE_OPENROUTER_API_KEY");
    throw new Error("Configuração de IA ausente.");
  }

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENROUTER_KEY.trim()}`,
        "HTTP-Referer": "https://ambulatorioshopee.vercel.app/",
        "X-Title": "C3 Ambulatorio"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini", // Alterado para GPT conforme solicitado
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(`AI Error: ${response.status} - ${err.error?.message || "Unknown error"}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
  } catch (error) {
    console.error("AI Assistant Error:", error);
    throw error;
  }
}

export const generateInventoryInsights = async (
  items: InventoryItem[],
  movements: Movement[],
  categories: Category[],
  isAdmin: boolean = false
): Promise<string> => {
  if (items.length === 0) return "Adicione itens ao catálogo para gerar insights!";

  const stockSummary = items.map(i => ({
    nome: i.name,
    categoria: categories.find(c => c.id === i.categoryId)?.name || 'Geral',
    saldo: i.currentQuantity,
    minimo: i.minQuantity || 5,
    valorUnitario: (movements.find(m => m.itemId === i.id && m.type === 'ENTRADA') as any)?.invoiceTotalValue || 0
  }));

  const prompt = isAdmin 
    ? `
    Você é o Shopito Admin, assistente estratégico do Ambulatório Shopee (C3). 
    Sua missão é: REDUZIR CUSTOS e TRAZER ALERTAS CRÍTICOS da rede.
    Analise os dados globais e gere um insight curto (max 300 caracteres).
    Foque em: itens caros com baixo giro, desperdício potencial, e unidades com estoque muito crítico.
    Seja direto, autoritário mas prestativo.
    
    ESTOQUE GLOBAL: ${JSON.stringify(stockSummary.slice(0, 40))}
    
    Responda em Português do Brasil.
    `
    : `
    Você é o Shopito, o assistente inteligente do Ambulatório Shopee. 
    Analise o estoque e gere um insight curto (max 280 caracteres).
    Foque em reposição e padrões. Seja direto e prestativo.
    
    ESTOQUE: ${JSON.stringify(stockSummary.slice(0, 40))}
    
    Responda em Português do Brasil de forma amigável.
    `;

  try {
    return await callAI(prompt);
  } catch (error) {
    return "Ops! O Shopito teve um contratempo ao conectar com o OpenRouter. Verifique o saldo ou a chave da API.";
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
    return await callAI(prompt);
  } catch (error) {
    return "Erro ao gerar relatório com o OpenRouter.";
  }
};





