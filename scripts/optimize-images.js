
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ASSETS_DIR = path.resolve(__dirname, '../src/assets');

async function optimizeImages() {
    if (!fs.existsSync(ASSETS_DIR)) {
        console.error(`Assets directory not found at ${ASSETS_DIR}`);
        return;
    }

    const files = fs.readdirSync(ASSETS_DIR);

    for (const file of files) {
        if (file.match(/\.(jpg|jpeg|png)$/i)) {
            const inputPath = path.join(ASSETS_DIR, file);
            const filename = path.parse(file).name;
            const webpPath = path.join(ASSETS_DIR, `${filename}.webp`);

            console.log(`Optimizing ${file}...`);

            let pipeline = sharp(inputPath);
            let quality = 80;

            // Specific rules
            // Specific rules
            if (filename.toLowerCase().includes('hero') || filename.includes('dashboard')) {
                pipeline = pipeline.resize({ width: 800, withoutEnlargement: true });
                quality = 65; // High compression for LCP image
            } else if (filename.toLowerCase().includes('logo')) {
                pipeline = pipeline.resize({ width: 96, withoutEnlargement: true });
                quality = 80; // Reasonable quality for logos
            } else {
                pipeline = pipeline.resize({ width: 1920, withoutEnlargement: true });
            }

            try {
                await pipeline
                    .webp({ quality })
                    .toFile(webpPath);

                console.log(`Generated ${filename}.webp`);
            } catch (err) {
                console.error(`Error processing ${file}:`, err);
            }
        }
    }
}

optimizeImages();
