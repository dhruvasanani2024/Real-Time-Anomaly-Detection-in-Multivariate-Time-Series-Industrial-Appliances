import React, { createContext, useState, useContext } from 'react';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [sensorData, setSensorData] = useState([]);
  const [predictionResult, setPredictionResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [anomalyLogs, setAnomalyLogs] = useState([]);

  const value = {
    sensorData,
    setSensorData,
    predictionResult,
    setPredictionResult,
    isLoading,
    setIsLoading,
    error,
    setError,
    history,
    setHistory,
    anomalyLogs,
    setAnomalyLogs,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};