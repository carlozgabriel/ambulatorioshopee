# 📋 Base de Conhecimento — C3 Ambulatório

> Sistema de gestão de insumos e medicamentos para ambulatórios corporativos da C3.

---

## 🧩 O Problema que o Sistema Resolve

Ambulatórios corporativos gerenciam diariamente **medicamentos, materiais cirúrgicos e insumos de saúde** que precisam ser controlados com rigor:

- ❌ **Sem controle**: itens vencidos passam despercebidos, gerando risco à saúde dos colaboradores
- ❌ **Falta de rastreabilidade**: não se sabe quem consumiu o quê, quando e em que quantidade
- ❌ **Perdas financeiras**: compras desnecessárias por falta de visibilidade do estoque real
- ❌ **Gestão fragmentada**: múltiplos ambulatórios sem comunicação entre si

O **C3 Ambulatório** centraliza toda essa gestão, integrando múltiplas unidades sob uma única plataforma inteligente.

---

## 🏗️ Estrutura Geral do Sistema

O sistema possui **dois níveis de acesso** com experiências distintas:

| Nível | Acesso | Capacidades |
|---|---|---|
| **Admin (C3)** | Visão global de toda a rede | Gerenciar unidades, ver todos os estoques, painel financeiro |
| **Ambulatório (Unidade)** | Restrito à sua unidade | Cadastrar itens, registrar entradas/saídas, ver movimentações |

---

## 🔐 Como Fazer Login

### Administrador C3
- **Usuário**: `adminc3ambulatorio`
- **Senha**: `Admin@c3`

### Usuário de Ambulatório (Unidade)
- **Usuário**: e-mail cadastrado na unidade (ex: `socmg2@shopee.com`)
- **Senha**: nome da unidade em minúsculas sem espaços + `@c3`
  - *Exemplo*: Unidade "SOC MG2" → senha: `socmg2@c3`

> 💡 O sistema cria automaticamente a conta do usuário no primeiro acesso, desde que o e-mail esteja cadastrado em uma unidade.

---

## 🛡️ Modo Admin (C3)

O Administrador tem **visão completa** da rede de ambulatórios.

### Menu do Admin
| Aba | Função |
|---|---|
| **Dashboard** | Visão geral de todas as unidades ativas |
| **Unidades** | Cadastrar e gerenciar ambulatórios |
| **Estoques Geração** | Ver estoque de qualquer unidade da rede |
| **Financeiro** | Painel financeiro consolidado |

### Seletor de Unidade (Header)
- No centro do cabeçalho há um **seletor de unidade**
- Padrão: **VISÃO GLOBAL (C3)** — agrega dados de todas as unidades
- Ao selecionar uma unidade específica, a visão é filtrada para aquela unidade

### Gerenciar Unidades
Para criar um novo ambulatório:
1. Acesse **Unidades** no menu lateral
2. Clique em **"Registrar Novo Ambulatório"**
3. Preencha:
   - **Empresa/Cliente** (ex: Shopee)
   - **Nome da Unidade** (ex: SOC MG2)
   - **Região/Localidade** (ex: Ribeirão das Neves, MG)
   - **E-mails dos Responsáveis** (separados por vírgula)
4. Clique em **Criar Unidade**

---

## 🏥 Modo Ambulatório (Unidade)

Após login, o usuário tem acesso restrito à **sua própria unidade**.

### Menu do Ambulatório
| Aba | Função |
|---|---|
| **Dashboard** | Indicadores do estoque da unidade |
| **Catálogo** | Cadastro de itens/insumos |
| **Estoque Real** | Visão atual do estoque com ações rápidas |
| **Movimentações** | Histórico de entradas e saídas |

---

## 📦 Catálogo de Itens

O catálogo é a **"biblioteca" de insumos** do ambulatório. Cada item representa um tipo de produto (ex: Gaze Estéril, Dipirona, Luva Cirúrgica).

### Cadastrar Novo Item
1. Acesse **Catálogo** → clique em **"+ Novo Item"**
2. Preencha:
   - **Nome do Insumo**
   - **Categoria** (ex: Medicamentos, Curativos)
   - **Fornecedor Padrão**
   - **Unidade de Medida** (UN, CX, FR, PCT, RL, PR)
   - **Mínimo em Estoque** (alerta de estoque baixo)
   - **Indicação** *(opcional)* — para que serve o item
3. Clique em **Salvar Item no Catálogo**

### Gerenciar Categorias
- Clique em **"+ Categorias"** para criar, editar ou excluir categorias
- As categorias organizam os itens no catálogo e no estoque

### Filtros do Catálogo
- Busca por **nome do item**
- Filtro por **categoria**
- Filtro por **fornecedor**
- Visualização em **Grid** ou **Lista**

### Indicação do Medicamento
- Clique no ícone de **estetoscópio** em qualquer item para ver para que ele serve

---

## 📊 Estoque Real

Exibe a **situação atual** de todos os itens cadastrados com suas quantidades.

### Indicadores Visuais
| Cor | Significado |
|---|---|
| 🟢 Verde | Estoque adequado |
| 🟡 Amarelo | Atenção (próximo do mínimo) |
| 🔴 Vermelho | Estoque baixo — abaixo do mínimo configurado |

### Ações Rápidas por Item
- **+ Entrada**: Registra entrada de estoque para aquele item
- **- Saída**: Registra saída de estoque para aquele item

---

## 🔄 Movimentações

Toda entrada ou saída de insumo gera uma **movimentação** registrada com data, responsável e lote.

### Registrar Entrada de Estoque

1. Acesse **Movimentações** → clique em **"+ Registrar Entrada"**
   *(ou clique em "+ Entrada" diretamente no item no Estoque Real)*

2. **Buscar o Item com Lupa** 🔍
   - Digite o nome do item no campo de busca
   - Selecione o item desejado na lista que aparece
   - Clique no `✕` para limpar e escolher outro item

3. Preencha os campos obrigatórios:
   - **Quantidade**
   - **Lote** (identificação do lote do produto)
   - **Validade** (data de vencimento do lote)
   - **Observações** *(opcional)*

4. **Informações Fiscais** *(opcional)*
   - Clique no toggle **"Deseja adicionar informações fiscais?"** para expandir
   - Preencha:
     - **Número da Nota**
     - **Série**
     - **Fornecedor** *(preenchido automaticamente com o fornecedor padrão do item)*
     - **Data de Emissão**
     - **Valor Total (R$)**
   - **Anexar Nota**: faça upload do PDF ou imagem da nota fiscal
   - O arquivo fica armazenado na nuvem e acessível pelo link no histórico

5. Clique em **"Confirmar Entrada"**

> ✅ O sistema atualiza automaticamente o estoque do item e registra o lote.

### Registrar Saída de Estoque

1. Clique em **"- Registrar Saída"**
2. Selecione o item com a lupa
3. Preencha: Quantidade, Lote e Observações
4. Clique em **"Confirmar Saída"**

> ✅ O estoque é reduzido automaticamente.

### Histórico de Movimentações

Tabela com todas as entradas e saídas, mostrando:
- Data e hora
- Tipo (ENTRADA / SAÍDA)
- Item
- Quantidade
- Lote
- Responsável

**Ações disponíveis por movimentação:**
- ✏️ **Editar**: corrige dados da movimentação (reverte e recria o registro)
- 🗑️ **Excluir**: remove a movimentação e ajusta o estoque de volta

---

## 📈 Dashboard

### Indicadores do Dashboard de Unidade
| Card | O que mostra |
|---|---|
| **Total de Itens** | Quantidade de tipos de insumos cadastrados |
| **Estoque Baixo** | Itens abaixo do mínimo configurado |
| **Vencendo em 30 dias** | Lotes com validade próxima |
| **Movimentações Hoje** | Entradas e saídas do dia atual |

### Insights de IA (Gemini)
- O botão **"Atualizar Insights"** aciona a IA do Google Gemini
- Analisa o estoque e gera recomendações automáticas de reposição e alertas de vencimento

### Lotes Vencendo em Breve
- Lista os lotes com vencimento nos próximos 30 dias
- Mostra item, número do lote, data de validade e quantidade

### Gráfico de Consumo
- Exibe os **5 itens mais consumidos** no período

---

## 🌙 Temas e Personalização

- Clique em **"Alternar Tema"** no menu lateral para trocar entre **modo claro** e **modo escuro**
- A preferência é salva automaticamente no navegador

---

## 🔒 Encerrar Sessão

- Clique em **"Encerrar Sessão"** no rodapé do menu lateral para sair com segurança

---

## ⚠️ Regras e Boas Práticas

1. **Lote sempre preenchido**: toda entrada deve ter o número do lote para rastreabilidade completa
2. **Validade obrigatória na entrada**: o sistema alerta automaticamente quando itens estão vencendo
3. **Categorias organizadas**: mantenha categorias bem definidas para facilitar buscas e relatórios
4. **Mínimo de estoque configurado**: sempre defina um mínimo para receber alertas de reposição
5. **Informações fiscais**: preencha sempre que possível para manter conformidade e auditoria

---

## 🗂️ Estrutura de Dados (Referência Técnica)

| Coleção Firestore | Descrição |
|---|---|
| `unities` | Unidades/ambulatórios cadastrados |
| `categories` | Categorias de insumos por unidade |
| `items` | Catálogo de itens por unidade |
| `batches` | Lotes de cada item com validade e quantidade |
| `movements` | Histórico de entradas e saídas |
| `users` | Perfis de usuários do sistema |

---

*Última atualização: Abril 2026 — C3 Ambulatório v1.0*
