import React from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
}

const SEO: React.FC<SEOProps> = ({
  title = 'QUANTUM HEALTH - Advanced Healthcare Management Platform',
  description = 'Revolutionary healthcare management platform connecting patients and doctors. Secure messaging, digital records, appointment booking, and comprehensive health tracking.',
  keywords = 'healthcare management, patient portal, doctor portal, medical appointments, health records, telemedicine, healthcare platform, medical reports, patient communication, healthcare technology',
  image = '/assets/QuantumHealth_Logo.png',
  url = 'https://quantumhealth.quantum-climb.com/',
  type = 'website',
  author = 'QuantumHealth Team',
  publishedTime,
  modifiedTime,
  section,
  tags = []
}) => {
  const fullTitle = title.includes('QUANTUM HEALTH') ? title : `${title} | QUANTUM HEALTH`;
  
  return (
    <>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="distribution" content="global" />
      <meta name="rating" content="general" />

      {/* Canonical URL */}
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="QUANTUM HEALTH" />
      <meta property="og:locale" content="en_US" />
      {author && <meta property="og:author" content={author} />}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {section && <meta property="article:section" content={section} />}
      {tags.map((tag, index) => (
        <meta key={index} property="article:tag" content={tag} />
      ))}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@quantumhealth" />
      <meta name="twitter:creator" content="@quantumclimb" />

      {/* Additional SEO */}
      <meta name="theme-color" content="#14b8a6" />
      <meta name="msapplication-TileColor" content="#14b8a6" />
      <meta name="application-name" content="QUANTUM HEALTH" />

      {/* Structured Data for Healthcare Organization */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HealthcareOrganization",
            "name": "QUANTUM HEALTH",
            "description": description,
            "url": url,
            "logo": image,
            "sameAs": [
              "https://twitter.com/quantumhealth",
              "https://linkedin.com/company/quantumhealth"
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+1-123-456-7890",
              "contactType": "customer service",
              "availableLanguage": "English"
            },
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "US"
            },
            "serviceType": [
              "Healthcare Management Platform",
              "Patient Portal",
              "Doctor Portal",
              "Medical Appointments",
              "Health Records Management"
            ]
          })
        }}
      />
    </>
  );
};

export default SEO; 