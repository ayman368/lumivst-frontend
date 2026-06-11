export interface Transaction {
  type: 'buy' | 'sell';
  stockSymbol: string;
  stockName: string;
  sector: string;
  quantity: number;
  totalAmount: number;
}

export interface AggregatedStock {
  stockSymbol: string
  stockName: string
  sector: string
  quantity: number
  totalCost: number
  avgCost: number
}

export function aggregateStocks(transactions: Transaction[]): AggregatedStock[] {
  const map: Record<string, AggregatedStock> = {}

  for (const t of transactions) {
    if (!map[t.stockSymbol]) {
      map[t.stockSymbol] = {
        stockSymbol: t.stockSymbol,
        stockName: t.stockName,
        sector: t.sector,
        quantity: 0,
        totalCost: 0,
        avgCost: 0,
      }
    }

    const stock = map[t.stockSymbol]
    if (t.type === 'buy') {
      const newQuantity = stock.quantity + t.quantity
      const newTotalCost = stock.totalCost + t.totalAmount
      stock.avgCost = newTotalCost / newQuantity
      stock.quantity = newQuantity
      stock.totalCost = newTotalCost
    } else if (t.type === 'sell') {
      stock.quantity -= t.quantity
      stock.totalCost -= t.quantity * stock.avgCost
    }
  }

  return Object.values(map).filter(s => s.quantity > 0)
}

export const calcSR = (currentValue: number, totalCost: number): number => {
  if (totalCost === 0) return 0
  return ((currentValue - totalCost) / totalCost) * 100
}

export const calcWeight = (stockValue: number, totalValue: number): number => {
  if (totalValue === 0) return 0
  return (stockValue / totalValue) * 100
}
