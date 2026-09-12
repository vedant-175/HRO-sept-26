import { create } from 'zustand';

export interface Decision {
  request_id: string;
  amount_safe_to_pay: number;
  affordability_status: string;
  recommended_payment_method: string;
  payment_plan: string;
  earliest_date_for_full_payment: string;
  spending_changes_needed: string;
  decision_explanation: string;
}

export interface Request {
  request_id: string;
  user_id: string;
  request_date: string;
  request_type: string;
  requested_amount: number;
  desired_completion_date: string;
  allows_partial_payment: boolean;
  request_text: string;
  decision?: Decision;
}

export interface Expense {
  date: string;
  amount: number;
}

export interface LedgerEntry {
  date: string;
  balance: number;
}

interface StoreState {
  requests: Request[];
  ledger: LedgerEntry[];
  expenses: Expense[];
  minBalance: number;
  selectedRequest: Request | null;
  viewMode: 'top-down' | 'water-level';
  searchTerm: string;
  
  setData: (requests: Request[], ledger: LedgerEntry[], expenses: Expense[], minBalance: number) => void;
  selectRequest: (req: Request | null) => void;
  setSearchTerm: (term: string) => void;
}

export const useStore = create<StoreState>((set) => ({
  requests: [],
  ledger: [],
  expenses: [],
  minBalance: 0,
  selectedRequest: null,
  viewMode: 'top-down',
  searchTerm: '',

  setData: (requests, ledger, expenses, minBalance) => 
    set({ requests, ledger, expenses, minBalance }),
    
  selectRequest: (req) => 
    set({ selectedRequest: req, viewMode: req ? 'water-level' : 'top-down' }),
    
  setSearchTerm: (term) => set({ searchTerm: term }),
}));
