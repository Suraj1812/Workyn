import { body, param, query } from 'express-validator';

const optionalPageQuery = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];

export const registerValidation = [
  body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Name is required.'),
  body('email').trim().isEmail().normalizeEmail().withMessage('A valid email is required.'),
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be at least 8 characters long.'),
];

export const loginValidation = [
  body('email').trim().isEmail().normalizeEmail().withMessage('A valid email is required.'),
  body('password').isLength({ min: 8, max: 128 }).withMessage('Password is required.'),
];

export const sendMessageValidation = [
  body('receiverId').trim().isUUID().withMessage('Receiver is required.'),
  body('message').trim().isLength({ min: 1, max: 4000 }).withMessage('Message is required.'),
  body('messageType').optional().isIn(['text', 'file']),
];

export const listMessagesValidation = [
  query('contactId').optional().trim().isUUID(),
  ...optionalPageQuery,
];

export const leadValidation = [
  body('name').trim().isLength({ min: 2, max: 120 }).withMessage('Lead name is required.'),
  body('status').optional().isIn(['New', 'Contacted', 'Converted']),
  body('notes').optional().isLength({ max: 4000 }),
  body('assignedTo').optional({ values: 'falsy' }).isUUID(),
  body('followUpAt').optional({ values: 'falsy' }).isISO8601(),
];

export const updateLeadValidation = [
  param('id').trim().isUUID(),
  body('name').optional().trim().isLength({ min: 2, max: 120 }),
  body('status').optional().isIn(['New', 'Contacted', 'Converted']),
  body('notes').optional().isLength({ max: 4000 }),
  body('assignedTo').optional({ values: 'falsy' }).isUUID(),
  body('followUpAt').optional({ values: 'falsy' }).isISO8601(),
];

export const leadListValidation = [
  query('status').optional().isIn(['New', 'Contacted', 'Converted']),
  query('search').optional().trim().isLength({ min: 1, max: 100 }),
  query('assignedTo').optional().isUUID(),
  query('mine').optional().isBoolean().toBoolean(),
  ...optionalPageQuery,
];

export const patientValidation = [
  body('name').trim().isLength({ min: 2, max: 120 }).withMessage('Patient name is required.'),
  body('age').isInt({ min: 0, max: 130 }).toInt(),
  body('history').optional().isLength({ max: 5000 }),
  body('appointments').optional().isArray(),
];

export const updatePatientValidation = [
  param('id').trim().isUUID(),
  body('name').optional().trim().isLength({ min: 2, max: 120 }),
  body('age').optional().isInt({ min: 0, max: 130 }).toInt(),
  body('history').optional().isLength({ max: 5000 }),
  body('appointments').optional().isArray(),
];

export const patientListValidation = [
  query('search').optional().trim().isLength({ min: 1, max: 100 }),
  query('mine').optional().isBoolean().toBoolean(),
  ...optionalPageQuery,
];

export const resumeValidation = [
  body('template').optional().isLength({ min: 2, max: 40 }),
  body('data').isObject().withMessage('Resume data is required.'),
];

export const workspaceInviteValidation = [
  body('email').trim().isEmail().normalizeEmail().withMessage('A valid email is required.'),
  body('role').optional().isIn(['admin', 'member']),
];

export const workspaceSwitchValidation = [body('workspaceId').trim().isUUID()];

export const invitationAcceptValidation = [param('token').trim().isLength({ min: 20 })];

export const workspaceUpdateValidation = [
  body('name').optional().trim().isLength({ min: 2, max: 120 }),
  body('billingEmail').optional({ values: 'falsy' }).isEmail().normalizeEmail(),
];

export const searchValidation = [
  query('q').trim().isLength({ min: 1, max: 100 }).withMessage('Search term is required.'),
  query('limit').optional().isInt({ min: 1, max: 20 }).toInt(),
];

export const notificationListValidation = [
  query('unreadOnly').optional().isBoolean().toBoolean(),
  ...optionalPageQuery,
];

export const notificationParamValidation = [param('id').trim().isUUID()];

export const billingCheckoutValidation = [
  body('plan').isIn(['pro']).withMessage('Unsupported plan.'),
];

export const uploadValidation = [
  body('module').optional().isIn(['chat', 'profile', 'crm', 'clinic', 'resume']),
];

export const activityListValidation = [
  query('module').optional().isIn(['auth', 'chat', 'crm', 'clinic', 'resume', 'team', 'billing']),
  ...optionalPageQuery,
];
