import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOMAIN = 'https://allrentr.com';
const TODAY = new Date().toISOString().split('T')[0];

const staticRoutes = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/listings', priority: '0.9', changefreq: 'daily' },
  { path: '/blog', priority: '0.9', changefreq: 'daily' },
  { path: '/about', priority: '0.8', changefreq: 'monthly' },
  { path: '/contact', priority: '0.8', changefreq: 'monthly' },
  { path: '/submit-listing', priority: '0.8', changefreq: 'weekly' },
  { path: '/leaderboard', priority: '0.7', changefreq: 'weekly' },
  { path: '/signup', priority: '0.7', changefreq: 'monthly' },
  { path: '/login', priority: '0.7', changefreq: 'monthly' },
  { path: '/privacy-policy', priority: '0.6', changefreq: 'monthly' },
  { path: '/terms-and-conditions', priority: '0.6', changefreq: 'monthly' },
];

const blogSlugs = [
  'peer-to-peer-equipment-rentals-guide',
  'renting-vs-buying-electronics-and-tools',
  'turn-idle-photography-gear-into-passive-income',
  'circular-economy-equipment-sharing-sustainability',
  'top-10-high-demand-items-to-rent-out',
  'essential-safety-protocols-inspecting-rented-gear',
  'home-renovation-budget-rent-power-tools',
  'how-to-write-airtight-rental-agreement',
  'camera-gear-rental-independent-filmmakers',
  'event-planning-audio-visual-stage-rentals',
  'understanding-security-deposits-equipment-insurance',
  'camping-outdoor-gear-sharing-guide',
  'delivery-logistics-local-equipment-rentals',
  'smart-consumer-questions-to-ask-equipment-owners',
  'how-to-price-rental-equipment-profitability'
];

const allUrls = [
  ...staticRoutes.map(r => `  <url>
    <loc>${DOMAIN}${r.path}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`),
  ...blogSlugs.map(slug => `  <url>
    <loc>${DOMAIN}/blog/${slug}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`)
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.join('\n')}
</urlset>
`;

const publicDir = path.resolve(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);
console.log('sitemap.xml generated with ' + (staticRoutes.length + blogSlugs.length) + ' URLs!');

const robots = `User-agent: *
Allow: /
Sitemap: ${DOMAIN}/sitemap.xml
`;

fs.writeFileSync(path.join(publicDir, 'robots.txt'), robots);
console.log('robots.txt generated!');
