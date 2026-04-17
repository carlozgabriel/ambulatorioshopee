export interface Category {
  id: string;
  name: string;
  color?: string;
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
}

export interface Batch {
  id: string;
  itemId: string;
  lotNumber: string;
  expirationDate: string; // ISO String
  quantity: number;
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
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}
