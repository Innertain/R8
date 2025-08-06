import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Calendar, Database, ExternalLink } from 'lucide-react';

interface DataSourceProps {
  source: string;
  lastUpdated: string;
  dataType: string;
  url?: string;
  reliability?: 'official' | 'research' | 'community' | 'encyclopedia';
  className?: string;
  title?: string; // Unified title override
}

const DataSourceAttribution: React.FC<DataSourceProps> = ({
  source,
  lastUpdated,
  dataType,
  url,
  reliability = 'official',
  className = '',
  title
}) => {
  const getReliabilityColor = (level: string) => {
    switch (level) {
      case 'official':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'research':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'community':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'encyclopedia':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className={`flex items-center gap-2 text-xs text-gray-600 ${className}`}>
      <div className="flex items-center gap-1">
        <Database className="w-3 h-3" />
        <span className="font-medium">{title || source}</span>
      </div>
      
      <div className="flex items-center gap-1">
        <Calendar className="w-3 h-3" />
        <span>{formatDate(lastUpdated)}</span>
      </div>
      
      <Badge 
        variant="outline" 
        className={`text-xs px-2 py-0 ${getReliabilityColor(reliability)}`}
      >
        {reliability === 'official' ? 'Official' : 
         reliability === 'research' ? 'Research' : 
         reliability === 'encyclopedia' ? 'Encyclopedia' : 'Community'}
      </Badge>
      
      {url && (
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
        >
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  );
};

export default DataSourceAttribution;