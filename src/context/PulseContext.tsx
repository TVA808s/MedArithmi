// context/PulseContext.tsx
import React, {createContext, useState, useContext, ReactNode} from 'react';

interface PulseData {
  zoneRange: string;
  restingHR: string;
}

interface PulseContextType {
  pulseData: PulseData | null;
  updatePulseData: (data: PulseData) => void;
}

const PulseContext = createContext<PulseContextType | undefined>(undefined);

export function PulseProvider({children}: {children: ReactNode}) {
  const [pulseData, setPulseData] = useState<PulseData | null>(null);

  const updatePulseData = (data: PulseData) => {
    setPulseData(data);
  };

  return (
    <PulseContext.Provider value={{pulseData, updatePulseData}}>
      {children}
    </PulseContext.Provider>
  );
}

export function usePulse() {
  const context = useContext(PulseContext);
  if (context === undefined) {
    throw new Error('usePulse must be used within a PulseProvider');
  }
  return context;
}
