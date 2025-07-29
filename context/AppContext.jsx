import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    return localStorage.getItem('userEmail') || '';
  });

  const [currentSession, setCurrentSession] = useState(() => {
    return localStorage.getItem('quizSessionId') || null;
  });

  const updateUser = (email) => {
    setUser(email);
    localStorage.setItem('userEmail', email);
  };

  const updateSession = (sessionId) => {
    setCurrentSession(sessionId);
    if (sessionId) {
      localStorage.setItem('quizSessionId', sessionId);
    } else {
      localStorage.removeItem('quizSessionId');
    }
  };

  const clearSession = () => {
    setCurrentSession(null);
    localStorage.removeItem('quizSessionId');
  };

  return (
    <AppContext.Provider value={{
      user,
      currentSession,
      updateUser,
      updateSession,
      clearSession
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
