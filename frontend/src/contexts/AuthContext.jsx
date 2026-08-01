import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || 'ADMIN');
  const [userName, setUserName] = useState(localStorage.getItem('userName') || 'Usuário');

  const handleLoginSuccess = (userData) => {
    setIsLoggedIn(true);
    const role = userData?.cargo || 'ADMIN';
    const name = userData?.nome || 'Usuário';
    
    setUserRole(role);
    setUserName(name);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userRole', role);
    localStorage.setItem('userName', name);
    // Note: App.jsx handles the redirection to dashboard via activeTab
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.clear();
    // Força o redirecionamento para a raiz e limpa o estado do React
    window.location.href = '/';
  };

  useEffect(() => {
    const handleAuthError = () => {
      console.warn('Sessão expirada detectada via evento global.');
      handleLogout();
    };
    window.addEventListener('auth-error', handleAuthError);
    return () => window.removeEventListener('auth-error', handleAuthError);
  }, []);

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn, 
      userRole, 
      userName, 
      handleLoginSuccess, 
      handleLogout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
