#!/usr/bin/env node

/**
 * Bundle Analysis Script for Siargao Surf
 * Analyzes JavaScript bundle sizes and suggests optimizations
 */

const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const fs = require('fs');
const path = require('path');

class BundleAnalyzer {
  constructor(options = {}) {
    this.outputDir = options.outputDir || './performance-reports';
    this.buildDir = options.buildDir || './.next';
  }

  async ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  analyzeBundleStats() {
    const statsPath = path.join(this.buildDir, 'webpack-stats.json');
    
    if (!fs.existsSync(statsPath)) {
      console.log('⚠️  No webpack stats found. Run build with bundle analysis first.');
      return null;
    }

    const stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
    return this.processStats(stats);
  }

  processStats(stats) {
    const analysis = {
      totalSize: 0,
      chunks: [],
      largestModules: [],
      duplicates: [],
      recommendations: []
    };

    // Analyze chunks
    if (stats.chunks) {
      stats.chunks.forEach(chunk => {
        const chunkSize = chunk.size || 0;
        analysis.totalSize += chunkSize;
        
        analysis.chunks.push({
          id: chunk.id,
          name: chunk.names ? chunk.names.join(', ') : 'unnamed',
          size: chunkSize,
          modules: chunk.modules ? chunk.modules.length : 0
        });
      });
    }

    // Sort chunks by size
    analysis.chunks.sort((a, b) => b.size - a.size);

    // Analyze modules
    const moduleMap = new Map();
    if (stats.modules) {
      stats.modules.forEach(module => {
        const moduleName = module.name || module.identifier || 'unknown';
        const moduleSize = module.size || 0;
        
        // Track module sizes
        if (moduleSize > 10000) { // > 10KB
          analysis.largestModules.push({
            name: moduleName,
            size: moduleSize
          });
        }

        // Track potential duplicates
        const cleanName = moduleName.replace(/\?.*$/, '').replace(/^.*node_modules\//, '');
        if (moduleMap.has(cleanName)) {
          moduleMap.get(cleanName).count++;
          moduleMap.get(cleanName).totalSize += moduleSize;
        } else {
          moduleMap.set(cleanName, { count: 1, totalSize: moduleSize, name: moduleName });
        }
      });
    }

    // Find duplicates
    moduleMap.forEach((data, name) => {
      if (data.count > 1 && data.totalSize > 5000) {
        analysis.duplicates.push({
          name,
          count: data.count,
          totalSize: data.totalSize
        });
      }
    });

    // Sort arrays
    analysis.largestModules.sort((a, b) => b.size - a.size);
    analysis.duplicates.sort((a, b) => b.totalSize - a.totalSize);

    // Generate recommendations
    this.generateRecommendations(analysis);

    return analysis;
  }

  generateRecommendations(analysis) {
    const recommendations = [];

    // Large bundle recommendations
    if (analysis.totalSize > 1000000) { // > 1MB
      recommendations.push({
        priority: '🔴 HIGH',
        title: 'Bundle size is very large',
        description: `Total bundle size is ${this.formatBytes(analysis.totalSize)}. Consider code splitting and lazy loading.`,
        action: 'Implement dynamic imports for large components and libraries'
      });
    }

    // Large chunks
    const largeChunks = analysis.chunks.filter(chunk => chunk.size > 500000); // > 500KB
    if (largeChunks.length > 0) {
      recommendations.push({
        priority: '🟡 MEDIUM',
        title: 'Large chunks detected',
        description: `Found ${largeChunks.length} chunks over 500KB`,
        action: 'Split large chunks using dynamic imports or route-based code splitting'
      });
    }

    // Duplicate modules
    if (analysis.duplicates.length > 0) {
      recommendations.push({
        priority: '🟡 MEDIUM',
        title: 'Duplicate modules detected',
        description: `Found ${analysis.duplicates.length} potentially duplicate modules`,
        action: 'Review dependencies and consider webpack optimization'
      });
    }

    // Large individual modules
    const veryLargeModules = analysis.largestModules.filter(mod => mod.size > 200000); // > 200KB
    if (veryLargeModules.length > 0) {
      recommendations.push({
        priority: '🟡 MEDIUM',
        title: 'Very large individual modules',
        description: `Found ${veryLargeModules.length} modules over 200KB`,
        action: 'Consider lazy loading or replacing with smaller alternatives'
      });
    }

    // Siargao Surf specific recommendations
    const weatherLibs = analysis.largestModules.filter(mod => 
      mod.name.includes('marine-weather') || mod.name.includes('weather')
    );
    if (weatherLibs.length > 0) {
      recommendations.push({
        priority: '🟢 LOW',
        title: 'Weather library optimization',
        description: 'Marine weather libraries detected in bundle',
        action: 'Ensure weather data fetching is client-side only with dynamic imports'
      });
    }

    analysis.recommendations = recommendations;
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  generateReport(analysis) {
    if (!analysis) {
      return "❌ No bundle analysis data available. Run 'npm run build' first.";
    }

    const timestamp = new Date().toISOString();
    
    let report = `# 📦 Siargao Surf - Bundle Analysis Report\n\n`;
    report += `**Generated:** ${timestamp}\n`;
    report += `**Total Bundle Size:** ${this.formatBytes(analysis.totalSize)}\n`;
    report += `**Chunks:** ${analysis.chunks.length}\n`;
    report += `**Large Modules:** ${analysis.largestModules.length}\n\n`;

    // Bundle size overview
    report += `## 📊 Bundle Size Overview\n\n`;
    if (analysis.totalSize < 500000) {
      report += `✅ **Excellent** - Bundle size is under 500KB\n\n`;
    } else if (analysis.totalSize < 1000000) {
      report += `🟡 **Good** - Bundle size is under 1MB but could be optimized\n\n`;
    } else {
      report += `🔴 **Needs Attention** - Bundle size is over 1MB\n\n`;
    }

    // Top chunks
    report += `## 🧩 Largest Chunks\n\n`;
    report += `| Chunk Name | Size | Modules |\n`;
    report += `|------------|------|----------|\n`;
    analysis.chunks.slice(0, 10).forEach(chunk => {
      report += `| ${chunk.name} | ${this.formatBytes(chunk.size)} | ${chunk.modules} |\n`;
    });
    report += `\n`;

    // Largest modules
    if (analysis.largestModules.length > 0) {
      report += `## 📄 Largest Modules\n\n`;
      report += `| Module | Size |\n`;
      report += `|--------|------|\n`;
      analysis.largestModules.slice(0, 15).forEach(module => {
        const displayName = module.name.length > 80 ? 
          module.name.substring(0, 77) + '...' : module.name;
        report += `| ${displayName} | ${this.formatBytes(module.size)} |\n`;
      });
      report += `\n`;
    }

    // Duplicates
    if (analysis.duplicates.length > 0) {
      report += `## 🔁 Potential Duplicate Modules\n\n`;
      report += `| Module | Count | Total Size |\n`;
      report += `|--------|-------|------------|\n`;
      analysis.duplicates.slice(0, 10).forEach(dup => {
        report += `| ${dup.name} | ${dup.count} | ${this.formatBytes(dup.totalSize)} |\n`;
      });
      report += `\n`;
    }

    // Recommendations
    report += `## 🎯 Optimization Recommendations\n\n`;
    if (analysis.recommendations.length === 0) {
      report += `✨ Great job! Your bundle is well optimized.\n\n`;
    } else {
      analysis.recommendations.forEach((rec, index) => {
        report += `### ${index + 1}. ${rec.priority} ${rec.title}\n\n`;
        report += `${rec.description}\n\n`;
        report += `**Action:** ${rec.action}\n\n`;
      });
    }

    // Siargao Surf specific section
    report += `## 🌊 Siargao Surf Bundle Optimizations\n\n`;
    report += `### Current Optimizations ✅\n`;
    report += `- Client-side weather data fetching with dynamic imports\n`;
    report += `- Minimal SSR approach reduces initial bundle size\n`;
    report += `- Component-based architecture enables tree shaking\n\n`;

    report += `### Recommended Next Steps\n`;
    report += `1. **Route-based code splitting** - Split pages into smaller chunks\n`;
    report += `2. **Component lazy loading** - Lazy load non-critical UI components\n`;
    report += `3. **Library optimization** - Review and optimize third-party dependencies\n`;
    report += `4. **Tree shaking** - Ensure unused code is eliminated\n\n`;

    report += `### Bundle Analysis Commands\n`;
    report += `\`\`\`bash\n`;
    report += `# Build with bundle analysis\n`;
    report += `ANALYZE=true npm run build\n\n`;
    report += `# Run this analysis script\n`;
    report += `node scripts/bundle-analysis.js\n`;
    report += `\`\`\`\n\n`;

    report += `---\n`;
    report += `*Generated by Claude Code Bundle Analyzer*\n`;

    return report;
  }

  async run() {
    console.log('📦 Starting Bundle Analysis...\n');
    
    await this.ensureOutputDir();
    
    const analysis = this.analyzeBundleStats();
    const report = this.generateReport(analysis);
    
    const reportPath = path.join(this.outputDir, 'bundle-analysis-report.md');
    fs.writeFileSync(reportPath, report);

    console.log(`📊 Bundle analysis complete!`);
    console.log(`📁 Report saved to: ${reportPath}`);
    
    if (analysis) {
      console.log(`📦 Total Bundle Size: ${this.formatBytes(analysis.totalSize)}`);
      console.log(`🧩 Number of Chunks: ${analysis.chunks.length}`);
      console.log(`⚠️  Optimization Opportunities: ${analysis.recommendations.length}`);
    }

    return {
      analysis,
      reportPath
    };
  }
}

// CLI usage
if (require.main === module) {
  const analyzer = new BundleAnalyzer();
  
  analyzer.run().then(result => {
    console.log('\n✨ Bundle analysis completed successfully!');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Bundle analysis failed:', error);
    process.exit(1);
  });
}

module.exports = BundleAnalyzer;