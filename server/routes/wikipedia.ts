
import { Router } from 'express';

const router = Router();

// Wikipedia disaster events cache
let wikipediaCache: any = null;
let wikipediaCacheTime: number = 0;
const WIKIPEDIA_CACHE_DURATION = 4 * 60 * 60 * 1000; // 4 hours

// Wikipedia API for current events and disasters
router.get('/wikipedia-disasters', async (req, res) => {
  try {
    // Check cache first
    const now = Date.now();
    if (wikipediaCache && (now - wikipediaCacheTime) < WIKIPEDIA_CACHE_DURATION) {
      console.log('✓ Returning cached Wikipedia disaster data');
      return res.json({
        ...wikipediaCache,
        cached: true,
        lastUpdated: new Date(wikipediaCacheTime).toISOString()
      });
    }

    console.log('📖 Fetching disaster information from Wikipedia...');
    
    // Search for current disaster-related articles
    const searchQueries = [
      'natural disasters 2024',
      'hurricanes 2024',
      'wildfires 2024',
      'earthquakes 2024',
      'floods 2024',
      'emergency response'
    ];

    const allArticles: any[] = [];

    for (const query of searchQueries) {
      try {
        // Wikipedia search API
        const searchUrl = `https://en.wikipedia.org/api/rest_v1/page/search?q=${encodeURIComponent(query)}&limit=5`;
        const searchResponse = await fetch(searchUrl, {
          headers: {
            'User-Agent': 'DisasterApp/1.0 (disaster-monitoring@example.com)'
          }
        });

        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          
          for (const page of searchData.pages || []) {
            try {
              // Get page content
              const contentUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(page.title)}`;
              const contentResponse = await fetch(contentUrl, {
                headers: {
                  'User-Agent': 'DisasterApp/1.0 (disaster-monitoring@example.com)'
                }
              });

              if (contentResponse.ok) {
                const contentData = await contentResponse.json();
                
                allArticles.push({
                  id: `wikipedia-${page.pageid}`,
                  title: contentData.title,
                  description: contentData.extract || 'No description available',
                  url: contentData.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title)}`,
                  thumbnail: contentData.thumbnail?.source || null,
                  lastModified: contentData.timestamp || new Date().toISOString(),
                  category: determineCategory(contentData.title, contentData.extract || ''),
                  relevanceScore: calculateRelevance(contentData.title, contentData.extract || '', query)
                });
              }
            } catch (error) {
              console.log(`Error fetching Wikipedia page ${page.title}:`, error);
            }
          }
        }
      } catch (error) {
        console.log(`Error searching Wikipedia for "${query}":`, error);
      }
    }

    // Remove duplicates and sort by relevance
    const uniqueArticles = allArticles.filter((article, index, self) => 
      index === self.findIndex(a => a.id === article.id)
    ).sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, 15);

    console.log(`✓ Wikipedia: ${uniqueArticles.length} relevant disaster articles found`);

    const responseData = {
      success: true,
      articles: uniqueArticles,
      source: 'Wikipedia',
      lastUpdated: new Date().toISOString(),
      totalArticles: uniqueArticles.length,
      cached: false
    };

    // Cache the response
    wikipediaCache = responseData;
    wikipediaCacheTime = now;

    res.json(responseData);
  } catch (error) {
    console.error('Wikipedia API error:', error);
    res.json({
      success: false,
      articles: [],
      source: 'Wikipedia',
      error: 'Unable to fetch Wikipedia disaster information',
      lastUpdated: new Date().toISOString()
    });
  }
});

// Helper function to determine article category
function determineCategory(title: string, extract: string): string {
  const text = (title + ' ' + extract).toLowerCase();
  
  if (text.includes('hurricane') || text.includes('tropical storm') || text.includes('cyclone')) return 'hurricane';
  if (text.includes('wildfire') || text.includes('forest fire') || text.includes('bushfire')) return 'wildfire';
  if (text.includes('earthquake') || text.includes('seismic')) return 'earthquake';
  if (text.includes('flood') || text.includes('flooding')) return 'flood';
  if (text.includes('tornado') || text.includes('twister')) return 'tornado';
  if (text.includes('volcanic') || text.includes('eruption')) return 'volcano';
  if (text.includes('drought') || text.includes('arid')) return 'drought';
  if (text.includes('storm') || text.includes('severe weather')) return 'storm';
  
  return 'general';
}

// Helper function to calculate relevance score
function calculateRelevance(title: string, extract: string, query: string): number {
  const text = (title + ' ' + extract).toLowerCase();
  const queryWords = query.toLowerCase().split(' ');
  
  let score = 0;
  
  // Title matches get higher score
  queryWords.forEach(word => {
    if (title.toLowerCase().includes(word)) score += 10;
    if (extract.toLowerCase().includes(word)) score += 5;
  });
  
  // Boost recent events
  const currentYear = new Date().getFullYear();
  if (text.includes(currentYear.toString())) score += 15;
  if (text.includes((currentYear - 1).toString())) score += 10;
  
  // Boost emergency-related content
  const emergencyKeywords = ['disaster', 'emergency', 'crisis', 'response', 'damage', 'casualties'];
  emergencyKeywords.forEach(keyword => {
    if (text.includes(keyword)) score += 3;
  });
  
  return score;
}

export default router;
