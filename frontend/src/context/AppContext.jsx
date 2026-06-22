import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../services/api';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // General fetching function for stats
  const fetchDashboardStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const response = await api.get('/dashboard');
      setDashboardStats(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats', error);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const value = {
    dashboardStats,
    loadingStats,
    fetchDashboardStats,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
