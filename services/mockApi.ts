
import { supabase } from './supabaseClient';
import { Role, RequestStatus, User, ServiceRequest, Quote, AgendaItem, ChatMessage } from '../types';

// --- HELPERS ---
const handleSupabaseError = (error: any) => {
    console.error('Supabase error:', error);
    throw new Error(error.message || 'An error occurred with the database');
};

// --- USERS ---
export const register = async (userData: { name: string, email: string, phone: string, password: string }): Promise<User> => {
    // Registration handles auth.users creation on client side (Register.tsx).
    // This is effectively a no-op or could be used to fetch the created profile.
    throw new Error("Use supabase.auth.signUp directly in component");
};

export const login = async (username: string, password: string): Promise<User | null> => {
    throw new Error("Use supabase.auth.signInWithPassword directly in component");
};

export const getUserById = async (id: string): Promise<User | undefined> => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

    if (error) return undefined;
    return mapProfileToUser(data);
};

export const getAllUsersByRole = async (role: Role): Promise<User[]> => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', role);

    if (error) handleSupabaseError(error);
    return (data || []).map(mapProfileToUser);
};

export const updateUser = async (userId: string, data: Partial<Pick<User, 'name' | 'address' | 'phone'>>): Promise<User | undefined> => {
    const { data: updated, error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', userId)
        .select()
        .single();

    if (error) handleSupabaseError(error);
    return mapProfileToUser(updated);
};

export const updateUserRole = async (userId: string, role: Role): Promise<User | undefined> => {
    const { data: updated, error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId)
        .select()
        .single();

    if (error) handleSupabaseError(error);
    return mapProfileToUser(updated);
};

export const deleteUser = async (userId: string): Promise<boolean> => {
    // Deleting from auth.users (via service role usually) is restricted on client.
    // For this app prototype, we will delete from 'profiles' OR use an Edge Function.
    // However, FK constraints are CASCADE, so deleting profile might not delete auth user.
    // Currently, we can only easily delete the profile row if RLS allows.
    // IMPORTANT: 'deleteUser' in mock deleted everything. In Supabase client, we can't easily delete the AUTH user.
    // We will simulate by deleting profile, which effectively "hides" them from lists.
    const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

    return !error;
};

export const getAdminUser = async (): Promise<User | undefined> => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', Role.ADMIN)
        .limit(1)
        .single();

    if (error) return undefined;
    return mapProfileToUser(data);
};

// --- SERVICE REQUESTS ---
export const getAllRequests = async (): Promise<ServiceRequest[]> => {
    const { data, error } = await supabase
        .from('service_requests')
        .select('*');

    if (error) handleSupabaseError(error);
    return (data || []).map(mapToServiceRequest);
};

export const getRequestsByClientId = async (clientId: string): Promise<ServiceRequest[]> => {
    const { data, error } = await supabase
        .from('service_requests')
        .select('*')
        .eq('client_id', clientId);

    if (error) handleSupabaseError(error);
    return (data || []).map(mapToServiceRequest);
};

export const getRequestsByCollaboratorId = async (collaboratorId: string): Promise<ServiceRequest[]> => {
    const { data, error } = await supabase
        .from('service_requests')
        .select('*')
        .eq('assigned_collaborator_id', collaboratorId);

    if (error) handleSupabaseError(error);
    return (data || []).map(mapToServiceRequest);
};

export const getPendingRequests = async (): Promise<ServiceRequest[]> => {
    const { data, error } = await supabase
        .from('service_requests')
        .select('*')
        .eq('status', RequestStatus.PENDENTE)
        .is('assigned_collaborator_id', null);

    if (error) handleSupabaseError(error);
    return (data || []).map(mapToServiceRequest);
};

export const getRequestDetails = async (requestId: number): Promise<{ request: ServiceRequest; quote: Quote | null; client: User | null }> => {
    const { data: requestData, error: reqError } = await supabase
        .from('service_requests')
        .select('*')
        .eq('id', requestId)
        .single();

    if (reqError) handleSupabaseError(reqError);

    const { data: quoteData } = await supabase
        .from('quotes')
        .select('*')
        .eq('request_id', requestId)
        .single();

    const { data: clientData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', requestData.client_id)
        .single();

    return {
        request: mapToServiceRequest(requestData),
        quote: quoteData ? mapToQuote(quoteData) : null,
        client: clientData ? mapProfileToUser(clientData) : null
    };
};

export const createRequest = async (requestData: Omit<ServiceRequest, 'id' | 'status' | 'createdAt' | 'assignedCollaboratorId' | 'collaboratorName' | 'clientName'>): Promise<ServiceRequest> => {
    // First get client profile to get the name if needed (optional optimization)
    // Actually, clientName can be derived from JOINs but for now we store it.
    const { data: client } = await supabase.from('profiles').select('name').eq('id', requestData.clientId).single();

    const payload = {
        client_id: requestData.clientId,
        client_name: client?.name || 'Desconhecido',
        description: requestData.description,
        priority: requestData.priority,
        status: RequestStatus.PENDENTE,
        photos: requestData.photos
    };

    const { data, error } = await supabase
        .from('service_requests')
        .insert(payload)
        .select()
        .single();

    if (error) handleSupabaseError(error);
    return mapToServiceRequest(data);
};

export const acceptQuote = async (requestId: number): Promise<ServiceRequest | undefined> => {
    const { data, error } = await supabase
        .from('service_requests')
        .update({ status: RequestStatus.FECHADO_PELO_CLIENTE })
        .eq('id', requestId)
        .select()
        .single();

    if (error) handleSupabaseError(error);
    return mapToServiceRequest(data);
};

// --- QUOTES ---
export const respondToRequest = async (quoteData: Omit<Quote, 'id'>, requestId: number, collaboratorId: string): Promise<Quote> => {
    // 1. Create Quote
    const quotePayload = {
        request_id: requestId,
        collaborator_id: collaboratorId,
        price: quoteData.price,
        labor_description: quoteData.laborDescription,
        materials_list: quoteData.materialsList,
        suggested_execution_date: quoteData.suggestedExecutionDate
    };

    const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .insert(quotePayload)
        .select()
        .single();

    if (quoteError) handleSupabaseError(quoteError);

    // 2. Update Request Status and Assignee
    const { data: collaborator } = await supabase.from('profiles').select('name').eq('id', collaboratorId).single();

    const { error: reqError } = await supabase
        .from('service_requests')
        .update({
            status: RequestStatus.RESPONDIDO,
            assigned_collaborator_id: collaboratorId,
            collaborator_name: collaborator?.name || 'Collaborador',
            responded_at: new Date().toISOString()
        })
        .eq('id', requestId);

    if (reqError) handleSupabaseError(reqError);

    return mapToQuote(quote);
};

// --- AGENDA ---
export const scheduleService = async (requestId: number, collaboratorId: string, executionDatetime: string): Promise<AgendaItem> => {
    // Update Request
    await supabase
        .from('service_requests')
        .update({
            status: RequestStatus.AGENDADO,
            execution_date: executionDatetime
        })
        .eq('id', requestId);

    // Create/Update Agenda Item
    // First check existing
    const { data: existing } = await supabase
        .from('agenda_items')
        .select('*')
        .eq('request_id', requestId)
        .single();

    if (existing) {
        const { data: updated, error } = await supabase
            .from('agenda_items')
            .update({ execution_datetime: executionDatetime, status: RequestStatus.AGENDADO })
            .eq('id', existing.id)
            .select()
            .single();
        if (error) handleSupabaseError(error);
        return mapToAgendaItem(updated);
    } else {
        // Need client details
        const { data: request } = await supabase.from('service_requests').select('client_id').eq('id', requestId).single();
        const { data: client } = await supabase.from('profiles').select('name, address').eq('id', request?.client_id).single();

        const payload = {
            collaborator_id: collaboratorId,
            request_id: requestId,
            client_name: client?.name,
            client_address: client?.address,
            description: 'Serviço Agendado',
            execution_datetime: executionDatetime,
            status: RequestStatus.AGENDADO
        };

        const { data: newItem, error } = await supabase.from('agenda_items').insert(payload).select().single();
        if (error) handleSupabaseError(error);
        return mapToAgendaItem(newItem);
    }
};

export const getAgendaByCollaboratorId = async (collaboratorId: string): Promise<AgendaItem[]> => {
    const { data, error } = await supabase
        .from('agenda_items')
        .select('*')
        .eq('collaborator_id', collaboratorId);

    if (error) handleSupabaseError(error);
    return (data || []).map(mapToAgendaItem);
};

export const completeService = async (agendaItemId: number): Promise<AgendaItem | undefined> => {
    const { data: updated, error } = await supabase
        .from('agenda_items')
        .update({ status: RequestStatus.CONCLUIDO })
        .eq('id', agendaItemId)
        .select()
        .single();

    if (error) handleSupabaseError(error);
    if (!updated) return undefined;

    // Update Request too
    await supabase.from('service_requests').update({
        status: RequestStatus.CONCLUIDO,
        completed_at: new Date().toISOString()
    }).eq('id', updated.request_id);

    return mapToAgendaItem(updated);
};


// --- MESSAGES ---
export const getChatMessages = async (requestId: number): Promise<ChatMessage[]> => {
    const { data, error } = await supabase
        .from('chat_messages')
        .select(`
            *,
            profiles!chat_messages_sender_id_fkey (role)
        `)
        .eq('request_id', requestId)
        .order('created_at', { ascending: true });

    if (error) handleSupabaseError(error);
    return (data || []).map(msg => ({
        ...mapToChatMessage(msg),
        senderRole: msg.profiles?.role as Role
    }));
};

export const sendChatMessage = async (requestId: number, senderId: string, message: string): Promise<ChatMessage> => {
    const { data: sender } = await supabase.from('profiles').select('name').eq('id', senderId).single();

    const payload = {
        request_id: requestId,
        sender_id: senderId,
        sender_name: sender?.name || 'Usuario',
        message: message
    };

    const { data, error } = await supabase
        .from('chat_messages')
        .insert(payload)
        .select()
        .single();

    if (error) handleSupabaseError(error);
    return mapToChatMessage(data);
};


// --- ADMIN CHAT (Using same table but requestId=0 or similar, or filtering) ---
// For simplicity in this migration, we will use requestId = 0 for admin chats? 
// Or better, query by participants.
export const getAdminChatMessages = async (adminId: string, userId: string): Promise<ChatMessage[]> => {
    const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .or(`sender_id.eq.${adminId},recipient_id.eq.${adminId}`)
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
        .is('request_id', null) // Admin chats don't have request_id
        .order('created_at', { ascending: true });

    // The OR logic needs to be careful: (sender=A AND recipient=B) OR (sender=B AND recipient=A)
    // Supabase query builder is limited. Raw SQL might be easier, OR just fetch all messages between these two.

    // Simplify: Fetch where (sender=A OR recipient=A) AND (sender=B OR recipient=B)
    // But Supabase doesn't support complex nested AND/OR easily in one go efficiently without raw sql.
    // Let's rely on standard messages for now.

    // Simpler workaround: Use a specific "request_id" that represents the chat between admin and user?
    // No, let's use the 'recipient_id' column we added.

    // Correct Query:
    const { data: d1 } = await supabase
        .from('chat_messages')
        .select(`
            *,
            profiles!chat_messages_sender_id_fkey (role)
        `)
        .eq('sender_id', adminId)
        .eq('recipient_id', userId);

    const { data: d2 } = await supabase
        .from('chat_messages')
        .select(`
            *,
            profiles!chat_messages_sender_id_fkey (role)
        `)
        .eq('sender_id', userId)
        .eq('recipient_id', adminId);

    const all = [...(d1 || []), ...(d2 || [])].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    return all.map(msg => ({
        ...mapToChatMessage(msg),
        senderRole: msg.profiles?.role as Role
    }));
};

export const sendAdminChatMessage = async (senderId: string, recipientId: string, message: string): Promise<ChatMessage> => {
    const { data: sender } = await supabase.from('profiles').select('name').eq('id', senderId).single();

    const payload = {
        sender_id: senderId,
        recipient_id: recipientId, // Direct message
        sender_name: sender?.name || 'Admin',
        message: message,
        request_id: null // Explicitly null
    };

    const { data, error } = await supabase
        .from('chat_messages')
        .insert(payload)
        .select()
        .single();

    if (error) handleSupabaseError(error);
    return mapToChatMessage(data);
};



// --- MAPPERS ---
const mapProfileToUser = (p: any): User => ({
    id: p.id,
    username: p.username || p.email,
    passwordHash: '',
    role: p.role as Role,
    name: p.name,
    address: p.address,
    phone: p.phone,
    email: p.email
});

const mapToServiceRequest = (r: any): ServiceRequest => ({
    id: r.id,
    clientId: r.client_id,
    clientName: r.client_name,
    assignedCollaboratorId: r.assigned_collaborator_id,
    collaboratorName: r.collaborator_name,
    description: r.description,
    priority: r.priority as any,
    status: r.status as RequestStatus,
    createdAt: r.created_at,
    respondedAt: r.responded_at,
    completedAt: r.completed_at,
    executionDate: r.execution_date,
    photos: r.photos || []
});

const mapToQuote = (q: any): Quote => ({
    id: q.id,
    requestId: q.request_id,
    collaboratorId: q.collaborator_id,
    price: q.price,
    laborDescription: q.labor_description,
    materialsList: q.materials_list,
    suggestedExecutionDate: q.suggested_execution_date
});

const mapToAgendaItem = (a: any): AgendaItem => ({
    id: a.id,
    collaboratorId: a.collaborator_id,
    requestId: a.request_id,
    clientName: a.client_name,
    clientAddress: a.client_address,
    description: a.description,
    executionDatetime: a.execution_datetime,
    status: a.status as RequestStatus
});

const mapToChatMessage = (m: any): ChatMessage => ({
    id: m.id,
    requestId: m.request_id || 0,
    senderId: m.sender_id,
    senderName: m.sender_name,
    message: m.message,
    createdAt: m.created_at,
    recipientId: m.recipient_id
});
