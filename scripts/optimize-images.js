#!/usr/bin/env node
/**
 * Image optimization script using Sharp
 * This script optimizes the large images in the public/i directory
 */

import sharp from 'sharp';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const publicDir = join(projectRoot, 'public');
const imagesDir = join(publicDir, 'i');

// Images to optimize with their target dimensions and quality
const imagesToOptimize = [
  {
    input: 'sergiocarracedo-og.png',
    outputs: [
      { suffix: '', format: 'webp', width: 1200, height: 630, quality: 85 },
      { suffix: '-optimized', format: 'png', width: 1200, height: 630, quality: 90 }
    ]
  },
  {
    input: 'sergiocarracedo-alt.png', 
    outputs: [
      { suffix: '', format: 'webp', width: 400, height: 400, quality: 85 },
      { suffix: '-optimized', format: 'png', width: 400, height: 400, quality: 90 }
    ]
  },
  {
    input: 'cover.jpg',
    outputs: [
      { suffix: '', format: 'webp', width: 1200, height: 800, quality: 85 },
      { suffix: '-optimized', format: 'jpeg', width: 1200, height: 800, quality: 85 }
    ]
  }
];

async function optimizeImages() {
  console.log('🖼️  Starting image optimization...');
  
  for (const imageConfig of imagesToOptimize) {
    const inputPath = join(imagesDir, imageConfig.input);
    
    if (!existsSync(inputPath)) {
      console.log(`⚠️  Skipping ${imageConfig.input} - file not found`);
      continue;
    }
    
    console.log(`📷 Processing ${imageConfig.input}...`);
    
    for (const output of imageConfig.outputs) {
      const outputName = imageConfig.input.replace(/\.[^.]+$/, '') + 
        (output.suffix || '') + '.' + output.format;
      const outputPath = join(imagesDir, outputName);
      
      try {
        let processor = sharp(inputPath)
          .resize(output.width, output.height, { 
            fit: 'cover', 
            position: 'center'
          });
        
        if (output.format === 'webp') {
          processor = processor.webp({ quality: output.quality });
        } else if (output.format === 'jpeg') {
          processor = processor.jpeg({ quality: output.quality });
        } else if (output.format === 'png') {
          processor = processor.png({ quality: output.quality });
        }
        
        await processor.toFile(outputPath);
        
        const stats = await sharp(outputPath).metadata();
        console.log(`  ✅ ${outputName} - ${stats.width}x${stats.height} (${output.format})`);
      } catch (error) {
        console.error(`  ❌ Failed to process ${outputName}:`, error.message);
      }
    }
  }
  
  console.log('✨ Image optimization completed!');
}

// Run the optimization
optimizeImages().catch(console.error);