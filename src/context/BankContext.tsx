import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserAccount, Stock, Transaction, LoanRequest } from '../types';
import { generateAccountNumber } from '../utils/helpers';

interface BankContextType {
  currentUser: UserAccount | null;
  users: { [username: string]: UserAccount };
  market: Stock[];
  isLoading: boolean;
  
  // Auth
  login: (u: string, p: string) => boolean;
  logout: () => void;
  register: (u: string, p: string) => string;
  
  // Banking
  deposit: (amt: number) => void;
  withdraw: (amt: number) => boolean;
  transfer: (to: string, amt: number) => string;
  payBill: (service: string, amt: number) => string;
  
  // Loans
  requestLoan: (amt: number, reason: string) => void;
  repayLoan: (id: string) => void;
  
  // Investing
  getPortfolioValue: () => number;
  buyStock: (sym: string, qty: number) => string;
  sellStock: (sym: string, qty: number) => string;
  
  // Games
  updateGameBalance: (amt: number, isWin: boolean, game: string) => void;
  
  // Admin
  adminProcessLoan: (user: string, id: string, approve: boolean) => void;
  adminAddStock: (s: string, n: string, p: number) => void;
  adminRemoveStock: (s: string) => void;
  adminAdjustBalance: (u: string, amt: number, add: boolean) => void;
}

export const BankContext = createContext<BankContextType>({} as BankContextType);

export const BankProvider = ({ children }: { children: ReactNode }) => {
  // --- STATE ---
  const [users, setUsers] = useState<{ [key: string]: UserAccount }>({
    admin: { 
        username: 'admin', 
        pin: '0000', 
        accountNumber: '000000000000', 
        balance: 1000000, 
        isAdmin: true, 
        history: [], 
        stocks: {}, 
        loans: [] 
    }
  });
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [market, setMarket] = useState<Stock[]>([
    { symbol: 'BTC', name: 'Bitcoin', price: 45000, change: 0, history: [45000] },
    { symbol: 'ETH', name: 'Ethereum', price: 3000, change: 0, history: [3000] },
    { symbol: 'AAPL', name: 'Apple', price: 175, change: 0, history: [175] },
  ]);
  const [isLoading, setIsLoading] = useState(true);

  // --- PERSISTENCE ---
  useEffect(() => {
    const loadData = async () => {
      try {
        const uData = await AsyncStorage.getItem('users');
        const mData = await AsyncStorage.getItem('market');
        if (uData) setUsers(JSON.parse(uData));
        if (mData) setMarket(JSON.parse(mData));
      } catch (e) { 
        console.error("Failed to load data", e); 
      }
      setIsLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      AsyncStorage.setItem('users', JSON.stringify(users));
      // Keep currentUser in sync with the users object if logged in
      if (currentUser) {
        setCurrentUser(users[currentUser.username]);
      }
    }
  }, [users]); // Trigger whenever 'users' changes

  useEffect(() => {
    if(!isLoading) {
        AsyncStorage.setItem('market', JSON.stringify(market));
    }
  }, [market]);

  // --- MARKET SIMULATION ---
  useEffect(() => {
    const interval = setInterval(() => {
      setMarket(prev => prev.map(s => {
        const fluc = (Math.random() * 0.04) - 0.02; // +/- 2%
        let price = s.price * (1 + fluc);
        if (price < 0.01) price = 0.01;
        
        const history = [...s.history, price];
        if (history.length > 20) history.shift();
        
        return { 
            ...s, 
            price, 
            change: s.change + (fluc * 100), 
            history 
        };
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // --- AUTH ---
  const login = (u: string, p: string) => {
    if (users[u] && users[u].pin === p) {
      setCurrentUser(users[u]);
      return true;
    }
    return false;
  };

  const logout = () => setCurrentUser(null);

  const register = (u: string, p: string) => {
    if (users[u]) return "User exists";
    if (p.length < 4) return "PIN too short";
    
    const newUser: UserAccount = {
      username: u, 
      pin: p, 
      accountNumber: generateAccountNumber(),
      balance: 1000, 
      isAdmin: false, 
      history: [], 
      stocks: {}, 
      loans: []
    };
    
    setUsers(prev => ({ ...prev, [u]: newUser }));
    return "Success";
  };

  // Helper to update specific user
  const updateUserState = (u: UserAccount) => {
    setUsers(prev => ({ ...prev, [u.username]: u }));
    // If updating the currently logged in user, update local state too for immediate UI refresh
    if (currentUser && currentUser.username === u.username) {
        setCurrentUser(u);
    }
  };

  // --- BANKING ---
  const deposit = (amt: number) => {
    if (!currentUser) return;
    const u = { 
        ...currentUser, 
        balance: currentUser.balance + amt, 
        history: [...currentUser.history, { type: 'Deposit', amount: amt, date: new Date().toISOString() }] 
    };
    updateUserState(u);
  };

  const withdraw = (amt: number) => {
    if (!currentUser || currentUser.balance < amt) return false;
    const u = { 
        ...currentUser, 
        balance: currentUser.balance - amt, 
        history: [...currentUser.history, { type: 'Withdraw', amount: amt, date: new Date().toISOString() }] 
    };
    updateUserState(u);
    return true;
  };

  const transfer = (to: string, amt: number) => {
    if (!currentUser) return "";
    if (amt <= 0) return "Invalid amount";
    if (currentUser.balance < amt) return "Insufficient funds";
    if (to === currentUser.username) return "Cannot send to yourself";
    if (!users[to]) return "User not found";

    const timestamp = new Date().toISOString();

    const sender = { 
      ...currentUser, 
      balance: currentUser.balance - amt, 
      history: [...currentUser.history, { type: `Sent to ${to}`, amount: amt, date: timestamp }] 
    };

    const receiver = { 
      ...users[to], 
      balance: users[to].balance + amt, 
      history: [...users[to].history, { type: `Received from ${currentUser.username}`, amount: amt, date: timestamp }] 
    };

    // Update both users
    setUsers(prev => ({ 
      ...prev, 
      [sender.username]: sender, 
      [receiver.username]: receiver 
    }));
    
    // Explicitly update current user to refresh UI immediately
    setCurrentUser(sender);

    return "Success";
  };

  const payBill = (service: string, amt: number) => {
    if (!currentUser || currentUser.balance < amt) return "Insufficient Funds";
    const u = { 
        ...currentUser, 
        balance: currentUser.balance - amt, 
        history: [...currentUser.history, { type: `Bill: ${service}`, amount: amt, date: new Date().toISOString() }] 
    };
    updateUserState(u);
    return "Success";
  };

  // --- GAMES ---
  const updateGameBalance = (amt: number, isWin: boolean, game: string) => {
    if (!currentUser) return;
    const type = `${game} ${isWin ? 'Win' : 'Loss'}`;
    // If win, add amount. If loss (isWin=false), SUBTRACT amount. 
    // NOTE: Plinko/Blackjack logic often handles the subtraction *before* starting, 
    // so check your game logic. This function assumes standard +/- logic.
    const bal = isWin ? currentUser.balance + amt : currentUser.balance - amt;
    
    const u = { 
        ...currentUser, 
        balance: bal, 
        history: [...currentUser.history, { type, amount: amt, date: new Date().toISOString() }] 
    };
    updateUserState(u);
  };

  // --- LOANS ---
  const requestLoan = (amt: number, reason: string) => {
    if (!currentUser) return;
    const req: LoanRequest = { 
        id: Date.now().toString(), 
        amount: amt, 
        reason, 
        status: 'Pending', 
        date: new Date().toISOString() 
    };
    const u = { ...currentUser, loans: [...currentUser.loans, req] };
    updateUserState(u);
  };

  const repayLoan = (id: string) => {
    if (!currentUser) return;
    const loanIdx = currentUser.loans.findIndex(l => l.id === id);
    if (loanIdx === -1) return;
    const loan = currentUser.loans[loanIdx];
    
    if (loan.status !== 'Approved') return;
    if (currentUser.balance < loan.amount) return;

    const newLoans = [...currentUser.loans];
    newLoans[loanIdx] = { ...loan, status: 'Paid' };
    
    const u = { 
        ...currentUser, 
        loans: newLoans, 
        balance: currentUser.balance - loan.amount, 
        history: [...currentUser.history, { type: 'Loan Repay', amount: loan.amount, date: new Date().toISOString() }] 
    };
    updateUserState(u);
  };

  // --- INVESTING ---
  const getPortfolioValue = () => {
    if (!currentUser) return 0;
    let total = 0;
    Object.keys(currentUser.stocks).forEach(sym => {
      const s = market.find(m => m.symbol === sym);
      if (s) total += s.price * currentUser.stocks[sym];
    });
    return total;
  };

  const buyStock = (sym: string, qty: number) => {
    if (!currentUser) return "Error";
    const s = market.find(x => x.symbol === sym);
    if (!s) return "Invalid Stock";
    const cost = s.price * qty;
    if (currentUser.balance < cost) return "Insufficient Funds";
    
    const newStocks = { ...currentUser.stocks };
    newStocks[sym] = (newStocks[sym] || 0) + qty;
    
    const u = { 
        ...currentUser, 
        stocks: newStocks, 
        balance: currentUser.balance - cost, 
        history: [...currentUser.history, { type: `Bought ${qty} ${sym}`, amount: cost, date: new Date().toISOString() }] 
    };
    updateUserState(u);
    return "Success";
  };

  const sellStock = (sym: string, qty: number) => {
    if (!currentUser) return "Error";
    const s = market.find(x => x.symbol === sym);
    if (!s) return "Invalid Stock";
    const currentQty = currentUser.stocks[sym] || 0;
    if (currentQty < qty) return "Not enough shares";
    
    const val = s.price * qty;
    const newStocks = { ...currentUser.stocks };
    newStocks[sym] -= qty;
    if (newStocks[sym] <= 0) delete newStocks[sym];

    const u = { 
        ...currentUser, 
        stocks: newStocks, 
        balance: currentUser.balance + val, 
        history: [...currentUser.history, { type: `Sold ${qty} ${sym}`, amount: val, date: new Date().toISOString() }] 
    };
    updateUserState(u);
    return "Success";
  };

  // --- ADMIN ---
  const adminProcessLoan = (username: string, id: string, approve: boolean) => {
    const u = users[username];
    if (!u) return;
    const loanIdx = u.loans.findIndex(l => l.id === id);
    if (loanIdx === -1) return;
    
    const newLoans = [...u.loans];
    const amount = newLoans[loanIdx].amount;
    newLoans[loanIdx] = { ...newLoans[loanIdx], status: approve ? 'Approved' : 'Rejected' };
    
    let newBal = u.balance;
    const newHist = [...u.history];
    
    if (approve) {
      newBal += amount;
      newHist.push({ type: 'Loan Approved', amount, date: new Date().toISOString() });
    }
    
    setUsers(prev => ({ 
        ...prev, 
        [username]: { ...u, loans: newLoans, balance: newBal, history: newHist } 
    }));
  };

  const adminAddStock = (symbol: string, name: string, price: number) => {
    setMarket(prev => [...prev, { symbol: symbol.toUpperCase(), name, price, change: 0, history: [price] }]);
  };

  const adminRemoveStock = (symbol: string) => {
    setMarket(prev => prev.filter(s => s.symbol !== symbol));
  };

  const adminAdjustBalance = (username: string, amt: number, add: boolean) => {
    const u = users[username];
    if (!u) return;
    const bal = add ? u.balance + amt : u.balance - amt;
    const hist = [...u.history, { type: `Admin ${add ? 'Credit' : 'Debit'}`, amount: amt, date: new Date().toISOString() }];
    setUsers(prev => ({ ...prev, [username]: { ...u, balance: bal, history: hist } }));
  };

  return (
    <BankContext.Provider value={{
      currentUser, users, market, isLoading, 
      login, logout, register, 
      deposit, withdraw, transfer, payBill,
      updateGameBalance,
      buyStock, sellStock, getPortfolioValue,
      requestLoan, repayLoan,
      adminProcessLoan, adminAddStock, adminRemoveStock, adminAdjustBalance
    }}>
      {children}
    </BankContext.Provider>
  );
};