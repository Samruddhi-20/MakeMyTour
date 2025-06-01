import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface SearchHistoryContextType {
  recentSearches: string[];
  addSearch: (search: string) => void;
}

const SearchHistoryContext = createContext<SearchHistoryContextType | undefined>(undefined);

export const SearchHistoryProvider = ({ children }: { children: ReactNode }) => {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('recentSearches');
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
  }, [recentSearches]);

  const addSearch = (search: string) => {
    setRecentSearches((prev) => {
      const updated = [search, ...prev.filter((s) => s !== search)];
      return updated.slice(0, 10); // Keep max 10 recent searches
    });
  };

  return (
    <SearchHistoryContext.Provider value={{ recentSearches, addSearch }}>
      {children}
    </SearchHistoryContext.Provider>
  );
};

export const useSearchHistory = (): SearchHistoryContextType => {
  const context = useContext(SearchHistoryContext);
  if (!context) {
    throw new Error('useSearchHistory must be used within a SearchHistoryProvider');
  }
  return context;
};
