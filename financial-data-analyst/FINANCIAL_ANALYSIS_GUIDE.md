# Financial Data Analyst - Complete Guide 📊

**Last Updated:** February 2026
**App Status:** ✅ Fully Operational with Dynamic Token Access

---

## 🎯 Overview

The Financial Data Analyst is a Next.js application powered by Claude AI that provides:
- **Intelligent Financial Analysis** - AI-powered insights from your data
- **Interactive Visualizations** - 6 chart types for data visualization
- **Dynamic Token Management** - Secure keychain-based authentication
- **Multi-format Support** - CSV, PDF, images, and text files
- **Real-time Analysis** - Instant chart generation and insights

---

## 🔐 Authentication Setup

### Dynamic Keychain Access (Recommended)
The app uses **dynamic keychain access** for maximum security:

**How it Works:**
1. Each API request retrieves your token from macOS keychain
2. Token is only in memory during the request
3. No token files stored locally
4. Works automatically with Claude Code/Agency

**Configuration:**
```typescript
// app/api/finance/route.ts
export const runtime = "nodejs";  // Node.js runtime for keychain access

// Token retrieved dynamically on each request
const apiKey = getApiKeyWithPlatformCheck({ verbose: true });
```

**Fallback Options:**
- Environment variable: `ANTHROPIC_API_KEY`
- Local config: Create `.env.local` with your key (if needed)

---

## 📁 Available Datasets

### 1. Sample Financial Data
**File:** `sample-data.csv`
- **Purpose:** Basic demo with 6 quarters of data
- **Metrics:** Revenue, Costs, Profit, Growth
- **Use Case:** Learning the app interface

### 2. Advanced Financial Data
**File:** `advanced-financial-data.csv`
- **Rows:** 100 comprehensive data points
- **Time Period:** 18 months (Jan 2024 - Jun 2025)
- **Dimensions:**
  - 3 Regions (North America, Europe, Asia Pacific)
  - 3 Product Categories (Software, Hardware, Cloud Services)
- **Metrics:**
  - Revenue, COGS, Operating Expenses
  - Marketing Spend, R&D Investment
  - Gross/Net Profit, Units Sold
  - Customer Count, CAC, Churn Rate

### 3. Microsoft Financial Data (Real-World Example)

#### **microsoft-quarterly-financials.csv**
- **Q4 FY2024 - Q4 FY2025** (5 quarters)
- **Revenue Range:** $64.7B - $76.4B
- **Metrics:**
  - Total Revenue, Operating Income, Net Income
  - Diluted EPS, Cloud Revenue
  - Azure Growth %, YoY Growth %
  - Operating & Net Margins

**Key Highlights:**
- Q4 FY2025: $76.4B revenue (+18% YoY)
- Cloud Revenue: $48.2B
- Azure Growth: 34% YoY
- Net Income: $27.2B (+24% YoY)

#### **microsoft-detailed-segments.csv**
**Business Segments:**
1. **Productivity & Business Processes**
   - Office 365, Dynamics 365, LinkedIn
   - Q4 FY2025: $23.5B (+13% YoY)

2. **Intelligent Cloud**
   - Azure, SQL Server, Enterprise Services
   - Q4 FY2025: $36.2B (+21% YoY)

3. **More Personal Computing**
   - Windows, Gaming/Xbox, Surface
   - Q4 FY2025: $16.7B (+15% YoY)

#### **microsoft-annual-summary.csv**
**Full Fiscal Year Comparison:**
- **FY2024:** $245.1B revenue
- **FY2025:** $281.7B revenue (+15%)
- **Operating Income:** $130.3B
- **Net Income:** $104.1B
- **Cloud Annual Revenue:** $174.3B
- **R&D Spend:** $32.8B
- **Capital Expenditures:** $53.0B

---

## 🚀 How to Use the App

### Starting the Application

```bash
cd /Users/ghu/aiworker/claude-quickstarts/financial-data-analyst
npm run dev
```

**Access:** http://localhost:3001

### Uploading Data

1. **Click the upload button** (📎 icon)
2. **Select a CSV file** from the datasets above
3. **Ask Claude to analyze** the data

### Example Queries

#### Basic Analysis
```
"Analyze the revenue trends"
"What are the key insights from this data?"
"Summarize the financial performance"
```

#### Chart Generation
```
"Create a line chart showing revenue growth over time"
"Show a bar chart comparing Q1 vs Q2 performance"
"Generate a pie chart of total revenue by region"
"Create a stacked area chart of revenue by product category"
```

#### Deep Dives
```
"Compare cloud revenue vs total revenue trends"
"Which business segment is growing fastest?"
"Analyze profit margin trends across quarters"
"Show the correlation between R&D spend and revenue growth"
```

#### Microsoft-Specific Queries
```
"Analyze Microsoft's quarterly revenue trajectory"
"Compare the growth rates of Azure vs other segments"
"Show Microsoft's operating margin trend"
"Which quarter had the highest net income growth?"
"Create a comprehensive dashboard with 6 key metrics"
```

---

## 📊 Available Chart Types

### 1. Line Charts
**Best For:** Time series trends, growth trajectories
```
"Show revenue growth as a line chart over 5 quarters"
```

### 2. Bar Charts
**Best For:** Period comparisons, single metric analysis
```
"Compare quarterly revenue with a bar chart"
```

### 3. Multi-Bar Charts
**Best For:** Multiple metrics comparison
```
"Create a multi-bar chart comparing revenue vs costs by region"
```

### 4. Area Charts
**Best For:** Volume over time, cumulative trends
```
"Show total revenue volume as an area chart"
```

### 5. Stacked Area Charts
**Best For:** Component breakdowns over time
```
"Create a stacked area chart of revenue by product category"
```

### 6. Pie Charts
**Best For:** Distribution analysis, market share
```
"Show revenue distribution by segment as a pie chart"
```

---

## 🎓 Use Cases

### Financial Analysis
- **Revenue Analysis:** Track growth trends and identify patterns
- **Cost Management:** Analyze cost structures and efficiency
- **Profitability:** Monitor margins and profit optimization
- **Performance Tracking:** Compare quarters and year-over-year

### Business Intelligence
- **Regional Performance:** Identify top-performing markets
- **Product Analysis:** Evaluate product line profitability
- **Customer Metrics:** Analyze CAC, churn, and customer value
- **Investment Analysis:** Track R&D and CapEx effectiveness

### Strategic Planning
- **Trend Identification:** Spot growth opportunities
- **Competitive Analysis:** Compare against benchmarks
- **Forecasting Support:** Use historical data for projections
- **Decision Making:** Data-driven insights for strategy

### Beyond Finance
- **Environmental Data:** Track sustainability metrics
- **Sports Analytics:** Performance tracking and analysis
- **Research Data:** Visualize scientific findings
- **Any Numerical Data:** General-purpose analysis tool

---

## 🛠 Technical Architecture

### Stack
- **Frontend:** Next.js 14, React, TailwindCSS
- **Visualization:** Recharts library (6 chart types)
- **AI Engine:** Claude Sonnet 4.5 (latest model)
- **Runtime:** Node.js (for keychain access)
- **File Processing:** Multi-format support (CSV, PDF, images)

### Key Features
```typescript
// Dynamic Token Detection
export function getApiKeyWithPlatformCheck() {
  if (isEdgeRuntime()) return process.env.ANTHROPIC_API_KEY;
  if (!isMacOS()) return process.env.ANTHROPIC_API_KEY;
  return getApiKey(); // Retrieves from keychain
}

// Chart Generation Tool
const tools = [{
  name: "generate_graph_data",
  description: "Generate structured JSON for financial charts",
  input_schema: {
    chartType: ["bar", "multiBar", "line", "pie", "area", "stackedArea"],
    config: { title, description, trend, footer },
    data: Array<DataPoint>,
    chartConfig: ChartConfiguration
  }
}];
```

### Security Features
- ✅ **Dynamic keychain access** (no stored tokens)
- ✅ **Per-request authentication** (fresh token each time)
- ✅ **Secure credential storage** (macOS keychain)
- ✅ **No token exposure** (never written to disk)
- ✅ **Fallback options** (environment variables)

---

## 📝 Data Sources & Attribution

### Microsoft Financial Data
**Sources:**
- [Microsoft FY25 Q4 Press Release](https://www.microsoft.com/en-us/investor/earnings/fy-2025-q4/press-release-webcast)
- [Microsoft FY25 Q1 Performance](https://www.microsoft.com/en-us/investor/earnings/fy-2025-q1/performance)
- [Microsoft FY25 Q2 Segment Revenues](https://www.microsoft.com/en-us/Investor/earnings/FY-2025-Q2/segment-revenues)
- [Microsoft 2025 Annual Report](https://www.microsoft.com/investor/reports/ar25/index.html)

**Data Accuracy:** All Microsoft financial data is sourced from official investor relations documents as of February 2026.

---

## 🎯 Tips for Best Results

### 1. Data Preparation
- Use clear column headers in CSV files
- Include date/period columns for time-series analysis
- Ensure numerical data is properly formatted
- Remove unnecessary columns for cleaner analysis

### 2. Effective Prompts
- **Be specific:** "Create a bar chart of Q4 revenue by region"
- **Request insights:** "What are the key trends and why?"
- **Multiple charts:** "Generate 4 different visualizations"
- **Comparisons:** "Compare 2024 vs 2025 performance"

### 3. Analysis Flow
1. **Upload data** and let Claude summarize it
2. **Request overview charts** (line charts for trends)
3. **Dive deeper** with comparative charts (multi-bar, pie)
4. **Ask follow-up questions** about specific patterns
5. **Generate reports** by requesting comprehensive analysis

### 4. Advanced Techniques
- **Combine datasets:** Upload multiple files for comparison
- **Iterative refinement:** Start broad, then narrow focus
- **Cross-dimensional:** "Compare regions AND products"
- **Time-based slicing:** "Show only 2025 data"

---

## 🔧 Troubleshooting

### Token Not Found
**Issue:** 401 error "No API key found"

**Solutions:**
1. Verify Claude Code/Agency is installed
2. Check keychain: `security find-generic-password -s "Claude Code"`
3. Set environment variable: `export ANTHROPIC_API_KEY=your-key`
4. Create `.env.local` with key (if needed)

### Charts Not Generating
**Issue:** Response but no visualization

**Solutions:**
- Ensure data has numerical values
- Check for proper column headers
- Verify CSV format (no special characters)
- Try simpler prompt: "Create any chart from this data"

### Model Not Found Error
**Issue:** "model: claude-3-5-sonnet-20240620 not found"

**Solution:** The app has been updated to use Claude Sonnet 4.5 (`claude-sonnet-4-5-20250929`). Hard refresh your browser (Cmd+Shift+R).

### Performance Issues
**Issue:** Slow responses with large datasets

**Solutions:**
- Limit CSV to most relevant columns
- Use aggregated data for overviews
- Request specific time periods
- Consider breaking large analyses into parts

---

## 📚 Example Analysis Session

### Analyzing Microsoft FY2025 Performance

```javascript
// 1. Upload microsoft-quarterly-financials.csv
User: "Hi"
Claude: "Hello! Ready to analyze financial data."

// 2. Upload the file
User: [uploads microsoft-quarterly-financials.csv]

// 3. Request comprehensive analysis
User: "Analyze Microsoft's quarterly performance and create 5 different visualizations"

Claude generates:
✅ Line chart: Revenue growth trend (5 quarters)
✅ Bar chart: Quarter-over-quarter growth comparison
✅ Area chart: Cloud revenue trajectory
✅ Multi-bar: Revenue vs Operating Income by quarter
✅ Line chart: Profit margin trends

// 4. Deep dive
User: "Which quarter had the best performance and why?"

Claude analyzes:
"Q4 FY2025 showed the strongest performance with:
- Highest revenue: $76.4B (+18% YoY)
- Best net income: $27.2B (+24% YoY)
- Strong cloud growth: 34%
- Key drivers: Azure expansion, Office 365 growth..."

// 5. Segment analysis
User: [uploads microsoft-detailed-segments.csv]
User: "Compare the three business segments"

Claude provides:
✅ Pie chart: Revenue distribution by segment
✅ Multi-bar: Growth rates by segment
✅ Insights on Intelligent Cloud leading growth
```

---

## 🎉 Success Stories

### What Works Great
- ✅ **Real-world financial data** (Microsoft, company reports)
- ✅ **Multi-dimensional analysis** (regions, products, time)
- ✅ **Complex datasets** (100+ rows with multiple metrics)
- ✅ **Comparative analysis** (YoY, QoQ, segment comparisons)
- ✅ **Dynamic visualizations** (multiple chart types at once)

### Proven Use Cases
- 📊 Quarterly earnings analysis
- 📈 Growth trend identification
- 🌍 Regional performance comparison
- 📦 Product line evaluation
- 💰 Profitability tracking
- 👥 Customer metrics analysis

---

## 🔮 Future Enhancements

Potential improvements for the app:
- [ ] Export charts as images/PDF
- [ ] Save analysis sessions
- [ ] Custom color themes for charts
- [ ] Data filtering within app
- [ ] Multi-file comparison view
- [ ] Automated report generation
- [ ] Scheduled data analysis

---

## 📞 Support & Resources

### Documentation
- **README.md** - Project setup and overview
- **SETUP_COMPLETE.md** - Initial setup documentation
- **This Guide** - Comprehensive usage instructions

### Key Files
```
financial-data-analyst/
├── app/api/finance/route.ts    # API endpoint with token detection
├── lib/token-manager.ts         # Dynamic keychain access
├── components/                  # UI components
├── sample-data.csv             # Demo dataset
├── advanced-financial-data.csv  # Complex demo dataset
├── microsoft-*.csv             # Real Microsoft data
└── FINANCIAL_ANALYSIS_GUIDE.md # This guide
```

### Useful Commands
```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Check token in keychain
security find-generic-password -s "Claude Code" -w
```

---

## ✅ Quick Start Checklist

- [ ] App running at http://localhost:3001
- [ ] Token detection working (check console logs)
- [ ] Sample data files available
- [ ] Can upload CSV and see analysis
- [ ] Charts generating correctly
- [ ] Claude Sonnet 4.5 model active

---

## 🎓 Learning Path

### Beginner
1. Start with `sample-data.csv` (6 rows)
2. Ask for basic analysis
3. Request one chart type at a time
4. Learn the UI and interface

### Intermediate
1. Use `advanced-financial-data.csv` (100 rows)
2. Request multiple charts together
3. Ask comparative questions
4. Explore different chart types

### Advanced
1. Use real Microsoft financial data
2. Perform multi-dimensional analysis
3. Create comprehensive dashboards
4. Generate actionable insights

---

## 🌟 Best Practices

1. **Start Simple** - Let Claude understand your data first
2. **Be Specific** - Clear requests get better results
3. **Iterate** - Build on previous analyses
4. **Verify** - Cross-check important insights
5. **Document** - Save interesting findings
6. **Experiment** - Try different chart combinations
7. **Ask Why** - Don't just request charts, seek insights

---

## 📊 Summary

The Financial Data Analyst combines:
- **Powerful AI** (Claude Sonnet 4.5)
- **Beautiful Visualizations** (6 chart types)
- **Secure Authentication** (Dynamic keychain access)
- **Real-world Data** (Microsoft and custom datasets)
- **Instant Insights** (AI-powered analysis)

Ready to transform your financial data into actionable insights! 🚀

---

**Status:** ✅ Fully Operational
**Version:** 2.0 (Node.js Runtime with Dynamic Keychain)
**Last Update:** February 13, 2026
**App URL:** http://localhost:3001
