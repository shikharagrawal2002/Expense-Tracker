
import React from 'react';

export const CATEGORIES = [
  'Food & Dining',
  'Transport',
  'Shopping',
  'Entertainment',
  'Utilities',
  'Health',
  'Salary',
  'Investment',
  'Other',
];

export const CARD_COLORS = [
  'bg-blue-600',
  'bg-purple-600',
  'bg-emerald-600',
  'bg-amber-600',
  'bg-rose-600',
  'bg-slate-800',
];

export const INITIAL_CREDIT_CARDS = [
  {
    id: 'cc1',
    name: 'Visa Platinum',
    lastFour: '4242',
    limit: 5000,
    balance: 1240.50,
    dueDate: '2024-05-15',
    color: 'bg-indigo-600',
  },
  {
    id: 'cc2',
    name: 'Mastercard Gold',
    lastFour: '8812',
    limit: 10000,
    balance: 450.00,
    dueDate: '2024-05-20',
    color: 'bg-slate-800',
  }
];

export const INITIAL_TRANSACTIONS = [
  {
    id: '1',
    amount: 1500,
    description: 'Monthly Salary',
    category: 'Salary',
    date: '2024-04-01',
    type: 'DEPOSIT' as any,
    source: 'BANK' as any,
  },
  {
    id: '2',
    amount: 45.50,
    description: 'Grocery Shopping',
    category: 'Food & Dining',
    date: '2024-04-02',
    type: 'EXPENSE' as any,
    source: 'CREDIT_CARD' as any,
    cardId: 'cc1',
  },
  {
    id: '3',
    amount: 120,
    description: 'Electricity Bill',
    category: 'Utilities',
    date: '2024-04-05',
    type: 'EXPENSE' as any,
    source: 'BANK' as any,
  }
];
