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
  senderId: mapUserRef(row, 'sender_'),
  receiverId: mapUserRef(row, 'receiver_'),
  message: row.message,
  timestamp: row.timestamp,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const mapLead = (row) => ({
  id: row.id,
  _id: row.id,
  name: row.name,
  status: row.status,
  notes: row.notes,
  createdBy: row.created_by,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const mapResume = (row) => ({
  id: row.id,
  _id: row.id,
  userId: row.user_id,
  data: row.data,
  template: row.template,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const mapPatient = (row) => ({
  id: row.id,
  _id: row.id,
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
