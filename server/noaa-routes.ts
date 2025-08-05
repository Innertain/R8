import { Router } from 'express';

const router = Router();

// Cache for NOAA climate reports
let noaaReportsCache: any = null;
let noaaReportsCacheTime: number = 0;
const NOAA_REPORTS_CACHE_DURATION = 2 * 60 * 60 * 1000; // 2 hour cache

// NOAA Monthly Climate Reports RSS Feed endpoint
router.get("/noaa-monthly-reports", async (req, res) => {
  try {
    // Check cache first
    const now = Date.now();
    if (noaaReportsCache && (now - noaaReportsCacheTime) < NOAA_REPORTS_CACHE_DURATION) {
      console.log('✓ Returning cached NOAA climate reports');
      return res.json({
        ...noaaReportsCache,
        cached: true,
        lastUpdated: new Date(noaaReportsCacheTime).toISOString()
      });
    }

    console.log('🌡️ Fetching NOAA monthly climate reports...');
    
    const response = await fetch('https://www.ncei.noaa.gov/access/monitoring/monthly-report/feed.rss');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const rssText = await response.text();
    
    // Parse RSS XML
    const Parser = (await import('rss-parser')).default;
    const parser = new Parser({
      customFields: {
        item: ['category']
      }
    });
    
    const feed = await parser.parseString(rssText);
    
    // Process and categorize the climate reports
    const reports = feed.items.map((item: any) => {
      const category = item.category || 'general';
      const title = item.title || '';
      const description = item.description || '';
      
      // Extract numerical data from descriptions where possible
      let temperatureAnomaly = null;
      let precipitationData = null;
      let percentageData = null;
      
      // Temperature anomaly extraction
      const tempMatch = description.match(/([+-]?[\d.]+)\s*degrees?\s*(celsius|fahrenheit)/i);
      if (tempMatch) {
        temperatureAnomaly = {
          value: parseFloat(tempMatch[1]),
          unit: tempMatch[2].toLowerCase()
        };
      }
      
      // Precipitation data extraction
      const precipMatch = description.match(/precipitation.*?(\d+\.?\d*)\s*(inches|mm)/i);
      if (precipMatch) {
        precipitationData = {
          value: parseFloat(precipMatch[1]),
          unit: precipMatch[2]
        };
      }
      
      // Percentage data extraction (for drought, ice extent, etc.)
      const percentMatch = description.match(/(\d+\.?\d*)%/);
      if (percentMatch) {
        percentageData = parseFloat(percentMatch[1]);
      }
      
      return {
        id: item.guid || item.link,
        title,
        description,
        category,
        link: item.link,
        pubDate: item.pubDate,
        temperatureAnomaly,
        precipitationData,
        percentageData,
        reportType: category === 'national' ? 'US National' : 
                   category === 'global' ? 'Global' : 'Regional'
      };
    });
    
    // Group reports by type for easier visualization
    const categorizedReports = {
      temperature: reports.filter(r => r.title.toLowerCase().includes('climate report') || r.title.toLowerCase().includes('temperature')),
      drought: reports.filter(r => r.title.toLowerCase().includes('drought')),
      wildfire: reports.filter(r => r.title.toLowerCase().includes('fire')),
      storms: reports.filter(r => r.title.toLowerCase().includes('tornado') || r.title.toLowerCase().includes('tropical')),
      ice: reports.filter(r => r.title.toLowerCase().includes('snow') || r.title.toLowerCase().includes('ice')),
      other: reports.filter(r => !['temperature', 'drought', 'wildfire', 'storms', 'ice'].some(cat => 
        r.title.toLowerCase().includes(cat === 'temperature' ? 'climate' : cat)
      ))
    };
    
    console.log(`✅ NOAA reports processed: ${reports.length} total reports`);
    console.log(`📊 Categories: Temperature(${categorizedReports.temperature.length}), Drought(${categorizedReports.drought.length}), Wildfire(${categorizedReports.wildfire.length}), Storms(${categorizedReports.storms.length}), Ice(${categorizedReports.ice.length}), Other(${categorizedReports.other.length})`);
    
    const responseData = {
      success: true,
      reports,
      categorized: categorizedReports,
      totalReports: reports.length,
      lastUpdated: new Date().toISOString(),
      source: 'NOAA National Centers for Environmental Information',
      cached: false
    };

    // Cache the response
    noaaReportsCache = responseData;
    noaaReportsCacheTime = now;
    
    res.json(responseData);
    
  } catch (error: any) {
    console.error('❌ NOAA monthly reports error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      reports: [],
      categorized: {
        temperature: [],
        drought: [],
        wildfire: [],
        storms: [],
        ice: [],
        other: []
      },
      totalReports: 0,
      source: 'NOAA National Centers for Environmental Information'
    });
  }
});

export default router;