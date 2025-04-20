// Schema Validator Script
// This script validates the structured data on key pages to ensure it complies with schema.org standards

import axios from 'axios';

const SCHEMA_ORG_CONTEXT = 'https://schema.org';
const REQUIRED_TYPES = ['JobPosting', 'WebSite', 'Organization', 'WebApplication'];

interface SchemaFields {
  [key: string]: string[];
}

// Basic validation for required fields by type
const REQUIRED_FIELDS: SchemaFields = {
  JobPosting: ['title', 'description', 'datePosted', 'hiringOrganization', 'jobLocation'],
  Organization: ['name', 'url'],
  WebSite: ['name', 'url'],
  WebApplication: ['name', 'applicationCategory']
};

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// Function to extract JSON-LD from HTML
const extractJsonLd = (html: string): any[] => {
  const jsonLdRegex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  const results: any[] = [];
  let match;
  
  while ((match = jsonLdRegex.exec(html)) !== null) {
    try {
      const jsonData = JSON.parse(match[1]);
      results.push(jsonData);
    } catch (error) {
      console.error('Error parsing JSON-LD:', error);
    }
  }
  
  return results;
};

// Function to validate JSON-LD against schema.org requirements
const validateJsonLd = (jsonLd: any): ValidationResult => {
  const errors: string[] = [];
  
  // Check for context
  if (!jsonLd['@context'] || !jsonLd['@context'].includes(SCHEMA_ORG_CONTEXT)) {
    errors.push('Missing or invalid @context. Should include https://schema.org');
  }
  
  // Check for type
  if (!jsonLd['@type']) {
    errors.push('Missing @type property');
    return { valid: errors.length === 0, errors };
  }
  
  // Check required fields based on type
  const type = jsonLd['@type'] as string;
  if (REQUIRED_TYPES.includes(type) && REQUIRED_FIELDS[type]) {
    REQUIRED_FIELDS[type].forEach((field: string) => {
      if (!jsonLd[field]) {
        errors.push(`Missing required field '${field}' for type '${type}'`);
      }
    });
  }
  
  return { valid: errors.length === 0, errors };
};

// Function to crawl a URL and validate its structured data
const validateUrlStructuredData = async (url: string): Promise<boolean> => {
  try {
    console.log(`Validating structured data for ${url}...`);
    const response = await axios.get(url);
    const jsonLdObjects = extractJsonLd(response.data);
    
    if (jsonLdObjects.length === 0) {
      console.log(`❌ No JSON-LD found at ${url}`);
      return false;
    }
    
    let allValid = true;
    
    jsonLdObjects.forEach((jsonLd, index) => {
      const { valid, errors } = validateJsonLd(jsonLd);
      
      if (!valid) {
        console.log(`❌ Invalid JSON-LD #${index + 1} at ${url}:`);
        errors.forEach(error => console.log(`  - ${error}`));
        allValid = false;
      } else {
        console.log(`✅ Valid JSON-LD #${index + 1} of type '${jsonLd['@type']}' at ${url}`);
      }
    });
    
    return allValid;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Error validating ${url}:`, error.message);
    } else {
      console.error(`Unknown error validating ${url}`);
    }
    return false;
  }
};

// Main function to validate structured data on key pages
const validateStructuredData = async (): Promise<void> => {
  const urlsToValidate = [
    'https://www.etherealjobs.com/',
    'https://www.etherealjobs.com/jobs',
    'https://www.etherealjobs.com/resume',
    // Add any specific job URLs you want to validate
    // 'https://www.etherealjobs.com/job/example-job-id',
  ];
  
  console.log('Starting structured data validation...');
  
  let allValid = true;
  
  for (const url of urlsToValidate) {
    const isValid = await validateUrlStructuredData(url);
    if (!isValid) allValid = false;
  }
  
  if (allValid) {
    console.log('✅ All structured data is valid.');
  } else {
    console.log('❌ Some structured data is invalid. See errors above.');
  }
};

// Run directly in Node.js environment
if (typeof process !== 'undefined' && process.argv[1] === import.meta.url) {
  validateStructuredData();
}

export default validateStructuredData;