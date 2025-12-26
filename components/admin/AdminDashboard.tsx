
import React, { useState, useEffect } from 'react';
import { ListIcon, UsersIcon, TrashIcon, ChatIcon } from '../shared/Icons';
import { ServiceRequest, User, Role, RequestStatus } from '../../types';
import { getAllRequests, getAllUsersByRole, deleteUser, updateUserRole } from '../../services/mockApi';
import RequestList from '../shared/RequestList';
import AdminChatModal from './AdminChatModal';

type Tab = 'requests' | 'clients' | 'collaborators';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('requests');
  const [chatUser, setChatUser] = useState<User | null>(null);

  const getTabClass = (tabName: Tab) =>
    `flex items-center justify-center sm:justify-start gap-2 px-5 py-4 font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all ${activeTab === tabName
      ? 'bg-primary text-white shadow-xl scale-105 z-10'
      : 'text-primary/40 hover:bg-secondary/30'
    }`;

  const renderContent = () => {
    switch (activeTab) {
      case 'requests':
        return <AllRequestsView />;
      case 'clients':
        return <UserListView role={Role.CLIENTE} title="Base de Clientes" onStartChat={setChatUser} canPromote={true} />;
      case 'collaborators':
        return <UserListView role={Role.COLABORADOR} title="Equipe Técnica" onStartChat={setChatUser} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2">
        <div>
          <h2 className="text-4xl font-black text-primary tracking-tighter">Gestão Central</h2>
          <p className="text-primary/30 font-bold text-xs uppercase tracking-widest mt-1">Painel de Controle Administrativo</p>
        </div>
      </div>

      <nav className="flex bg-secondary/10 p-2 rounded-[2.5rem] gap-2 overflow-x-auto scrollbar-hide shadow-inner border border-secondary/20">
        <button onClick={() => setActiveTab('requests')} className={`${getTabClass('requests')} whitespace-nowrap`}>
          <ListIcon />
          <span>Solicitações</span>
        </button>
        <button onClick={() => setActiveTab('clients')} className={`${getTabClass('clients')} whitespace-nowrap`}>
          <UsersIcon />
          <span>Clientes</span>
        </button>
        <button onClick={() => setActiveTab('collaborators')} className={`${getTabClass('collaborators')} whitespace-nowrap`}>
          <UsersIcon />
          <span>Colaboradores</span>
        </button>
      </nav>

      <div className="animate-in slide-in-from-bottom-4 duration-700 fill-mode-both">
        {renderContent()}
      </div>

      {chatUser && <AdminChatModal user={chatUser} onClose={() => setChatUser(null)} />}
    </div>
  );
};

const AllRequestsView: React.FC = () => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [activeSubTabView, setActiveSubTabView] = useState<'recent' | 'archive'>('recent');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const data = await getAllRequests();
      const sortedData = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setRequests(sortedData);
      setLoading(false);
    };
    fetch();
  }, []);

  useEffect(() => {
    const sourceData = activeSubTabView === 'recent' ? requests.slice(0, 20) : requests.slice(20);

    if (statusFilter === 'Todos') {
      setFilteredRequests(sourceData);
    } else {
      setFilteredRequests(sourceData.filter(r => r.status === statusFilter));
    }
  }, [statusFilter, requests, activeSubTabView]);

  if (loading) return (
    <div className="flex justify-center py-32">
      <div className="w-12 h-12 border-4 border-primary/5 border-t-primary rounded-full animate-spin"></div>
    </div>
  );

  const getSubTabClass = (tabName: 'recent' | 'archive') =>
    `px-6 py-2.5 text-[9px] font-black uppercase tracking-[0.15em] rounded-xl transition-all ${activeSubTabView === tabName
      ? 'bg-white text-primary shadow-sm ring-1 ring-black/5'
      : 'text-primary/30 hover:text-primary/50'
    }`;


  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-surface/50 p-4 rounded-[2.5rem] border border-secondary/30">
        <div className="flex bg-secondary/20 p-1.5 rounded-2xl">
          <button onClick={() => setActiveSubTabView('recent')} className={getSubTabClass('recent')}>
            Recentes
          </button>
          <button onClick={() => setActiveSubTabView('archive')} className={getSubTabClass('archive')}>
            Arquivo
          </button>
        </div>
        <div className="relative group">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full md:w-auto rounded-2xl border-secondary/50 shadow-sm focus:border-accent focus:ring-4 focus:ring-accent/10 text-[11px] font-black uppercase tracking-wider bg-surface px-5 py-3 pr-10 appearance-none outline-none transition-all cursor-pointer"
          >
            <option value="Todos">Filtrar por Status</option>
            {Object.values(RequestStatus).map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-primary/30">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 9l-7 7-7-7" strokeWidth={3} /></svg>
          </div>
        </div>
      </div>
      <RequestList requests={filteredRequests} />
    </div>
  );
};


const UserListView: React.FC<{ role: Role, title: string, onStartChat: (user: User) => void, canPromote?: boolean }> = ({ role, title, onStartChat, canPromote }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    const data = await getAllUsersByRole(role);
    setUsers(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchUsers();
  }, [role]);

  const handleDelete = async (userId: string) => {
    if (window.confirm('Atenção: A exclusão de um usuário é permanente. Confirmar?')) {
      await deleteUser(userId);
      fetchUsers();
    }
  }

  const handlePromote = async (userId: string, userName: string) => {
    if (window.confirm(`Confirma promover ${userName} para Colaborador?`)) {
      await updateUserRole(userId, Role.COLABORADOR);
      fetchUsers();
    }
  }

  if (loading) return (
    <div className="flex justify-center py-32">
      <div className="w-12 h-12 border-4 border-primary/5 border-t-primary rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 px-2">
        <div className="w-2 h-7 bg-primary rounded-full"></div>
        <h3 className="text-2xl font-black text-primary tracking-tight">{title}</h3>
      </div>

      {/* Mobile Cards - Responsivo */}
      <div className="grid grid-cols-1 gap-5 sm:hidden">
        {users.length === 0 ? (
          <div className="bg-surface/50 border-4 border-dashed border-secondary/30 rounded-[3rem] py-20 text-center">
            <p className="text-primary/20 font-black uppercase text-[10px] tracking-widest">Base de dados vazia.</p>
          </div>
        ) : users.map(user => (
          <div key={user.id} className="bg-surface p-7 rounded-[2.8rem] shadow-sm border border-secondary/40 hover:shadow-xl transition-all group">
            <div className="flex justify-between items-start mb-5">
              <div>
                <h4 className="font-black text-primary text-lg leading-tight group-hover:text-accent transition-colors">{user.name}</h4>
                <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest mt-1">{user.email}</p>
              </div>
              <div className="flex gap-2">
                {canPromote && (
                  <button onClick={() => handlePromote(user.id, user.name)} className="p-3 bg-green-50 text-green-600 rounded-2xl active:scale-90 transition-transform" title="Promover a Colaborador">
                    <UsersIcon />
                  </button>
                )}
                <button onClick={() => onStartChat(user)} className="p-3 bg-blue-50 text-accent rounded-2xl active:scale-90 transition-transform"><ChatIcon /></button>
                <button onClick={() => handleDelete(user.id)} className="p-3 bg-red-50 text-red-500 rounded-2xl active:scale-90 transition-transform"><TrashIcon /></button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-5 border-t border-secondary/20">
              <div>
                <p className="text-[9px] font-black text-primary/20 uppercase tracking-widest mb-1">Contato</p>
                <p className="text-xs font-bold text-primary/80">{user.phone}</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-primary/20 uppercase tracking-widest mb-1">Localização</p>
                <p className="text-xs font-bold text-primary/80 truncate">{user.address || 'Não cadastrado'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table - Responsivo */}
      <div className="hidden sm:block bg-surface p-6 rounded-[3.5rem] shadow-sm border border-secondary/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-secondary/20">
            <thead>
              <tr>
                <th className="px-8 py-6 text-left text-[10px] font-black text-primary/20 uppercase tracking-[0.2em]">Identificação</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-primary/20 uppercase tracking-[0.2em]">E-mail / Contato</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-primary/20 uppercase tracking-[0.2em]">Endereço Principal</th>
                <th className="px-8 py-6 text-right text-[10px] font-black text-primary/20 uppercase tracking-[0.2em]">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-surface divide-y divide-secondary/10">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-primary group-hover:text-accent transition-colors">{user.name}</span>
                      <span className="text-[10px] text-primary/30 font-bold uppercase tracking-widest mt-0.5">ID #{user.id}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-primary/70">{user.email}</span>
                      <span className="text-xs font-medium text-primary/40">{user.phone}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap text-sm text-primary/50 max-w-xs truncate font-medium">{user.address}</td>
                  <td className="px-8 py-6 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-3">
                      {canPromote && (
                        <button
                          onClick={() => handlePromote(user.id, user.name)}
                          className="p-3 text-green-500 hover:bg-green-50 rounded-2xl transition-all hover:scale-110 active:scale-95"
                          title={`Promover ${user.name} a Colaborador`}
                        >
                          <UsersIcon />
                        </button>
                      )}
                      <button
                        onClick={() => onStartChat(user)}
                        className="p-3 text-accent hover:bg-blue-50 rounded-2xl transition-all hover:scale-110 active:scale-95"
                        title={`Falar com ${user.name}`}
                      >
                        <ChatIcon />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all hover:scale-110 active:scale-95"
                        title={`Excluir ${user.name}`}
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
};

export default AdminDashboard;
