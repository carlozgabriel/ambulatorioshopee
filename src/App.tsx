import React, { useEffect, useState, useMemo } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  googleProvider, 
  auth, 
  db, 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  addDoc, 
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  where,
  OperationType, 
  handleFirestoreError,
  FirebaseUser,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from './firebase';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import { 
  Package, 
  Plus, 
  Minus, 
  History, 
  LayoutDashboard, 
  AlertTriangle, 
  LogOut,
  Search,
  Filter,
  Calendar,
  User,
  Tag,
  Stethoscope,
  ShoppingBag,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Clock,
  CheckCircle2,
  Sparkles,
  XCircle,
  BarChart3,
  Box,
  Truck,
  Sun,
  Moon,
  List,
  Grid,
  FileText,
  Send,
  Download,
  Eye,
  EyeOff,
  Trash2,
  Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, isPast, isBefore, addDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from './lib/utils';
import { Category, InventoryItem, Batch, Movement, UserProfile } from './types';

import Markdown from 'react-markdown';
import { generateInventoryInsights, generateCustomReport } from "./lib/gemini";

// --- Components ---

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className,
  disabled,
  type = 'button'
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}) => {
  const variants = {
    primary: 'bg-primary text-white hover:bg-accent shadow-sm transition-all',
    secondary: 'bg-secondary text-white hover:opacity-90 shadow-sm transition-all',
    outline: 'border border-border-base bg-surface text-text-base hover:bg-bg-main transition-all',
    ghost: 'text-text-muted hover:text-text-base hover:bg-bg-main transition-all',
    danger: 'bg-rose-600 text-white hover:opacity-90 transition-all',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-sm font-bold text-sm uppercase tracking-wide active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none transition-all',
        variants[variant],
        className
      )}
    >
      {children}
    </button>
  );
};

const Card = ({ children, className, ...props }: React.ComponentProps<'div'>) => (
  <div {...props} className={cn('bg-surface border border-border-base rounded-lg overflow-hidden shadow-sm transition-colors duration-200', className)}>
    {children}
  </div>
);

const Input = ({ 
  label, 
  id, 
  ...props 
}: { 
  label?: string; 
  id: string; 
} & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className="space-y-1">
    {label && <label htmlFor={id} className="text-sm font-medium text-text-base">{label}</label>}
    <input
      id={id}
      {...props}
      className="w-full px-3 py-2 bg-bg-main border border-border-base rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-text-muted text-text-base"
    />
  </div>
);

const Select = ({ 
  label, 
  id, 
  children, 
  ...props 
}: { 
  label?: string; 
  id: string; 
  children: React.ReactNode; 
} & React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <div className="space-y-1">
    {label && <label htmlFor={id} className="text-sm font-medium text-text-base">{label}</label>}
    <select
      id={id}
      {...props}
      className="w-full px-3 py-2 bg-bg-main border border-border-base rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-no-repeat bg-[right_0.5rem_center] text-text-base"
    >
      {children}
    </select>
  </div>
);

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-secondary/60 backdrop-blur-sm z-50 px-4 flex items-center justify-center"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-surface rounded-sm w-full max-w-lg shadow-2xl overflow-hidden border border-border-base"
          >
            <div className="px-6 py-4 border-b border-border-base flex items-center justify-between">
              <h3 className="text-lg font-black text-text-base uppercase tracking-tight italic">{title}</h3>
              <button onClick={onClose} className="p-2 hover:bg-bg-main rounded-sm transition-colors text-text-muted">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-6 overflow-y-auto max-h-[80vh]">
              {children}
            </div>
          </motion.div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

// --- Component Props Interfaces ---

interface DashboardProps {
  items: InventoryItem[];
  movements: Movement[];
  categories: Category[];
  stats: {
    totalItems: number;
    lowStock: number;
    expiringSoon: number;
    recentMovements: number;
  };
  topConsumedItems: { name: string; quantity: number }[];
  aiInsight: string;
  isLoadingInsight: boolean;
  fetchAiInsight: () => void;
  setActiveTab: (tab: any) => void;
  expiringBatches: any[];
  theme: 'light' | 'dark';
}

interface ItemsViewProps {
  items: InventoryItem[];
  categories: Category[];
  theme: 'light' | 'dark';
  setIsCategoryModalOpen: (open: boolean) => void;
  handleEditCategory: (cat: Category) => void;
  handleDeleteCategory: (cat: Category) => void;
  setEditingItem: (item: InventoryItem | null) => void;
  setIsItemModalOpen: (open: boolean) => void;
  setSelectedItemForIndication: (item: InventoryItem | null) => void;
  handleEditItem: (item: InventoryItem) => void;
  handleDeleteItem: (id: string) => void;
}

interface StockViewProps {
  items: InventoryItem[];
  categories: Category[];
  setMovementType: (type: 'ENTRADA' | 'SAIDA') => void;
  setSelectedItemForMovement: (item: InventoryItem | null) => void;
  setIsMovementModalOpen: (open: boolean) => void;
}

interface ReportsViewProps {
  items: InventoryItem[];
  movements: Movement[];
  categories: Category[];
}

const Dashboard = ({ 
  items, 
  movements, 
  categories, 
  stats, 
  topConsumedItems, 
  aiInsight, 
  isLoadingInsight, 
  fetchAiInsight, 
  setActiveTab, 
  expiringBatches, 
  theme 
}: DashboardProps) => (
  <div className="space-y-4">
    {/* AI Assistant Card */}
    <Card className="border-none shadow-xl bg-gradient-to-br from-[#EE4D2D] via-[#f53d2d] to-[#ff4d00] text-white overflow-hidden relative group">
      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-all">
        <Sparkles className="w-32 h-32 rotate-12" />
      </div>
      <div className="p-4 relative z-10 flex flex-col md:flex-row items-center gap-6">
        <div className="w-12 h-12 rounded-full border-4 border-white/30 overflow-hidden shadow-2xl shrink-0 bg-white">
          <img 
            src="https://shopee.com.br/blog/wp-content/uploads/2022/03/Shopito-capa.jpg" 
            alt="Shopito" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border border-white/30 shadow-inner">Shopito AI Assistant</span>
            {isLoadingInsight && <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Sparkles className="w-3 h-3" /></motion.div>}
          </div>
          <h3 className="text-lg font-black italic uppercase leading-none mb-2">Insights do seu Ambulatório</h3>
          <div className="text-sm font-medium leading-relaxed max-w-2xl opacity-90">
            {isLoadingInsight ? (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:0.4s]" />
                <span className="text-xs uppercase font-black opacity-50 ml-2">Shopito está analisando os dados...</span>
              </div>
            ) : (
              <p className="font-sans line-clamp-3 md:line-clamp-none whitespace-pre-line">{aiInsight || "Clique em atualizar para receber recomendações inteligentes baseadas no seu estoque atual!"}</p>
            )}
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={fetchAiInsight}
          disabled={isLoadingInsight}
          className="bg-white/10 hover:bg-white/20 border-white/30 text-white font-black text-[10px] uppercase h-10 px-6 backdrop-blur-md shrink-0 disabled:opacity-50"
        >
          Atualizar Insights
        </Button>
      </div>
    </Card>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: 'Total no Catálogo', value: stats.totalItems, icon: Box, color: 'text-primary', bg: 'bg-primary/5', border: 'border-primary/10' },
        { label: 'Alertas de Validade', value: stats.expiringSoon, icon: Clock, color: 'text-accent', bg: 'bg-accent/5', border: 'border-accent/10' },
        { label: 'Itens Vencidos', value: '00', icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-500/5', border: 'border-rose-500/10' },
        { label: 'Fluxo Recente', value: stats.recentMovements, icon: History, color: 'text-secondary', bg: 'bg-secondary/5', border: 'border-secondary/10' },
      ].map((stat, i) => (
        <Card key={i} className={cn("p-4 border shadow-sm hover:shadow-md transition-all group", stat.border)}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">{stat.label}</p>
              <p className={cn("text-2xl font-black tracking-tighter", stat.color)}>{stat.value}</p>
            </div>
            <div className={cn("p-2 rounded-xl transition-all group-hover:scale-110", stat.bg)}>
              <stat.icon className={cn("w-5 h-5", stat.color)} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
              <div className="w-1 h-1 rounded-full bg-current" />
              <span className="text-[9px] font-bold uppercase tracking-tight">Atualizado agora</span>
          </div>
        </Card>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 shadow-sm border-border-base overflow-hidden">
        <div className="px-6 py-4 border-b border-border-base bg-surface/50 flex items-center justify-between">
          <h3 className="text-sm font-black text-secondary flex items-center gap-2 uppercase italic tracking-tight">
              <Box className="w-4 h-4 text-primary" />
              Panorama do Estoque
              <span className="text-[10px] text-text-muted font-bold not-italic ml-2 lowercase">({items.length} itens totais)</span>
          </h3>
          <Button variant="ghost" className="text-[9px] font-black uppercase tracking-widest h-8 px-3 hover:bg-primary/5 hover:text-primary" onClick={() => setActiveTab('stock')}>
            Abrir Inventário
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
              <thead className="bg-bg-main/50 text-text-muted font-bold uppercase tracking-widest">
                  <tr>
                      <th className="px-6 py-3 border-b border-border-base">Insumo</th>
                      <th className="px-6 py-3 border-b border-border-base">Categoria</th>
                      <th className="px-6 py-3 border-b border-border-base text-center">Saldo</th>
                      <th className="px-6 py-3 border-b border-border-base">Status</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-border-base">
                  {items.slice(0, 6).map(item => {
                      const lowStock = (item.currentQuantity || 0) <= (item.minQuantity || 5);
                      return (
                          <tr key={item.id} className="hover:bg-bg-main/40 transition-colors group">
                              <td className="px-6 py-4">
                                <p className="font-bold text-text-base leading-tight group-hover:text-primary transition-colors">{item.name}</p>
                                <p className="text-[9px] text-text-muted font-mono uppercase mt-0.5">ID: {item.id.slice(0,8)}</p>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-[10px] font-bold text-text-muted uppercase bg-bg-main px-2 py-0.5 rounded-sm">
                                  {categories.find(c => c.id === item.categoryId)?.name || 'Geral'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className={cn("text-sm font-black tracking-tight", lowStock ? "text-rose-600" : "text-primary")}>
                                  {item.currentQuantity}
                                </span>
                                <span className="text-[10px] text-text-muted font-bold ml-1 uppercase">un</span>
                              </td>
                              <td className="px-6 py-4">
                                  <div className={cn(
                                      "inline-flex items-center gap-1.5 px-2 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest border",
                                      lowStock 
                                        ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20' 
                                        : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                                  )}>
                                      <div className={cn("w-1.5 h-1.5 rounded-full", lowStock ? "bg-rose-600 animate-pulse" : "bg-emerald-600")} />
                                      {lowStock ? 'Reposição Necessária' : 'Em Conformidade'}
                                  </div>
                              </td>
                          </tr>
                      );
                  })}
              </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4">
          <Card>
              <div className="px-5 py-3 border-b border-border-base flex items-center justify-between">
                  <h3 className="text-sm font-bold text-text-base flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-rose-500" />
                      Mais Consumidos
                  </h3>
              </div>
              <div className="p-4 h-[240px]">
                  {topConsumedItems.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={topConsumedItems} layout="vertical" margin={{ left: -10, right: 30, top: 0, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={theme === 'dark' ? '#333' : '#eee'} />
                              <XAxis type="number" hide />
                              <YAxis 
                                  dataKey="name" 
                                  type="category" 
                                  hide={false} 
                                  width={80} 
                                  fontSize={9} 
                                  fontWeight="bold"
                                  axisLine={false}
                                  tickLine={false}
                                  stroke={theme === 'dark' ? '#888' : '#666'}
                              />
                              <Tooltip 
                                  cursor={{ fill: 'transparent' }}
                                  contentStyle={{ 
                                      backgroundColor: theme === 'dark' ? '#1a1a1a' : '#fff',
                                      border: 'none',
                                      borderRadius: '4px',
                                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                                      fontSize: '10px',
                                      padding: '4px 8px',
                                      color: theme === 'dark' ? '#fff' : '#000'
                                  }}
                              />
                              <Bar dataKey="quantity" radius={[0, 2, 2, 0]} barSize={14}>
                                  {topConsumedItems.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={index === 0 ? '#ff4d00' : '#ff4d0080'} />
                                  ))}
                              </Bar>
                          </BarChart>
                      </ResponsiveContainer>
                  ) : (
                      <div className="h-full flex flex-col items-center justify-center text-text-muted space-y-2">
                           <TrendingUp className="w-8 h-8 opacity-20" />
                           <p className="text-[9px] uppercase font-bold tracking-widest">Sem dados</p>
                      </div>
                  )}
              </div>
          </Card>

          <Card>
              <div className="px-5 py-3 border-b border-border-base flex items-center justify-between">
                  <h3 className="text-sm font-bold text-text-base flex items-center gap-2">
                       <AlertTriangle className="w-4 h-4 text-accent" />
                       Alertas Validade
                  </h3>
              </div>
              <div className="p-4 space-y-3">
                  {expiringBatches.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-4 text-center">
                          <CheckCircle2 className="w-8 h-8 text-success/30 mb-2" />
                          <p className="text-[10px] font-bold text-success uppercase tracking-widest">Tudo em dia!</p>
                      </div>
                  ) : expiringBatches.map(batch => (
                      <div key={batch.id} className="flex items-center gap-3 p-2 bg-rose-50 dark:bg-rose-500/5 rounded-sm border border-rose-100 dark:border-rose-500/10">
                          <div className="bg-rose-500 text-white p-1 rounded-sm">
                              <Clock className="w-3 h-3" />
                          </div>
                          <div className="flex-1">
                              <p className="text-[10px] font-black text-rose-600 dark:text-rose-400 leading-none uppercase tracking-tight">{items.find(i => i.id === batch.itemId)?.name}</p>
                              <p className="text-[9px] text-rose-500/70 font-bold mt-1">Lote: {batch.lotNumber} • Vence em: {format(new Date(batch.expirationDate), 'dd/MM/yy')}</p>
                          </div>
                      </div>
                  ))}
              </div>
          </Card>
      </div>
    </div>
  </div>
);

const ItemsView = ({
  items,
  categories,
  theme,
  setIsCategoryModalOpen,
  handleEditCategory,
  handleDeleteCategory,
  setEditingItem,
  setIsItemModalOpen,
  setSelectedItemForIndication,
  handleEditItem,
  handleDeleteItem
}: ItemsViewProps) => {
  const [itemsSubTab, setItemsSubTab] = useState<'overview' | 'categories' | 'list'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');
  
  // Get unique suppliers for the filter
  const uniqueSuppliers = useMemo(() => {
    const suppliers = new Set(items.map(i => i.supplier).filter(Boolean));
    return Array.from(suppliers).sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter(i => {
      const matchesSearch = i.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || i.categoryId === categoryFilter;
      const matchesSupplier = supplierFilter === 'all' || i.supplier === supplierFilter;
      let matchesStatus = true;
      if (statusFilter === 'low') matchesStatus = (i.currentQuantity || 0) <= (i.minQuantity || 5);
      if (statusFilter === 'out') matchesStatus = (i.currentQuantity || 0) === 0;
      if (statusFilter === 'ok') matchesStatus = (i.currentQuantity || 0) > (i.minQuantity || 5);
      
      return matchesSearch && matchesCategory && matchesStatus && matchesSupplier;
    });
  }, [items, searchQuery, categoryFilter, statusFilter, supplierFilter]);

  const categoryStats = useMemo(() => {
    return categories.map(cat => {
      const catItems = items.filter(i => i.categoryId === cat.id);
      return {
        name: cat.name,
        value: catItems.reduce((acc, curr) => acc + (curr.currentQuantity || 0), 0),
        count: catItems.length,
        color: cat.color || '#EE4D2D'
      };
    })
    .filter(c => c.count > 0)
    .sort((a, b) => b.value - a.value); // Ordena por maior quantidade
  }, [items, categories]);

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-border-base mb-6 overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Catálogo', icon: BarChart3 },
          { id: 'categories', label: 'Categorias', icon: Tag },
          { id: 'list', label: 'Lista', icon: List }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setItemsSubTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 text-xs font-black uppercase tracking-widest transition-all relative whitespace-nowrap",
              itemsSubTab === tab.id 
                ? "text-primary" 
                : "text-text-muted hover:text-text-base"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {itemsSubTab === tab.id && (
              <motion.div 
                layoutId="items-tab-active"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {itemsSubTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 border-l-4 border-primary">
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Total de Itens Cadastrados</p>
                <p className="text-3xl font-black text-text-base italic">{items.length}</p>
                <div className="mt-4 flex items-center gap-2 text-emerald-500">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-[9px] font-bold uppercase">Catálogo Ativo</span>
                </div>
              </Card>
              <Card className="p-6 border-l-4 border-accent">
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Total em Estoque</p>
                <p className="text-3xl font-black text-text-base italic">{items.reduce((acc, curr) => acc + (curr.currentQuantity || 0), 0)}</p>
                <p className="text-[9px] font-bold uppercase text-text-muted mt-4">Unidades totais somadas</p>
              </Card>
              <Card className="p-6 border-l-4 border-rose-500">
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Categorias Ativas</p>
                <p className="text-3xl font-black text-text-base italic">{categories.length}</p>
                <p className="text-[9px] font-bold uppercase text-text-muted mt-4">Distribuição diversificada</p>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-sm font-black text-text-base uppercase italic mb-6 flex items-center gap-2">
                  <Grid className="w-4 h-4 text-primary" /> Distribuição por Categoria (Qtd)
                </h3>
                <div className="h-[360px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={categoryStats} 
                      layout="vertical" 
                      margin={{ left: 10, right: 30, top: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={theme === 'dark' ? '#333' : '#eee'} />
                      <XAxis type="number" hide />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        width={120} 
                        fontSize={9} 
                        fontWeight="bold"
                        axisLine={false}
                        tickLine={false}
                        stroke={theme === 'dark' ? '#888' : '#666'}
                        tickFormatter={(value) => (value && value.length > 18) ? `${value.substring(0, 15)}...` : (value || "")}
                      />
                      <Tooltip 
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ 
                          backgroundColor: theme === 'dark' ? '#1a1a1a' : '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                          fontSize: '11px',
                          padding: '8px',
                          color: theme === 'dark' ? '#fff' : '#000'
                        }}
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                        {categoryStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-sm font-black text-text-base uppercase italic mb-6 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" /> Resumo das Categorias
                </h3>
                <div className="space-y-4">
                  {categoryStats.map((cat, idx) => (
                    <div key={idx} className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase">
                        <span className="text-text-base">{cat.name}</span>
                        <span className="text-primary">{cat.value} un</span>
                      </div>
                      <div className="w-full h-2 bg-bg-main rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(cat.value / items.reduce((acc, curr) => acc + (curr.currentQuantity || 0), 1)) * 100}%` }}
                          className="h-full bg-primary"
                        />
                      </div>
                      <p className="text-[9px] text-text-muted font-bold uppercase">{cat.count} TIPOS DE INSUMO NESTA CATEGORIA</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {itemsSubTab === 'categories' && (
          <motion.div
            key="categories"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between bg-surface p-4 rounded-sm border border-border-base">
              <div className="space-y-1">
                 <h3 className="text-lg font-black text-text-base uppercase italic">Gestão de Grupos</h3>
                 <p className="text-[10px] text-text-muted font-bold uppercase">Organize seus insumos por categorias lógicas</p>
              </div>
              <Button onClick={() => setIsCategoryModalOpen(true)}>
                <Plus className="w-4 h-4" /> Nova Categoria
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map(cat => (
                <Card key={cat.id} className="p-6 hover:border-primary transition-all group border-2 border-transparent">
                   <div className="flex items-center gap-4 mb-4">
                      <div className="w-1.5 h-10 rounded-full" style={{ backgroundColor: cat.color || '#EE4D2D' }} />
                      <div className="flex-1">
                         <h4 className="font-black text-text-base uppercase italic leading-none">{cat.name}</h4>
                         <p className="text-[10px] text-text-muted font-bold uppercase mt-1">{items.filter(i => i.categoryId === cat.id).length} itens vinculados</p>
                      </div>
                   </div>
                   <div className="flex gap-2">
                      <Button variant="outline" className="flex-1 h-8 text-[9px]" onClick={() => handleEditCategory(cat)}>
                         <Edit2 className="w-3 h-3 mr-2" /> Editar
                      </Button>
                      <Button variant="outline" className="flex-1 h-8 text-[9px] border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white" onClick={() => handleDeleteCategory(cat)}>
                         <Trash2 className="w-3 h-3 mr-2" /> Excluir
                      </Button>
                   </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {itemsSubTab === 'list' && (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            {/* Filters Bar */}
            <div className="flex flex-col xl:flex-row gap-4 items-center bg-surface p-4 rounded-sm border border-border-base shadow-sm">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input 
                  placeholder="Pesquisar por nome ou especificação..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-bg-main border border-border-base rounded-sm outline-none focus:border-primary transition-all text-sm text-text-base font-bold"
                />
              </div>
              
              <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                 <div className="flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5 text-text-muted" />
                    <span className="text-[10px] font-black uppercase text-text-muted">Filtros:</span>
                 </div>
                 
                 <Select 
                   id="catFilter" 
                   value={categoryFilter} 
                   onChange={(e) => setCategoryFilter(e.target.value)}
                   className="h-9 py-0 text-[10px] font-black uppercase tracking-widest min-w-[160px]"
                 >
                   <option value="all">TODAS CATEGORIAS</option>
                   {categories.map(c => <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>)}
                 </Select>

                 <Select 
                   id="statusFilter" 
                   value={statusFilter} 
                   onChange={(e) => setStatusFilter(e.target.value as any)}
                   className="h-9 py-0 text-[10px] font-black uppercase tracking-widest min-w-[160px]"
                 >
                   <option value="all">STATUS (TODOS)</option>
                   <option value="ok">DISPONÍVEL</option>
                   <option value="low">BAIXO ESTOQUE</option>
                   <option value="out">INDISPONÍVEL</option>
                 </Select>

                 <Select 
                   id="supplierFilter" 
                   value={supplierFilter} 
                   onChange={(e) => setSupplierFilter(e.target.value)}
                   className="h-9 py-0 text-[10px] font-black uppercase tracking-widest min-w-[160px]"
                 >
                   <option value="all">FORNECEDOR (TODOS)</option>
                   {uniqueSuppliers.map(s => <option key={s} value={s}>{s?.toUpperCase()}</option>)}
                 </Select>

                 <div className="xl:h-8 xl:w-[1px] bg-border-base hidden xl:block" />

                 <Button className="h-9 text-[10px]" onClick={() => { setEditingItem(null); setIsItemModalOpen(true); }}>
                   <Plus className="w-4 h-4" /> Novo Item
                 </Button>
              </div>
            </div>

            <Card className="overflow-hidden border-border-base">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-bg-main text-text-muted font-bold uppercase tracking-tight">
                    <tr>
                      <th className="px-5 py-3 border-b border-border-base w-[10%]">Status</th>
                      <th className="px-5 py-3 border-b border-border-base text-left">Insumo</th>
                      <th className="px-5 py-3 border-b border-border-base">Categoria</th>
                      <th className="px-5 py-3 border-b border-border-base">Fornecedor</th>
                      <th className="px-5 py-3 border-b border-border-base text-center">Unidade</th>
                      <th className="px-5 py-3 border-b border-border-base text-center">Mín. Alerta</th>
                      <th className="px-5 py-3 border-b border-border-base text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-base">
                    {filteredItems.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-20 text-center text-text-muted font-bold uppercase tracking-widest opacity-50">
                          Nenhum item encontrado com os filtros aplicados
                        </td>
                      </tr>
                    ) : filteredItems.map(item => {
                      const lowStock = (item.currentQuantity || 0) <= (item.minQuantity || 5);
                      const outState = (item.currentQuantity || 0) === 0;
                      return (
                        <tr key={item.id} className="hover:bg-bg-main/50 transition-colors group">
                          <td className="px-5 py-3">
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              outState ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" : 
                              lowStock ? "bg-accent shadow-[0_0_8px_rgba(255,165,0,0.5)]" : 
                              "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                            )} />
                          </td>
                          <td className="px-5 py-3">
                             <p className="font-black text-text-base uppercase italic leading-none group-hover:text-primary transition-colors">{item.name}</p>
                             <p className="text-[8px] text-text-muted mt-1 uppercase font-bold">ID: {item.id.slice(0,10)}</p>
                          </td>
                          <td className="px-5 py-3">
                            <span className="text-[10px] font-bold text-text-muted uppercase px-2 py-0.5 bg-bg-main border border-border-base rounded-full">
                              {categories.find(c => c.id === item.categoryId)?.name || 'Geral'}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-text-muted uppercase font-bold">{item.supplier || '-'}</td>
                          <td className="px-5 py-3 text-center text-text-muted font-bold uppercase text-[10px]">{item.unit || 'UN'}</td>
                          <td className="px-5 py-3 text-center">
                             <span className={cn("text-xs font-black px-2 py-0.5 rounded-sm", lowStock ? "text-rose-500 bg-rose-500/5" : "text-text-muted bg-bg-main")}>
                                {item.minQuantity || 5}
                             </span>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <div className="flex items-center justify-end gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                              {item.indication && (
                                <button onClick={() => setSelectedItemForIndication(item)} title="Ver indicação" className="text-text-muted hover:text-primary transition-colors">
                                  <Eye className="w-4 h-4" />
                                </button>
                              )}
                              <button onClick={() => handleEditItem(item)} title="Editar item" className="text-primary hover:text-accent transition-colors">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDeleteItem(item.id)} title="Excluir item" className="text-rose-500 hover:text-rose-600 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StockView = ({
  items,
  categories,
  setMovementType,
  setSelectedItemForMovement,
  setIsMovementModalOpen
}: StockViewProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewType, setViewType] = useState<'grid' | 'table'>('table');
  const [filter, setFilter] = useState<'all' | 'low'>('all');
  
  const filteredItems = useMemo(() => {
    let result = items.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (filter === 'low') {
      result = result.filter(i => (i.currentQuantity || 0) <= (i.minQuantity || 5));
    }
    return result;
  }, [items, searchQuery, filter]);

  const handleDownloadCSV = (type: 'all' | 'critical') => {
    const targetItems = type === 'all' 
      ? items 
      : items.filter(i => (i.currentQuantity || 0) <= (i.minQuantity || 5));

    const headers = ['ID', 'Item', 'Categoria', 'Fornecedor', 'Estoque Atual', 'Estoque Minimo', 'Status'];
    const rows = targetItems.map(item => [
      item.id,
      item.name,
      categories.find(c => c.id === item.categoryId)?.name || 'Geral',
      item.supplier || 'N/A',
      item.currentQuantity,
      item.minQuantity || 5,
      (item.currentQuantity || 0) <= (item.minQuantity || 5) ? 'CRITICO' : 'NORMAL'
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `estoque_${type}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Stats for Stock Page */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         <Card className="p-4 bg-primary/5 border-primary/10">
            <div className="flex items-center gap-3">
               <div className="bg-primary p-2 rounded-sm text-white"><Box className="w-4 h-4" /></div>
               <div>
                  <p className="text-[10px] font-black uppercase text-text-muted">Insumos Cadastrados</p>
                  <p className="text-xl font-black text-primary italic">{items.length}</p>
               </div>
            </div>
         </Card>
         <Card className="p-4 bg-rose-500/5 border-rose-500/10">
            <div className="flex items-center gap-3">
               <div className="bg-rose-500 p-2 rounded-sm text-white"><TrendingDown className="w-4 h-4" /></div>
               <div>
                  <p className="text-[10px] font-black uppercase text-text-muted">Abaixo do Mínimo</p>
                  <p className="text-xl font-black text-rose-500 italic">{items.filter(i => (i.currentQuantity || 0) <= (i.minQuantity || 5)).length}</p>
               </div>
            </div>
         </Card>

         <Card className="p-4 bg-surface border-border-base col-span-1 md:col-span-2 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase text-text-muted tracking-widest">Relatórios de Inventário</p>
              <p className="text-[9px] font-bold text-text-muted/60 uppercase">Exportação em formato CSV para conferência externa</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="h-9 text-[9px] font-black uppercase tracking-widest border-rose-500/30 text-rose-600 hover:bg-rose-500 hover:text-white"
                onClick={() => handleDownloadCSV('critical')}
              >
                <Download className="w-3 h-3 mr-2" /> Críticos
              </Button>
              <Button 
                variant="outline" 
                className="h-9 text-[9px] font-black uppercase tracking-widest"
                onClick={() => handleDownloadCSV('all')}
              >
                <Download className="w-3 h-3 mr-2" /> Completo
              </Button>
            </div>
         </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        {/* Main Items Section */}
        <div className="xl:col-span-3 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-surface p-3 rounded-sm shadow-sm border border-border-base">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input 
                placeholder="Pesquisar estoque..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-bg-main border border-border-base rounded-sm outline-none focus:border-primary transition-all text-sm text-text-base font-bold"
              />
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="flex border border-border-base rounded-sm overflow-hidden bg-bg-main p-0.5">
                 <button 
                  onClick={() => setViewType('table')}
                  className={cn("p-1.5 rounded-sm transition-all", viewType === 'table' ? "bg-primary text-white" : "text-text-muted hover:text-text-base")}
                 >
                   <List className="w-4 h-4" />
                 </button>
                 <button 
                  onClick={() => setViewType('grid')}
                  className={cn("p-1.5 rounded-sm transition-all", viewType === 'grid' ? "bg-primary text-white" : "text-text-muted hover:text-text-base")}
                 >
                   <Grid className="w-4 h-4" />
                 </button>
              </div>

              <div className="h-8 w-[1px] bg-border-base mx-1" />

              <Select 
                id="filter" 
                value={filter} 
                onChange={(e) => setFilter(e.target.value as any)}
                className="h-9 py-0 text-[10px] font-black uppercase tracking-widest w-40"
              >
                 <option value="all">TODOS OS ITENS</option>
                 <option value="low">BAIXO ESTOQUE</option>
              </Select>
            </div>
          </div>

          {viewType === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
              {filteredItems.length === 0 ? (
                <div className="col-span-full py-20 text-center bg-surface border border-dashed border-border-base rounded-sm">
                  <Box className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-20" />
                  <p className="text-text-muted font-bold uppercase tracking-widest text-xs">Nenhum item em estoque</p>
                </div>
              ) : filteredItems.map(item => (
                <Card key={item.id} className="group hover:border-primary transition-all h-full flex flex-col">
                  <div className="p-4 flex-1 text-text-base">
                    <div className="flex justify-between items-start mb-3">
                      <div className="min-w-0 pr-2">
                        <p className="text-[9px] font-black text-primary uppercase tracking-[0.1em] mb-1 truncate">
                          {categories.find(c => c.id === item.categoryId)?.name || 'Sem Categoria'}
                        </p>
                        <h4 className="text-sm font-black text-text-base group-hover:text-primary transition-colors leading-tight mb-1 truncate">
                          {item.name}
                        </h4>
                        <p className="text-[10px] text-text-muted font-bold flex items-center gap-1.5 uppercase">
                          <Truck className="w-3 h-3" /> {item.supplier || 'N/A'}
                        </p>
                      </div>
                      <div className={cn(
                        "px-2 py-1 rounded-sm flex flex-col items-center justify-center min-w-[45px] border",
                        (item.currentQuantity || 0) <= (item.minQuantity || 5) 
                          ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' 
                          : 'bg-bg-main border-border-base text-text-base'
                      )}>
                        <span className="text-lg font-black leading-none italic">{item.currentQuantity || 0}</span>
                        <span className="text-[8px] uppercase font-black mt-0.5">un</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-auto pt-3 border-t border-border-base">
                      <Button 
                        variant="outline"
                        className="flex-1 text-[9px] h-8 border-border-base hover:border-primary hover:text-primary" 
                        onClick={() => { setMovementType('ENTRADA'); setSelectedItemForMovement(item); setIsMovementModalOpen(true); }}
                      >
                        + Entrada
                      </Button>
                      <Button 
                        variant="outline"
                        className="flex-1 text-[9px] h-8 border-border-base hover:border-danger hover:text-danger" 
                        onClick={() => { setMovementType('SAIDA'); setSelectedItemForMovement(item); setIsMovementModalOpen(true); }}
                      >
                        - Saída
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="overflow-hidden border-border-base">
               <div className="overflow-x-auto">
                 <table className="w-full text-left text-[11px]">
                    <thead className="bg-bg-main text-text-muted font-bold uppercase tracking-tight">
                       <tr>
                          <th className="px-5 py-3 border-b border-border-base">Insumo</th>
                          <th className="px-5 py-3 border-b border-border-base">Categoria</th>
                          <th className="px-5 py-3 border-b border-border-base text-center">Saldo</th>
                          <th className="px-5 py-3 border-b border-border-base text-center">Mínimo</th>
                          <th className="px-5 py-3 border-b border-border-base">Fornecedor</th>
                          <th className="px-5 py-3 border-b border-border-base text-right font-black">Ações</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-border-base">
                       {filteredItems.map(item => {
                          const lowStock = (item.currentQuantity || 0) <= (item.minQuantity || 5);
                          return (
                             <tr key={item.id} className="hover:bg-bg-main/50 transition-colors">
                                <td className="px-5 py-3 font-black text-text-base uppercase italic">{item.name}</td>
                                <td className="px-5 py-3">
                                   <span className="text-[10px] font-bold text-text-muted uppercase px-2 py-0.5 bg-bg-main border border-border-base rounded-full">
                                      {categories.find(c => c.id === item.categoryId)?.name || 'Geral'}
                                   </span>
                                </td>
                                <td className="px-5 py-3 text-center">
                                   <span className={cn("text-sm font-black italic", lowStock ? 'text-rose-500' : 'text-primary')}>
                                      {item.currentQuantity || 0} un
                                   </span>
                                </td>
                                <td className="px-5 py-3 text-center text-text-muted font-bold font-mono">
                                   {item.minQuantity || 5}
                                </td>
                                <td className="px-5 py-3 text-text-muted uppercase font-bold text-[9px]">{item.supplier || '-'}</td>
                                <td className="px-5 py-3 text-right">
                                   <div className="flex justify-end gap-1">
                                      <button 
                                        className="p-1.5 hover:bg-primary/10 text-primary transition-colors rounded-sm"
                                        onClick={() => { setMovementType('ENTRADA'); setSelectedItemForMovement(item); setIsMovementModalOpen(true); }}
                                        title="Entrada"
                                      >
                                         <Plus className="w-4 h-4" />
                                      </button>
                                      <button 
                                        className="p-1.5 hover:bg-rose-500/10 text-rose-500 transition-colors rounded-sm"
                                        onClick={() => { setMovementType('SAIDA'); setSelectedItemForMovement(item); setIsMovementModalOpen(true); }}
                                        title="Saída"
                                      >
                                         <Minus className="w-4 h-4" />
                                      </button>
                                   </div>
                                </td>
                             </tr>
                          );
                       })}
                    </tbody>
                 </table>
               </div>
            </Card>
          )}
        </div>

        {/* Summary Sidebar for Stock */}
        <div className="space-y-4">
          <Card className="p-5 border border-border-base bg-bg-main/30">
            <h3 className="font-black text-text-base uppercase tracking-tight italic text-[9px] mb-4 flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-primary" />
              Resumo por Categoria
            </h3>
            <div className="space-y-1.5">
              {categories.map(cat => {
                const count = items.filter(i => i.categoryId === cat.id).length;
                if (count === 0) return null;
                return (
                  <div key={cat.id} className="flex items-center justify-between text-[10px] font-bold text-text-muted uppercase">
                    <span>{cat.name}</span>
                    <span className="text-primary font-black">{items.filter(i => i.categoryId === cat.id).reduce((acc, curr) => acc + (curr.currentQuantity || 0), 0)} un</span>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-5 bg-secondary text-white border-none shadow-xl shadow-secondary/10">
             <div className="flex items-center gap-3 mb-3">
                <Box className="w-4 h-4 text-primary" />
                <h4 className="font-black uppercase tracking-widest text-[9px]">Análise Rápida</h4>
             </div>
             <div className="space-y-3">
                <div className="flex justify-between items-end border-b border-white/10 pb-1.5">
                   <span className="text-white/40 text-[9px] font-bold uppercase">Variedade</span>
                   <span className="text-lg font-black italic">{items.length} itens</span>
                </div>
                <div className="flex justify-between items-end border-b border-white/10 pb-1.5">
                   <span className="text-white/40 text-[9px] font-bold uppercase">Baixo Estoque</span>
                   <span className="text-lg font-black italic text-rose-400">{items.filter(i => (i.currentQuantity || 0) <= (i.minQuantity || 5)).length}</span>
                </div>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const ReportsView = ({
  items,
  movements,
  categories
}: ReportsViewProps) => {
  const [query, setQuery] = useState('');
  const [currentReport, setCurrentReport] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const response = await generateCustomReport(query, items, movements, categories);
      setCurrentReport(response);
    } catch (error) {
      setCurrentReport("### Erro na Geração\nNão foi possível conectar ao Shopito. Verifique sua conexão ou a chave da API.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] max-w-5xl mx-auto space-y-6">
      {/* Header com Ações Rápidas */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-black uppercase italic text-text-base tracking-tighter">Shopito Intelligence</h2>
          </div>
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mt-1">Gere relatórios analíticos em segundos</p>
        </div>
        
        <div className="flex gap-2">
          {['Resumo de Estoque', 'Alertas de Validade', 'Giro Mensal'].map(btn => (
            <button 
              key={btn}
              onClick={() => {
                setQuery(`Gere um ${btn.toLowerCase()} detalhado.`);
                // O useEffect ou um timer poderia disparar, mas vamos deixar o usuário clicar em enviar
              }}
              className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest bg-surface border border-border-base rounded-[4px] hover:border-primary transition-all text-text-muted hover:text-primary"
            >
              {btn}
            </button>
          ))}
        </div>
      </div>

      {/* Área do Documento */}
      <div className="flex-1 bg-surface border border-border-base rounded-[4px] shadow-2xl overflow-hidden flex flex-col relative group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50 opacity-50" />
        
        <div className="p-4 border-b border-border-base bg-surface-variant/20 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Relatório Analítico Gerado</span>
          </div>
          {currentReport && (
            <button 
              onClick={() => window.print()}
              className="p-2 hover:bg-surface-variant rounded-full transition-all text-text-muted"
              title="Imprimir Relatório"
            >
              <FileText className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar">
          {isGenerating ? (
            <div className="h-full flex flex-col items-center justify-center space-y-6">
               <motion.div 
                 animate={{ 
                   scale: [1, 1.1, 1],
                   rotate: [0, 90, 180, 270, 360]
                 }}
                 transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                 className="relative"
               >
                 <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150" />
                 <img 
                    src="https://shopee.com.br/blog/wp-content/uploads/2022/03/Shopito-capa.jpg" 
                    className="w-20 h-20 rounded-full border-4 border-primary shadow-2xl relative z-10" 
                    referrerPolicy="no-referrer"
                 />
               </motion.div>
               <div className="text-center">
                 <h3 className="text-xl font-black uppercase italic text-primary animate-pulse tracking-tighter">Processando Dados...</h3>
                 <p className="text-xs font-bold text-text-muted uppercase tracking-widest mt-2">O Shopito está organizando seu almoxarifado</p>
               </div>
            </div>
          ) : currentReport ? (
            <div className="prose prose-invert prose-sm max-w-none animate-in fade-in slide-in-from-bottom-4 duration-700">
               <Markdown>{currentReport}</Markdown>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
               <FileText className="w-20 h-20 mb-4 text-text-muted" />
               <p className="text-sm font-black uppercase tracking-widest text-text-muted">Aguardando comando de análise...</p>
            </div>
          )}
        </div>
      </div>

      {/* Barra de Comando */}
      <form onSubmit={handleGenerateReport} className="relative">
        <textarea 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isGenerating}
          rows={2}
          placeholder="O que você deseja que o Shopito analise hoje? Ex: 'Relatório de consumo mensal' ou 'Checklist de itens críticos'..."
          className="w-full bg-surface border-2 border-border-base focus:border-primary rounded-[8px] p-4 pr-20 outline-none transition-all shadow-xl text-sm font-medium placeholder:text-text-muted/40 resize-none"
        />
        <button 
          type="submit"
          disabled={!query.trim() || isGenerating}
          className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-3 bg-primary text-white font-black uppercase italic rounded-[4px] shadow-lg hover:bg-accent transition-all active:scale-95 text-xs disabled:opacity-50"
        >
          {isGenerating ? 'Gerando...' : 'Gerar Relatório'}
        </button>
      </form>
    </div>
  );
};

// --- Main App Logic ---

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return localStorage.getItem('theme') as 'light' | 'dark' || 'light';
  });

  // Theme effect
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'items' | 'stock' | 'movements' | 'reports'>('dashboard');

  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);

  const topConsumedItems = useMemo(() => {
    const consumption: Record<string, number> = {};
    movements
        .filter(m => m.type === 'SAIDA')
        .forEach(m => {
            consumption[m.itemId] = (consumption[m.itemId] || 0) + m.quantity;
        });

    return Object.entries(consumption)
        .map(([itemId, quantity]) => ({
            name: items.find(i => i.id === itemId)?.name || 'Desconhecido',
            quantity
        }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);
  }, [movements, items]);

  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedItemForMovement, setSelectedItemForMovement] = useState<InventoryItem | null>(null);
  const [movementType, setMovementType] = useState<'ENTRADA' | 'SAIDA'>('ENTRADA');
  const [selectedItemForIndication, setSelectedItemForIndication] = useState<InventoryItem | null>(null);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [editingMovement, setEditingMovement] = useState<Movement | null>(null);

  const [aiInsight, setAiInsight] = useState<string>("");
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [movementToDelete, setMovementToDelete] = useState<Movement | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteMovement = (movement: Movement) => {
    setMovementToDelete(movement);
  };

  const confirmDeleteMovement = async () => {
    if (!movementToDelete || isDeleting) return;
    setIsDeleting(true);
    
    try {
      const movement = movementToDelete;
      console.log('Starting deletion of movement:', movement.id);

      // 1. Reverse Batch quantity
      if (movement.itemId && movement.lotNumber) {
        const batchesRef = collection(db, 'batches');
        const q = query(batchesRef, where('itemId', '==', movement.itemId), where('lotNumber', '==', movement.lotNumber));
        const batchSnap = await getDocs(q);
        
        if (!batchSnap.empty) {
          const batchDocId = batchSnap.docs[0].id;
          const currentQty = batchSnap.docs[0].data().quantity || 0;
          const reversedQty = movement.type === 'ENTRADA' ? currentQty - movement.quantity : currentQty + movement.quantity;
          
          await updateDoc(doc(db, 'batches', batchDocId), { quantity: reversedQty });
          console.log('Batch updated:', batchDocId, 'New qty:', reversedQty);
        }
      }

      // 2. Reverse Item Total
      if (movement.itemId) {
        const itemRef = doc(db, 'items', movement.itemId);
        const itemSnap = await getDoc(itemRef);
        if (itemSnap.exists()) {
          const itemData = itemSnap.data() as InventoryItem;
          const reversedTotal = movement.type === 'ENTRADA' ? (itemData.currentQuantity || 0) - movement.quantity : (itemData.currentQuantity || 0) + movement.quantity;
          await updateDoc(itemRef, { currentQuantity: reversedTotal });
          console.log('Item updated:', movement.itemId, 'New total:', reversedTotal);
        }
      }

      // 3. Delete movement record
      await deleteDoc(doc(db, 'movements', movement.id));
      console.log('Movement document deleted successfully');
      
      setMovementToDelete(null);
      alert('Movimentação excluída com sucesso!');
    } catch (e) {
      console.error('Error during movement deletion:', e);
      alert('Erro ao excluir movimentação: ' + (e instanceof Error ? e.message : String(e)));
      handleFirestoreError(e, OperationType.DELETE, 'movements');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditMovement = (movement: Movement) => {
    setEditingMovement(movement);
    setMovementType(movement.type);
    setIsMovementModalOpen(true);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este item do catálogo? Esta ação não pode ser desfeita.')) return;
    try {
      await deleteDoc(doc(db, 'items', itemId));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, 'items');
    }
  };

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setIsItemModalOpen(true);
  };

  const handleDeleteCategory = async (category: Category) => {
    const itemCount = items.filter(i => i.categoryId === category.id).length;
    let message = `Tem certeza que deseja excluir a categoria "${category.name}"?`;
    if (itemCount > 0) {
      message += `\n\nATENÇÃO: Existem ${itemCount} itens vinculados a esta categoria. Eles não serão excluídos, mas ficarão sem categoria associada.`;
    }

    if (!window.confirm(message)) return;

    try {
      await deleteDoc(doc(db, 'categories', category.id));
      alert('Categoria excluída com sucesso!');
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, 'categories');
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsCategoryModalOpen(true);
  };

  const fetchAiInsight = async () => {
    if (items.length === 0) return;
    setIsLoadingInsight(true);
    const insight = await generateInventoryInsights(items, movements, categories);
    setAiInsight(insight);
    setIsLoadingInsight(false);
  };

  useEffect(() => {
    if (activeTab === 'dashboard' && !aiInsight && items.length > 0) {
      fetchAiInsight();
    }
  }, [activeTab, items]);

  // --- Auth & Data Listeners ---

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      try {
        setUser(u);
        if (u) {
          // Simple profile auto-creation for first login
          const userRef = doc(db, 'users', u.uid);
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            const newProfile: Omit<UserProfile, 'id'> = {
              name: u.displayName || 'Sem Nome',
              email: u.email || '',
              role: u.email === 'carlosgabriel.camppos@gmail.com' ? 'admin' : 'user'
            };
            await setDoc(userRef, newProfile).catch(e => handleFirestoreError(e, OperationType.WRITE, 'users'));
            setProfile({ id: u.uid, ...newProfile });
          } else {
            setProfile({ id: u.uid, ...userSnap.data() as Omit<UserProfile, 'id'> });
          }
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error("Erro ao carregar perfil do usuário:", err);
      } finally {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsubCategories = onSnapshot(collection(db, 'categories'), 
      (snap) => setCategories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category))),
      (e) => handleFirestoreError(e, OperationType.LIST, 'categories')
    );

    const unsubItems = onSnapshot(collection(db, 'items'), 
      (snap) => setItems(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem))),
      (e) => handleFirestoreError(e, OperationType.LIST, 'items')
    );

    const unsubMovements = onSnapshot(query(collection(db, 'movements'), orderBy('timestamp', 'desc')), 
      (snap) => setMovements(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Movement)).slice(0, 100)),
      (e) => handleFirestoreError(e, OperationType.LIST, 'movements')
    );

    const unsubBatches = onSnapshot(collection(db, 'batches'), 
      (snap) => setBatches(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Batch))),
      (e) => handleFirestoreError(e, OperationType.LIST, 'batches')
    );

    return () => {
      unsubCategories();
      unsubItems();
      unsubMovements();
      unsubBatches();
    };
  }, [user]);

  // Special listener for all batches (Global alert system)
  useEffect(() => {
    if (!user) return;
    // In many cases, you want to see ALL batches to find what's expiring.
    // Collection group is best here.
    // We'll simulate by fetching top level batches in the UI logic if we change structure.
    // For now, I'll put batches in items/{itemId}/batches but I'll query them.
    // I will add a separate batches collection for simplicity in alerts.
  }, [user]);


  // --- Actions ---

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (username === 'ambulatoriosocmg2' && password === 'shopee@2026') {
      try {
        await signInWithEmailAndPassword(auth, 'ambulatoriosocmg2@shopee.com', 'shopee@2026');
      } catch (err: any) {
        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
          try {
            await createUserWithEmailAndPassword(auth, 'ambulatoriosocmg2@shopee.com', 'shopee@2026');
          } catch (createErr: any) {
            setLoginError('Erro interno ao registrar no banco de dados. ' + createErr.message);
          }
        } else {
          setLoginError('Erro de conexão: ' + err.message);
        }
      }
    } else {
      setLoginError('Credenciais inválidas.');
    }
  };
  const handleLogout = () => signOut(auth);

  const registerMovement = async (data: { 
    itemId: string; 
    type: 'ENTRADA' | 'SAIDA'; 
    quantity: number; 
    lotNumber: string; 
    expirationDate: string; 
    notes?: string; 
  }) => {
    if (!user || !profile) return;

    try {
      // 1. If editing, reverse the OLD impact first
      if (editingMovement) {
        // Reverse Batch quantity
        const batchesRef = collection(db, 'batches');
        const qOld = query(batchesRef, where('itemId', '==', editingMovement.itemId), where('lotNumber', '==', editingMovement.lotNumber));
        const batchSnapOld = await getDocs(qOld);
        if (!batchSnapOld.empty) {
          const batchDocId = batchSnapOld.docs[0].id;
          const currentQty = batchSnapOld.docs[0].data().quantity;
          const reversedQty = editingMovement.type === 'ENTRADA' ? currentQty - editingMovement.quantity : currentQty + editingMovement.quantity;
          await updateDoc(doc(db, 'batches', batchDocId), { quantity: reversedQty });
        }

        // Reverse Item Total
        const itemRefOld = doc(db, 'items', editingMovement.itemId);
        const itemSnapOld = await getDoc(itemRefOld);
        if (itemSnapOld.exists()) {
          const itemData = itemSnapOld.data() as InventoryItem;
          const reversedTotal = editingMovement.type === 'ENTRADA' ? (itemData.currentQuantity || 0) - editingMovement.quantity : (itemData.currentQuantity || 0) + editingMovement.quantity;
          await updateDoc(itemRefOld, { currentQuantity: reversedTotal });
        }
      }

      // 2. Update or Create movement log
      if (editingMovement) {
        await updateDoc(doc(db, 'movements', editingMovement.id), {
          ...data,
          responsibleName: profile.name,
          responsibleUid: user.uid,
          timestamp: new Date().toISOString(),
        });
      } else {
        await addDoc(collection(db, 'movements'), {
          ...data,
          responsibleName: profile.name,
          responsibleUid: user.uid,
          timestamp: new Date().toISOString(),
        });
      }

      // 3. Apply NEW impact to Batch
      const batchesRef = collection(db, 'batches');
      const q = query(batchesRef, where('itemId', '==', data.itemId), where('lotNumber', '==', data.lotNumber));
      const batchSnap = await getDocs(q);
      const item = items.find(i => i.id === data.itemId);

      if (!batchSnap.empty) {
        const batchDocId = batchSnap.docs[0].id;
        // Refetch to get most recent quantity after potential reversal
        const freshBatchSnap = await getDoc(doc(db, 'batches', batchDocId));
        const existingQty = freshBatchSnap.data()?.quantity || 0;
        const newQty = data.type === 'ENTRADA' ? existingQty + data.quantity : existingQty - data.quantity;
        
        if (newQty < 0) throw new Error('Saldo insuficiente no lote selecionado.');
        
        await updateDoc(doc(db, 'batches', batchDocId), {
          quantity: newQty,
          expirationDate: data.expirationDate
        });
      } else {
        if (data.type === 'SAIDA') throw new Error('Lote não encontrado para retirada.');
        await addDoc(batchesRef, {
          itemId: data.itemId,
          itemName: item?.name || 'Item',
          lotNumber: data.lotNumber,
          expirationDate: data.expirationDate,
          quantity: data.quantity
        });
      }

      // 4. Apply NEW impact to Item Total
      const itemRef = doc(db, 'items', data.itemId);
      const freshItemSnap = await getDoc(itemRef);
      if (freshItemSnap.exists()) {
        const itemData = freshItemSnap.data() as InventoryItem;
        const newTotal = data.type === 'ENTRADA' ? (itemData.currentQuantity || 0) + data.quantity : (itemData.currentQuantity || 0) - data.quantity;
        await updateDoc(itemRef, { currentQuantity: newTotal });
      }

      setIsMovementModalOpen(false);
      setEditingMovement(null);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erro ao processar movimentação');
      handleFirestoreError(e, editingMovement ? OperationType.UPDATE : OperationType.WRITE, 'movements');
    }
  };

  // --- Derived State ---

  const expiringBatches = useMemo(() => {
    return batches
      .filter(b => b.quantity > 0)
      .map(b => ({
        ...b,
        status: isPast(parseISO(b.expirationDate)) 
          ? 'expired' 
          : isBefore(parseISO(b.expirationDate), addDays(new Date(), 30)) 
            ? 'soon' 
            : 'ok'
      }))
      .filter(b => b.status !== 'ok')
      .sort((a, b) => parseISO(a.expirationDate).getTime() - parseISO(b.expirationDate).getTime());
  }, [batches]);

  const stats = useMemo(() => ({
    totalItems: items.length,
    lowStock: items.filter(i => (i.currentQuantity || 0) <= (i.minQuantity || 5)).length,
    expiringSoon: expiringBatches.length,
    recentMovements: movements.length
  }), [items, movements, expiringBatches]);





  // --- Auth Guard ---

  if (loading) return (
    <div className="min-h-screen bg-bg-main flex flex-col items-center justify-center gap-6">
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0]
        }} 
        transition={{ repeat: Infinity, duration: 2 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150" />
        <img 
          src="https://shopee.com.br/blog/wp-content/uploads/2022/03/Shopito-capa.jpg" 
          alt="Shopito Mascot"
          className="w-24 h-24 rounded-full object-cover border-4 border-primary relative z-10 shadow-2xl"
          referrerPolicy="no-referrer"
        />
      </motion.div>
      <p className="text-text-muted font-black font-sans text-xs tracking-widest uppercase italic animate-pulse">Iniciando Ambulatório Inteligente...</p>
    </div>
  );

  if (!user) return (
    <div className="min-h-screen bg-bg-main flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-10 text-center space-y-8 bg-surface border-border-base relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
        <div className="w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-primary/5 p-1 overflow-hidden bg-bg-main shadow-inner">
          <img 
            src="https://shopee.com.br/blog/wp-content/uploads/2022/03/Shopito-capa.jpg" 
            alt="Shopito Mascot"
            className="w-full h-full rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div>
          <h1 className="text-2xl font-black text-text-base uppercase italic tracking-tight leading-tight">
            Ambulatório Inteligente <br />
            <span className="text-primary not-italic">Shopee</span>
          </h1>
          <p className="text-text-muted mt-2 font-bold text-xs uppercase tracking-widest leading-loose">Bem-vindo ao sistema de gestão, Shopito!</p>
        </div>
        <form onSubmit={handleCustomLogin} className="space-y-4 text-left w-full">
          {loginError && <p className="text-rose-500 text-xs font-bold text-center bg-rose-500/10 p-2 rounded-sm">{loginError}</p>}
          <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Usuário" required />
          <div className="relative">
             <Input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" required className="pr-10" />
             <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-base p-1" tabIndex={-1}>
               {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
             </button>
          </div>
          <Button type="submit" className="w-full py-4 text-sm tracking-widest mt-4">
             ENTRAR NO SISTEMA
          </Button>
        </form>
        <p className="text-[10px] text-text-muted uppercase tracking-widest font-black">Área de Segurança: Insumos Ambulatoriais</p>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg-main flex">
      {/* Sidebar - Shopee Graphite */}
      <nav className="w-16 md:w-[240px] bg-secondary flex flex-col fixed h-full z-10 transition-all text-white border-r border-white/5 shadow-2xl">
        <div className="p-8 flex items-center justify-center md:justify-start gap-4">
          <div className="w-11 h-11 rounded-xl overflow-hidden border-2 border-primary shadow-xl shadow-primary/20 shrink-0 bg-white">
            <img 
              src="https://shopee.com.br/blog/wp-content/uploads/2022/03/Shopito-capa.jpg" 
              alt="Mascote Shopee"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="hidden md:flex flex-col leading-none">
            <span className="font-black text-[9px] tracking-[0.2em] text-white/40 uppercase italic mb-0.5">Ambulatório</span>
            <span className="font-black text-lg tracking-tight text-white uppercase italic leading-none">Inteligente</span>
            <span className="text-primary font-black text-[10px] tracking-widest uppercase">Shopee</span>
          </div>
        </div>

        <div className="flex-1 px-4 space-y-1.5 mt-6">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'items', label: 'Catálogo', icon: Box },
            { id: 'stock', label: 'Estoque Real', icon: ShoppingBag },
            { id: 'movements', label: 'Movimentações', icon: History },
            { id: 'reports', label: 'Relatórios IA', icon: FileText },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={cn(
                "w-full flex items-center gap-3.5 px-4 py-3.5 rounded-lg transition-all group relative overflow-hidden",
                activeTab === item.id 
                  ? "bg-primary text-white shadow-xl shadow-primary/30" 
                  : "text-white/50 hover:bg-white/[0.03] hover:text-white"
              )}
            >
              <item.icon className={cn("w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110", activeTab === item.id ? "text-white" : "text-white/30 group-hover:text-white/60")} />
              <span className="hidden md:block font-bold text-xs uppercase tracking-wider">{item.label}</span>
              {activeTab === item.id && (
                <motion.div 
                  layoutId="sidebar-active"
                  className="absolute left-0 w-1 h-6 bg-white rounded-r-full"
                />
              )}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-2">
          <button 
            onClick={toggleTheme}
            className="w-full h-11 flex items-center justify-center md:justify-start gap-4 px-4 text-white/40 hover:text-white bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-lg transition-all"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            <span className="font-bold uppercase tracking-[0.1em] text-[9px] hidden md:block">Alternar Tema</span>
          </button>
          
          <button 
            onClick={handleLogout}
            className="w-full h-11 flex items-center justify-center md:justify-start gap-4 px-4 text-white/40 hover:text-red-400 bg-white/[0.02] hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 rounded-lg transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span className="font-bold uppercase tracking-[0.1em] text-[9px] hidden md:block">Encerrar Sessão</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="ml-16 md:ml-[240px] flex-1 min-h-screen bg-bg-main relative">
        <div className="max-w-7xl mx-auto p-4 lg:p-6">
          <header className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border-base pb-4">
            <div className="space-y-1">
               <div className="flex items-center gap-2 mb-2">
                 <span className="px-2 py-0.5 bg-primary/10 text-primary text-[8px] font-black uppercase tracking-[0.2em] rounded-sm">Módulo {activeTab}</span>
               </div>
               <h1 className="text-2xl font-black text-secondary tracking-tighter uppercase italic leading-none">
                  {activeTab === 'dashboard' && 'Visão Geral'}
                  {activeTab === 'items' && 'Gestão de Itens'}
                  {activeTab === 'stock' && 'Inventário Físico'}
                  {activeTab === 'movements' && 'Fluxo de Carga'}
                  {activeTab === 'reports' && 'Shopito Intelligence'}
               </h1>
               <p className="text-text-muted font-bold text-[10px] uppercase tracking-widest pl-1">{format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
            </div>
            
            <div className="flex items-center gap-3">
              {profile && (
                <div className="flex items-center gap-3 px-4 py-2 bg-surface border border-border-base rounded-lg shadow-sm mr-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xs uppercase">
                    {profile.name.charAt(0)}
                  </div>
                  <div className="hidden lg:block leading-none text-left">
                    <p className="text-[10px] font-black text-text-base uppercase truncate max-w-[100px]">{profile.name}</p>
                    <p className="text-[8px] font-bold text-text-muted uppercase mt-0.5 italic">{profile.role}</p>
                  </div>
                </div>
              )}
            </div>
          </header>

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="pb-20"
          >
           {activeTab === 'dashboard' && <Dashboard 
             items={items} 
             movements={movements} 
             categories={categories} 
             stats={stats} 
             topConsumedItems={topConsumedItems} 
             aiInsight={aiInsight} 
             isLoadingInsight={isLoadingInsight} 
             fetchAiInsight={fetchAiInsight} 
             setActiveTab={setActiveTab} 
             expiringBatches={expiringBatches} 
             theme={theme} 
           />}
           {activeTab === 'items' && <ItemsView 
             items={items} 
             categories={categories} 
             theme={theme} 
             setIsCategoryModalOpen={setIsCategoryModalOpen}
             handleEditCategory={handleEditCategory}
             handleDeleteCategory={handleDeleteCategory}
             setEditingItem={setEditingItem}
             setIsItemModalOpen={setIsItemModalOpen}
             setSelectedItemForIndication={setSelectedItemForIndication}
             handleEditItem={handleEditItem}
             handleDeleteItem={handleDeleteItem}
           />}
           {activeTab === 'stock' && <StockView 
             items={items} 
             categories={categories} 
             setMovementType={setMovementType}
             setSelectedItemForMovement={setSelectedItemForMovement}
             setIsMovementModalOpen={setIsMovementModalOpen}
           />}
           {activeTab === 'reports' && <ReportsView 
             items={items} 
             movements={movements} 
             categories={categories} 
           />}
           {activeTab === 'movements' && (
             <div className="space-y-6">
                <div className="flex gap-4">
                  <Button 
                    onClick={() => { setEditingMovement(null); setMovementType('ENTRADA'); setIsMovementModalOpen(true); }}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-4 shadow-lg shadow-emerald-500/20 font-black uppercase tracking-tight"
                  >
                    + Registrar Entrada
                  </Button>
                  <Button 
                    onClick={() => { setEditingMovement(null); setMovementType('SAIDA'); setIsMovementModalOpen(true); }}
                    className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-4 shadow-lg shadow-rose-500/20 font-black uppercase tracking-tight"
                  >
                    - Registrar Saída
                  </Button>
                </div>
                <Card>
                   <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                         <h3 className="font-bold text-text-base">Histórico de Movimentações</h3>
                         <Filter className="w-4 h-4 text-text-muted" />
                      </div>
                   <div className="border border-border-base rounded-sm overflow-hidden">
                      <table className="w-full text-left text-sm">
                         <thead className="bg-bg-main text-text-muted uppercase tracking-tighter font-bold">
                            <tr>
                               <th className="px-6 py-3">Data</th>
                               <th className="px-6 py-3">Tipo</th>
                               <th className="px-6 py-3">Item</th>
                               <th className="px-6 py-3">Qtd</th>
                               <th className="px-6 py-3">Lote</th>
                               <th className="px-6 py-3">Resp.</th>
                               <th className="px-6 py-3 text-right">Ações</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-border-base">
                            {movements.map(m => (
                               <tr key={m.id} className="hover:bg-bg-main transition-colors">
                                  <td className="px-6 py-4 text-text-muted">{format(parseISO(m.timestamp), 'dd/MM HH:mm')}</td>
                                  <td className="px-6 py-4">
                                     <span className={cn(
                                       "px-2 py-0.5 rounded-full text-[10px] font-bold",
                                       m.type === 'ENTRADA' ? 'bg-emerald-100/10 text-emerald-600' : 'bg-rose-100/10 text-rose-600'
                                     )}>
                                        {m.type}
                                     </span>
                                  </td>
                                  <td className="px-6 py-4 font-bold text-text-base">{items.find(i => i.id === m.itemId)?.name}</td>
                                  <td className="px-6 py-4 font-black text-text-base">{m.quantity}</td>
                                  <td className="px-6 py-4 font-mono text-[10px] text-text-muted">{m.lotNumber}</td>
                                  <td className="px-6 py-4 text-text-muted">{m.responsibleName}</td>
                                  <td className="px-6 py-4 text-right">
                                     <div className="flex justify-end gap-2">
                                        <button 
                                          onClick={() => handleEditMovement(m)}
                                          title="Editar movimentação"
                                          className="p-1 hover:bg-primary/10 text-primary transition-colors rounded"
                                        >
                                          <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button 
                                          onClick={() => handleDeleteMovement(m)}
                                          title="Excluir movimentação"
                                          className="p-1 hover:bg-rose-500/10 text-rose-500 transition-colors rounded"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                     </div>
                                  </td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </div>
             </Card>
             </div>
           )}

        </motion.div>
      </div>
    </main>

    {/* Modals */}
      
      {/* Modal de Indicação */}
      {selectedItemForIndication && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setSelectedItemForIndication(null)}
        >
          <div
            className="bg-surface border border-border-base rounded-xl shadow-2xl p-6 max-w-md w-full"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Indicação do Medicamento</p>
                <h3 className="text-lg font-black text-text-base uppercase italic leading-tight">
                  {selectedItemForIndication.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedItemForIndication(null)}
                className="text-text-muted hover:text-text-base transition-colors ml-4 shrink-0"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-bg-main border border-border-base rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Stethoscope className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Para que serve?</span>
              </div>
              <p className="text-sm text-text-base leading-relaxed">
                {selectedItemForIndication.indication}
              </p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] text-text-muted">
              <div className="bg-bg-main border border-border-base rounded px-3 py-2">
                <span className="font-bold uppercase">Categoria:</span>{' '}
                {categories.find(c => c.id === selectedItemForIndication.categoryId)?.name || 'Geral'}
              </div>
              <div className="bg-bg-main border border-border-base rounded px-3 py-2">
                <span className="font-bold uppercase">Unidade:</span>{' '}
                {selectedItemForIndication.unit}
              </div>
            </div>
          </div>
        </div>
      )}

      <Modal 
        isOpen={isCategoryModalOpen} 
        onClose={() => { setIsCategoryModalOpen(false); setEditingCategory(null); }} 
        title={editingCategory ? "Editar Categoria" : "Gerenciar Categorias"}
      >
        <form className="space-y-4" onSubmit={async (e) => {
          e.preventDefault();
          const form = e.target as HTMLFormElement;
          const name = (form.elements.namedItem('catName') as HTMLInputElement).value;
          
          try {
            if (editingCategory) {
              await updateDoc(doc(db, 'categories', editingCategory.id), { name });
              setEditingCategory(null);
              setIsCategoryModalOpen(false);
            } else {
              await addDoc(collection(db, 'categories'), { name });
            }
            form.reset();
          } catch (err) {
            handleFirestoreError(err, editingCategory ? OperationType.UPDATE : OperationType.WRITE, 'categories');
          }
        }}>
           <Input 
             id="catName" 
             name="catName" 
             label={editingCategory ? "Nome da Categoria" : "Nova Categoria"} 
             placeholder="Ex: Medicamentos" 
             defaultValue={editingCategory?.name || ''}
             required 
           />
           <Button type="submit" variant="secondary" className="w-full">
             {editingCategory ? "Salvar Alterações" : "Adicionar Categoria"}
           </Button>
           
           {!editingCategory && (
             <div className="space-y-2 mt-6">
                <h4 className="text-xs font-bold text-text-muted uppercase tracking-widest">Existentes</h4>
                {categories.map(c => (
                  <div key={c.id} className="flex justify-between items-center bg-bg-main px-3 py-2 rounded-sm border border-border-base text-text-base">
                    <span className="text-sm font-bold uppercase italic tracking-tight">{c.name}</span>
                    <div className="flex gap-1">
                      <button onClick={() => handleEditCategory(c)} className="p-1 text-primary hover:bg-primary/10 rounded transition-colors">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDeleteCategory(c)} className="p-1 text-rose-500 hover:bg-rose-500/10 rounded transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
             </div>
           )}
        </form>
      </Modal>

      <Modal 
        isOpen={isItemModalOpen} 
        onClose={() => { setIsItemModalOpen(false); setEditingItem(null); }} 
        title={editingItem ? "Editar Item do Catálogo" : "Cadastrar Novo Item"}
      >
        <form className="space-y-4" onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          const indication = (formData.get('indication') as string).trim();
          const itemData: any = {
             name: formData.get('name') as string,
             categoryId: formData.get('categoryId') as string,
             supplier: formData.get('supplier') as string,
             unit: formData.get('unit') as string,
             minQuantity: Number(formData.get('minQty')),
          };
          if (indication) itemData.indication = indication;
          
          try {
            if (editingItem) {
              await updateDoc(doc(db, 'items', editingItem.id), itemData);
            } else {
              await addDoc(collection(db, 'items'), {
                ...itemData,
                currentQuantity: 0
              });
            }
          } catch (e) {
            handleFirestoreError(e, editingItem ? OperationType.UPDATE : OperationType.WRITE, 'items');
            return;
          }

          setIsItemModalOpen(false);
          setEditingItem(null);
        }}>
           <Input 
             id="name" 
             name="name" 
             label="Nome do Insumo" 
             placeholder="Ex: Gaze Estéril 7.5x7.5" 
             defaultValue={editingItem?.name || ''}
             required 
           />
           <Select 
             id="categoryId" 
             name="categoryId" 
             label="Categoria" 
             defaultValue={editingItem?.categoryId || ''}
             required
           >
              <option value="">Selecione...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
           </Select>
           <Input 
             id="supplier" 
             name="supplier" 
             label="Fornecedor Padrão" 
             placeholder="Ex: MedSul Distribuídora" 
             defaultValue={editingItem?.supplier || ''}
             required 
           />
           
           <div className="grid grid-cols-2 gap-4">
             <Select 
               id="unit" 
               name="unit" 
               label="Unidade de Medida" 
               defaultValue={editingItem?.unit || ''}
               required
             >
               <option value="">Selecione...</option>
               <option value="Un">Unidade (UN)</option>
               <option value="Cx">Caixa (CX)</option>
               <option value="Fr">Frasco (FR)</option>
               <option value="Pct">Pacote (PCT)</option>
               <option value="Rl">Rolo (RL)</option>
               <option value="Pr">Par (PR)</option>
             </Select>
             <Input 
               id="minQty" 
               name="minQty" 
               label="Mínimo em Estoque" 
               type="number" 
               defaultValue={editingItem?.minQuantity?.toString() || "5"} 
               required 
             />
           </div>

           <div>
             <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Indicação (Para que serve?)</label>
             <textarea
               id="indication"
               name="indication"
               rows={3}
               placeholder="Ex: Indicado para cólicas intestinais e espasmos abdominais..."
               defaultValue={editingItem?.indication || ''}
               className="w-full px-3 py-2 bg-bg-main border border-border-base rounded-sm outline-none focus:border-primary transition-all text-sm text-text-base resize-none"
             />
           </div>

           <Button type="submit" variant="primary" className="w-full py-3">
             {editingItem ? "Salvar Alterações" : "Salvar Item no Catálogo"}
           </Button>
        </form>
      </Modal>

      <Modal 
        isOpen={isMovementModalOpen} 
        onClose={() => { setIsMovementModalOpen(false); setEditingMovement(null); }} 
        title={editingMovement 
          ? `Editar ${editingMovement.type === 'ENTRADA' ? 'Entrada' : 'Saída'}` 
          : (movementType === 'ENTRADA' ? "Entrada de Estoque" : "Saída de Estoque")}
      >
        <form className="space-y-4" onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          registerMovement({
            itemId: formData.get('itemId') as string,
            type: movementType,
            quantity: Number(formData.get('qty')),
            lotNumber: formData.get('lot') as string,
            expirationDate: formData.get('expiry') 
              ? new Date(formData.get('expiry') as string).toISOString() 
              : (editingMovement?.timestamp || new Date().toISOString()),
            notes: formData.get('notes') as string
          });
        }}>
           <Select 
             id="itemId" 
             name="itemId" 
             label="Item" 
             defaultValue={editingMovement?.itemId || selectedItemForMovement?.id || ''} 
             required
           >
              <option value="">Selecione um item...</option>
              {items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
           </Select>
           <div className="grid grid-cols-2 gap-4">
              <Input 
                id="qty" 
                name="qty" 
                label="Quantidade" 
                type="number" 
                defaultValue={editingMovement?.quantity || ''} 
                required 
                min="1" 
              />
              <Input 
                id="lot" 
                name="lot" 
                label="Lote" 
                placeholder="Identificação" 
                defaultValue={editingMovement?.lotNumber || ''} 
                required 
              />
           </div>
           {(movementType === 'ENTRADA' || (editingMovement && editingMovement.type === 'ENTRADA')) && (
              <Input 
                id="expiry" 
                name="expiry" 
                label="Validade" 
                type="date" 
                defaultValue={editingMovement?.timestamp ? format(parseISO(editingMovement.timestamp), 'yyyy-MM-dd') : ''} 
                required 
              />
           )}
           <Input 
             id="notes" 
             name="notes" 
             label="Observações (Opcional)" 
             defaultValue={editingMovement?.notes || ''} 
           />
           <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest italic">
             {editingMovement ? 'Editando como:' : 'Registrando como:'} <b className="text-primary">{profile?.name}</b>
           </p>
           <Button type="submit" variant={movementType === 'ENTRADA' ? 'primary' : 'danger'} className="w-full py-3">
              {editingMovement ? 'Salvar Alterações' : `Confirmar ${movementType === 'ENTRADA' ? 'Entrada' : 'Saída'}`}
           </Button>
        </form>
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        isOpen={!!movementToDelete}
        onClose={() => setMovementToDelete(null)}
        title="Confirmar Exclusão"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-sm">
            <AlertTriangle className="w-8 h-8 text-rose-500 shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-black text-rose-600 uppercase italic">Atenção!</p>
              <p className="text-xs text-rose-500/80 font-bold leading-relaxed uppercase tracking-tight">
                Você está prestes a excluir uma movimentação de {movementToDelete?.type}. 
                O estoque será ajustado automaticamente para refletir esta mudança.
              </p>
            </div>
          </div>

          <div className="bg-bg-main p-4 rounded-sm border border-border-base space-y-3">
             <div className="flex justify-between items-center text-[10px] font-black uppercase">
                <span className="text-text-muted">Item:</span>
                <span className="text-text-base">{items.find(i => i.id === movementToDelete?.itemId)?.name}</span>
             </div>
             <div className="flex justify-between items-center text-[10px] font-black uppercase">
                <span className="text-text-muted">Quantidade:</span>
                <span className="text-primary">{movementToDelete?.quantity} un</span>
             </div>
             <div className="flex justify-between items-center text-[10px] font-black uppercase">
                <span className="text-text-muted">Lote:</span>
                <span className="text-text-base">{movementToDelete?.lotNumber}</span>
             </div>
          </div>

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={() => setMovementToDelete(null)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button 
              variant="danger" 
              className="flex-1" 
              onClick={confirmDeleteMovement}
              disabled={isDeleting}
            >
              {isDeleting ? 'Excluindo...' : 'Sim, Excluir'}
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
