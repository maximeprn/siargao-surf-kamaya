# 🏄‍♂️ Siargao Surf - Performance Analysis Tools

## Overview

This project now includes comprehensive performance analysis tools to monitor and optimize the surf forecasting application. These tools help identify bottlenecks, analyze bundle sizes, and provide actionable recommendations for improvements.

## 🚀 Quick Start

### Prerequisites

- Node.js and npm installed
- Development server running (`npm run dev`)

### Run Complete Analysis

```bash
# Install performance tools (already done)
npm install -D lighthouse webpack-bundle-analyzer

# Run complete performance analysis
npm run analyze:performance
```

This command will:
- ✅ Run Lighthouse performance audits on all pages
- ✅ Analyze JavaScript bundle sizes
- ✅ Generate comprehensive reports with recommendations
- ✅ Create a master report with priority actions

## 📊 Individual Analysis Tools

### Lighthouse Performance Analysis

```bash
# Analyze Core Web Vitals and performance metrics
npm run analyze:lighthouse
```

**What it analyzes:**
- Largest Contentful Paint (LCP)
- First Contentful Paint (FCP)
- Time to Interactive (TTI)
- Cumulative Layout Shift (CLS)
- Total Blocking Time (TBT)
- Speed Index

**Output:**
- `performance-reports/performance-analysis-report.md` - Detailed analysis
- `performance-reports/lighthouse-*.json` - Raw Lighthouse data for each page

### Bundle Size Analysis

```bash
# Analyze JavaScript bundle sizes
npm run analyze:bundle

# Build with bundle analysis visualization
npm run build:analyze
```

**What it analyzes:**
- Total bundle size and breakdown
- Largest modules and dependencies
- Potential duplicate code
- Code splitting opportunities

**Output:**
- `performance-reports/bundle-analysis-report.md` - Bundle analysis report
- `analyze/client.html` - Interactive bundle visualization
- `.next/webpack-stats.json` - Webpack statistics

## 📁 Report Structure

All reports are saved in `performance-reports/`:

```
performance-reports/
├── performance-master-report.md      # 📋 Executive summary and action plan
├── performance-analysis-report.md    # 🔍 Detailed Lighthouse analysis
├── bundle-analysis-report.md         # 📦 Bundle size analysis
├── lighthouse-index.json            # 🏠 Homepage Lighthouse data
├── lighthouse-spots-*.json          # 🌊 Individual spot page data
└── ...
```

## 🎯 Performance Optimization Workflow

### 1. Baseline Analysis
```bash
# Run initial analysis to establish baseline
npm run analyze:performance
```

### 2. Implement Optimizations
Based on the generated reports, implement high-priority optimizations first:

- **🔴 High Priority**: Critical performance issues affecting user experience
- **🟡 Medium Priority**: Optimizations with good ROI
- **🟢 Low Priority**: Minor improvements

### 3. Measure Impact
```bash
# Re-run analysis after changes
npm run analyze:performance
```

### 4. Compare Results
- Check improvement in performance scores
- Verify Core Web Vitals improvements
- Monitor bundle size changes

## 🌊 Siargao Surf Specific Optimizations

### Current Performance Features ✅

- **Hero Image Optimization**: WebP format, CDN delivery, priority loading
- **Server Response Optimization**: Minimal SSR with client-side weather data
- **Code Splitting**: Dynamic imports for marine weather libraries
- **Caching Strategy**: Optimized headers for static assets
- **Bundle Optimization**: Package import optimization for key libraries

### Performance Targets

| Metric | Target | Current Status |
|--------|--------|---------------|
| Performance Score | > 90 | ✅ Optimized |
| LCP | < 2.5s | ✅ Achieved |
| FID | < 100ms | ✅ Achieved |
| CLS | < 0.1 | ✅ Achieved |
| Bundle Size | < 500KB | 🟡 Monitoring |

## 🔧 Advanced Configuration

### Custom Analysis Settings

You can customize the analysis by modifying the scripts:

```javascript
// scripts/run-performance-analysis.js
const options = {
  baseUrl: 'https://surf-kamaya-siargao.com', // For production analysis
  pages: ['/', '/spots/cloud-9', '/spots/quicksilver'], // Custom page list
  outputDir: './custom-reports' // Custom output directory
};
```

### Production Analysis

```bash
# Analyze production site
node scripts/run-performance-analysis.js --url=https://surf-kamaya-siargao.com
```

### Skip Specific Analysis Types

```bash
# Skip bundle analysis (Lighthouse only)
node scripts/run-performance-analysis.js --skip-bundle

# Skip Lighthouse analysis (Bundle only)
node scripts/run-performance-analysis.js --skip-lighthouse
```

## 📈 Continuous Monitoring

### Performance Budget

Set up performance budgets in your CI/CD pipeline:

```bash
# In your deployment script
npm run analyze:performance
if [ $performance_score -lt 90 ]; then
  echo "Performance regression detected!"
  exit 1
fi
```

### Automated Alerts

Consider setting up automated performance monitoring:

- **Lighthouse CI**: For continuous performance monitoring
- **Vercel Analytics**: For real user monitoring
- **Core Web Vitals monitoring**: Using Google Search Console

## 🚨 Troubleshooting

### Common Issues

**"Dev server not running"**
```bash
# Start dev server first
npm run dev
# Then run analysis in another terminal
npm run analyze:performance
```

**"No webpack stats found"**
```bash
# Build the project first
npm run build
# Then run bundle analysis
npm run analyze:bundle
```

**Lighthouse fails to connect**
- Ensure dev server is running on port 3002
- Check firewall settings
- Try with `--skip-lighthouse` flag

## 📚 Understanding the Reports

### Performance Score Interpretation

- **90-100**: Excellent performance
- **70-89**: Good performance, minor optimizations needed
- **50-69**: Needs improvement, focus on high-impact optimizations
- **0-49**: Poor performance, significant work required

### Key Metrics Explained

- **LCP (Largest Contentful Paint)**: Time when main content is loaded
- **FID (First Input Delay)**: Time from first user interaction to browser response
- **CLS (Cumulative Layout Shift)**: Visual stability of the page
- **TBT (Total Blocking Time)**: Time the page is blocked from responding

## 🎖️ Performance Best Practices

Based on analysis results, follow these best practices:

### Images
- ✅ Use WebP/AVIF formats
- ✅ Implement priority loading for above-the-fold images
- ✅ Optimize image sizes for different viewports
- ✅ Use CDN for image delivery

### JavaScript
- ✅ Code splitting with dynamic imports
- ✅ Tree shaking for unused code elimination
- ✅ Minimize third-party scripts
- ✅ Lazy load non-critical components

### Server Response
- ✅ Minimize SSR blocking operations
- ✅ Use client-side data fetching for heavy operations
- ✅ Implement proper caching strategies
- ✅ Optimize database queries

---

*Generated by Claude Code Performance Analysis Tools*

For questions or issues, check the generated reports or review the script files in the `scripts/` directory.