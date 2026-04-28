import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AppContextType {
  datasetId: string | null;
  setDatasetId: (id: string | null) => void;
  fileName: string | null;
  setFileName: (name: string | null) => void;
  targetColumn: string;
  setTargetColumn: (col: string) => void;
  sensitiveAttribute: string;
  setSensitiveAttribute: (col: string) => void;
  predictionColumn: string;
  setPredictionColumn: (col: string) => void;
  modelId: string | null;
  setModelId: (id: string | null) => void;
  analysisResults: any | null;
  setAnalysisResults: (results: any) => void;
  mitigationResults: any | null;
  setMitigationResults: (results: any) => void;
  explainabilityResults: any | null;
  setExplainabilityResults: (results: any) => void;
  simulationResults: any | null;
  setSimulationResults: (results: any) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [datasetId, setDatasetId] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [targetColumn, setTargetColumn] = useState<string>("label");
  const [sensitiveAttribute, setSensitiveAttribute] = useState<string>("gender");
  const [predictionColumn, setPredictionColumn] = useState<string>("prediction");
  const [modelId, setModelId] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<any | null>(null);
  const [mitigationResults, setMitigationResults] = useState<any | null>(null);
  const [explainabilityResults, setExplainabilityResults] = useState<any | null>(null);
  const [simulationResults, setSimulationResults] = useState<any | null>(null);

  return (
    <AppContext.Provider
      value={{
        datasetId,
        setDatasetId,
        fileName,
        setFileName,
        targetColumn,
        setTargetColumn,
        sensitiveAttribute,
        setSensitiveAttribute,
        predictionColumn,
        setPredictionColumn,
        modelId,
        setModelId,
        analysisResults,
        setAnalysisResults,
        mitigationResults,
        setMitigationResults,
        explainabilityResults,
        setExplainabilityResults,
        simulationResults,
        setSimulationResults,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
