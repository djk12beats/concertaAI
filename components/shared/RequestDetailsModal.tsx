
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ServiceRequest, Quote, User, Role, RequestStatus } from '../../types';
import { getRequestDetails, respondToRequest, acceptQuote, scheduleService } from '../../services/mockApi';
import Chat from './Chat';

interface Props {
    requestId: number;
    onClose: () => void;
}

const RequestDetailsModal: React.FC<Props> = ({ requestId, onClose }) => {
    const { currentUser } = useAuth();
    const [details, setDetails] = useState<{ request: ServiceRequest; quote: Quote | null; client: User | null } | null>(null);
    const [loading, setLoading] = useState(true);

    const [showResponseForm, setShowResponseForm] = useState(false);
    const [showScheduleForm, setShowScheduleForm] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        const data = await getRequestDetails(requestId);
        setDetails(data);
        setLoading(false);
    }, [requestId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAcceptQuote = async () => {
        await acceptQuote(requestId);
        fetchData();
    };

    const handleDownload = (photoUrl: string, index: number) => {
        const link = document.createElement('a');
        link.href = photoUrl;
        link.download = `concerta-ai-request-${requestId}-photo-${index + 1}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading || !details || !currentUser) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-surface p-8 rounded-2xl animate-pulse flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-primary font-bold">Sincronizando...</p>
                </div>
            </div>
        );
    }

    const { request, quote, client } = details;

    const isOwnerCollaborator = currentUser.role === Role.COLABORADOR && request.assignedCollaboratorId === currentUser.id;
    const isPendingForAll = request.status === RequestStatus.PENDENTE;
    const isVisibleToCollab = currentUser.role !== Role.COLABORADOR || isOwnerCollaborator || isPendingForAll;

    if (!isVisibleToCollab && currentUser.role !== Role.ADMIN) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                <div className="bg-surface p-8 rounded-[2rem] text-center shadow-2xl w-full max-w-sm">
                    <p className="text-primary font-bold text-lg mb-2">Acesso Restrito</p>
                    <p className="text-primary/60 text-sm mb-6">Este pedido já foi assumido por outro colaborador.</p>
                    <button onClick={onClose} className="w-full px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all">Entendido</button>
                </div>
            </div>
        );
    }

    const canRespond = currentUser.role === Role.COLABORADOR && request.status === RequestStatus.PENDENTE;
    const canAccept = currentUser.role === Role.CLIENTE && request.status === RequestStatus.RESPONDIDO;
    const canFirstSchedule = currentUser.role === Role.COLABORADOR && request.status === RequestStatus.FECHADO_PELO_CLIENTE && isOwnerCollaborator;
    const canReschedule = currentUser.role === Role.COLABORADOR && request.status === RequestStatus.AGENDADO && isOwnerCollaborator;

    const handleSuccess = () => {
        setShowResponseForm(false);
        setShowScheduleForm(false);
        fetchData();
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-end sm:items-center z-40 px-0 sm:px-4 py-0 sm:py-6 overflow-hidden" onClick={onClose}>
            <div className="bg-background rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl w-full max-w-6xl h-[95vh] sm:h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300" onClick={e => e.stopPropagation()}>
                {/* Header Responsivo */}
                <div className="p-5 sm:p-6 border-b flex justify-between items-center bg-surface flex-shrink-0">
                    <div>
                        <h3 className="text-lg sm:text-xl font-black text-primary uppercase tracking-tight">Pedido #{request.id}</h3>
                        <p className="text-[9px] sm:text-[10px] text-primary/40 font-black uppercase tracking-widest">Aberto em {new Date(request.createdAt).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <button onClick={onClose} className="text-primary/20 hover:text-primary transition-colors p-2 text-3xl leading-none">&times;</button>
                </div>

                {/* Content Responsivo */}
                <div className="flex-grow p-4 sm:p-6 overflow-y-auto overflow-x-hidden scrollbar-hide">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-full">
                        <div className="lg:col-span-7 space-y-6">
                            <InfoSection title="Dados do Serviço">
                                <div className="flex flex-wrap gap-4 mb-4">
                                    <InfoItem label="Status Atual" value={request.status} badge={true} />
                                    {request.executionDate && (
                                        <InfoItem
                                            label="Agendamento"
                                            value={new Date(request.executionDate).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                                        />
                                    )}
                                </div>
                                <InfoItem label="O que precisa ser feito" value={request.description} />
                                <InfoItem label="Nível de Urgência" value={request.priority} />
                            </InfoSection>

                            {request.photos && request.photos.length > 0 && (
                                <InfoSection title="Evidências e Fotos">
                                    <div className="grid grid-cols-2 xs:grid-cols-3 gap-3">
                                        {request.photos.map((photo, index) => (
                                            <div key={index} className="group relative rounded-2xl overflow-hidden border-2 border-secondary bg-slate-100 aspect-square">
                                                <img src={photo} alt={`foto ${index + 1}`} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                <button
                                                    onClick={() => handleDownload(photo, index)}
                                                    className="absolute bottom-2 right-2 p-2 bg-white/90 text-primary rounded-lg shadow-lg active:scale-90 transition-transform"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </InfoSection>
                            )}

                            {quote && (
                                <InfoSection title="Detalhes do Orçamento">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <InfoItem label="Valor da Mão de Obra" value={`R$ ${quote.price.toFixed(2)}`} />
                                        <InfoItem label="Data Proposta Inicial" value={new Date(quote.suggestedExecutionDate).toLocaleDateString('pt-BR')} />
                                    </div>
                                    <InfoItem label="Descrição da Execução" value={quote.laborDescription} />
                                    <InfoItem label="Materiais Sugeridos" value={quote.materialsList} />
                                </InfoSection>
                            )}
                        </div>

                        <div className="lg:col-span-5 flex flex-col gap-6">
                            {client && (currentUser.role !== Role.CLIENTE) && (
                                <InfoSection title="Informações de Contato">
                                    <InfoItem label="Cliente" value={client.name} />
                                    <InfoItem label="Local da Prestação" value={client.address || 'Não cadastrado'} />
                                    <a href={`tel:${client.phone}`} className="mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 text-accent font-black text-[10px] uppercase rounded-xl border border-blue-100 tracking-[0.1em] hover:bg-blue-100 transition-colors">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                        Ligar para {client.name.split(' ')[0]}
                                    </a>
                                </InfoSection>
                            )}

                            <div className="flex-grow flex flex-col min-h-[400px]">
                                <Chat requestId={requestId} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer/Actions Responsivo */}
                <div className="p-4 sm:p-6 bg-surface border-t flex-shrink-0">
                    <div className="max-w-xl mx-auto space-y-3">
                        {canRespond && (
                            <button
                                onClick={() => setShowResponseForm(true)}
                                className="w-full py-4 sm:py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all text-[11px] sm:text-xs shadow-xl active:scale-95"
                            >
                                Responder com Proposta
                            </button>
                        )}
                        {canAccept && (
                            <button
                                onClick={handleAcceptQuote}
                                className="w-full py-4 sm:py-5 bg-green-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-green-700 transition-all text-[11px] sm:text-xs shadow-xl active:scale-95"
                            >
                                Aceitar e Confirmar Serviço
                            </button>
                        )}

                        {(canFirstSchedule || (canReschedule && !showScheduleForm)) && (
                            <button
                                onClick={() => setShowScheduleForm(true)}
                                className={`w-full py-4 sm:py-5 text-white rounded-2xl font-black uppercase tracking-widest transition-all text-[11px] sm:text-xs shadow-xl active:scale-95 ${canReschedule ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                            >
                                {canReschedule ? 'Reagendar Horário' : 'Definir Data da Agenda'}
                            </button>
                        )}

                        {showScheduleForm && (
                            <div className="animate-in slide-in-from-bottom-2 duration-300">
                                <div className="flex justify-between items-center mb-2 px-1">
                                    <span className="text-[9px] font-black text-primary/40 uppercase tracking-widest">{canReschedule ? 'Alterar Atendimento' : 'Selecione a Data'}</span>
                                    <button onClick={() => setShowScheduleForm(false)} className="text-[9px] font-black text-red-500 uppercase tracking-widest hover:bg-red-50 px-2 py-1 rounded-lg">Desistir</button>
                                </div>
                                <ScheduleForm
                                    requestId={requestId}
                                    collaboratorId={currentUser.id}
                                    onSuccess={handleSuccess}
                                    initialDate={request.executionDate}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {showResponseForm && <ResponseForm requestId={requestId} collaboratorId={currentUser.id} onClose={() => setShowResponseForm(false)} onSuccess={handleSuccess} />}
            </div>
        </div>
    );
};

const InfoSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-surface p-5 sm:p-7 rounded-[2.2rem] border border-secondary/50 shadow-sm">
        <h4 className="font-black text-[9px] sm:text-[10px] mb-5 text-primary/30 uppercase tracking-[0.2em] border-b border-secondary/20 pb-3">{title}</h4>
        <div className="space-y-5">{children}</div>
    </div>
);

const InfoItem: React.FC<{ label: string; value: string; badge?: boolean }> = ({ label, value, badge }) => {
    const getStatusBadgeClass = (status: string) => {
        const statusMap: { [key: string]: string } = {
            [RequestStatus.PENDENTE]: 'bg-amber-100 text-amber-700',
            [RequestStatus.RESPONDIDO]: 'bg-blue-100 text-blue-700',
            [RequestStatus.FECHADO_PELO_CLIENTE]: 'bg-indigo-100 text-indigo-700',
            [RequestStatus.AGENDADO]: 'bg-emerald-100 text-emerald-700',
            [RequestStatus.CONCLUIDO]: 'bg-slate-100 text-slate-600',
        };
        return statusMap[status] || 'bg-gray-100 text-gray-800';
    }

    return (
        <div className="group overflow-hidden">
            <p className="text-[9px] font-black text-primary/20 uppercase tracking-widest mb-1.5">{label}</p>
            {badge ?
                <span className={`inline-block px-4 py-1.5 text-[10px] font-black rounded-xl uppercase tracking-wider ${getStatusBadgeClass(value)}`}>{value}</span>
                : <p className="text-base sm:text-xl text-primary font-bold leading-tight break-words">{value}</p>
            }
        </div>
    );
};

const ResponseForm: React.FC<{ requestId: number, collaboratorId: string, onClose: () => void, onSuccess: () => void }> = ({ requestId, collaboratorId, onClose, onSuccess }) => {
    const [price, setPrice] = useState('');
    const [labor, setLabor] = useState('');
    const [materials, setMaterials] = useState('');
    const [date, setDate] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await respondToRequest({
            requestId,
            collaboratorId,
            price: parseFloat(price),
            laborDescription: labor,
            materialsList: materials || 'Materiais inclusos conforme combinado',
            suggestedExecutionDate: new Date(date).toISOString()
        }, requestId, collaboratorId);
        setLoading(false);
        onSuccess();
    }

    return (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-end sm:items-center z-50 p-0 sm:p-4 backdrop-blur-md">
            <form onSubmit={handleSubmit} className="bg-surface p-7 sm:p-12 rounded-t-[3rem] sm:rounded-[3.5rem] shadow-2xl w-full max-w-xl space-y-6 animate-in slide-in-from-bottom sm:zoom-in duration-300">
                <div className="flex justify-between items-start">
                    <div>
                        <h4 className="font-black text-3xl text-primary tracking-tight">Nova Proposta</h4>
                        <p className="text-primary/40 text-[10px] font-black uppercase tracking-widest mt-1">Defina seus termos de serviço</p>
                    </div>
                    <button type="button" onClick={onClose} className="text-primary/20 hover:text-primary text-4xl leading-none transition-colors">&times;</button>
                </div>
                <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-2 scrollbar-hide">
                    <div className="group">
                        <label className="text-[10px] font-black text-primary/30 uppercase tracking-widest mb-2 block">Custo Mão de Obra (R$)</label>
                        <input type="number" step="0.01" placeholder="0,00" value={price} onChange={e => setPrice(e.target.value)} required className="w-full p-4 border-2 border-secondary rounded-2xl bg-slate-50 font-black text-2xl focus:border-accent focus:ring-4 focus:ring-accent/10 outline-none transition-all placeholder:text-primary/10" />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-primary/30 uppercase tracking-widest mb-2 block">O que será executado?</label>
                        <textarea value={labor} onChange={e => setLabor(e.target.value)} placeholder="Detalhe sua forma de trabalho para este reparo..." required className="w-full p-5 border-2 border-secondary rounded-2xl bg-slate-50 text-sm focus:border-accent focus:ring-4 focus:ring-accent/10 outline-none transition-all" rows={3} />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-primary/30 uppercase tracking-widest mb-2 block">Materiais Necesários</label>
                        <input value={materials} onChange={e => setMaterials(e.target.value)} placeholder="Ex: Torneira Deca, Luva 20mm..." className="w-full p-4 border-2 border-secondary rounded-2xl bg-slate-50 text-sm focus:border-accent focus:ring-4 focus:ring-accent/10 outline-none transition-all" />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-primary/30 uppercase tracking-widest mb-2 block">Previsão Inicial</label>
                        <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} required className="w-full p-4 border-2 border-secondary rounded-2xl bg-slate-50 font-black text-sm focus:border-accent focus:ring-4 focus:ring-accent/10 outline-none transition-all" />
                    </div>
                </div>
                <div className="flex gap-4 pt-4">
                    <button type="button" onClick={onClose} className="flex-1 py-5 bg-secondary text-primary rounded-[1.5rem] font-black uppercase text-[11px] tracking-widest hover:bg-slate-300 transition-colors">Voltar</button>
                    <button type="submit" disabled={loading} className="flex-[2] py-5 bg-primary text-white rounded-[1.5rem] font-black uppercase text-[11px] tracking-widest shadow-xl hover:bg-slate-800 disabled:opacity-50 transition-all">
                        {loading ? 'Sincronizando...' : 'Enviar Orçamento'}
                    </button>
                </div>
            </form>
        </div>
    );
}

const ScheduleForm: React.FC<{ requestId: number, collaboratorId: string, onSuccess: () => void, initialDate?: string }> = ({ requestId, collaboratorId, onSuccess, initialDate }) => {
    const [date, setDate] = useState(initialDate ? new Date(initialDate).toISOString().slice(0, 16) : '');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await scheduleService(requestId, collaboratorId, new Date(date).toISOString());
        setLoading(false);
        onSuccess();
    }

    const isRescheduling = !!initialDate;

    return (
        <form onSubmit={handleSubmit} className={`${isRescheduling ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'} p-6 sm:p-9 rounded-[2.5rem] border-2 flex flex-col gap-5 shadow-inner`}>
            <input
                type="datetime-local"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
                className={`w-full p-5 border-2 rounded-[1.5rem] bg-white font-black text-xl outline-none transition-all ${isRescheduling ? 'border-amber-100 focus:border-amber-400' : 'border-emerald-100 focus:border-emerald-400'}`}
            />
            <button
                type="submit"
                disabled={loading || !date}
                className={`w-full py-5 text-white rounded-[1.5rem] font-black uppercase text-[11px] tracking-widest shadow-xl active:scale-95 transition-all ${isRescheduling ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
            >
                {loading ? 'Agendando...' : isRescheduling ? 'Atualizar Agenda' : 'Confirmar Atendimento'}
            </button>
        </form>
    );
}

export default RequestDetailsModal;
