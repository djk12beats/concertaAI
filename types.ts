
export enum Role {
  CLIENTE = 'CLIENTE',
  COLABORADOR = 'COLABORADOR',
  ADMIN = 'ADMIN',
}

export enum RequestStatus {
  PENDENTE = 'Pendente',
  RESPONDIDO = 'Respondido',
  FECHADO_PELO_CLIENTE = 'Fechado pelo Cliente',
  AGENDADO = 'Agendado',
  CONCLUIDO = 'Concluído',
}

export interface User {
  id: string; // Changed to string for Supabase UUID
  username: string;
  passwordHash: string;
  role: Role;
  name: string;
  address: string;
  phone: string;
  email: string;
}

export interface ServiceRequest {
  id: number;
  clientId: string;
  clientName?: string;
  assignedCollaboratorId: string | null;
  collaboratorName?: string;
  description: string;
  priority: 'Baixa' | 'Média' | 'Alta';
  status: RequestStatus;
  createdAt: string;
  executionDate?: string; // Data agendada para execução
  photos: string[];
}

export interface Quote {
  id: number;
  requestId: number;
  collaboratorId: string;
  price: number;
  laborDescription: string;
  materialsList: string;
  suggestedExecutionDate: string;
}

export interface AgendaItem {
  id: number;
  collaboratorId: string;
  requestId: number;
  clientName: string;
  clientAddress: string;
  description: string;
  executionDatetime: string;
  status: RequestStatus;
}

export interface ChatMessage {
  id: number;
  requestId: number;
  senderId: string;
  senderName: string;
  message: string;
  createdAt: string;
  recipientId?: string;
}
