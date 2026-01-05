#!/usr/bin/env node
/**
 * Bulk image optimization for blog post images
 * This script optimizes all images in blog posts to reduce bundle size
 */

import sharp from 'sharp';
import { existsSync, readdirSync, statSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const blogDir = join(projectRoot, 'src/content/blog');

// Optimization settings
const OPTIMIZATION_SETTINGS = {
  maxWidth: 1200,
  maxHeight: 800,
  quality: {
    jpeg: 80,
    png: 85,
    webp: 85
  }
};

async function findLargeImages(directory, minSize = 500 * 1024) { // 500KB threshold
  const largeImages = [];
  
  function scanDirectory(dir) {
    const entries = readdirSync(dir);
    
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (stat.isFile()) {
        const ext = extname(entry).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext) && stat.size > minSize) {
          largeImages.push({
            path: fullPath,
            size: stat.size,
            sizeKB: Math.round(stat.size / 1024),
            sizeMB: (stat.size / (1024 * 1024)).toFixed(2)
          });
        }
      }
    }
  }
  
  scanDirectory(directory);
  return largeImages.sort((a, b) => b.size - a.size);
}

async function optimizeImage(imagePath, settings = OPTIMIZATION_SETTINGS) {
  try {
    const ext = extname(imagePath).toLowerCase();
    const metadata = await sharp(imagePath).metadata();
    
    console.log(`📷 Processing ${imagePath.replace(projectRoot, '.')}`);
    console.log(`   Original: ${metadata.width}x${metadata.height} (${metadata.format})`);
    
    let processor = sharp(imagePath);
    
    // Resize if too large
    if (metadata.width > settings.maxWidth || metadata.height > settings.maxHeight) {
      processor = processor.resize(settings.maxWidth, settings.maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }
    
    // Apply format-specific optimization
    if (ext === '.jpg' || ext === '.jpeg') {
      processor = processor.jpeg({ 
        quality: settings.quality.jpeg,
        progressive: true,
        mozjpeg: true 
      });
    } else if (ext === '.png') {
      processor = processor.png({ 
        quality: settings.quality.png,
        compressionLevel: 9,
        adaptiveFiltering: true
      });
    } else if (ext === '.webp') {
      processor = processor.webp({ 
        quality: settings.quality.webp,
        effort: 6
      });
    }
    
    // Save optimized image (overwrite original)
    await processor.toFile(imagePath + '.tmp');
    
    // Get new file size
    const originalSize = (await sharp(imagePath).metadata()).size || statSync(imagePath).size;
    const newSize = statSync(imagePath + '.tmp').size;
    const reduction = ((originalSize - newSize) / originalSize * 100).toFixed(1);
    
    // Replace original if smaller
    if (newSize < originalSize) {
      await sharp(imagePath + '.tmp').toFile(imagePath);
      console.log(`   ✅ Optimized: ${Math.round(newSize/1024)}KB (${reduction}% reduction)`);
    } else {
      console.log(`   ⚠️  Skipped: No size reduction achieved`);
    }
    
    // Clean up temp file
    try {
      const fs = await import('fs');
      fs.unlinkSync(imagePath + '.tmp');
    } catch {}
    
    return { originalSize, newSize, reduction: parseFloat(reduction) };
    
  } catch (error) {
    console.error(`   ❌ Error processing ${imagePath}: ${error.message}`);
    return null;
  }
}

async function optimizeAllBlogImages() {
  console.log('🔍 Scanning for large blog images...');
  
  const largeImages = await findLargeImages(blogDir);
  
  if (largeImages.length === 0) {
    console.log('✅ No large images found to optimize!');
    return;
  }
  
  console.log(`📊 Found ${largeImages.length} large images (>500KB):`);
  largeImages.slice(0, 10).forEach(img => {
    console.log(`   ${img.path.replace(projectRoot, '.')} - ${img.sizeKB}KB`);
  });
  
  if (largeImages.length > 10) {
    console.log(`   ... and ${largeImages.length - 10} more`);
  }
  
  console.log('\n🚀 Starting optimization...');
  
  let totalOriginalSize = 0;
  let totalNewSize = 0;
  let processedCount = 0;
  
  for (const image of largeImages) {
    const result = await optimizeImage(image.path);
    if (result) {
      totalOriginalSize += result.originalSize;
      totalNewSize += result.newSize;
      processedCount++;
    }
    
    // Add small delay to prevent overwhelming the system
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  const totalReduction = ((totalOriginalSize - totalNewSize) / totalOriginalSize * 100).toFixed(1);
  const savedMB = ((totalOriginalSize - totalNewSize) / (1024 * 1024)).toFixed(2);
  
  console.log('\n📈 Optimization Summary:');
  console.log(`   Images processed: ${processedCount}`);
  console.log(`   Original total: ${(totalOriginalSize / (1024 * 1024)).toFixed(2)}MB`);
  console.log(`   Optimized total: ${(totalNewSize / (1024 * 1024)).toFixed(2)}MB`);
  console.log(`   Space saved: ${savedMB}MB (${totalReduction}% reduction)`);
  console.log('✨ Blog image optimization completed!');
}

// Run the optimization
optimizeAllBlogImages().catch(console.error);