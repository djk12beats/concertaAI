
import React, { useState, useEffect } from 'react';
import { ListIcon, CalendarIcon, ChatIcon, HistoryIcon } from '../shared/Icons';
import Agenda from './Agenda';
import { ServiceRequest } from '../../types';
import { getPendingRequests } from '../../services/mockApi';
import RequestList from '../shared/RequestList';
import AdminDirectChat from '../shared/AdminDirectChat';
import HistoryView from './HistoryView';
import { useAuth } from '../../hooks/useAuth';

type Tab = 'pending' | 'agenda' | 'history';

const CollaboratorDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('pending');
  const [isDirectChatOpen, setIsDirectChatOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'pending':
        return <PendingRequests />;
      case 'agenda':
        return <Agenda />;
      case 'history':
        return <HistoryView />;
      default:
        return null;
    }
  };

  const getTabClass = (tabName: Tab) =>
    `flex-1 text-center flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-3 py-4 font-bold rounded-2xl transition-all duration-300 ${
      activeTab === tabName
        ? 'bg-surface text-primary shadow-lg ring-1 ring-black/5'
        : 'text-primary/40 hover:text-primary/70 hover:bg-secondary/10'
    }`;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Navegação de Tabs Estilo Mobile-First App */}
      <nav className="w-full max-w-2xl mx-auto bg-secondary/20 rounded-[2.5rem] p-2 flex gap-2 shadow-inner">
        <button onClick={() => setActiveTab('pending')} className={getTabClass('pending')}>
          <ListIcon />
          <span className="text-xs sm:text-sm uppercase tracking-wider">Pendentes</span>
        </button>
        <button onClick={() => setActiveTab('agenda')} className={getTabClass('agenda')}>
          <CalendarIcon />
          <span className="text-xs sm:text-sm uppercase tracking-wider">Agenda</span>
        </button>
        <button onClick={() => setActiveTab('history')} className={getTabClass('history')}>
          <HistoryIcon />
          <span className="text-xs sm:text-sm uppercase tracking-wider">Trabalhos</span>
        </button>
      </nav>

      <div className="mt-4">{renderContent()}</div>
      
      {isDirectChatOpen && (
          <AdminDirectChat onClose={() => setIsDirectChatOpen(false)} />
      )}

      <button
        onClick={() => setIsDirectChatOpen(true)}
        className="fixed bottom-8 right-8 bg-accent text-white p-5 rounded-2xl shadow-2xl hover:bg-blue-600 transition-all transform hover:scale-110 active:scale-95 z-30"
        title="Falar com Suporte"
      >
        <ChatIcon />
      </button>
    </div>
  );
};

const PendingRequests: React.FC = () => {
    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            const data = await getPendingRequests();
            setRequests(data);
            setLoading(false);
        }
        fetch();
    }, []);

    if (loading) return (
      <div className="flex justify-center py-24">
        <div className="w-12 h-12 border-4 border-primary/10 border-t-accent rounded-full animate-spin"></div>
      </div>
    );
    
    if (requests.length === 0) return (
      <div className="bg-surface rounded-[3rem] p-20 text-center border-4 border-dashed border-secondary/50">
        <div className="bg-secondary/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-primary/20">
            <ListIcon />
        </div>
        <p className="text-primary/40 font-bold text-lg">Tudo limpo por aqui!</p>
        <p className="text-primary/30 text-sm">Não há novas solicitações aguardando orçamento.</p>
      </div>
    );

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2">
            <div className="w-2 h-8 bg-accent rounded-full"></div>
            <h3 className="text-2xl font-black text-primary">Oportunidades</h3>
        </div>
        <RequestList requests={requests} />
      </div>
    );
}

export default CollaboratorDashboard;
