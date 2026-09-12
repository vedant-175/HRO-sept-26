export interface RequestEvent {
  id: string;
  label: string;
  date: string;
  amount: number;
  kind: 'income' | 'expense';
}

export interface RequestPlan {
  date: string;
  amount: number;
}

export interface RequestData {
  id: string;
  user: string;
  currency: string;
  type: string;
  text: string;
  requested_amount: number;
  request_date: string;
  desired_completion_date: string;
  status: 'affordable_now' | 'affordable_with_plan' | 'affordable_later' | 'not_affordable';
  method: string;
  amount_safe_to_pay: number;
  plan: RequestPlan[] | ['none'];
  earliest_full: string | null;
  spending_changes: string[];
  explanation: string;
  balance: number;
  minBalance: number;
  events: RequestEvent[];
  messages: string[];
  images: string[];
}

export const STATUS_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
  affordable_now: { label: 'Affordable Now', color: '#1fbf9a', bg: 'rgba(31,191,154,.10)', border: 'rgba(31,191,154,.35)' },
  affordable_with_plan: { label: 'Affordable With Plan', color: '#e6a23c', bg: 'rgba(230,162,60,.10)', border: 'rgba(230,162,60,.35)' },
  affordable_later: { label: 'Affordable Later', color: '#9b7bf0', bg: 'rgba(155,123,240,.10)', border: 'rgba(155,123,240,.35)' },
  not_affordable: { label: 'Not Affordable', color: '#f0576e', bg: 'rgba(240,87,110,.10)', border: 'rgba(240,87,110,.35)' }
};

export const CURRENCY_SYMBOL: Record<string, string> = {
  USD: '$', INR: '₹', EUR: '€', IDR: 'Rp', ZAR: 'R'
};

export function fmtAmount(amount: number, currency: string): string {
  const sym = CURRENCY_SYMBOL[currency] || '';
  return sym + Number(amount).toLocaleString('en-US', { maximumFractionDigits: 0 });
}
