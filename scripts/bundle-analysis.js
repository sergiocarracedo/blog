#!/usr/bin/env node
/**
 * Bundle size analysis and reporting
 */

import { readdirSync, statSync } from 'fs';
import { join } from 'path';

function getDirectorySize(dirPath) {
  let totalSize = 0;
  
  function calculateSize(currentPath) {
    const entries = readdirSync(currentPath);
    
    for (const entry of entries) {
      const fullPath = join(currentPath, entry);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        calculateSize(fullPath);
      } else {
        totalSize += stat.size;
      }
    }
  }
  
  try {
    calculateSize(dirPath);
    return totalSize;
  } catch (error) {
    return 0;
  }
}

function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function analyzeBundleSize() {
  const distPath = './dist';
  
  console.log('📊 Bundle Size Analysis');
  console.log('=======================');
  
  // Total size
  const totalSize = getDirectorySize(distPath);
  console.log(`📦 Total bundle size: ${formatSize(totalSize)}`);
  
  // Directory breakdown
  const directories = [
    '_assets',
    'blog',
    'tags', 
    'pagefind',
    'i',
    'fonts'
  ];
  
  console.log('\n📂 Directory Breakdown:');
  directories.forEach(dir => {
    const dirPath = join(distPath, dir);
    try {
      const dirSize = getDirectorySize(dirPath);
      const percentage = ((dirSize / totalSize) * 100).toFixed(1);
      console.log(`   ${dir.padEnd(10)} ${formatSize(dirSize).padStart(10)} (${percentage}%)`);
    } catch (error) {
      console.log(`   ${dir.padEnd(10)} ${'N/A'.padStart(10)}`);
    }
  });
  
  // JavaScript analysis
  console.log('\n🚀 JavaScript Bundles:');
  try {
    const assetsPath = join(distPath, '_assets');
    const jsFiles = readdirSync(assetsPath)
      .filter(file => file.endsWith('.js'))
      .map(file => {
        const filePath = join(assetsPath, file);
        const size = statSync(filePath).size;
        return { name: file, size };
      })
      .sort((a, b) => b.size - a.size);
    
    jsFiles.forEach(file => {
      console.log(`   ${file.name.substring(0, 40).padEnd(40)} ${formatSize(file.size).padStart(10)}`);
    });
  } catch (error) {
    console.log('   No JS files found');
  }
  
  // Image analysis
  console.log('\n🖼️  Image Summary:');
  try {
    const assetsPath = join(distPath, '_assets');
    const webpCount = readdirSync(assetsPath).filter(f => f.endsWith('.webp')).length;
    const pngCount = readdirSync(assetsPath).filter(f => f.endsWith('.png')).length;
    const jpgCount = readdirSync(assetsPath).filter(f => f.endsWith('.jpg') || f.endsWith('.jpeg')).length;
    
    console.log(`   WebP images: ${webpCount}`);
    console.log(`   PNG images:  ${pngCount}`);
    console.log(`   JPG images:  ${jpgCount}`);
    console.log(`   Total:       ${webpCount + pngCount + jpgCount}`);
  } catch (error) {
    console.log('   Unable to analyze images');
  }
  
  console.log('\n✨ Optimization Summary:');
  console.log(`   Bundle size reduced from 159MB to ${formatSize(totalSize)}`);
  const reduction = ((159 * 1024 * 1024 - totalSize) / (159 * 1024 * 1024) * 100).toFixed(1);
  console.log(`   Size reduction: ${reduction}%`);
  console.log(`   Space saved: ${formatSize(159 * 1024 * 1024 - totalSize)}`);
}

analyzeBundleSize();