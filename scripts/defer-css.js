
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.resolve(__dirname, '../dist');
const htmlPath = path.resolve(distDir, 'index.html');

if (!fs.existsSync(htmlPath)) {
    console.error('index.html not found in dist directory. Run build first.');
    process.exit(1);
}

let html = fs.readFileSync(htmlPath, 'utf8');

// Find the main CSS link
// Pattern: <link rel="stylesheet" crossorigin href="/assets/index-....css">
const cssLinkRegex = /<link rel="stylesheet"([^>]*?)href="([^"]*?\.css)"([^>]*?)>/g;

html = html.replace(cssLinkRegex, (match, p1, href, p3) => {
    console.log(`Deferring CSS: ${href}`);
    // Convert to preload with onload handler to swap to stylesheet
    // This makes it non-render-blocking
    return `<link rel="preload" as="style" href="${href}"${p1}${p3} onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="${href}"${p1}${p3}></noscript>`;
});

fs.writeFileSync(htmlPath, html);
console.log('CSS deferred successfully in index.html');
