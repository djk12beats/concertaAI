
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { AgendaItem, RequestStatus } from '../../types';
import { getAgendaByCollaboratorId, completeService } from '../../services/mockApi';

const Agenda: React.FC = () => {
  const { currentUser } = useAuth();
  const [allAgendaItems, setAllAgendaItems] = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());

  const fetchAgenda = useCallback(async () => {
    if (currentUser) {
      setLoading(true);
      const data = await getAgendaByCollaboratorId(currentUser.id);
      setAllAgendaItems(data.filter(item => item.status === RequestStatus.AGENDADO));
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchAgenda();
  }, [fetchAgenda]);

  const handleComplete = async (itemId: number) => {
    await completeService(itemId);
    fetchAgenda();
  };

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    return new Date(year, month + 1, 0).getDate();
  }, [currentDate]);

  const firstDayOfMonth = useMemo(() => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  }, [currentDate]);

  const monthName = currentDate.toLocaleString('pt-BR', { month: 'long' });
  const year = currentDate.getFullYear();

  const servicesForSelectedDay = useMemo(() => {
    return allAgendaItems.filter(item => {
      const date = new Date(item.executionDatetime);
      return date.getDate() === selectedDay &&
             date.getMonth() === currentDate.getMonth() &&
             date.getFullYear() === currentDate.getFullYear();
    });
  }, [allAgendaItems, selectedDay, currentDate]);

  const hasServiceOnDay = (day: number) => {
    return allAgendaItems.some(item => {
      const date = new Date(item.executionDatetime);
      return date.getDate() === day &&
             date.getMonth() === currentDate.getMonth() &&
             date.getFullYear() === currentDate.getFullYear();
    });
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
    setCurrentDate(newDate);
    const today = new Date();
    if (newDate.getMonth() === today.getMonth() && newDate.getFullYear() === today.getFullYear()) {
        setSelectedDay(today.getDate());
    } else {
        setSelectedDay(1);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-24">
      <div className="w-12 h-12 border-4 border-primary/10 border-t-accent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-1 sm:px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Calendário Responsivo */}
      <div className="bg-surface rounded-[2rem] sm:rounded-[3rem] p-5 sm:p-8 shadow-2xl border border-secondary/30">
        <div className="flex flex-row justify-between items-center mb-8 sm:mb-10">
          <div>
            <h3 className="text-xl sm:text-3xl font-black text-primary capitalize tracking-tighter">{monthName}</h3>
            <p className="text-primary/30 font-bold text-[10px] sm:text-sm">{year}</p>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <button onClick={() => changeMonth(-1)} className="p-3 sm:p-4 bg-secondary/30 hover:bg-secondary text-primary rounded-xl sm:rounded-2xl transition-all active:scale-90">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15 19l-7-7 7-7" strokeWidth={4}/></svg>
            </button>
            <button onClick={() => changeMonth(1)} className="p-3 sm:p-4 bg-secondary/30 hover:bg-secondary text-primary rounded-xl sm:rounded-2xl transition-all active:scale-90">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 5l7 7-7 7" strokeWidth={4}/></svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center mb-4">
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => (
            <span key={d} className="text-[10px] font-black text-primary/20 uppercase tracking-[0.2em]">{d}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-3">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="h-10 sm:h-16"></div>
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const isSelected = day === selectedDay;
            const hasService = hasServiceOnDay(day);
            const todayDate = new Date();
            const isToday = day === todayDate.getDate() && currentDate.getMonth() === todayDate.getMonth() && currentDate.getFullYear() === todayDate.getFullYear();

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`
                  relative h-10 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-sm sm:text-lg transition-all
                  ${isSelected ? 'bg-primary text-white shadow-xl scale-105 sm:scale-110 z-10' : 'hover:bg-slate-50 text-primary'}
                  ${isToday && !isSelected ? 'text-accent ring-2 ring-accent/20' : ''}
                  ${!isSelected && !isToday && !hasService ? 'text-primary/40' : ''}
                `}
              >
                {day}
                {hasService && (
                  <span className={`absolute bottom-1.5 sm:bottom-2 w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-accent'} animate-pulse`}></span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista de Serviços */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
            <h4 className="text-[10px] font-black text-primary/30 uppercase tracking-[0.1em]">
              Agenda: {selectedDay} / {currentDate.getMonth() + 1}
            </h4>
            <span className="text-[10px] font-black bg-accent/10 text-accent px-3 py-1 rounded-full uppercase">
                {servicesForSelectedDay.length} tarefa(s)
            </span>
        </div>
        
        {servicesForSelectedDay.length > 0 ? (
          <div className="space-y-4">
            {servicesForSelectedDay.map((item) => (
              <div key={item.id} className="bg-surface p-5 sm:p-7 rounded-[2rem] shadow-lg border border-secondary/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-xl transition-all">
                <div className="flex-grow space-y-1 sm:space-y-2 w-full">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-500 text-white px-3 py-1 rounded-lg text-[10px] sm:text-xs font-black">
                        {new Date(item.executionDatetime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-primary/20 font-black text-[10px]">REQ #{item.requestId}</span>
                  </div>
                  <p className="text-base sm:text-xl font-black text-primary leading-tight">{item.description}</p>
                  <div className="flex flex-col text-xs sm:text-sm text-primary/50 font-bold">
                    <span>Cliente: {item.clientName}</span>
                    <span className="flex items-center gap-1 truncate max-w-full">
                        <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeWidth={2}/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeWidth={2}/></svg>
                        {item.clientAddress}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleComplete(item.id)}
                  className="w-full md:w-auto px-6 py-4 bg-emerald-500 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-600 transition-all shadow-md active:scale-95"
                >
                  Concluir
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/50 border-4 border-dashed border-secondary/50 rounded-[2rem] sm:rounded-[3rem] p-10 sm:p-16 text-center">
            <p className="text-primary/30 font-black text-sm uppercase tracking-tight">Sem tarefas para este dia</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Agenda;
