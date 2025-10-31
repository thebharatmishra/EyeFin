// shared/types/transaction.ts
export type Currency = "INR" | "USD" | "EUR" | "GBP" | string;

export interface Transaction {
  id: string; // uuid
  userId: string;
  timestamp: string; // ISO
  amount: number;
  currency: Currency;
  merchant: string;
  category: string; // e.g., "Food", "Travel", "Utilities"
  country: string; // country code or name
  isFlagged?: boolean; // set by fraud detection
  flags?: string[]; // reasons
}
