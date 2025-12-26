
import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Register from './components/Register';

const App: React.FC = () => {
  const { currentUser } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  const renderAuth = () => {
    if (showLogin) {
      return <Login onSwitchToRegister={() => setShowLogin(false)} />;
    }
    return <Register onSwitchToLogin={() => setShowLogin(true)} />;
  };

  return (
    <div className="min-h-screen bg-background font-sans text-primary">
      {currentUser ? <Dashboard /> : renderAuth()}
    </div>
  );
};

export default App;