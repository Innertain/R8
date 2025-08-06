
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, BookOpen, Clock, RefreshCw } from 'lucide-react';
import DataSourceAttribution from './DataSourceAttribution';

interface WikipediaArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail?: string;
  lastModified: string;
  category: string;
  relevanceScore: number;
}

interface WikipediaResponse {
  success: boolean;
  articles: WikipediaArticle[];
  source: string;
  lastUpdated: string;
  totalArticles: number;
  cached?: boolean;
  error?: string;
}

const WikipediaDisasterFeed: React.FC = () => {
  const [data, setData] = useState<WikipediaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const fetchWikipediaData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/wikipedia-disasters');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching Wikipedia data:', error);
      setData({
        success: false,
        articles: [],
        source: 'Wikipedia',
        lastUpdated: new Date().toISOString(),
        totalArticles: 0,
        error: 'Failed to fetch data'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWikipediaData();
  }, []);

  const categories = data?.articles ? 
    ['all', ...Array.from(new Set(data.articles.map(a => a.category)))] : ['all'];

  const filteredArticles = data?.articles?.filter(article => 
    selectedCategory === 'all' || article.category === selectedCategory
  ) || [];

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      hurricane: 'bg-red-100 text-red-800',
      wildfire: 'bg-orange-100 text-orange-800',
      earthquake: 'bg-yellow-100 text-yellow-800',
      flood: 'bg-blue-100 text-blue-800',
      tornado: 'bg-purple-100 text-purple-800',
      volcano: 'bg-gray-100 text-gray-800',
      storm: 'bg-indigo-100 text-indigo-800',
      general: 'bg-green-100 text-green-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Wikipedia Disaster Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            <span className="ml-2">Loading Wikipedia articles...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Emergency Information Encyclopedia
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {data?.totalArticles || 0} relevant disaster articles from Wikipedia
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchWikipediaData}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Articles Grid */}
          {data?.success ? (
            <div className="grid gap-4">
              {filteredArticles.map((article) => (
                <div key={article.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                  <div className="flex gap-4">
                    {article.thumbnail && (
                      <img 
                        src={article.thumbnail} 
                        alt={article.title}
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-lg leading-tight">
                          {article.title}
                        </h3>
                        <Badge className={getCategoryColor(article.category)}>
                          {article.category}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                        {article.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>
                            Updated {new Date(article.lastModified).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Read more
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredArticles.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No articles found for the selected category.
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-red-600">
              {data?.error || 'Failed to load Wikipedia data'}
            </div>
          )}

          {/* Data Source Attribution */}
          <div className="mt-6 pt-4 border-t">
            <DataSourceAttribution
              title="Emergency Information Encyclopedia"
              source="Wikipedia"
              lastUpdated={data?.lastUpdated || new Date().toISOString()}
              dataType="Encyclopedia Articles"
              url="https://en.wikipedia.org"
              reliability="encyclopedia"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WikipediaDisasterFeed;
