export function formatCurrency(
  amount: number,
  currency: string = "USD"
): string {
  if (amount === null || amount === undefined || isNaN(amount)) return "$0";
  
  const isWhole = amount % 1 === 0;
  if (isWhole) {
    return `$${amount}`;
  }
  return `$${amount.toFixed(2)}`;
}
