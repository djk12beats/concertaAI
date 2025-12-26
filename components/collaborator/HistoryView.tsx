
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ServiceRequest, RequestStatus } from '../../types';
import { getRequestsByCollaboratorId } from '../../services/mockApi';
import { ChatIcon, CalendarIcon } from '../shared/Icons';
import RequestDetailsModal from '../shared/RequestDetailsModal';

const HistoryView: React.FC = () => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);

  const fetchHistory = useCallback(async () => {
    if (currentUser) {
      setLoading(true);
      const data = await getRequestsByCollaboratorId(currentUser.id);
      setRequests(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const { inProgress, finished } = useMemo(() => {
    return {
      inProgress: requests.filter(r => r.status !== RequestStatus.CONCLUIDO),
      finished: requests.filter(r => r.status === RequestStatus.CONCLUIDO)
    };
  }, [requests]);

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-10 h-10 border-4 border-primary/20 border-t-accent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-8 pb-10">
      {/* Seção Em Andamento */}
      <section>
        <h3 className="text-xl font-black text-primary mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-accent rounded-full"></span>
            Assumidos por Você
        </h3>
        <div className="space-y-4">
          {inProgress.length > 0 ? (
            inProgress.map(req => (
              <RequestCard key={req.id} request={req} onClick={() => setSelectedRequestId(req.id)} />
            ))
          ) : (
            <p className="text-primary/40 italic p-4 text-center">Você ainda não enviou orçamentos ativos.</p>
          )}
        </div>
      </section>

      {/* Seção Concluídos */}
      <section>
        <h3 className="text-xl font-black text-primary/60 mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-slate-400 rounded-full"></span>
            Serviços Concluídos
        </h3>
        <div className="space-y-4">
          {finished.length > 0 ? (
            finished.map(req => (
              <RequestCard key={req.id} request={req} isFinished onClick={() => setSelectedRequestId(req.id)} />
            ))
          ) : (
            <p className="text-primary/40 italic p-4 text-center">Nenhum serviço finalizado ainda.</p>
          )}
        </div>
      </section>

      {selectedRequestId && (
        <RequestDetailsModal 
          requestId={selectedRequestId} 
          onClose={() => {
              setSelectedRequestId(null);
              fetchHistory();
          }} 
        />
      )}
    </div>
  );
};

const RequestCard: React.FC<{ request: ServiceRequest; onClick: () => void; isFinished?: boolean }> = ({ request, onClick, isFinished }) => {
    const statusColor = {
        [RequestStatus.RESPONDIDO]: 'bg-blue-100 text-blue-700',
        [RequestStatus.FECHADO_PELO_CLIENTE]: 'bg-indigo-100 text-indigo-700',
        [RequestStatus.AGENDADO]: 'bg-emerald-100 text-emerald-700',
        [RequestStatus.CONCLUIDO]: 'bg-slate-100 text-slate-600',
    }[request.status] || 'bg-slate-100';

    // Prioriza mostrar a data de execução se o serviço já estiver agendado
    const displayDate = request.executionDate || request.createdAt;
    const dateLabel = request.executionDate ? '' : 'Criado em ';

    return (
        <div 
            onClick={onClick}
            className={`
                group bg-surface p-6 rounded-3xl border border-secondary/50 shadow-sm cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1
                ${isFinished ? 'opacity-70 grayscale-[0.5]' : ''}
            `}
        >
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black bg-secondary/40 text-primary/50 px-2 py-0.5 rounded-md uppercase">ID #{request.id}</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${statusColor}`}>{request.status}</span>
                    </div>
                    <h4 className="text-lg font-bold text-primary group-hover:text-accent transition-colors">{request.description}</h4>
                    <div className="flex items-center gap-4 text-sm font-medium text-primary/50">
                        <span className="flex items-center gap-1.5">
                            <CalendarIcon /> {dateLabel}{new Date(displayDate).toLocaleDateString('pt-BR')}
                        </span>
                        <span className="font-bold text-primary/70">• {request.clientName}</span>
                    </div>
                </div>
                <div className="flex items-center justify-end gap-2">
                    <div className="p-3 bg-secondary/30 rounded-2xl text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChatIcon />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HistoryView;
