import { Router, RequestHandler } from 'express';
import { supabase } from '@/lib/supabase';

const router = Router();

type ActivityResponse = {
  type: 'ticket' | 'chat' | 'login';
  id: number;
  title?: string;
  status?: string;
  contact?: string;
  timestamp: string;
  description: string;
};

type DbContact = {
  id: number;
  full_name: string;
  last_portal_login: string;
};

type DbTicket = {
  id: number;
  subject: string;
  status: string;
  updated_at: string;
  contact: DbContact | null;
};

type DbChat = {
  id: number;
  status: string;
  created_at: string;
  contact: DbContact | null;
};

/**
 * @swagger
 * /api/activity/recent:
 *   get:
 *     summary: Get recent activities for a company
 */
const getRecentActivity: RequestHandler = async (req, res) => {
  try {
    const companyId = Number(req.query.companyId);
    const limit = Number(req.query.limit) || 5;

    // Fetch recent activities from different sources
    const [tickets, chats, logins] = await Promise.all([
      // Recent ticket updates
      supabase
        .from('tickets')
        .select(`
          id,
          subject,
          status,
          updated_at,
          contact:contacts (
            id,
            full_name
          )
        `)
        .eq('company_id', companyId)
        .order('updated_at', { ascending: false })
        .limit(limit),

      // Recent chat sessions
      supabase
        .from('chat_sessions')
        .select(`
          id,
          status,
          created_at,
          contact:contacts (
            id,
            full_name
          )
        `)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(limit),

      // Recent customer logins
      supabase
        .from('contacts')
        .select('id, full_name, last_portal_login')
        .eq('company_id', companyId)
        .not('last_portal_login', 'is', null)
        .order('last_portal_login', { ascending: false })
        .limit(limit)
    ]);

    if (tickets.error || chats.error || logins.error) {
      throw new Error('Failed to fetch activities');
    }

    // Combine and format activities
    const activities: ActivityResponse[] = [
      ...((tickets.data || []) as unknown as DbTicket[]).map((ticket) => ({
        type: 'ticket' as const,
        id: ticket.id,
        title: ticket.subject,
        status: ticket.status,
        contact: ticket.contact?.full_name,
        timestamp: ticket.updated_at,
        description: `Ticket "${ticket.subject}" status changed to ${ticket.status}`
      })),
      ...((chats.data || []) as unknown as DbChat[]).map((chat) => ({
        type: 'chat' as const,
        id: chat.id,
        contact: chat.contact?.full_name,
        timestamp: chat.created_at,
        description: `New chat session started with ${chat.contact?.full_name || 'Unknown'}`
      })),
      ...((logins.data || []) as DbContact[]).map((login) => ({
        type: 'login' as const,
        id: login.id,
        contact: login.full_name,
        timestamp: login.last_portal_login,
        description: `${login.full_name} logged into customer portal`
      }))
    ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);

    res.json(activities);
  } catch (error) {
    console.error('Failed to fetch recent activity:', error);
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
};

router.get('/recent', getRecentActivity);

export default router; 