// Sitemap submission script
// This script sends an HTTP request to notify search engines about our sitemap
// It should be run after generating a new sitemap

import axios from 'axios';

interface SearchEngine {
  name: string;
  submitUrl: string;
}

const SEARCH_ENGINES: SearchEngine[] = [
  {
    name: 'Google',
    submitUrl: 'https://www.google.com/ping?sitemap=https://www.etherealjobs.com/sitemap.xml'
  },
  {
    name: 'Bing',
    submitUrl: 'https://www.bing.com/ping?sitemap=https://www.etherealjobs.com/sitemap.xml'
  }
];

async function submitSitemapToSearchEngines(): Promise<void> {
  console.log('Submitting sitemap to search engines...');
  
  for (const engine of SEARCH_ENGINES) {
    try {
      console.log(`Submitting to ${engine.name}...`);
      const response = await axios.get(engine.submitUrl);
      
      if (response.status >= 200 && response.status < 300) {
        console.log(`✅ Successfully submitted sitemap to ${engine.name}.`);
      } else {
        console.log(`❌ Failed to submit sitemap to ${engine.name}. Status: ${response.status}`);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`❌ Error submitting sitemap to ${engine.name}:`, error.message);
      } else {
        console.error(`❌ Unknown error submitting sitemap to ${engine.name}`);
      }
    }
  }
}

// Run when imported directly
if (typeof process !== 'undefined' && process.argv[1] === import.meta.url) {
  submitSitemapToSearchEngines();
}

export default submitSitemapToSearchEngines;