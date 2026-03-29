/**
 * Exchange Rate Formatter Utility
 * Formats exchange rates for display with proper currency notation
 */

export const formatExchangeRate = (rate: number | undefined, currency: string): string => {
  if (rate === undefined || rate === null) {
    return "---";
  }

  const decimals = currency === "VND" ? 0 : 2;
  const formatted = rate.toFixed(decimals);

  const currencyMap: { [key: string]: string } = {
    KHR: "KHR",
    CNY: "CNY",
    VND: "VND",
  };

  return `1 USD = ${formatted} ${currencyMap[currency] || currency}`;
};

export const formatKhrRate = (rate: number | undefined): string =>
  formatExchangeRate(rate, "KHR");

export const formatCnyRate = (rate: number | undefined): string =>
  formatExchangeRate(rate, "CNY");

export const formatVndRate = (rate: number | undefined): string =>
  formatExchangeRate(rate, "VND");

export const formatExchangeRateStatus = (status: string | undefined): string => {
  if (!status) return "---";

  switch (status.toUpperCase()) {
    case "ACTIVE":
      return "Active";
    case "INACTIVE":
      return "Inactive";
    default:
      return status;
  }
};
