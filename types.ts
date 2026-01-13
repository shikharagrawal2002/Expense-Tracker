
export enum TransactionType {
  EXPENSE = 'EXPENSE',
  DEPOSIT = 'DEPOSIT',
}

export enum TransactionSource {
  CASH = 'CASH',
  BANK = 'BANK',
  CREDIT_CARD = 'CREDIT_CARD',
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  type: TransactionType;
  source: TransactionSource;
  cardId?: string;
}

export interface CreditCard {
  id: string;
  name: string;
  lastFour: string;
  limit: number;
  balance: number;
  dueDate: string;
  color: string;
}

export interface FinancialStats {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  totalDebt: number;
}
