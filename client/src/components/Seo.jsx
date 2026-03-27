import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import {
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  DEFAULT_OG_IMAGE,
  DEFAULT_TITLE,
  INDEXABLE_ROBOTS,
  SITE_NAME,
  buildAbsoluteUrl,
  buildWebPageSchema,
  mergeKeywords,
} from '../utils/seo.js';

const upsertMeta = (attribute, key, content) => {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
};

const upsertLink = (rel, href) => {
  let element = document.head.querySelector(`link[rel="${rel}"]`);

  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }

  element.setAttribute('href', href);
};

const upsertStructuredData = (schema) => {
  const scriptId = 'workyn-structured-data';
  let element = document.head.querySelector(`#${scriptId}`);

  if (!element) {
    element = document.createElement('script');
    element.setAttribute('id', scriptId);
    element.setAttribute('type', 'application/ld+json');
    document.head.appendChild(element);
  }

  element.textContent = JSON.stringify(schema);
};

const Seo = ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  image = DEFAULT_OG_IMAGE,
  path,
  type = 'website',
  robots = INDEXABLE_ROBOTS,
  structuredData,
}) => {
  const location = useLocation();

  useEffect(() => {
    const pageTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
    const resolvedPath = path || `${location.pathname}${location.search || ''}`;
    const canonicalUrl = buildAbsoluteUrl(resolvedPath);
    const imageUrl = image.startsWith('http') ? image : buildAbsoluteUrl(image);
    const schema =
      structuredData || buildWebPageSchema({ title: pageTitle, description, path: resolvedPath });

    document.title = pageTitle;
    document.documentElement.lang = 'en';

    upsertMeta('name', 'description', description);
    upsertMeta('name', 'keywords', mergeKeywords(DEFAULT_KEYWORDS, keywords));
    upsertMeta('name', 'robots', robots);
    upsertMeta('name', 'googlebot', robots);
    upsertMeta('name', 'application-name', SITE_NAME);
    upsertMeta('name', 'apple-mobile-web-app-title', SITE_NAME);
    upsertMeta('name', 'author', SITE_NAME);
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', pageTitle);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', imageUrl);
    upsertMeta('property', 'og:title', pageTitle);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:url', canonicalUrl);
    upsertMeta('property', 'og:image', imageUrl);
    upsertMeta('property', 'og:image:alt', `${SITE_NAME} brand preview`);
    upsertMeta('property', 'og:site_name', SITE_NAME);
    upsertMeta('property', 'og:locale', 'en_US');
    upsertLink('canonical', canonicalUrl);
    upsertStructuredData(Array.isArray(schema) ? schema : [schema]);
  }, [
    description,
    image,
    keywords,
    location.pathname,
    location.search,
    path,
    robots,
    structuredData,
    title,
    type,
  ]);

  return null;
};

export default Seo;
