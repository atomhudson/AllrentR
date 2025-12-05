
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

            try {
                await sharp(inputPath)
                    .resize({ width: 1920, withoutEnlargement: true }) // Resize huge hero images
                    .webp({ quality: 80 })
                    .toFile(webpPath);

                console.log(`Generated ${filename}.webp`);
            } catch (err) {
                console.error(`Error processing ${file}:`, err);
            }
        }
    }
}

optimizeImages();
