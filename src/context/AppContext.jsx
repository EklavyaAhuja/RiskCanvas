"use client";

import { createContext, useContext, useReducer } from 'react';

const AppContext = createContext(null);

const INITIAL_STATE = {
  balance: 100000,
  holdings: {},
  watchlist: [],
  transactions: [],
};

function upsertWatchlistItem(watchlist, item) {
  const index = watchlist.findIndex((entry) => entry.symbol === item.symbol);
  if (index === -1) {
    return [...watchlist, item];
  }

  return watchlist.map((entry, entryIndex) => (
    entryIndex === index ? { ...entry, ...item } : entry
  ));
}

function reducer(state, action) {
  switch (action.type) {
    case 'BUY_STOCK': {
      const { symbol, name, qty, price, change = 0 } = action.payload;
      const cost = qty * price;

      if (cost > state.balance) {
        return state;
      }

      const currentHolding = state.holdings[symbol] || { qty: 0, avgPrice: 0, name };
      const nextQty = currentHolding.qty + qty;
      const nextAvgPrice = ((currentHolding.qty * currentHolding.avgPrice) + cost) / nextQty;

      return {
        ...state,
        balance: parseFloat((state.balance - cost).toFixed(2)),
        holdings: {
          ...state.holdings,
          [symbol]: {
            qty: nextQty,
            avgPrice: parseFloat(nextAvgPrice.toFixed(2)),
            name,
          },
        },
        watchlist: upsertWatchlistItem(state.watchlist, {
          symbol,
          name,
          price,
          change,
          currency: 'Rs.',
        }),
        transactions: [
          { type: 'BUY', symbol, name, qty, price, time: new Date().toISOString() },
          ...state.transactions,
        ],
      };
    }

    case 'SELL_STOCK': {
      const { symbol, qty, price, change = 0 } = action.payload;
      const currentHolding = state.holdings[symbol];

      if (!currentHolding || currentHolding.qty < qty) {
        return state;
      }

      const remainingQty = currentHolding.qty - qty;
      const nextHoldings = { ...state.holdings };
      let nextWatchlist = upsertWatchlistItem(state.watchlist, {
        symbol,
        name: currentHolding.name,
        price,
        change,
        currency: 'Rs.',
      });

      if (remainingQty === 0) {
        delete nextHoldings[symbol];
        nextWatchlist = nextWatchlist.filter((entry) => entry.symbol !== symbol);
      } else {
        nextHoldings[symbol] = { ...currentHolding, qty: remainingQty };
      }

      return {
        ...state,
        balance: parseFloat((state.balance + qty * price).toFixed(2)),
        holdings: nextHoldings,
        watchlist: nextWatchlist,
        transactions: [
          { type: 'SELL', symbol, name: currentHolding.name, qty, price, time: new Date().toISOString() },
          ...state.transactions,
        ],
      };
    }

    case 'ADD_WATCHLIST': {
      return {
        ...state,
        watchlist: upsertWatchlistItem(state.watchlist, action.payload),
      };
    }

    case 'REMOVE_WATCHLIST': {
      return {
        ...state,
        watchlist: state.watchlist.filter((entry) => entry.symbol !== action.payload),
      };
    }

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  const buyStock = (symbol, name, qty, price, change) => {
    dispatch({ type: 'BUY_STOCK', payload: { symbol, name, qty, price, change } });
  };

  const sellStock = (symbol, qty, price, change) => {
    dispatch({ type: 'SELL_STOCK', payload: { symbol, qty, price, change } });
  };

  const addToWatchlist = (stock) => {
    dispatch({ type: 'ADD_WATCHLIST', payload: stock });
  };

  const removeFromWatchlist = (symbol) => {
    dispatch({ type: 'REMOVE_WATCHLIST', payload: symbol });
  };

  return (
    <AppContext.Provider
      value={{ ...state, buyStock, sellStock, addToWatchlist, removeFromWatchlist }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
