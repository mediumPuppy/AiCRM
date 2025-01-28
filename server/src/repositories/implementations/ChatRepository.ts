import { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { IChatRepository } from '../interfaces/IChatRepository';
import { 
  ChatSession, 
  ChatMessage, 
  CreateChatSessionDTO, 
  UpdateChatSessionDTO,
  CreateChatMessageDTO,
  ChatSessionStatus,
  UpdateChatMessageDTO
} from '../../types/chat.types';
import { ChatSessionEntity } from '../../domain/entities/chat-session';
import { ChatMessageEntity } from '../../domain/entities/chat-message';

export class ChatRepository implements IChatRepository {
  private readonly sessionsTable = 'chat_sessions';
  private readonly messagesTable = 'chat_messages';

  constructor(private readonly supabase: SupabaseClient) {}

  // Session methods implementation
  async createSession(data: CreateChatSessionDTO): Promise<ChatSession> {
    const now = new Date().toISOString();
    const { data: session, error } = await this.supabase
      .from(this.sessionsTable)
      .insert({
        ...data,
        started_at: now,
        created_at: now,
        updated_at: now
      })
      .select()
      .single();

    if (error) throw error;
    return new ChatSessionEntity(session);
  }

  async findSessionById(id: number): Promise<ChatSession | null> {
    const { data: session, error } = await this.supabase
      .from(this.sessionsTable)
      .select('*, contact:contacts(*), agent:users(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return session ? new ChatSessionEntity(session) : null;
  }

  async findSessionsByCompanyId(companyId: number, filters?: any): Promise<ChatSession[]> {
    let query = this.supabase
      .from(this.sessionsTable)
      .select('*, contact:contacts(*), agent:users(*)')
      .eq('company_id', companyId);

    // Apply status filter
    if (filters?.status?.length === 1) {
      query = query.eq('status', filters.status[0]);
    }

    // Apply search filter
    if (filters?.search) {
      query = query.or(`contact.full_name.ilike.%${filters.search}%,contact.email.ilike.%${filters.search}%`);
    }

    // Apply date range filter
    if (filters?.dateRange?.from) {
      query = query.gte('created_at', filters.dateRange.from);
    }
    if (filters?.dateRange?.to) {
      query = query.lte('created_at', filters.dateRange.to);
    }

    const { data: sessions, error } = await query;

    if (error) throw error;
    return sessions.map(session => new ChatSessionEntity(session));
  }

  async findSessionsByStatus(companyId: number, status: ChatSessionStatus): Promise<ChatSession[]> {
    const { data: sessions, error } = await this.supabase
      .from(this.sessionsTable)
      .select()
      .eq('company_id', companyId)
      .eq('status', status);

    if (error) throw error;
    return sessions.map(session => new ChatSessionEntity(session));
  }

  async findSessionsByContact(contactId: number): Promise<ChatSession[]> {
    const { data: sessions, error } = await this.supabase
      .from(this.sessionsTable)
      .select()
      .eq('contact_id', contactId);

    if (error) throw error;
    return sessions.map(session => new ChatSessionEntity(session));
  }

  async findSessionsByAgent(agentId: number): Promise<ChatSession[]> {
    const { data: sessions, error } = await this.supabase
      .from(this.sessionsTable)
      .select()
      .eq('agent_id', agentId);

    if (error) throw error;
    return sessions.map(session => new ChatSessionEntity(session));
  }

  async updateSession(id: number, data: UpdateChatSessionDTO): Promise<ChatSession> {
    const { data: session, error } = await this.supabase
      .from(this.sessionsTable)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return new ChatSessionEntity(session);
  }

  async closeSession(id: number): Promise<ChatSession> {
    const { data: session, error } = await this.supabase
      .from(this.sessionsTable)
      .update({
        status: 'closed',
        ended_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return new ChatSessionEntity(session);
  }

  // Message methods implementation
  async createMessage(data: CreateChatMessageDTO): Promise<ChatMessage> {
    const { data: message, error } = await this.supabase
      .from(this.messagesTable)
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return new ChatMessageEntity(message);
  }

  async findMessageById(id: number): Promise<ChatMessage | null> {
    const { data: message, error } = await this.supabase
      .from(this.messagesTable)
      .select()
      .eq('id', id)
      .single();

    if (error) throw error;
    return message ? new ChatMessageEntity(message) : null;
  }

  async findMessagesBySessionId(sessionId: number): Promise<ChatMessage[]> {
    const { data: messages, error } = await this.supabase
      .from(this.messagesTable)
      .select()
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return messages.map(message => new ChatMessageEntity(message));
  }

  async markMessageAsRead(id: number): Promise<ChatMessage> {
    const { data: message, error } = await this.supabase
      .from(this.messagesTable)
      .update({ read_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return new ChatMessageEntity(message);
  }

  async updateMessage(id: number, data: UpdateChatMessageDTO): Promise<ChatMessage> {
    const { data: message, error } = await this.supabase
      .from(this.messagesTable)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return new ChatMessageEntity(message);
  }

  // Realtime methods implementation
  subscribeToSession(sessionId: number, callback: (message: ChatMessage) => void): RealtimeChannel {
    const channel = this.supabase
      .channel(`chat_messages:session_id=eq.${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          const message = new ChatMessageEntity(payload.new as ChatMessage);
          callback(message);
        }
      )
      .subscribe();

    return channel;
  }

  unsubscribeFromSession(channel: RealtimeChannel): void {
    this.supabase.removeChannel(channel);
  }

  async findSessionsByContactId(contactId: number) {
    const { data, error } = await this.supabase
      .from('chat_sessions')
      .select('*, contact:contacts(*), agent:users(*)')
      .eq('contact_id', contactId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  async createCustomerSession(contactId: number, companyId: number): Promise<ChatSession> {
    const { data: session, error } = await this.supabase
      .from('chat_sessions')
      .insert({
        contact_id: contactId,
        company_id: companyId,
        status: 'active',
        metadata: {},
        started_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return new ChatSessionEntity(session)
  }
} 