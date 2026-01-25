import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

type TourPage = 'onboarding' | 'category' | 'basket' | null;

interface TourContextType {
  isActive: boolean;
  currentPage: TourPage;
  startTour: () => void;
  setTourPage: (page: TourPage) => void;
  completeTour: () => void;
}

const TourContext = createContext<TourContextType | null>(null);

export function TourProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [currentPage, setCurrentPage] = useState<TourPage>(null);

  const startTour = useCallback(() => {
    setIsActive(true);
    setCurrentPage('onboarding');
  }, []);

  const setTourPage = useCallback((page: TourPage) => {
    if (isActive) {
      setCurrentPage(page);
    }
  }, [isActive]);

  const completeTour = useCallback(() => {
    setIsActive(false);
    setCurrentPage(null);
  }, []);

  // Listen for page changes to resume tour on correct page
  useEffect(() => {
    if (!isActive) return;

    const path = window.location.pathname;
    if (path === '/onboarding') {
      setCurrentPage('onboarding');
    } else if (path.startsWith('/category/')) {
      setCurrentPage('category');
    } else if (path === '/basket') {
      setCurrentPage('basket');
    }
  }, [isActive]);

  return (
    <TourContext.Provider
      value={{
        isActive,
        currentPage,
        startTour,
        setTourPage,
        completeTour,
      }}
    >
      {children}
    </TourContext.Provider>
  );
}

export function useTour() {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
}
