
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Role } from '../types';
import ClientDashboard from './client/ClientDashboard';
import CollaboratorDashboard from './collaborator/CollaboratorDashboard';
import AdminDashboard from './admin/AdminDashboard';
import Header from './shared/Header';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();

  const renderDashboard = () => {
    switch (currentUser?.role) {
      case Role.CLIENTE:
        return <ClientDashboard />;
      case Role.COLABORADOR:
        return <CollaboratorDashboard />;
      case Role.ADMIN:
        return <AdminDashboard />;
      default:
        return <div className="p-8 text-center font-bold">Papel de usuário desconhecido.</div>;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              {renderDashboard()}
            </div>
        </main>
        <footer className="py-6 text-center text-primary/30 text-xs">
          &copy; 2023 ConcertaAi - Gestão Inteligente de Reparos
        </footer>
    </div>
  );
};

export default Dashboard;
