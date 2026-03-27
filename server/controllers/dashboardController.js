import { countChatsForUser, listRecentChatsForUser } from '../repositories/chatsRepository.js';
import { countLeadsByUser, listRecentLeadsByUser } from '../repositories/leadsRepository.js';
import {
  countPatientsByUser,
  listRecentPatientsByUser,
} from '../repositories/patientsRepository.js';
import { countUsers } from '../repositories/usersRepository.js';

export const getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [
      usersCount,
      chatsCount,
      leadsCount,
      patientsCount,
      recentChats,
      recentLeads,
      recentPatients,
    ] = await Promise.all([
      countUsers(),
      countChatsForUser(userId),
      countLeadsByUser(userId),
      countPatientsByUser(userId),
      listRecentChatsForUser(userId, 3),
      listRecentLeadsByUser(userId, 3),
      listRecentPatientsByUser(userId, 3),
    ]);

    const activity = [
      ...recentChats.map((chat) => ({
        id: chat._id,
        type: 'chat',
        title: `Conversation with ${
          chat.senderId._id === userId ? chat.receiverId.name : chat.senderId.name
        }`,
        description: chat.message,
        date: chat.timestamp,
      })),
      ...recentLeads.map((lead) => ({
        id: lead._id,
        type: 'lead',
        title: `${lead.name} lead updated`,
        description: `Status: ${lead.status}`,
        date: lead.updatedAt,
      })),
      ...recentPatients.map((patient) => ({
        id: patient._id,
        type: 'patient',
        title: `${patient.name} patient record changed`,
        description: `${patient.appointments.length} appointment(s) on record`,
        date: patient.updatedAt,
      })),
    ]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 8);

    res.json({
      success: true,
      stats: {
        users: usersCount,
        chats: chatsCount,
        leads: leadsCount,
        patients: patientsCount,
      },
      activity,
    });
  } catch (error) {
    next(error);
  }
};
