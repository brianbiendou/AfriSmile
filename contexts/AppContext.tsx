import React, { createContext, useContext, useState } from 'react';

type AppMode = 'afrismile' | 'kolofap';

interface AppContextType {
  currentApp: AppMode;
  setCurrentApp: (app: AppMode) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentApp, setCurrentApp] = useState<AppMode>('afrismile');

  return (
    <AppContext.Provider value={{ currentApp, setCurrentApp }}>
      {children}
    </AppContext.Provider>
  );
};