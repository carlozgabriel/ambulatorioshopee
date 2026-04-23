export interface Unity {
  id: string;
  name: string;
  company: string;
  city: string;
  state: string;
  responsibleEmails: string[];
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  unityId: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  categoryId: string;
  supplier: string;
  unit: string;
  currentQuantity: number;
  minQuantity?: number;
  indication?: string;
  unityId: string;
  purchasePrice?: number; // Custo unitário médio
}

export interface Batch {
  id: string;
  itemId: string;
  lotNumber: string;
  expirationDate: string; // ISO String
  quantity: number;
  unityId: string;
  costPrice?: number; // Custo específico deste lote
}

export interface Movement {
  id: string;
  type: 'ENTRADA' | 'SAIDA';
  itemId: string;
  batchId?: string;
  lotNumber?: string;
  quantity: number;
  responsibleName: string;
  responsibleUid: string;
  timestamp: string; // ISO String
  notes?: string;
  unityId: string;
  unitPrice?: number; // Preço no momento da movimentação
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  unityId?: string; // Atribuído apenas se manager/user
}
