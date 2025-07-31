export interface RssItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  guid: string;
}

export function parseRssXml(xmlString: string): RssItem[] {
  try {
    // Simple regex-based XML parsing for RSS items
    const itemMatches = xmlString.match(/<item[^>]*>[\s\S]*?<\/item>/gi) || [];
    
    return itemMatches.map((itemXml, index) => {
      const getTagContent = (tag: string): string => {
        const match = itemXml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
        return match ? match[1].trim().replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1') : '';
      };

      return {
        title: getTagContent('title') || 'No title',
        link: getTagContent('link') || '#',
        pubDate: getTagContent('pubDate') || '',
        description: getTagContent('description') || '',
        guid: getTagContent('guid') || `item-${index}`
      };
    });
  } catch (error) {
    console.error('RSS parsing error:', error);
    return [];
  }
}