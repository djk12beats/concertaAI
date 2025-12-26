
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ServiceRequest, RequestStatus } from '../../types';
import { getRequestsByClientId, getRequestDetails } from '../../services/mockApi';
import RequestList from '../shared/RequestList';
import NewRequestForm from './NewRequestForm';
import { PlusIcon, ChatIcon, CalendarIcon, UsersIcon } from '../shared/Icons';
import AdminDirectChat from '../shared/AdminDirectChat';
import RequestDetailsModal from '../shared/RequestDetailsModal';

type Tab = 'active' | 'history';

const ClientDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDirectChatOpen, setIsDirectChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('active');
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);

  const fetchRequests = useCallback(async () => {
    if (currentUser) {
      setLoading(true);
      const data = await getRequestsByClientId(currentUser.id);
      setRequests(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleRequestCreated = () => {
    setIsModalOpen(false);
    fetchRequests();
  };

  const getTabClass = (tabName: Tab) =>
    `px-6 py-3 font-bold text-sm rounded-xl transition-all ${activeTab === tabName
      ? 'bg-primary text-white shadow-md'
      : 'text-primary/60 hover:bg-secondary/50 hover:text-primary'
    }`;

  const { activeRequests, allRequestsSorted } = useMemo(() => {
    const active = requests.filter(r => r.status !== RequestStatus.CONCLUIDO);
    const sorted = [...requests].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return { activeRequests: active, allRequestsSorted: sorted };
  }, [requests]);

  const renderActiveRequests = () => {
    const responded = activeRequests.filter(r => r.status === RequestStatus.RESPONDIDO);
    const pending = activeRequests.filter(r => r.status === RequestStatus.PENDENTE);
    const scheduled = activeRequests.filter(r => r.status === RequestStatus.AGENDADO || r.status === RequestStatus.FECHADO_PELO_CLIENTE);

    return (
      <div className="space-y-8">
        {responded.length > 0 && (
          <section>
            <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
              <span className="w-2 h-6 bg-accent rounded-full"></span>
              Ações Necessárias
            </h3>
            <RequestList requests={responded} highlightResponded />
          </section>
        )}
        {pending.length > 0 && (
          <section>
            <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
              <span className="w-2 h-6 bg-yellow-400 rounded-full"></span>
              Aguardando Orçamento
            </h3>
            <RequestList requests={pending} />
          </section>
        )}
        {scheduled.length > 0 && (
          <section>
            <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
              <span className="w-2 h-6 bg-green-500 rounded-full"></span>
              Próximos Serviços
            </h3>
            <RequestList requests={scheduled} />
          </section>
        )}
        {activeRequests.length === 0 && (
          <div className="bg-surface rounded-2xl p-12 text-center border border-dashed border-secondary">
            <p className="text-primary/50 font-medium">Você não possui solicitações ativas no momento.</p>
          </div>
        )}
      </div>
    );
  };

  const renderHistory = () => (
    <div className="space-y-4">
      {allRequestsSorted.length > 0 ? (
        allRequestsSorted.map((req) => (
          <DetailedHistoryCard
            key={req.id}
            request={req}
            onClick={() => setSelectedRequestId(req.id)}
          />
        ))
      ) : (
        <div className="bg-surface rounded-2xl p-12 text-center border border-dashed border-secondary">
          <p className="text-primary/50 font-medium">Seu histórico de pedidos está vazio.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div>
          <h2 className="text-3xl font-bold text-primary">Minhas Solicitações</h2>
          <p className="text-primary/60 font-medium">Gerencie seus reparos e manutenções</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg hover:scale-105 active:scale-95"
        >
          <PlusIcon />
          <span>Nova Solicitação</span>
        </button>
      </div>

      <div className="bg-secondary/20 p-1.5 rounded-2xl inline-flex gap-1">
        <button onClick={() => setActiveTab('active')} className={getTabClass('active')}>
          Ativas ({activeRequests.length})
        </button>
        <button onClick={() => setActiveTab('history')} className={getTabClass('history')}>
          Histórico Completo ({allRequestsSorted.length})
        </button>
      </div>

      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="text-primary/60 font-medium">Carregando...</p>
          </div>
        ) : activeTab === 'active' ? (
          renderActiveRequests()
        ) : (
          renderHistory()
        )}
      </div>

      {isModalOpen && (
        <NewRequestForm
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleRequestCreated}
        />
      )}

      {isDirectChatOpen && (
        <AdminDirectChat onClose={() => setIsDirectChatOpen(false)} />
      )}

      {selectedRequestId && (
        <RequestDetailsModal
          requestId={selectedRequestId}
          onClose={() => {
            setSelectedRequestId(null);
            fetchRequests();
          }}
        />
      )}

      {!isModalOpen && !selectedRequestId && (
        <button
          onClick={() => setIsDirectChatOpen(true)}
          className="fixed bottom-8 right-8 bg-accent text-white p-5 rounded-2xl shadow-2xl hover:bg-blue-600 transition-all transform hover:scale-110 active:scale-90 z-30"
          title="Falar com um administrador"
        >
          <ChatIcon />
        </button>
      )}
    </div>
  );
};

interface DetailedCardProps {
  request: ServiceRequest;
  onClick: () => void;
}

const DetailedHistoryCard: React.FC<DetailedCardProps> = ({ request, onClick }) => {
  const [details, setDetails] = useState<any>(null);

  useEffect(() => {
    // Busca detalhes extras para mostrar orçamento no histórico se existir
    const fetchExtra = async () => {
      if (request.status !== RequestStatus.PENDENTE) {
        const d = await getRequestDetails(request.id);
        setDetails(d);
      }
    };
    fetchExtra();
  }, [request]);

  const formattedDate = new Date(request.createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.CONCLUIDO: return 'bg-green-100 text-green-700';
      case RequestStatus.AGENDADO: return 'bg-indigo-100 text-indigo-700';
      case RequestStatus.RESPONDIDO: return 'bg-blue-100 text-blue-700';
      case RequestStatus.PENDENTE: return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div
      onClick={onClick}
      className="bg-surface p-6 rounded-[2rem] shadow-sm border border-secondary/50 hover:border-accent hover:shadow-xl transition-all cursor-pointer group animate-in fade-in slide-in-from-bottom-2"
    >
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black bg-secondary/40 text-primary/50 px-2 py-0.5 rounded uppercase">
                ID #{request.id}
              </span>
              <span className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusColor(request.status)}`}>
                {request.status}
              </span>
            </div>
            <h4 className="text-xl font-bold text-primary group-hover:text-accent transition-colors">
              {request.description}
            </h4>
          </div>
          {details?.quote && (
            <div className="text-right">
              <p className="text-[10px] font-black text-primary/30 uppercase">Orçado em</p>
              <p className="text-xl font-black text-accent">R$ {details.quote.price.toFixed(2)}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-4 border-t border-secondary/30">
          <div className="flex items-center gap-3 text-primary/60">
            <div className="p-2 bg-secondary/30 rounded-xl"><CalendarIcon /></div>
            <div>
              <p className="text-[10px] font-black uppercase opacity-50">Solicitação</p>
              <p className="text-sm font-bold">{formattedDate}</p>
            </div>
          </div>

          {request.collaboratorName && (
            <div className="flex items-center gap-3 text-primary/60">
              <div className="p-2 bg-secondary/30 rounded-xl"><UsersIcon /></div>
              <div>
                <p className="text-[10px] font-black uppercase opacity-50">Técnico Responsável</p>
                <p className="text-sm font-bold">{request.collaboratorName}</p>
              </div>
            </div>
          )}

          {details?.quote?.suggestedExecutionDate && (
            <div className="flex items-center gap-3 text-primary/60">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase opacity-50">Previsão/Execução</p>
                <p className="text-sm font-bold">
                  {new Date(details.quote.suggestedExecutionDate).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          )}
        </div>

        {details?.quote && (
          <div className="mt-2 p-4 bg-slate-50 rounded-2xl">
            <p className="text-[10px] font-black text-primary/30 uppercase mb-2">Resumo da Mão de Obra</p>
            <p className="text-sm text-primary/70 italic line-clamp-2">{details.quote.laborDescription}</p>
          </div>
        )}

        <div className="flex justify-between items-center pt-2">
          <div className="flex gap-2">
            {request.photos && request.photos.length > 0 && (
              <span className="flex items-center gap-1.5 bg-blue-50 text-accent px-3 py-1 rounded-xl text-xs font-bold">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {request.photos.length} Fotos
              </span>
            )}
          </div>
          <span className="text-accent font-black text-xs uppercase tracking-widest group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
            Ver Detalhes e Chat
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 5l7 7-7 7" strokeWidth={3} /></svg>
          </span>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
