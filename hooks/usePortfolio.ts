import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchPortfolioPositions,
  getPortfolioTransactions,
  getPortfolioCash,
  updatePortfolioCash,
  getPortfolioPerformance,
  getPortfolioEvents,
  createPortfolioPosition,
  addSharesToPosition,
  partialSellPosition,
  deletePortfolioPosition,
  closePortfolioPosition,
  getPortfolioSummary,
  getPortfolioRealizedPnl,
} from '@/lib/api/wallet';
import { WalletPositionDB } from '@/types/wallet';

export function usePortfolioData() {
  const positionsQuery = useQuery({
    queryKey: ['portfolio', 'positions'],
    queryFn: fetchPortfolioPositions,
  });

  const transactionsQuery = useQuery({
    queryKey: ['portfolio', 'transactions'],
    queryFn: getPortfolioTransactions,
  });

  const cashQuery = useQuery({
    queryKey: ['portfolio', 'cash'],
    queryFn: getPortfolioCash,
  });

  const performanceQuery = useQuery({
    queryKey: ['portfolio', 'performance'],
    queryFn: getPortfolioPerformance,
  });

  const eventsQuery = useQuery({
    queryKey: ['portfolio', 'events'],
    queryFn: getPortfolioEvents,
  });

  const summaryQuery = useQuery({
    queryKey: ['portfolio', 'summary'],
    queryFn: getPortfolioSummary,
  });

  const realizedPnlQuery = useQuery({
    queryKey: ['portfolio', 'realized-pnl'],
    queryFn: getPortfolioRealizedPnl,
  });

  const isLoading = 
    positionsQuery.isLoading || 
    transactionsQuery.isLoading || 
    cashQuery.isLoading || 
    performanceQuery.isLoading || 
    eventsQuery.isLoading;

  const error = 
    positionsQuery.error || 
    transactionsQuery.error || 
    cashQuery.error || 
    performanceQuery.error || 
    eventsQuery.error;

  return {
    positions: positionsQuery.data || [],
    transactions: transactionsQuery.data || [],
    cash: cashQuery.data?.cash || 0,
    performance: performanceQuery.data || [],
    events: eventsQuery.data || { dividends: [], financials: [] },
    summary: summaryQuery.data || null,
    realizedPnl: realizedPnlQuery.data || [],
    isLoading,
    error,
    refetchAll: () => {
      positionsQuery.refetch();
      transactionsQuery.refetch();
      cashQuery.refetch();
      performanceQuery.refetch();
      eventsQuery.refetch();
      summaryQuery.refetch();
      realizedPnlQuery.refetch();
    }
  };
}

export function usePortfolioMutations() {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['portfolio'] });
  };

  const updateCash = useMutation({
    mutationFn: (cash: number) => updatePortfolioCash(cash),
    onSuccess: invalidateAll,
  });

  const addPosition = useMutation({
    mutationFn: (data: any) => createPortfolioPosition(data),
    onSuccess: invalidateAll,
  });

  const addShares = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => addSharesToPosition(id, data),
    onSuccess: invalidateAll,
  });

  const partialSell = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => partialSellPosition(id, data),
    onSuccess: invalidateAll,
  });

  const deletePosition = useMutation({
    mutationFn: (id: number) => deletePortfolioPosition(id),
    onSuccess: invalidateAll,
  });

  const closePosition = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { sell_price: number; exit_date: string } }) => closePortfolioPosition(id, data),
    onSuccess: invalidateAll,
  });

  return {
    updateCash,
    addPosition,
    addShares,
    partialSell,
    deletePosition,
    closePosition,
  };
}
