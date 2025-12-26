
import React, { useState } from 'react';
import { ServiceRequest, RequestStatus } from '../../types';
import RequestDetailsModal from './RequestDetailsModal';

interface Props {
  requests: ServiceRequest[];
  highlightResponded?: boolean;
}

const getStatusBadgeClass = (status: RequestStatus) => {
  switch (status) {
    case RequestStatus.PENDENTE:
      return 'bg-amber-100 text-amber-700';
    case RequestStatus.RESPONDIDO:
      return 'bg-blue-100 text-blue-700';
    case RequestStatus.FECHADO_PELO_CLIENTE:
      return 'bg-indigo-100 text-indigo-700';
    case RequestStatus.AGENDADO:
      return 'bg-emerald-100 text-emerald-700';
    case RequestStatus.CONCLUIDO:
      return 'bg-slate-100 text-slate-500';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const RequestList: React.FC<Props> = ({ requests, highlightResponded = false }) => {
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);

  if (requests.length === 0) {
    return <p className="text-primary/40 text-center py-10 font-medium italic">Nenhuma solicitação encontrada.</p>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {requests.map((request) => {
        const isResponded = highlightResponded && request.status === RequestStatus.RESPONDIDO;

        return (
          <div
            key={request.id}
            onClick={() => setSelectedRequestId(request.id)}
            className={`group bg-surface p-6 rounded-[2rem] shadow-sm border transition-all cursor-pointer animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden
            ${isResponded
                ? 'border-blue-500 shadow-xl shadow-blue-100 ring-2 ring-blue-400 ring-offset-2 scale-[1.02] hover:scale-[1.03]'
                : 'border-secondary/50 hover:border-accent hover:shadow-xl'
              }`}
          >
            {isResponded && (
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-400 via-blue-600 to-blue-400 animate-gradient-x"></div>
            )}

            <div className="flex justify-between items-start gap-2 mb-4">
              <span className="text-[10px] font-black bg-secondary/30 text-primary/40 px-2 py-0.5 rounded uppercase tracking-tighter">
                #{request.id}
              </span>
              <div className="flex items-center gap-2">
                {isResponded && (
                  <span className="px-3 py-1 text-[11px] font-black rounded-lg uppercase bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg animate-pulse flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                    ORÇAMENTO PRONTO
                  </span>
                )}
                {!isResponded && (
                  <span className={`px-2.5 py-0.5 text-[10px] font-black rounded uppercase tracking-wider ${getStatusBadgeClass(request.status)}`}>
                    {request.status}
                  </span>
                )}
              </div>
            </div>

            <h4 className="text-lg font-bold text-primary leading-tight group-hover:text-accent transition-colors mb-4 line-clamp-2">
              {request.description}
            </h4>

            {isResponded && (
              <div className="mb-4 text-sm font-bold text-blue-800 bg-blue-50 p-3 rounded-xl border border-blue-100">
                🚀 Clique para ver o valor e aprovar!
              </div>
            )}

            <div className="space-y-2 border-t border-secondary/30 pt-4">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-primary/40">Criado em:</span>
                <span className="text-primary/70">{new Date(request.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>
              {request.clientName && (
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-primary/40">Cliente:</span>
                  <span className="text-primary font-bold">{request.clientName}</span>
                </div>
              )}
              {request.collaboratorName && (
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-primary/40">Técnico:</span>
                  <span className="text-primary/80">{request.collaboratorName}</span>
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <span className={`text-[10px] font-black uppercase tracking-widest transition-opacity group-hover:opacity-100 ${isResponded ? 'text-blue-600 opacity-100' : 'text-accent opacity-0'}`}>
                Ver detalhes &rarr;
              </span>
            </div>
          </div>
        )
      })}

      {selectedRequestId && (
        <RequestDetailsModal
          requestId={selectedRequestId}
          onClose={() => setSelectedRequestId(null)}
        />
      )}
    </div>
  );
};

export default RequestList;
