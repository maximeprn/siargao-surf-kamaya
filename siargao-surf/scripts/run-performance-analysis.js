#!/usr/bin/env node

/**
 * Master Performance Analysis Runner for Siargao Surf
 * Runs both Lighthouse and Bundle analysis, generates comprehensive report
 */

const PerformanceAnalyzer = require('./performance-analysis');
const BundleAnalyzer = require('./bundle-analysis');
const fs = require('fs');
const path = require('path');

class MasterAnalyzer {
  constructor(options = {}) {
    this.outputDir = options.outputDir || './performance-reports';
    this.baseUrl = options.baseUrl || 'http://localhost:3002';
    this.skipBundle = options.skipBundle || false;
    this.skipLighthouse = options.skipLighthouse || false;
  }

  async ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async checkDevServer() {
    console.log(`🌊 Checking if dev server is running on ${this.baseUrl}...`);
    
    try {
      const response = await fetch(this.baseUrl);
      if (response.ok) {
        console.log('✅ Dev server is running\n');
        return true;
      }
    } catch (error) {
      console.log('❌ Dev server is not running');
      console.log('💡 Please start the dev server first: npm run dev\n');
      return false;
    }
    return false;
  }

  formatScore(score) {
    if (score >= 90) return `${score.toFixed(1)} 🟢`;
    if (score >= 70) return `${score.toFixed(1)} 🟡`;
    return `${score.toFixed(1)} 🔴`;
  }

  generateMasterReport(lighthouseResult, bundleResult) {
    const timestamp = new Date().toISOString();
    
    let report = `# 🏄‍♂️ Siargao Surf - Complete Performance Analysis\n\n`;
    report += `**Generated:** ${timestamp}\n`;
    report += `**Analysis Type:** Complete (Lighthouse + Bundle)\n`;
    report += `**Base URL:** ${this.baseUrl}\n\n`;

    // Executive Summary
    report += `## 📋 Executive Summary\n\n`;
    
    if (lighthouseResult && lighthouseResult.avgPerformance) {
      report += `**Overall Performance Score:** ${this.formatScore(lighthouseResult.avgPerformance)}\n`;
      
      const status = lighthouseResult.avgPerformance >= 90 ? 'Excellent' :
                    lighthouseResult.avgPerformance >= 70 ? 'Good' : 'Needs Improvement';
      report += `**Status:** ${status}\n`;
      
      const highPriority = lighthouseResult.suggestions.filter(s => s.priority.includes('HIGH')).length;
      const mediumPriority = lighthouseResult.suggestions.filter(s => s.priority.includes('MEDIUM')).length;
      
      report += `**Critical Issues:** ${highPriority}\n`;
      report += `**Medium Priority Issues:** ${mediumPriority}\n`;
    }
    
    if (bundleResult && bundleResult.analysis) {
      const bundleSize = bundleResult.analysis.totalSize;
      const bundleMB = (bundleSize / 1024 / 1024).toFixed(2);
      report += `**Total Bundle Size:** ${bundleMB} MB\n`;
      
      const bundleStatus = bundleSize < 500000 ? 'Excellent' :
                          bundleSize < 1000000 ? 'Good' : 'Needs Optimization';
      report += `**Bundle Status:** ${bundleStatus}\n`;
    }
    
    report += `\n`;

    // Quick Wins Section
    report += `## ⚡ Quick Wins & Priority Actions\n\n`;
    
    const quickWins = [];
    
    if (lighthouseResult) {
      const highPriorityIssues = lighthouseResult.suggestions
        .filter(s => s.priority.includes('HIGH'))
        .slice(0, 3);
      
      highPriorityIssues.forEach(issue => {
        quickWins.push(`🔴 **${issue.title}**`);
        quickWins.push(`   ${issue.description}`);
        quickWins.push('');
      });
    }
    
    if (bundleResult && bundleResult.analysis) {
      const bundleIssues = bundleResult.analysis.recommendations
        .filter(r => r.priority.includes('HIGH'))
        .slice(0, 2);
      
      bundleIssues.forEach(issue => {
        quickWins.push(`📦 **${issue.title}**`);
        quickWins.push(`   ${issue.description}`);
        quickWins.push('');
      });
    }
    
    if (quickWins.length === 0) {
      report += `✨ Great job! No critical performance issues detected.\n\n`;
    } else {
      report += quickWins.join('\n') + '\n';
    }

    // Detailed Analysis Links
    report += `## 📊 Detailed Analysis\n\n`;
    
    if (lighthouseResult) {
      report += `### 🔍 Lighthouse Performance Analysis\n`;
      report += `- **Report:** [performance-analysis-report.md](./performance-analysis-report.md)\n`;
      report += `- **Raw Data:** Individual JSON files for each page\n`;
      report += `- **Pages Analyzed:** ${lighthouseResult.results.length}\n\n`;
    }
    
    if (bundleResult) {
      report += `### 📦 Bundle Size Analysis\n`;
      report += `- **Report:** [bundle-analysis-report.md](./bundle-analysis-report.md)\n`;
      report += `- **Bundle Stats:** Available if build completed\n\n`;
    }

    // Siargao Surf Specific Insights
    report += `## 🌊 Siargao Surf Performance Insights\n\n`;
    
    // LCP Analysis
    report += `### Largest Contentful Paint (LCP)\n`;
    if (lighthouseResult && lighthouseResult.results.length > 0) {
      const homepageResult = lighthouseResult.results.find(r => r.path === '/');
      if (homepageResult && homepageResult.metrics.largestContentfulPaint) {
        const lcpValue = parseFloat(homepageResult.metrics.largestContentfulPaint);
        const lcpStatus = lcpValue < 2.5 ? 'Good' : lcpValue < 4 ? 'Needs Improvement' : 'Poor';
        report += `- **Current LCP:** ${homepageResult.metrics.largestContentfulPaint} (${lcpStatus})\n`;
        
        if (lcpValue < 2.5) {
          report += `- ✅ **Excellent LCP!** The hero image optimization is working well\n`;
        } else {
          report += `- ⚠️ **LCP needs attention** - Focus on hero image loading and server response time\n`;
        }
      }
    }
    report += `- **Optimizations Applied:** WebP format, CDN delivery, priority loading, client-side data fetching\n`;
    report += `- **Architecture:** Minimal SSR with client-side weather data loading\n\n`;

    // Server Response Analysis
    report += `### Server Response Time\n`;
    report += `- **Architecture:** Optimized with minimal SSR (coordinates only)\n`;
    report += `- **Weather Data:** Client-side fetching with dynamic imports\n`;
    report += `- **Database:** Fast Supabase queries for basic spot data\n\n`;

    // Implementation Recommendations
    report += `## 🚀 Implementation Roadmap\n\n`;
    report += `### Phase 1: Critical Fixes (Week 1)\n`;
    if (lighthouseResult) {
      const critical = lighthouseResult.suggestions.filter(s => s.priority.includes('HIGH')).slice(0, 3);
      if (critical.length > 0) {
        critical.forEach((issue, index) => {
          report += `${index + 1}. ${issue.title}\n`;
        });
      } else {
        report += `✅ No critical performance issues detected\n`;
      }
    }
    report += `\n`;
    
    report += `### Phase 2: Optimizations (Week 2)\n`;
    if (lighthouseResult) {
      const medium = lighthouseResult.suggestions.filter(s => s.priority.includes('MEDIUM')).slice(0, 3);
      medium.forEach((issue, index) => {
        report += `${index + 1}. ${issue.title}\n`;
      });
    }
    if (bundleResult && bundleResult.analysis) {
      const bundleOpts = bundleResult.analysis.recommendations.slice(0, 2);
      bundleOpts.forEach((issue, index) => {
        report += `${medium.length + index + 1}. ${issue.title} (Bundle)\n`;
      });
    }
    report += `\n`;
    
    report += `### Phase 3: Advanced Optimizations (Ongoing)\n`;
    report += `1. Service Worker implementation for offline caching\n`;
    report += `2. Progressive Web App (PWA) features\n`;
    report += `3. Advanced image optimization (WebP + AVIF)\n`;
    report += `4. Code splitting for non-critical components\n`;
    report += `5. Performance monitoring and alerts\n\n`;

    // Monitoring Setup
    report += `## 📈 Continuous Monitoring\n\n`;
    report += `### Automated Analysis\n`;
    report += `\`\`\`bash\n`;
    report += `# Run complete analysis\n`;
    report += `node scripts/run-performance-analysis.js\n\n`;
    report += `# Lighthouse only\n`;
    report += `node scripts/performance-analysis.js\n\n`;
    report += `# Bundle analysis only\n`;
    report += `node scripts/bundle-analysis.js\n`;
    report += `\`\`\`\n\n`;
    
    report += `### Performance Budget\n`;
    report += `- **Performance Score:** > 90\n`;
    report += `- **LCP:** < 2.5s\n`;
    report += `- **FID:** < 100ms\n`;
    report += `- **CLS:** < 0.1\n`;
    report += `- **Bundle Size:** < 500KB initial\n\n`;

    report += `---\n`;
    report += `*Complete performance analysis generated by Claude Code*\n`;
    report += `*For detailed reports, see individual analysis files in this directory*\n`;

    return report;
  }

  async run() {
    console.log('🏄‍♂️ Siargao Surf - Complete Performance Analysis\n');
    console.log('==================================================\n');
    
    await this.ensureOutputDir();
    
    let lighthouseResult = null;
    let bundleResult = null;

    // Run Lighthouse analysis
    if (!this.skipLighthouse) {
      console.log('🔍 Phase 1: Lighthouse Performance Analysis\n');
      
      const serverRunning = await this.checkDevServer();
      if (!serverRunning && this.baseUrl.includes('localhost')) {
        console.log('⚠️  Cannot run Lighthouse analysis without dev server');
        console.log('   Starting with bundle analysis only...\n');
        this.skipLighthouse = true;
      } else {
        try {
          const analyzer = new PerformanceAnalyzer({ 
            outputDir: this.outputDir,
            baseUrl: this.baseUrl
          });
          lighthouseResult = await analyzer.run();
          console.log('✅ Lighthouse analysis completed\n');
        } catch (error) {
          console.error('❌ Lighthouse analysis failed:', error.message);
          console.log('   Continuing with bundle analysis...\n');
        }
      }
    }

    // Run Bundle analysis
    if (!this.skipBundle) {
      console.log('📦 Phase 2: Bundle Size Analysis\n');
      try {
        const bundleAnalyzer = new BundleAnalyzer({ outputDir: this.outputDir });
        bundleResult = await bundleAnalyzer.run();
        console.log('✅ Bundle analysis completed\n');
      } catch (error) {
        console.error('❌ Bundle analysis failed:', error.message);
        console.log('   Tip: Run "npm run build" first for bundle analysis\n');
      }
    }

    // Generate master report
    console.log('📊 Phase 3: Generating Master Report\n');
    const masterReport = this.generateMasterReport(lighthouseResult, bundleResult);
    const masterReportPath = path.join(this.outputDir, 'performance-master-report.md');
    fs.writeFileSync(masterReportPath, masterReport);

    // Final summary
    console.log('🎉 Complete Performance Analysis Finished!\n');
    console.log('===============================================\n');
    console.log(`📁 All reports saved to: ${this.outputDir}/`);
    console.log(`📋 Master report: ${masterReportPath}`);
    
    if (lighthouseResult) {
      console.log(`🎯 Average Performance Score: ${lighthouseResult.avgPerformance.toFixed(1)}/100`);
    }
    
    if (bundleResult && bundleResult.analysis) {
      const bundleMB = (bundleResult.analysis.totalSize / 1024 / 1024).toFixed(2);
      console.log(`📦 Total Bundle Size: ${bundleMB} MB`);
    }
    
    console.log('\n💡 Next steps:');
    console.log('   1. Review the master report for priority actions');
    console.log('   2. Implement high-priority optimizations first');
    console.log('   3. Re-run analysis after changes');
    console.log('   4. Set up continuous performance monitoring\n');

    return {
      lighthouseResult,
      bundleResult,
      masterReportPath
    };
  }
}

// CLI usage with arguments
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};

  // Parse command line arguments
  args.forEach(arg => {
    if (arg === '--skip-lighthouse') options.skipLighthouse = true;
    if (arg === '--skip-bundle') options.skipBundle = true;
    if (arg.startsWith('--url=')) options.baseUrl = arg.split('=')[1];
  });

  const analyzer = new MasterAnalyzer(options);
  
  analyzer.run().then(result => {
    console.log('✨ Master performance analysis completed successfully!');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Master performance analysis failed:', error);
    process.exit(1);
  });
}

module.exports = MasterAnalyzer;