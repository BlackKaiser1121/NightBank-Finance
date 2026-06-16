export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  history: number[];
}

export interface Transaction {
  type: string;
  amount: number;
  date: string;
}

export interface LoanRequest {
  id: string;
  amount: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Paid';
  date: string;
}

export interface UserAccount {
  username: string;
  pin: string;
  accountNumber: string;
  balance: number;
  isAdmin: boolean;
  history: Transaction[];
  stocks: { [symbol: string]: number };
  loans: LoanRequest[];
}

export interface PlayingCard {
  rank: string;
  suit: string;
  value: number;
  color: string;
}