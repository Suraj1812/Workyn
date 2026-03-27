import { countLeadsByStatus, listInactiveLeads } from '../../repositories/leadsRepository.js';
import {
  findActiveAutomationBySourceKey,
  listUserActions,
} from '../../repositories/aiRepository.js';
import { resolvePendingSuggestions, upsertSuggestion } from './suggestionEngine.js';
import { getDateKey, normalizeText } from '../utils/normalizers.js';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const titleSkillMap = [
  {
    match: ['frontend', 'react', 'ui', 'javascript'],
    skills: ['React', 'JavaScript', 'Responsive Design'],
  },
  {
    match: ['backend', 'node', 'api', 'express'],
    skills: ['Node.js', 'REST APIs', 'Express.js'],
  },
  {
    match: ['crm', 'sales', 'operations'],
    skills: ['CRM Management', 'Pipeline Tracking', 'Stakeholder Communication'],
  },
  {
    match: ['clinic', 'health', 'patient'],
    skills: ['Patient Coordination', 'Appointment Management', 'Clinical Documentation'],
  },
];

const hasAutomation = async (userId, sourceKey) =>
  Boolean(await findActiveAutomationBySourceKey(userId, sourceKey));

const suggestLeadCadenceAutomation = async (userId) => {
  const leadAutomationExists = await hasAutomation(userId, 'crm:auto-follow-up-after-lead');

  if (leadAutomationExists) {
    await resolvePendingSuggestions({
      userId,
      dedupeKey: 'crm:lead-follow-up-automation',
    });
    return;
  }

  const since = new Date(Date.now() - 14 * DAY_IN_MS);
  const actions = await listUserActions({
    userId,
    actionType: 'crm.lead_created',
    since,
  });

  const activeDays = new Set(actions.map((action) => getDateKey(action.timestamp)));

  if (actions.length >= 5 && activeDays.size >= 3) {
    await upsertSuggestion({
      userId,
      module: 'crm',
      type: 'automation',
      title: 'Automate lead follow-ups',
      message:
        'You add leads on a steady rhythm. Create a follow-up reminder two days after every new lead?',
      priority: 3,
      dedupeKey: 'crm:lead-follow-up-automation',
      context: {
        actionsTracked: actions.length,
        activeDays: activeDays.size,
      },
      automationPayload: {
        sourceKey: 'crm:auto-follow-up-after-lead',
        name: 'Lead follow-up autopilot',
        description: 'Creates a two-day follow-up reminder after a new lead is added.',
        trigger: {
          event: 'crm.lead_created',
        },
        action: {
          type: 'schedule_suggestion',
          module: 'crm',
          delayHours: 48,
          contextKey: 'leadId',
          title: 'Lead follow-up due',
          messageTemplate: 'You added {{leadName}} two days ago. Send a follow-up now.',
          priority: 2,
        },
      },
    });
  }
};

const suggestRepeatedMessageTemplate = async ({ userId, message }) => {
  const normalizedMessage = normalizeText(message);

  if (normalizedMessage.length < 12) {
    return;
  }

  const templateExists = await hasAutomation(userId, `chat:template:${normalizedMessage}`);

  if (templateExists) {
    await resolvePendingSuggestions({
      userId,
      dedupeKey: `chat:template:${normalizedMessage}`,
    });
    return;
  }

  const repeatedMessages = await listUserActions({
    userId,
    actionType: 'chat.message_sent',
    normalizedMessage,
    since: new Date(Date.now() - 30 * DAY_IN_MS),
    limit: 10,
  });

  if (repeatedMessages.length >= 3) {
    await upsertSuggestion({
      userId,
      module: 'chat',
      type: 'template',
      title: 'Save a repeated chat reply',
      message: `You have sent a similar message ${repeatedMessages.length} times. Save it as a reusable quick reply template?`,
      priority: 2,
      dedupeKey: `chat:template:${normalizedMessage}`,
      context: {
        templateText: message,
      },
      automationPayload: {
        sourceKey: `chat:template:${normalizedMessage}`,
        name: 'Quick reply template',
        description: 'Adds a reusable chat quick reply based on a repeated message.',
        trigger: {
          event: 'chat.composer_opened',
        },
        action: {
          type: 'surface_template',
          module: 'chat',
          label: message.slice(0, 40),
          templateText: message,
        },
      },
    });
  }
};

const suggestLeadBulkAction = async (userId) => {
  const newLeadsCount = await countLeadsByStatus(userId, 'New');

  if (newLeadsCount >= 10) {
    await upsertSuggestion({
      userId,
      module: 'crm',
      type: 'bulk_action',
      title: 'Bulk update your new leads',
      message: `You currently have ${newLeadsCount} leads in the New stage. Consider moving a batch to Contacted.`,
      priority: 2,
      dedupeKey: 'crm:bulk-new-leads',
      context: {
        newLeadsCount,
      },
    });
  } else {
    await resolvePendingSuggestions({
      userId,
      dedupeKey: 'crm:bulk-new-leads',
    });
  }
};

const suggestRepeatedLeadFieldEdits = async (userId) => {
  const actions = await listUserActions({
    userId,
    actionType: 'crm.lead_updated',
    since: new Date(Date.now() - 2 * DAY_IN_MS),
    limit: 20,
  });

  const fieldCounts = actions.reduce((accumulator, action) => {
    (action.metadata?.changedFields || []).forEach((field) => {
      accumulator[field] = (accumulator[field] || 0) + 1;
    });
    return accumulator;
  }, {});

  if ((fieldCounts.status || 0) >= 4) {
    await upsertSuggestion({
      userId,
      module: 'crm',
      type: 'bulk_action',
      title: 'You keep updating lead statuses',
      message:
        'Status is being changed repeatedly. This is a strong candidate for a bulk update workflow.',
      priority: 2,
      dedupeKey: 'crm:repeated-status-edits',
      context: {
        statusChanges: fieldCounts.status,
      },
    });
  } else {
    await resolvePendingSuggestions({
      userId,
      dedupeKey: 'crm:repeated-status-edits',
    });
  }
};

const buildSuggestedSkills = (resumeData) => {
  const existingSkills = new Set((resumeData.skills || []).map((skill) => normalizeText(skill)));
  const sourceText = normalizeText(
    [
      resumeData.personal?.title,
      ...(resumeData.experience || []).flatMap((item) => [item.role, item.company, item.summary]),
    ]
      .filter(Boolean)
      .join(' '),
  );

  return titleSkillMap
    .filter((entry) => entry.match.some((keyword) => sourceText.includes(normalizeText(keyword))))
    .flatMap((entry) => entry.skills)
    .filter((skill) => !existingSkills.has(normalizeText(skill)))
    .slice(0, 4);
};

const analyzeResume = async ({ userId, resumeData, isNewResume }) => {
  await resolvePendingSuggestions({
    userId,
    module: 'resume',
    type: 'quality',
  });

  const missingSections = [];

  if (!resumeData.personal?.fullName) {
    missingSections.push('your full name');
  }
  if (!resumeData.personal?.title) {
    missingSections.push('a professional title');
  }
  if (!resumeData.personal?.summary) {
    missingSections.push('a profile summary');
  }
  if (!(resumeData.skills || []).length) {
    missingSections.push('skills');
  }
  if (!(resumeData.experience || []).length) {
    missingSections.push('experience');
  }

  if (missingSections.length) {
    await upsertSuggestion({
      userId,
      module: 'resume',
      type: 'quality',
      title: 'Complete your resume',
      message: `Add ${missingSections.join(', ')} to make your resume stronger and easier to export.`,
      priority: 3,
      dedupeKey: `resume:missing:${missingSections.join('-')}`,
    });
  }

  const suggestedSkills = buildSuggestedSkills(resumeData);

  if (suggestedSkills.length) {
    await upsertSuggestion({
      userId,
      module: 'resume',
      type: 'quality',
      title: 'Suggested skills to add',
      message: `Based on the role and experience described, consider adding: ${suggestedSkills.join(', ')}.`,
      priority: 2,
      dedupeKey: `resume:skills:${suggestedSkills.join('-')}`,
      context: {
        suggestedSkills,
      },
    });
  }

  const hasResumeExportAutomation = await hasAutomation(
    userId,
    'resume:auto-export-reminder-after-save',
  );

  if (isNewResume || !hasResumeExportAutomation) {
    await upsertSuggestion({
      userId,
      module: 'resume',
      type: 'automation',
      title: 'Nudge yourself to export',
      message:
        'Your resume is updated. Want Workyn to remind you to export the latest PDF after future changes?',
      priority: 1,
      dedupeKey: 'resume:export-reminder-automation',
      automationPayload: {
        sourceKey: 'resume:auto-export-reminder-after-save',
        name: 'Resume export reminder',
        description: 'Shows an export reminder whenever the resume is saved.',
        trigger: {
          event: 'resume.saved',
        },
        action: {
          type: 'schedule_suggestion',
          module: 'resume',
          delayHours: 0,
          contextKey: 'resumeId',
          title: 'Resume ready to export',
          messageTemplate:
            'Your latest resume update is saved. Export the fresh PDF when you are ready.',
          priority: 1,
        },
      },
    });
  }
};

const analyzePatient = async ({ userId, patient }) => {
  const patientId = patient._id?.toString() || patient.patientId;
  const futureAppointments = (patient.appointments || [])
    .filter((appointment) => new Date(appointment.date) > new Date())
    .sort((left, right) => new Date(left.date) - new Date(right.date));

  if (!patient.history?.trim()) {
    await upsertSuggestion({
      userId,
      module: 'clinic',
      type: 'quality',
      title: 'Capture patient history',
      message: `${patient.name} has no history recorded yet. Fill it in now so follow-ups stay safer and easier.`,
      priority: 3,
      dedupeKey: `clinic:missing-history:${patientId}`,
    });
  } else {
    await resolvePendingSuggestions({
      userId,
      dedupeKey: `clinic:missing-history:${patientId}`,
    });
  }

  if (!futureAppointments.length) {
    await upsertSuggestion({
      userId,
      module: 'clinic',
      type: 'follow_up',
      title: 'Schedule a follow-up appointment',
      message: `${patient.name} does not have an upcoming appointment. Add one to keep care moving.`,
      priority: 2,
      dedupeKey: `clinic:no-upcoming-appointment:${patientId}`,
    });
  } else {
    await resolvePendingSuggestions({
      userId,
      dedupeKey: `clinic:no-upcoming-appointment:${patientId}`,
    });
  }

  if ((patient.appointments || []).length >= 3) {
    await upsertSuggestion({
      userId,
      module: 'clinic',
      type: 'alert',
      title: 'Frequent patient alert',
      message: `${patient.name} has ${(patient.appointments || []).length} appointments on file. Review their follow-up cadence for trends.`,
      priority: 1,
      dedupeKey: `clinic:frequent-patient:${patientId}`,
    });
  }

  const hasClinicAutomation = await hasAutomation(userId, 'clinic:auto-appointment-reminder');

  if (futureAppointments.length && !hasClinicAutomation) {
    await upsertSuggestion({
      userId,
      module: 'clinic',
      type: 'automation',
      title: 'Automate appointment reminders',
      message:
        'You are already scheduling appointments. Want Workyn to surface reminder prompts 24 hours before each visit?',
      priority: 2,
      dedupeKey: 'clinic:appointment-reminder-automation',
      automationPayload: {
        sourceKey: 'clinic:auto-appointment-reminder',
        name: 'Appointment reminder autopilot',
        description: 'Creates reminder suggestions before patient appointments.',
        trigger: {
          events: ['clinic.patient_created', 'clinic.patient_updated'],
        },
        action: {
          type: 'schedule_suggestion',
          module: 'clinic',
          dateField: 'patient.nextAppointmentDate',
          offsetHoursBefore: 24,
          fallbackDelayHours: 168,
          contextKey: 'patientId',
          title: 'Appointment reminder due',
          messageTemplate:
            '{{patient.name}} has an appointment coming up soon. Confirm details and send a reminder.',
          priority: 2,
        },
      },
    });
  }
};

export const detectInactiveLeads = async (userId) => {
  const staleLeads = await listInactiveLeads({
    userId,
    olderThan: new Date(Date.now() - 3 * DAY_IN_MS),
    limit: 12,
  });

  await Promise.all(
    staleLeads.map((lead) =>
      upsertSuggestion({
        userId,
        module: 'crm',
        type: 'follow_up',
        title: 'Lead follow-up looks overdue',
        message: `${lead.name} has been inactive for a few days. Reach out before momentum fades.`,
        priority: 2,
        dedupeKey: `crm:inactive-lead:${lead._id}`,
        context: {
          leadId: lead._id,
          leadName: lead.name,
        },
      }),
    ),
  );
};

export const runActionPatternAnalysis = async ({ userId, actionType, metadata = {} }) => {
  switch (actionType) {
    case 'chat.message_sent':
      await suggestRepeatedMessageTemplate({
        userId,
        message: metadata.message || '',
      });
      break;
    case 'crm.lead_created':
      await Promise.all([suggestLeadCadenceAutomation(userId), suggestLeadBulkAction(userId)]);
      break;
    case 'crm.lead_updated':
      await Promise.all([suggestLeadBulkAction(userId), suggestRepeatedLeadFieldEdits(userId)]);
      break;
    case 'resume.saved':
      await analyzeResume({
        userId,
        resumeData: metadata.resumeData || {},
        isNewResume: metadata.isNewResume,
      });
      break;
    case 'clinic.patient_created':
    case 'clinic.patient_updated':
      await analyzePatient({
        userId,
        patient: metadata.patient || {},
      });
      break;
    default:
      break;
  }
};

export const runScheduledAnalysis = async (activeUserIds = []) => {
  await Promise.all(activeUserIds.map((userId) => detectInactiveLeads(userId)));
};
