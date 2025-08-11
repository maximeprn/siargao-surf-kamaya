#!/usr/bin/env node

/**
 * Performance Analysis Script for Siargao Surf
 * Analyzes website performance using Lighthouse and suggests improvements
 */

const lighthouse = require('lighthouse').default || require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

class PerformanceAnalyzer {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || 'http://localhost:3002';
    this.outputDir = options.outputDir || './performance-reports';
    this.pages = options.pages || [
      '/',
      '/spots/cloud-9',
      '/spots/quicksilver',
      '/spots/philippine-deep'
    ];
  }

  async ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async launchChrome() {
    return chromeLauncher.launch({
      chromeFlags: [
        '--headless',
        '--disable-gpu',
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--no-first-run',
        '--no-default-browser-check'
      ]
    });
  }

  async runLighthouseAudit(url, chrome) {
    const options = {
      logLevel: 'info',
      output: 'json',
      onlyCategories: ['performance', 'best-practices', 'seo'],
      port: chrome.port
    };

    const config = {
      extends: 'lighthouse:default',
      settings: {
        formFactor: 'desktop',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
          requestLatencyMs: 0,
          downloadThroughputKbps: 0,
          uploadThroughputKbps: 0
        },
        screenEmulation: {
          mobile: false,
          width: 1350,
          height: 940,
          deviceScaleFactor: 1,
          disabled: false
        },
        emulatedUserAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    };

    return lighthouse(url, options, config);
  }

  async analyzePage(pagePath, chrome) {
    const fullUrl = `${this.baseUrl}${pagePath}`;
    console.log(`🔍 Analyzing: ${fullUrl}`);

    try {
      const result = await this.runLighthouseAudit(fullUrl, chrome);
      const report = result.report;
      const lhr = JSON.parse(report);

      // Save detailed JSON report
      const sanitizedPath = pagePath.replace(/\//g, '_').replace(/_$/, '_index');
      const reportPath = path.join(this.outputDir, `lighthouse-${sanitizedPath}.json`);
      fs.writeFileSync(reportPath, JSON.stringify(lhr, null, 2));

      return {
        url: fullUrl,
        path: pagePath,
        performance: lhr.categories.performance.score * 100,
        bestPractices: lhr.categories['best-practices'].score * 100,
        seo: lhr.categories.seo.score * 100,
        metrics: {
          firstContentfulPaint: lhr.audits['first-contentful-paint'].displayValue,
          largestContentfulPaint: lhr.audits['largest-contentful-paint'].displayValue,
          totalBlockingTime: lhr.audits['total-blocking-time'].displayValue,
          cumulativeLayoutShift: lhr.audits['cumulative-layout-shift'].displayValue,
          speedIndex: lhr.audits['speed-index'].displayValue,
          timeToInteractive: lhr.audits['interactive'].displayValue
        },
        opportunities: lhr.audits,
        reportPath
      };
    } catch (error) {
      console.error(`❌ Error analyzing ${fullUrl}:`, error.message);
      return null;
    }
  }

  generateSuggestions(results) {
    const suggestions = [];
    const allOpportunities = {};

    // Collect all opportunities from all pages
    results.forEach(result => {
      if (!result) return;
      
      Object.keys(result.opportunities).forEach(auditKey => {
        const audit = result.opportunities[auditKey];
        if (audit.score !== null && audit.score < 1 && audit.details) {
          if (!allOpportunities[auditKey]) {
            allOpportunities[auditKey] = {
              title: audit.title,
              description: audit.description,
              pages: [],
              severity: 0
            };
          }
          allOpportunities[auditKey].pages.push(result.path);
          allOpportunities[auditKey].severity += (1 - audit.score);
        }
      });
    });

    // Convert to suggestions with priority
    const sortedOpportunities = Object.entries(allOpportunities)
      .sort(([,a], [,b]) => b.severity - a.severity)
      .slice(0, 10); // Top 10 most important

    sortedOpportunities.forEach(([auditKey, data]) => {
      const priority = data.severity > 2 ? '🔴 HIGH' : data.severity > 1 ? '🟡 MEDIUM' : '🟢 LOW';
      suggestions.push({
        priority,
        title: data.title,
        description: data.description,
        affectedPages: data.pages,
        auditKey
      });
    });

    return suggestions;
  }

  generateReport(results, suggestions) {
    const timestamp = new Date().toISOString();
    const validResults = results.filter(r => r !== null);
    
    if (validResults.length === 0) {
      return "❌ No valid results to generate report";
    }

    // Calculate averages
    const avgPerformance = validResults.reduce((sum, r) => sum + r.performance, 0) / validResults.length;
    const avgBestPractices = validResults.reduce((sum, r) => sum + r.bestPractices, 0) / validResults.length;
    const avgSEO = validResults.reduce((sum, r) => sum + r.seo, 0) / validResults.length;

    let report = `# 🏄‍♂️ Siargao Surf - Performance Analysis Report\n\n`;
    report += `**Generated:** ${timestamp}\n`;
    report += `**Base URL:** ${this.baseUrl}\n`;
    report += `**Pages Analyzed:** ${validResults.length}\n\n`;

    // Overall scores
    report += `## 📊 Overall Scores\n\n`;
    report += `| Metric | Score |\n`;
    report += `|--------|-------|\n`;
    report += `| Performance | ${avgPerformance.toFixed(1)}/100 ${avgPerformance >= 90 ? '🟢' : avgPerformance >= 70 ? '🟡' : '🔴'} |\n`;
    report += `| Best Practices | ${avgBestPractices.toFixed(1)}/100 ${avgBestPractices >= 90 ? '🟢' : avgBestPractices >= 70 ? '🟡' : '🔴'} |\n`;
    report += `| SEO | ${avgSEO.toFixed(1)}/100 ${avgSEO >= 90 ? '🟢' : avgSEO >= 70 ? '🟡' : '🔴'} |\n\n`;

    // Individual page results
    report += `## 📱 Individual Page Results\n\n`;
    validResults.forEach(result => {
      report += `### ${result.path === '/' ? 'Homepage' : result.path}\n\n`;
      report += `**Performance:** ${result.performance.toFixed(1)}/100\n\n`;
      report += `**Core Web Vitals:**\n`;
      report += `- First Contentful Paint: ${result.metrics.firstContentfulPaint}\n`;
      report += `- Largest Contentful Paint: ${result.metrics.largestContentfulPaint}\n`;
      report += `- Total Blocking Time: ${result.metrics.totalBlockingTime}\n`;
      report += `- Cumulative Layout Shift: ${result.metrics.cumulativeLayoutShift}\n`;
      report += `- Speed Index: ${result.metrics.speedIndex}\n`;
      report += `- Time to Interactive: ${result.metrics.timeToInteractive}\n\n`;
    });

    // Top suggestions
    report += `## 🎯 Performance Improvement Suggestions\n\n`;
    if (suggestions.length === 0) {
      report += `✨ Great job! No major performance issues detected.\n\n`;
    } else {
      suggestions.forEach((suggestion, index) => {
        report += `### ${index + 1}. ${suggestion.priority} ${suggestion.title}\n\n`;
        report += `${suggestion.description}\n\n`;
        report += `**Affected pages:** ${suggestion.affectedPages.join(', ')}\n\n`;
      });
    }

    // Specific recommendations for this project
    report += `## 🌊 Siargao Surf Specific Recommendations\n\n`;
    
    if (avgPerformance < 90) {
      report += `### Image Optimization\n`;
      report += `- ✅ WebP format already implemented\n`;
      report += `- ✅ CDN delivery via GitHub already implemented\n`;
      report += `- ✅ Priority loading for hero images already implemented\n`;
      report += `- Consider implementing progressive JPEG for fallback\n\n`;
      
      report += `### Server Response Time\n`;
      report += `- ✅ Client-side weather data fetching already implemented\n`;
      report += `- ✅ Minimal SSR approach already implemented\n`;
      report += `- Consider implementing service worker for offline caching\n\n`;
    }

    if (avgBestPractices < 90) {
      report += `### Best Practices\n`;
      report += `- Review console errors and warnings\n`;
      report += `- Ensure HTTPS is used in production\n`;
      report += `- Consider implementing Content Security Policy\n\n`;
    }

    if (avgSEO < 90) {
      report += `### SEO Optimization\n`;
      report += `- Add meta descriptions for all pages\n`;
      report += `- Implement structured data for surf conditions\n`;
      report += `- Add Open Graph tags for social sharing\n\n`;
    }

    report += `## 📈 Next Steps\n\n`;
    report += `1. **Priority**: Address high-priority suggestions first\n`;
    report += `2. **Monitor**: Set up continuous performance monitoring\n`;
    report += `3. **Test**: Re-run analysis after implementing changes\n`;
    report += `4. **Deploy**: Use staged deployments for performance-critical changes\n\n`;

    report += `---\n`;
    report += `*Generated by Claude Code Performance Analyzer*\n`;

    return report;
  }

  async run() {
    console.log('🏄‍♂️ Starting Siargao Surf Performance Analysis...\n');
    
    await this.ensureOutputDir();
    
    const chrome = await this.launchChrome();
    console.log(`🌊 Chrome launched on port ${chrome.port}\n`);

    const results = [];
    for (const page of this.pages) {
      const result = await this.analyzePage(page, chrome);
      results.push(result);
      
      if (result) {
        console.log(`✅ ${page}: Performance ${result.performance.toFixed(1)}/100`);
      }
    }

    await chrome.kill();
    console.log('\n🏆 Chrome closed\n');

    // Generate suggestions
    const suggestions = this.generateSuggestions(results);
    
    // Generate and save report
    const report = this.generateReport(results, suggestions);
    const reportPath = path.join(this.outputDir, 'performance-analysis-report.md');
    fs.writeFileSync(reportPath, report);

    console.log(`📊 Analysis complete!`);
    console.log(`📁 Reports saved to: ${this.outputDir}`);
    console.log(`📋 Summary report: ${reportPath}`);
    
    // Display quick summary
    const validResults = results.filter(r => r !== null);
    if (validResults.length > 0) {
      const avgPerf = validResults.reduce((sum, r) => sum + r.performance, 0) / validResults.length;
      console.log(`🎯 Average Performance Score: ${avgPerf.toFixed(1)}/100`);
      console.log(`🚀 Top Priority Issues: ${suggestions.filter(s => s.priority.includes('HIGH')).length}`);
    }

    return {
      results: validResults,
      suggestions,
      reportPath,
      avgPerformance: validResults.length > 0 ? 
        validResults.reduce((sum, r) => sum + r.performance, 0) / validResults.length : 0
    };
  }
}

// CLI usage
if (require.main === module) {
  const analyzer = new PerformanceAnalyzer();
  
  analyzer.run().then(result => {
    console.log('\n✨ Performance analysis completed successfully!');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Performance analysis failed:', error);
    process.exit(1);
  });
}

module.exports = PerformanceAnalyzer;