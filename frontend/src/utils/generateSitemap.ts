// Sitemap Generator for Ethereal Jobs
// This script generates a sitemap.xml file by crawling the app's routes
// Run this script periodically to keep the sitemap updated

import fs from 'node:fs';
import path from 'node:path';
import { format } from 'date-fns';
import { fileURLToPath } from 'node:url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base URL of the site
const baseUrl = 'https://www.etherealjobs.com';

// Function to generate sitemap entries
const generateSitemapEntry = (
  url: string, 
  lastmod: Date, 
  changefreq: string, 
  priority: string, 
  alternateUrl: string | null = null
): string => {
  const dateStr = format(new Date(lastmod), 'yyyy-MM-dd');
  
  let entry = `  <url>\n`;
  entry += `    <loc>${url}</loc>\n`;
  entry += `    <lastmod>${dateStr}</lastmod>\n`;
  entry += `    <changefreq>${changefreq}</changefreq>\n`;
  entry += `    <priority>${priority}</priority>\n`;
  
  if (alternateUrl) {
    entry += `    <xhtml:link rel="alternate" hreflang="en" href="${alternateUrl}"/>\n`;
  }
  
  entry += `  </url>\n`;
  return entry;
};

// Main static routes with their configurations
const staticRoutes = [
  { path: '/', lastmod: new Date(), changefreq: 'weekly', priority: '1.0' },
  { path: '/jobs', lastmod: new Date(), changefreq: 'daily', priority: '0.9' },
  { path: '/resume', lastmod: new Date(), changefreq: 'weekly', priority: '0.8' },
  { path: '/onboarding', lastmod: new Date(), changefreq: 'monthly', priority: '0.7' },
  { path: '/reset-password', lastmod: new Date(), changefreq: 'yearly', priority: '0.5' },
  { path: '/verify-email', lastmod: new Date(), changefreq: 'yearly', priority: '0.5' },
];

// Generate sitemap XML content
const generateSitemap = async (): Promise<void> => {
  try {
    let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    sitemapContent += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" \n`;
    sitemapContent += `        xmlns:xhtml="http://www.w3.org/1999/xhtml"\n`;
    sitemapContent += `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;
    
    // Add static routes
    staticRoutes.forEach(route => {
      const url = `${baseUrl}${route.path}`;
      const alternateUrl = route.path === '/' 
        ? 'https://etherealjobs.com/' 
        : `https://etherealjobs.com${route.path}`;
      
      sitemapContent += generateSitemapEntry(
        url, 
        route.lastmod, 
        route.changefreq, 
        route.priority,
        alternateUrl
      );
    });
    
    // TODO: Add dynamic job listings by fetching from the database
    // This would require connecting to your database and pulling the latest job IDs
    // For example:
    // const jobIds = await fetchJobIdsFromDatabase();
    // jobIds.forEach(id => {
    //   sitemapContent += generateSitemapEntry(
    //     `${baseUrl}/job/${id}`,
    //     new Date(),
    //     'weekly',
    //     '0.8',
    //     `https://etherealjobs.com/job/${id}`
    //   );
    // });
    
    sitemapContent += `</urlset>`;
    
    // Write the sitemap to file
    const outputPath = path.resolve(__dirname, '../../public/sitemap.xml');
    fs.writeFileSync(outputPath, sitemapContent);
    console.log(`Sitemap generated successfully at ${outputPath}`);
    
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }
};

// Run the generator
generateSitemap();

export default generateSitemap;