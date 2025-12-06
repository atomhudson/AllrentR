
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
            if (filename.toLowerCase().includes('hero') || filename.includes('dashboard')) {
                pipeline = pipeline.resize({ width: 1000, withoutEnlargement: true });
                quality = 75; // Lower quality for background/hero images
            } else if (filename.toLowerCase().includes('logo')) {
                pipeline = pipeline.resize({ width: 128, withoutEnlargement: true });
                quality = 90; // Higher quality for logos
                // Ensure we also make a .png version for the logo if it was a png (processed as webp here, but we might want to keep original or optimization logic for png is separate)
                // actually the script converts everything TO webp.
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
