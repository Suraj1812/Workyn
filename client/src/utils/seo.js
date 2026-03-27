export const SITE_NAME = 'Workyn';

export const DEFAULT_TITLE =
  'Workyn | AI-Powered SaaS for Chat, CRM, Hiring, and Clinic Operations';

export const DEFAULT_DESCRIPTION =
  'Workyn is an AI-powered SaaS platform that unifies real-time team chat, CRM workflows, resume building, clinic operations, analytics, automation, and collaboration in one workspace.';

export const DEFAULT_KEYWORDS = [
  'Workyn',
  'AI SaaS platform',
  'team chat software',
  'CRM software',
  'resume builder',
  'clinic management software',
  'patient management system',
  'workspace collaboration',
  'business productivity platform',
  'startup operations software',
];

export const DEFAULT_OG_IMAGE = '/og-image.svg';

export const INDEXABLE_ROBOTS =
  'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

export const NOINDEX_ROBOTS = 'noindex, nofollow, noarchive';

export const getSiteUrl = () => {
  const configuredUrl = import.meta.env.VITE_SITE_URL;

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/$/, '');
  }

  return 'https://workyn.app';
};

export const buildAbsoluteUrl = (path = '/') => new URL(path, `${getSiteUrl()}/`).toString();

export const mergeKeywords = (...keywordGroups) =>
  [...new Set(keywordGroups.flat().filter(Boolean))].join(', ');

export const buildOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: buildAbsoluteUrl('/'),
  logo: buildAbsoluteUrl('/icon.svg'),
  image: buildAbsoluteUrl(DEFAULT_OG_IMAGE),
  description: DEFAULT_DESCRIPTION,
});

export const buildWebsiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: buildAbsoluteUrl('/'),
  description: DEFAULT_DESCRIPTION,
  inLanguage: 'en',
});

export const buildSoftwareApplicationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: SITE_NAME,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: buildAbsoluteUrl('/'),
  image: buildAbsoluteUrl(DEFAULT_OG_IMAGE),
  description: DEFAULT_DESCRIPTION,
  offers: [
    {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      category: 'Free',
    },
    {
      '@type': 'Offer',
      price: '29',
      priceCurrency: 'USD',
      category: 'Pro',
    },
  ],
  featureList: [
    'Real-time team chat',
    'CRM pipeline and lead tracking',
    'Resume builder with PDF export',
    'Clinic and patient management',
    'Workspace analytics',
    'Rule-based in-house AI automation',
  ],
});

export const buildFaqSchema = (questions = []) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: questions.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
});

export const buildWebPageSchema = ({ title, description, path = '/' }) => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: title,
  description,
  url: buildAbsoluteUrl(path),
  isPartOf: {
    '@type': 'WebSite',
    name: SITE_NAME,
    url: buildAbsoluteUrl('/'),
  },
});
