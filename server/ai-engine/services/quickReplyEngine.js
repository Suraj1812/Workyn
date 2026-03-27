import { listChatTemplateAutomations } from '../../repositories/aiRepository.js';
import { findLatestIncomingMessage } from '../../repositories/chatsRepository.js';
import { normalizeText } from '../utils/normalizers.js';

const keywordRules = [
  {
    match: ['meeting', 'call', 'schedule', 'available'],
    replies: [
      'I can make time today. What slot works best?',
      'Thanks for the note. Let me confirm and get back to you shortly.',
      'Yes, I am available. Please share a preferred time.',
    ],
  },
  {
    match: ['resume', 'cv', 'profile'],
    replies: [
      'I will send the updated resume shortly.',
      'Thanks. I am polishing the latest version now.',
      'I can share the latest profile in a few minutes.',
    ],
  },
  {
    match: ['thanks', 'thank you', 'appreciate'],
    replies: ['You are welcome.', 'Happy to help.', 'Glad this helped.'],
  },
  {
    match: ['patient', 'appointment', 'clinic', 'visit'],
    replies: [
      'I will review the appointment details and update you soon.',
      'Thanks. I will confirm the next available slot.',
      'I have noted this and will follow up shortly.',
    ],
  },
];

const uniqueReplies = (replies) => {
  const seen = new Set();

  return replies.filter((reply) => {
    const key = normalizeText(reply.text);
    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

export const getChatQuickReplies = async ({ userId, contactId }) => {
  const [recentIncomingMessage, activeTemplateAutomations] = await Promise.all([
    findLatestIncomingMessage({
      userId,
      contactId,
    }),
    listChatTemplateAutomations(userId, 4),
  ]);

  const normalizedIncomingMessage = normalizeText(recentIncomingMessage?.message || '');
  const matchedRule =
    keywordRules.find((rule) =>
      rule.match.some((keyword) => normalizedIncomingMessage.includes(normalizeText(keyword))),
    ) || null;

  const heuristicReplies = matchedRule
    ? matchedRule.replies.map((text) => ({ source: 'pattern', text }))
    : [
        { source: 'pattern', text: 'Thanks for the update. I will review it today.' },
        { source: 'pattern', text: 'Noted. I will get back to you shortly.' },
        { source: 'pattern', text: 'Sounds good. Let us keep moving on this.' },
      ];

  const templateReplies = activeTemplateAutomations.map((automation) => ({
    source: 'template',
    text: automation.action.templateText,
    label: automation.action.label || automation.name,
  }));

  return uniqueReplies([...templateReplies, ...heuristicReplies]).slice(0, 6);
};
