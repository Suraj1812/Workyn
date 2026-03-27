import { query } from '../db/client.js';
import { withCache } from '../cache/memoryCache.js';
import { countChatsForUser, listRecentChatsForUser } from '../repositories/chatsRepository.js';
import {
  countLeadsByUser,
  countLeadsByWorkspace,
  listRecentLeadsByUser,
} from '../repositories/leadsRepository.js';
import { countUnreadNotifications } from '../repositories/notificationsRepository.js';
import {
  countPatientsByUser,
  countPatientsByWorkspace,
  listRecentPatientsByUser,
} from '../repositories/patientsRepository.js';
import { countUsers } from '../repositories/usersRepository.js';
import { countActivityLogs, listActivityLogs } from '../repositories/activityRepository.js';

export const getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const workspaceId = req.workspace.id;
    const cacheKey = `dashboard:${workspaceId}:summary:${userId}`;

    const payload = await withCache(
      cacheKey,
      async () => {
        const [
          usersCount,
          chatsCount,
          leadsCount,
          patientsCount,
          unreadNotifications,
          recentActivity,
          reviewedActions,
          recentChats,
          recentLeads,
          recentPatients,
        ] = await Promise.all([
          countUsers(workspaceId),
          countChatsForUser(userId, workspaceId),
          countLeadsByWorkspace({ workspaceId }),
          countPatientsByWorkspace({ workspaceId }),
          countUnreadNotifications(userId),
          listActivityLogs({ workspaceId, limit: 8 }),
          countActivityLogs({ workspaceId }),
          listRecentChatsForUser(userId, 3, workspaceId),
          listRecentLeadsByUser(userId, 3, workspaceId),
          listRecentPatientsByUser(userId, 3, workspaceId),
        ]);

        const activity = recentActivity.length
          ? recentActivity.map((item) => ({
              id: item.id,
              type: item.module,
              title: item.description,
              description: item.action,
              date: item.createdAt,
            }))
          : [
              ...recentChats.map((chat) => ({
                id: chat.id,
                type: 'chat',
                title: `Conversation with ${
                  chat.senderId.id === userId ? chat.receiverId.name : chat.senderId.name
                }`,
                description: chat.message,
                date: chat.timestamp,
              })),
              ...recentLeads.map((lead) => ({
                id: lead.id,
                type: 'lead',
                title: `${lead.name} lead updated`,
                description: `Status: ${lead.status}`,
                date: lead.updatedAt,
              })),
              ...recentPatients.map((patient) => ({
                id: patient.id,
                type: 'patient',
                title: `${patient.name} patient record changed`,
                description: `${patient.appointments.length} appointment(s) on record`,
                date: patient.updatedAt,
              })),
            ]
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .slice(0, 8);

        return {
          success: true,
          stats: {
            users: usersCount,
            chats: chatsCount,
            leads: leadsCount,
            patients: patientsCount,
            unreadNotifications,
            reviewedActions,
          },
          workspace: {
            id: req.workspace.id,
            name: req.workspace.name,
            plan: req.workspace.plan,
          },
          activity,
        };
      },
      20_000,
    );

    res.json(payload);
  } catch (error) {
    next(error);
  }
};

export const getDashboardAnalytics = async (req, res, next) => {
  try {
    const workspaceId = req.workspace.id;
    const cacheKey = `analytics:${workspaceId}`;

    const payload = await withCache(
      cacheKey,
      async () => {
        const [activityTrendResult, leadStatusResult, chatTrendResult] = await Promise.all([
          query(
            `
              SELECT
                TO_CHAR(DATE_TRUNC('day', created_at), 'YYYY-MM-DD') AS day,
                COUNT(*)::int AS total
              FROM activity_logs
              WHERE workspace_id = $1 AND created_at >= NOW() - INTERVAL '6 days'
              GROUP BY 1
              ORDER BY 1 ASC
            `,
            [workspaceId],
          ),
          query(
            `
              SELECT status, COUNT(*)::int AS total
              FROM leads
              WHERE workspace_id = $1
              GROUP BY status
              ORDER BY status ASC
            `,
            [workspaceId],
          ),
          query(
            `
              SELECT
                TO_CHAR(DATE_TRUNC('day', timestamp), 'YYYY-MM-DD') AS day,
                COUNT(*)::int AS total
              FROM chats
              WHERE workspace_id = $1 AND timestamp >= NOW() - INTERVAL '6 days'
              GROUP BY 1
              ORDER BY 1 ASC
            `,
            [workspaceId],
          ),
        ]);

        return {
          success: true,
          trends: {
            activity: activityTrendResult.rows,
            chats: chatTrendResult.rows,
          },
          leadStatus: leadStatusResult.rows.map((row) => ({
            name: row.status,
            value: row.total,
          })),
        };
      },
      30_000,
    );

    res.json(payload);
  } catch (error) {
    next(error);
  }
};
