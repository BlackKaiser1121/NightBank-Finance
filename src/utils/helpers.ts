export const formatCurrency = (amount: number): string => {
  return "$" + amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
};

export const generateAccountNumber = (): string => {
  let number = "";
  for (let i = 0; i < 12; i++) {
    number += Math.floor(Math.random() * 10).toString();
  }
  return number;
};