import { randomUUID } from 'node:crypto';

export const createId = () => randomUUID();

export const buildUpdateClause = (payload, fieldMap, startIndex = 1) => {
  const entries = Object.entries(payload).filter(
    ([key, value]) => fieldMap[key] && value !== undefined,
  );

  if (!entries.length) {
    return {
      clause: '',
      values: [],
      nextIndex: startIndex,
    };
  }

  const values = [];
  const setFragments = entries.map(([key, value], index) => {
    const config = fieldMap[key];
    const parameterIndex = startIndex + index;
    values.push(config.transform ? config.transform(value) : value);
    return `${config.column} = $${parameterIndex}${config.cast ? `::${config.cast}` : ''}`;
  });

  return {
    clause: setFragments.join(', '),
    values,
    nextIndex: startIndex + entries.length,
  };
};

export const mapUser = (row, { includePassword = false } = {}) => ({
  id: row.id,
  _id: row.id,
  name: row.name,
  email: row.email,
  role: row.role,
  avatarUrl: row.avatar_url,
  currentWorkspaceId: row.current_workspace_id,
  lastLoginAt: row.last_login_at,
  ...(includePassword ? { password: row.password } : {}),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapUserRef = (row, prefix) => ({
  id: row[`${prefix}id`],
  _id: row[`${prefix}id`],
  name: row[`${prefix}name`],
  email: row[`${prefix}email`],
});

export const mapChat = (row) => ({
  id: row.id,
  _id: row.id,
  workspaceId: row.workspace_id,
  senderId: mapUserRef(row, 'sender_'),
  receiverId: mapUserRef(row, 'receiver_'),
  message: row.message,
  messageType: row.message_type,
  attachment: row.attachment || null,
  timestamp: row.timestamp,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const mapLead = (row) => ({
  id: row.id,
  _id: row.id,
  workspaceId: row.workspace_id,
  name: row.name,
  status: row.status,
  notes: row.notes,
  assignedTo: row.assigned_to,
  followUpAt: row.follow_up_at,
  createdBy: row.created_by,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const mapResume = (row) => ({
  id: row.id,
  _id: row.id,
  workspaceId: row.workspace_id,
  userId: row.user_id,
  data: row.data,
  template: row.template,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const mapPatient = (row) => ({
  id: row.id,
  _id: row.id,
  workspaceId: row.workspace_id,
  name: row.name,
  age: row.age,
  history: row.history,
  appointments: Array.isArray(row.appointments) ? row.appointments : [],
  createdBy: row.created_by,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const mapUserAction = (row) => ({
  id: row.id,
  _id: row.id,
  workspaceId: row.workspace_id,
  userId: row.user_id,
  module: row.module,
  actionType: row.action_type,
  metadata: row.metadata || {},
  timestamp: row.timestamp,
  createdAt: row.created_at,
});

export const mapAutomation = (row) => ({
  id: row.id,
  _id: row.id,
  workspaceId: row.workspace_id,
  userId: row.user_id,
  name: row.name,
  description: row.description,
  trigger: row.trigger_config || {},
  action: row.action_config || {},
  active: row.active,
  sourceSuggestion: row.source_suggestion_id,
  sourceKey: row.source_key,
  runsCount: row.runs_count,
  lastExecutedAt: row.last_executed_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const mapSuggestion = (row) => ({
  id: row.id,
  _id: row.id,
  workspaceId: row.workspace_id,
  userId: row.user_id,
  module: row.module,
  type: row.type,
  title: row.title,
  message: row.message,
  accepted: row.accepted,
  status: row.status,
  priority: row.priority,
  context: row.context_data || {},
  dedupeKey: row.dedupe_key,
  availableAt: row.available_at,
  automationPayload: row.automation_payload,
  sourceAutomation: row.source_automation_id,
  respondedAt: row.responded_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const mapWorkspace = (row) => ({
  id: row.id,
  _id: row.id,
  name: row.name,
  slug: row.slug,
  ownerUserId: row.owner_user_id,
  billingEmail: row.billing_email,
  plan: row.plan,
  subscriptionStatus: row.subscription_status,
  stripeCustomerId: row.stripe_customer_id,
  stripeSubscriptionId: row.stripe_subscription_id,
  currentPeriodEnd: row.current_period_end,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const mapWorkspaceMembership = (row) => ({
  id: row.id,
  _id: row.id,
  workspaceId: row.workspace_id,
  userId: row.user_id,
  role: row.role,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  user:
    row.member_id || row.member_name || row.member_email
      ? {
          id: row.member_id,
          _id: row.member_id,
          name: row.member_name,
          email: row.member_email,
          avatarUrl: row.member_avatar_url,
          appRole: row.member_role,
        }
      : undefined,
});

export const mapWorkspaceInvitation = (row) => ({
  id: row.id,
  _id: row.id,
  workspaceId: row.workspace_id,
  email: row.email,
  role: row.role,
  token: row.token,
  invitedBy: row.invited_by,
  acceptedBy: row.accepted_by,
  status: row.status,
  expiresAt: row.expires_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const mapNotification = (row) => ({
  id: row.id,
  _id: row.id,
  workspaceId: row.workspace_id,
  userId: row.user_id,
  type: row.type,
  title: row.title,
  message: row.message,
  link: row.link,
  metadata: row.metadata || {},
  isRead: row.is_read,
  readAt: row.read_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const mapActivityLog = (row) => ({
  id: row.id,
  _id: row.id,
  workspaceId: row.workspace_id,
  userId: row.user_id,
  module: row.module,
  action: row.action,
  entityType: row.entity_type,
  entityId: row.entity_id,
  description: row.description,
  metadata: row.metadata || {},
  createdAt: row.created_at,
  actor:
    row.actor_id || row.actor_name || row.actor_email
      ? {
          id: row.actor_id,
          _id: row.actor_id,
          name: row.actor_name,
          email: row.actor_email,
        }
      : undefined,
});

export const mapFileRecord = (row) => ({
  id: row.id,
  _id: row.id,
  workspaceId: row.workspace_id,
  userId: row.user_id,
  module: row.module,
  fileName: row.file_name,
  mimeType: row.mime_type,
  sizeBytes: Number(row.size_bytes || 0),
  url: row.url,
  publicId: row.public_id,
  provider: row.provider,
  resourceType: row.resource_type,
  metadata: row.metadata || {},
  createdAt: row.created_at,
});
