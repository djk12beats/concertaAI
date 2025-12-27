
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { SettingsIcon } from './Icons';
import SettingsModal from './SettingsModal';
import Logo from './Logo';
import { Role } from '../../types';

const Header: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const displayName = currentUser?.role === Role.ADMIN
    ? 'Administrador'
    : currentUser?.name.split(' ')[0];

  return (
    <>
      <header className="bg-primary text-white shadow-md sticky top-0 z-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Logo variant="small" />
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="hidden sm:block text-sm font-medium opacity-90">
                Olá, {displayName}
              </span>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-1.5 rounded-full hover:bg-white/10 transition-colors duration-200"
                title="Configurações da Conta"
                aria-label="Configurações da Conta"
              >
                <SettingsIcon />
              </button>
              <button
                onClick={logout}
                className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg text-sm font-semibold hover:bg-white/20 transition-all duration-200"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>
      {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
    </>
  );
};

export default Header;
