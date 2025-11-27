'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

;

/**
 * JSON-LD Structured Data for SEO
 * Implements Schema.org markup for organisation and website
 */

interface OrganisationSchemaProps {
  name?: string;
  url?: string;
  logo?: string;
  description?: string;
  foundingDate?: string;
  founder?: string;
  contactEmail?: string;
  telephone?: string;
  address?: {
    streetAddress?: string;
    addressLocality?: string;
    postalCode?: string;
    addressCountry?: string;
  };
  sameAs?: string[];
}

export function OrganisationSchema({
  name = 'EdPsych Connect Limited',
  url = 'https://www.edpsychconnect.com',
  logo = 'https://www.edpsychconnect.com/logo.png',
  description = 'AI-powered educational psychology platform for UK schools, Local Authorities, and Educational Psychologists.',
  foundingDate = '2023',
  founder = 'Dr Scott I-Patrick',
  contactEmail = 'help@edpsychconnect.com',
  address = {
    addressCountry: 'GB',
  },
  sameAs = [],
}: OrganisationSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organisation',
    name,
    url,
    logo,
    description,
    foundingDate,
    founder: {
      '@type': 'Person',
      name: founder,
      jobTitle: 'Educational Psychologist',
      honorificPrefix: 'Dr',
      honorificSuffix: 'DEdPsych CPsychol',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: contactEmail,
      availableLanguage: ['English', 'Welsh'],
    },
    address: {
      '@type': 'PostalAddress',
      ...address,
    },
    sameAs,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface WebsiteSchemaProps {
  name?: string;
  url?: string;
  description?: string;
}

export function WebsiteSchema({
  name = 'EdPsych Connect',
  url = 'https://www.edpsychconnect.com',
  description = 'AI-powered educational psychology platform for SEND support and assessment.',
}: WebsiteSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
    description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${url}/en/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    inLanguage: ['en-GB', 'cy'],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface SoftwareApplicationSchemaProps {
  name?: string;
  description?: string;
  url?: string;
  applicationCategory?: string;
  operatingSystem?: string;
  offers?: {
    price?: string;
    priceCurrency?: string;
    priceValidUntil?: string;
  };
}

export function SoftwareApplicationSchema({
  name = 'EdPsych Connect',
  description = 'AI-powered educational psychology platform with SEND assessments, EHCP support, and collaborative tools.',
  url = 'https://www.edpsychconnect.com',
  applicationCategory = 'EducationalApplication',
  operatingSystem = 'Web browser',
  offers = {
    price: '0',
    priceCurrency: 'GBP',
    priceValidUntil: '2025-12-31',
  },
}: SoftwareApplicationSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    description,
    url,
    applicationCategory,
    operatingSystem,
    offers: {
      '@type': 'Offer',
      ...offers,
      availability: 'https://schema.org/OnlineOnly',
    },
    author: {
      '@type': 'Organisation',
      name: 'EdPsych Connect Limited',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '50',
      bestRating: '5',
      worstRating: '1',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSchemaProps {
  items: FAQItem[];
}

export function FAQSchema({ items }: FAQSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface ArticleSchemaProps {
  headline: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
  url: string;
}

export function ArticleSchema({
  headline,
  description,
  image,
  datePublished,
  dateModified,
  author = 'Dr Scott I-Patrick',
  url,
}: ArticleSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    image: image || 'https://www.edpsychconnect.com/og-image.png',
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Person',
      name: author,
      url: 'https://www.edpsychconnect.com/en/about',
    },
    publisher: {
      '@type': 'Organisation',
      name: 'EdPsych Connect Limited',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.edpsychconnect.com/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface EducationalOrganisationSchemaProps {
  name?: string;
  url?: string;
  description?: string;
}

export function EducationalOrganisationSchema({
  name = 'EdPsych Connect',
  url = 'https://www.edpsychconnect.com',
  description = 'Platform providing AI-powered educational psychology assessments and SEND support for UK schools.',
}: EducationalOrganisationSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganisation',
    name,
    url,
    description,
    areaServed: {
      '@type': 'Country',
      name: 'United Kingdom',
    },
    educationalCredentialAwarded: [
      'EHCP Assessment Support',
      'SEND Assessment Reports',
      'Educational Psychology Consultation',
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Educational Psychology Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Cognitive Assessment Tools',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'SEND Support Services',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'EHCP Evidence Gathering',
          },
        },
      ],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
