export interface MockRequest {
  id: string;
  user: string;
  currency: string;
  text: string;
  requested_amount: number;
  status: string;
  method: string;
  amount_safe_to_pay: number;
  balance: number;
  minBalance: number;
  analyzed?: boolean;
  explanation?: string;
  payment_plan?: string;
  earliest_date_for_full_payment?: string;
  spending_changes_needed?: string;
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

// Fallback just in case
export const MOCK_REQUESTS: MockRequest[] = [];

function parseCSVRow(str: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === '"' && str[i + 1] === '"') {
      current += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export async function fetchMockRequests(): Promise<MockRequest[]> {
  try {
    const res = await fetch('/requests.csv');
    if (!res.ok) throw new Error('Failed to fetch requests.csv');
    const text = await res.text();
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    
    // Skip header
    const dataLines = lines.slice(1);
    
    return dataLines.map((line, index) => {
      const cols = parseCSVRow(line);
      const request_id = cols[0];
      const user_id = cols[1];
      const req_amount = parseFloat(cols[4] || '0');
      const text = cols[7] || '';
      
      const currencyMatch = text.match(/(USD|EUR|INR|IDR|ZAR)/);
      const currency = currencyMatch ? currencyMatch[1] : 'USD';
      
      // Deterministic pseudo-randomness based on index
      const statusOptions: MockRequest['status'][] = ['affordable_now', 'affordable_with_plan', 'affordable_later', 'not_affordable'];
      const statusIdx = (index * 7) % 4;
      const status = statusOptions[statusIdx];
      
      let method = 'full_payment';
      let safe_amount = req_amount;
      
      if (status === 'affordable_with_plan') {
        method = index % 2 === 0 ? 'partial_payment' : 'installments';
        safe_amount = Math.round(req_amount * 0.3);
      } else if (status === 'affordable_later') {
        method = 'wait';
        safe_amount = 0;
      } else if (status === 'not_affordable') {
        method = 'not_recommended';
        safe_amount = 0;
      }

      return {
        id: request_id.replace('request_', 'req'),
        user: user_id,
        currency,
        text,
        requested_amount: req_amount,
        status,
        method,
        amount_safe_to_pay: safe_amount,
        balance: req_amount * 3 + (index * 100),
        minBalance: req_amount * 0.8
      };
    });
  } catch (err) {
    console.error('Error fetching mock requests:', err);
    return MOCK_REQUESTS;
  }
}
