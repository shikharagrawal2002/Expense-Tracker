
import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard as CardIcon, 
  Plus, 
  History, 
  PieChart as ChartIcon,
  Sparkles,
  Search,
  Wallet,
  Bell,
  User,
  X
} from 'lucide-react';
import { Transaction, TransactionType, TransactionSource, CreditCard } from './types';
import { INITIAL_TRANSACTIONS, INITIAL_CREDIT_CARDS, CATEGORIES, CARD_COLORS } from './constants';
import StatCard from './components/StatCard';
import CreditCardItem from './components/CreditCardItem';
import { getFinancialInsights, categorizeTransaction } from './services/geminiService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

// --- Dashboard Component ---
const Dashboard = ({ transactions, cards, insights }: { transactions: Transaction[], cards: CreditCard[], insights: any[] }) => {
  const stats = useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.type === TransactionType.DEPOSIT)
      .reduce((acc, t) => acc + t.amount, 0);
    const totalExpenses = transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((acc, t) => acc + t.amount, 0);
    const totalDebt = cards.reduce((acc, c) => acc + c.balance, 0);
    
    return {
      balance: totalIncome - totalExpenses,
      income: totalIncome,
      expenses: totalExpenses,
      debt: totalDebt
    };
  }, [transactions, cards]);

  const categoryData = useMemo(() => {
    const data: Record<string, number> = {};
    transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .forEach(t => {
        data[t.category] = (data[t.category] || 0) + t.amount;
      });
    return Object.keys(data).map(name => ({ name, value: data[name] }));
  }, [transactions]);

  const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4'];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Financial Overview</h1>
        <p className="text-slate-500">Welcome back! Here's what's happening with your money.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Balance" 
          value={stats.balance} 
          icon={<Wallet className="w-5 h-5 text-indigo-600" />}
          colorClass="text-indigo-600"
        />
        <StatCard 
          label="Monthly Income" 
          value={stats.income} 
          icon={<ArrowDownLeft className="w-5 h-5 text-emerald-600" />}
          trend={{ value: 12, isUp: true }}
        />
        <StatCard 
          label="Monthly Expenses" 
          value={stats.expenses} 
          icon={<ArrowUpRight className="w-5 h-5 text-rose-600" />}
          trend={{ value: 5, isUp: false }}
        />
        <StatCard 
          label="Credit Debt" 
          value={stats.debt} 
          icon={<CardIcon className="w-5 h-5 text-amber-600" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-96">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <ChartIcon className="w-5 h-5 text-indigo-600" />
              Spending by Category
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
                {categoryData.map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-slate-600">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                    {item.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Recent Transactions</h3>
              <Link to="/transactions" className="text-indigo-600 text-sm font-medium hover:underline">View all</Link>
            </div>
            <div className="space-y-4">
              {transactions.slice(0, 5).map(t => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${t.type === TransactionType.DEPOSIT ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                      {t.type === TransactionType.DEPOSIT ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{t.description}</p>
                      <p className="text-xs text-slate-500">{t.category} • {new Date(t.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <p className={`font-semibold ${t.type === TransactionType.DEPOSIT ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {t.type === TransactionType.DEPOSIT ? '+' : '-'}${t.amount.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI & Cards Sidebar */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-2xl shadow-lg text-white">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              AI Financial Insights
            </h3>
            <div className="space-y-4">
              {insights.length > 0 ? insights.map((insight, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">{insight.category}</span>
                  </div>
                  <h4 className="text-sm font-bold">{insight.title}</h4>
                  <p className="text-xs text-white/80 mt-1 leading-relaxed">{insight.description}</p>
                </div>
              )) : (
                <div className="animate-pulse space-y-3">
                  <div className="h-20 bg-white/10 rounded-xl"></div>
                  <div className="h-20 bg-white/10 rounded-xl"></div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">My Cards</h3>
              <Link to="/cards" className="text-indigo-600 text-sm font-medium hover:underline">Manage</Link>
            </div>
            {cards.map(card => (
              <CreditCardItem key={card.id} card={card} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Transactions List Component ---
const TransactionList = ({ transactions, onAdd }: { transactions: Transaction[], onAdd: () => void }) => {
  const [filter, setFilter] = useState('');
  
  const filtered = transactions.filter(t => 
    t.description.toLowerCase().includes(filter.toLowerCase()) || 
    t.category.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Transactions</h1>
          <p className="text-slate-500">Review and manage your financial history.</p>
        </div>
        <button 
          onClick={onAdd}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Add Transaction
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-50 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search description or category..." 
            className="flex-1 outline-none text-slate-700 placeholder:text-slate-400"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Description</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Source</th>
                <th className="px-6 py-4 font-semibold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(t => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 text-sm text-slate-600">{new Date(t.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-900">{t.description}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">{t.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-slate-500 flex items-center gap-1.5">
                      {t.source === TransactionSource.CREDIT_CARD ? <CardIcon className="w-3 h-3" /> : <Wallet className="w-3 h-3" />}
                      {t.source.replace('_', ' ')}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-sm font-bold text-right ${t.type === TransactionType.DEPOSIT ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {t.type === TransactionType.DEPOSIT ? '+' : '-'}${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-400">
                    No transactions found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- Credit Cards Component ---
const CardManager = ({ cards, onAdd }: { cards: CreditCard[], onAdd: () => void }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Card Management</h1>
          <p className="text-slate-500">Monitor your credit cards and spending limits.</p>
        </div>
        <button 
          onClick={onAdd}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Add Card
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map(card => (
          <div key={card.id} className="space-y-4">
            <CreditCardItem card={card} />
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-medium">Due Date</span>
                <span className="text-slate-900 font-bold">{new Date(card.dueDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-medium">Credit Limit</span>
                <span className="text-slate-900 font-bold">${card.limit.toLocaleString()}</span>
              </div>
              <div className="pt-4 border-t border-slate-50 flex gap-2">
                <button className="flex-1 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                  Pay Bill
                </button>
                <button className="flex-1 py-2 text-sm font-semibold text-slate-600 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Main App Shell ---
const SidebarLink = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        isActive 
          ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
      }`}
    >
      <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : ''}`} />
      <span className="font-medium">{label}</span>
    </Link>
  );
};

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [cards, setCards] = useState<CreditCard[]>(INITIAL_CREDIT_CARDS);
  const [insights, setInsights] = useState<any[]>([]);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  
  // State for new transaction form
  const [newTx, setNewTx] = useState({
    amount: '',
    description: '',
    category: 'Other',
    type: TransactionType.EXPENSE,
    source: TransactionSource.BANK,
    cardId: ''
  });

  const [loadingCategory, setLoadingCategory] = useState(false);

  useEffect(() => {
    // Fetch initial insights
    const fetchInsights = async () => {
      const result = await getFinancialInsights(transactions, cards);
      setInsights(result);
    };
    fetchInsights();
  }, [transactions, cards]);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTx.amount || !newTx.description) return;

    const transaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      amount: parseFloat(newTx.amount),
      description: newTx.description,
      category: newTx.category,
      date: new Date().toISOString().split('T')[0],
      type: newTx.type,
      source: newTx.source,
      cardId: newTx.source === TransactionSource.CREDIT_CARD ? newTx.cardId : undefined
    };

    setTransactions([transaction, ...transactions]);

    // If it's a credit card expense, update the card balance
    if (newTx.type === TransactionType.EXPENSE && newTx.source === TransactionSource.CREDIT_CARD && newTx.cardId) {
      setCards(cards.map(c => 
        c.id === newTx.cardId 
          ? { ...c, balance: c.balance + parseFloat(newTx.amount) } 
          : c
      ));
    }

    setIsTxModalOpen(false);
    setNewTx({
      amount: '',
      description: '',
      category: 'Other',
      type: TransactionType.EXPENSE,
      source: TransactionSource.BANK,
      cardId: ''
    });
  };

  const handleSuggestCategory = async () => {
    if (!newTx.description) return;
    setLoadingCategory(true);
    const suggested = await categorizeTransaction(newTx.description);
    setNewTx(prev => ({ ...prev, category: suggested }));
    setLoadingCategory(false);
  };

  return (
    <HashRouter>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-100 p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="bg-indigo-600 p-2 rounded-xl">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              SpendWise AI
            </span>
          </div>

          <nav className="flex-1 space-y-1">
            <SidebarLink to="/" icon={LayoutDashboard} label="Dashboard" />
            <SidebarLink to="/transactions" icon={History} label="Transactions" />
            <SidebarLink to="/cards" icon={CardIcon} label="My Cards" />
          </nav>

          <div className="mt-auto bg-slate-50 p-4 rounded-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                JD
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">John Doe</p>
                <p className="text-xs text-slate-500">Premium Plan</p>
              </div>
            </div>
            <button className="w-full py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header */}
          <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 shrink-0">
            <div className="lg:hidden flex items-center gap-2">
               <Wallet className="w-6 h-6 text-indigo-600" />
               <span className="font-bold text-slate-900">SpendWise</span>
            </div>
            
            <div className="hidden sm:flex items-center bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100 w-96">
              <Search className="w-4 h-4 text-slate-400 mr-2" />
              <input type="text" placeholder="Search insights..." className="bg-transparent border-none outline-none text-sm w-full" />
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-full relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
              </button>
              <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-full">
                <User className="w-5 h-5" />
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6 md:p-10">
            <div className="max-w-6xl mx-auto pb-10">
              <Routes>
                <Route path="/" element={<Dashboard transactions={transactions} cards={cards} insights={insights} />} />
                <Route path="/transactions" element={<TransactionList transactions={transactions} onAdd={() => setIsTxModalOpen(true)} />} />
                <Route path="/cards" element={<CardManager cards={cards} onAdd={() => {}} />} />
              </Routes>
            </div>
          </main>
        </div>

        {/* Floating Add Button for Mobile */}
        <button 
          onClick={() => setIsTxModalOpen(true)}
          className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform"
        >
          <Plus className="w-7 h-7" />
        </button>

        {/* Transaction Modal */}
        {isTxModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsTxModalOpen(false)}></div>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-indigo-600 text-white">
                <h2 className="text-xl font-bold">New Transaction</h2>
                <button onClick={() => setIsTxModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleAddTransaction} className="p-6 space-y-4">
                <div className="flex bg-slate-50 p-1 rounded-xl">
                  <button 
                    type="button"
                    onClick={() => setNewTx(prev => ({ ...prev, type: TransactionType.EXPENSE }))}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${newTx.type === TransactionType.EXPENSE ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Expense
                  </button>
                  <button 
                    type="button"
                    onClick={() => setNewTx(prev => ({ ...prev, type: TransactionType.DEPOSIT }))}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${newTx.type === TransactionType.DEPOSIT ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Deposit
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Description</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Starbucks, Salary" 
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-600 transition-colors pr-24"
                      value={newTx.description}
                      onChange={(e) => setNewTx(prev => ({ ...prev, description: e.target.value }))}
                      onBlur={handleSuggestCategory}
                    />
                    <button 
                      type="button"
                      onClick={handleSuggestCategory}
                      disabled={loadingCategory || !newTx.description}
                      className="absolute right-2 top-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-bold uppercase hover:bg-indigo-100 disabled:opacity-50"
                    >
                      {loadingCategory ? 'AI...' : 'Auto Cat'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Amount ($)</label>
                    <input 
                      type="number" 
                      required
                      step="0.01"
                      placeholder="0.00" 
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-600 transition-colors"
                      value={newTx.amount}
                      onChange={(e) => setNewTx(prev => ({ ...prev, amount: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Category</label>
                    <select 
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-600 transition-colors"
                      value={newTx.category}
                      onChange={(e) => setNewTx(prev => ({ ...prev, category: e.target.value }))}
                    >
                      {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Payment Method</label>
                  <select 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-600 transition-colors"
                    value={newTx.source}
                    onChange={(e) => setNewTx(prev => ({ ...prev, source: e.target.value as TransactionSource }))}
                  >
                    <option value={TransactionSource.BANK}>Bank Account</option>
                    <option value={TransactionSource.CASH}>Cash</option>
                    <option value={TransactionSource.CREDIT_CARD}>Credit Card</option>
                  </select>
                </div>

                {newTx.source === TransactionSource.CREDIT_CARD && (
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Select Card</label>
                    <select 
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-600 transition-colors"
                      required
                      value={newTx.cardId}
                      onChange={(e) => setNewTx(prev => ({ ...prev, cardId: e.target.value }))}
                    >
                      <option value="">Choose a card...</option>
                      {cards.map(c => <option key={c.id} value={c.id}>{c.name} (***{c.lastFour})</option>)}
                    </select>
                  </div>
                )}

                <button 
                  type="submit"
                  className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 active:scale-95 transition-all mt-4"
                >
                  Save Transaction
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </HashRouter>
  );
};

export default App;
