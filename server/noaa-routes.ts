import { Router } from 'express';

const router = Router();

// Cache for NOAA climate reports
let noaaReportsCache: any = null;
let noaaReportsCacheTime: number = 0;
const NOAA_REPORTS_CACHE_DURATION = 2 * 60 * 60 * 1000; // 2 hour cache

// NOAA Monthly Climate Reports RSS Feed endpoint with enhanced data sources
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

    console.log('🌡️ Fetching comprehensive NOAA climate data from multiple sources...');
    
    // Fetch from multiple NOAA RSS feeds for more comprehensive data
    const feedUrls = [
      'https://www.ncei.noaa.gov/access/monitoring/monthly-report/feed.rss', // Monthly reports
      'https://www.ncei.noaa.gov/news/feed.rss', // NCEI news and announcements
      'https://www.climate.gov/news-features/feed.rss', // Climate.gov news
      'https://www.weather.gov/rss/climate.xml', // NWS climate summaries
    ];

    const Parser = (await import('rss-parser')).default;
    const parser = new Parser({
      customFields: {
        item: ['category', 'author', 'summary']
      }
    });

    let allReports: any[] = [];
    let feedResults: any[] = [];

    // Fetch from all feeds simultaneously
    const feedPromises = feedUrls.map(async (url, index) => {
      try {
        console.log(`📡 Fetching from feed ${index + 1}: ${url}`);
        const response = await fetch(url);
        if (!response.ok) {
          console.warn(`⚠️ Feed ${index + 1} failed: ${response.status}`);
          return { url, success: false, error: `HTTP ${response.status}` };
        }
        
        const rssText = await response.text();
        const feed = await parser.parseString(rssText);
        
        return { url, success: true, feed, itemCount: feed.items?.length || 0 };
      } catch (error: any) {
        console.warn(`⚠️ Feed ${index + 1} error:`, error.message);
        return { url, success: false, error: error.message };
      }
    });

    feedResults = await Promise.all(feedPromises);
    
    // Process all successful feeds
    feedResults.forEach((result, index) => {
      if (result.success && result.feed?.items) {
        const feedType = index === 0 ? 'monthly-reports' : 
                        index === 1 ? 'ncei-news' : 
                        index === 2 ? 'climate-gov' : 'nws-climate';
        
        result.feed.items.forEach((item: any) => {
          allReports.push({
            ...item,
            feedSource: feedType,
            feedIndex: index
          });
        });
      }
    });

    console.log(`📊 Collected ${allReports.length} reports from ${feedResults.filter(r => r.success).length} successful feeds`);
    
    // Process and categorize all climate reports with enhanced data extraction
    const reports = allReports.map((item: any) => {
      const category = item.category || 'general';
      const title = item.title || '';
      const description = item.description || item.summary || '';
      const content = item.content || item.contentSnippet || '';
      const fullText = `${description} ${content}`.toLowerCase();
      
      // Enhanced numerical data extraction
      let temperatureAnomaly = null;
      let precipitationData = null;
      let percentageData = null;
      let severityLevel = 'normal';
      let geographicScope = 'regional';
      
      // Advanced temperature anomaly extraction
      const tempPatterns = [
        /([+-]?[\d.]+)\s*degrees?\s*(celsius|fahrenheit|f|c)/i,
        /temperature.*?([+-]?[\d.]+)\s*°?[fc]/i,
        /([+-]?[\d.]+)\s*°?[fc]\s*above|below/i,
        /anomaly.*?([+-]?[\d.]+)/i
      ];
      
      for (const pattern of tempPatterns) {
        const match = fullText.match(pattern);
        if (match) {
          temperatureAnomaly = {
            value: parseFloat(match[1]),
            unit: (match[2] || 'fahrenheit').toLowerCase(),
            confidence: 'high'
          };
          break;
        }
      }
      
      // Enhanced precipitation data extraction
      const precipPatterns = [
        /precipitation.*?(\d+\.?\d*)\s*(inches|mm|centimeters|cm)/i,
        /rainfall.*?(\d+\.?\d*)\s*(inches|mm|centimeters|cm)/i,
        /(\d+\.?\d*)\s*(inches|mm|cm).*?rain/i,
        /moisture.*?(\d+\.?\d*)\s*percent/i
      ];
      
      for (const pattern of precipPatterns) {
        const match = fullText.match(pattern);
        if (match) {
          precipitationData = {
            value: parseFloat(match[1]),
            unit: match[2].toLowerCase(),
            confidence: 'high'
          };
          break;
        }
      }
      
      // Enhanced percentage data extraction with context
      const percentPatterns = [
        /(\d+\.?\d*)%.*?(drought|dry|arid)/i,
        /(\d+\.?\d*)%.*?(ice|snow|frozen)/i,
        /(\d+\.?\d*)%.*?(flood|wet|moisture)/i,
        /(\d+\.?\d*)%.*?(fire|burn|wildfire)/i,
        /(\d+\.?\d*)%/
      ];
      
      for (const pattern of percentPatterns) {
        const match = fullText.match(pattern);
        if (match) {
          percentageData = {
            value: parseFloat(match[1]),
            context: match[2] || 'general',
            confidence: match[2] ? 'high' : 'medium'
          };
          break;
        }
      }
      
      // Determine severity level
      const severityKeywords = {
        critical: ['extreme', 'severe', 'critical', 'emergency', 'unprecedented', 'record-breaking'],
        high: ['significant', 'major', 'substantial', 'notable', 'concerning'],
        moderate: ['moderate', 'elevated', 'increased', 'notable'],
        normal: ['normal', 'typical', 'average', 'routine']
      };
      
      for (const [level, keywords] of Object.entries(severityKeywords)) {
        if (keywords.some(keyword => fullText.includes(keyword))) {
          severityLevel = level;
          break;
        }
      }
      
      // Determine geographic scope
      if (fullText.includes('global') || fullText.includes('worldwide') || fullText.includes('international')) {
        geographicScope = 'global';
      } else if (fullText.includes('national') || fullText.includes('united states') || fullText.includes('nationwide')) {
        geographicScope = 'national';
      } else if (fullText.includes('region') || fullText.includes('state') || fullText.includes('local')) {
        geographicScope = 'regional';
      }
      
      // Enhanced categorization
      let enhancedCategory = 'other';
      const categoryKeywords = {
        temperature: ['temperature', 'heat', 'warm', 'cold', 'thermal', 'climate report'],
        drought: ['drought', 'dry', 'arid', 'water shortage', 'moisture deficit'],
        wildfire: ['fire', 'wildfire', 'burn', 'blaze', 'smoke'],
        storms: ['storm', 'hurricane', 'tornado', 'cyclone', 'typhoon', 'severe weather'],
        ice: ['ice', 'snow', 'frozen', 'winter', 'blizzard', 'arctic'],
        flooding: ['flood', 'inundation', 'overflow', 'deluge'],
        air_quality: ['air quality', 'pollution', 'smog', 'particulate'],
        ocean: ['ocean', 'sea', 'marine', 'coastal', 'tide']
      };
      
      for (const [cat, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some(keyword => fullText.includes(keyword))) {
          enhancedCategory = cat;
          break;
        }
      }
      
      return {
        id: item.guid || item.link || `${item.feedSource}-${Date.now()}-${Math.random()}`,
        title,
        description: description.substring(0, 500), // Limit description length
        fullContent: content,
        category: enhancedCategory,
        originalCategory: category,
        link: item.link,
        pubDate: item.pubDate,
        author: item.author || item.creator,
        feedSource: item.feedSource,
        temperatureAnomaly,
        precipitationData,
        percentageData,
        severityLevel,
        geographicScope,
        reportType: geographicScope === 'global' ? 'Global' : 
                   geographicScope === 'national' ? 'US National' : 'Regional',
        processingTimestamp: new Date().toISOString()
      };
    });
    
    // Sort reports by date (newest first) and remove duplicates
    const uniqueReports = reports.filter((report, index, self) => 
      index === self.findIndex(r => r.title === report.title || r.link === report.link)
    ).sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

    // Group reports by enhanced categories
    const categorizedReports = {
      temperature: uniqueReports.filter(r => r.category === 'temperature'),
      drought: uniqueReports.filter(r => r.category === 'drought'),
      wildfire: uniqueReports.filter(r => r.category === 'wildfire'),
      storms: uniqueReports.filter(r => r.category === 'storms'),
      ice: uniqueReports.filter(r => r.category === 'ice'),
      flooding: uniqueReports.filter(r => r.category === 'flooding'),
      air_quality: uniqueReports.filter(r => r.category === 'air_quality'),
      ocean: uniqueReports.filter(r => r.category === 'ocean'),
      other: uniqueReports.filter(r => r.category === 'other')
    };

    // Generate enhanced statistics
    const severityStats = uniqueReports.reduce((acc: any, report) => {
      acc[report.severityLevel] = (acc[report.severityLevel] || 0) + 1;
      return acc;
    }, {});

    const scopeStats = uniqueReports.reduce((acc: any, report) => {
      acc[report.geographicScope] = (acc[report.geographicScope] || 0) + 1;
      return acc;
    }, {});

    const feedStats = uniqueReports.reduce((acc: any, report) => {
      acc[report.feedSource] = (acc[report.feedSource] || 0) + 1;
      return acc;
    }, {});

    // Calculate trends from recent data
    const recentReports = uniqueReports.slice(0, 30);
    const temperatureTrends = recentReports
      .filter(r => r.temperatureAnomaly)
      .map(r => ({
        date: r.pubDate,
        value: r.temperatureAnomaly.value,
        title: r.title
      }));

    const precipitationTrends = recentReports
      .filter(r => r.precipitationData)
      .map(r => ({
        date: r.pubDate,
        value: r.precipitationData.value,
        unit: r.precipitationData.unit,
        title: r.title
      }));
    
    console.log(`✅ NOAA reports processed: ${uniqueReports.length} unique reports from ${allReports.length} total`);
    console.log(`📊 Enhanced Categories: Temperature(${categorizedReports.temperature.length}), Drought(${categorizedReports.drought.length}), Wildfire(${categorizedReports.wildfire.length}), Storms(${categorizedReports.storms.length}), Ice(${categorizedReports.ice.length}), Flooding(${categorizedReports.flooding.length}), Air Quality(${categorizedReports.air_quality.length}), Ocean(${categorizedReports.ocean.length}), Other(${categorizedReports.other.length})`);
    console.log(`📈 Severity Distribution: Critical(${severityStats.critical || 0}), High(${severityStats.high || 0}), Moderate(${severityStats.moderate || 0}), Normal(${severityStats.normal || 0})`);
    
    const responseData = {
      success: true,
      reports: uniqueReports,
      categorized: categorizedReports,
      totalReports: uniqueReports.length,
      originalCount: allReports.length,
      statistics: {
        severity: severityStats,
        geographicScope: scopeStats,
        feedSources: feedStats,
        temperatureTrends,
        precipitationTrends
      },
      feedResults: feedResults.map(r => ({
        url: r.url,
        success: r.success,
        itemCount: r.itemCount || 0,
        error: r.error
      })),
      lastUpdated: new Date().toISOString(),
      sources: [
        'NOAA National Centers for Environmental Information',
        'NOAA Climate.gov',
        'National Weather Service Climate Division',
        'NCEI News and Announcements'
      ],
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
        flooding: [],
        air_quality: [],
        ocean: [],
        other: []
      },
      statistics: {
        severity: {},
        geographicScope: {},
        feedSources: {},
        temperatureTrends: [],
        precipitationTrends: []
      },
      feedResults: [],
      totalReports: 0,
      source: 'NOAA National Centers for Environmental Information'
    });
  }
});

export default router;