export interface RssItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  guid: string;
}

export interface ReliefWebItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  guid: string;
  country: string;
  glideCode: string;
  disasterType: string;
}

export function parseReliefWebRss(xmlString: string): ReliefWebItem[] {
  try {
    // Parse ReliefWeb RSS items
    const itemMatches = xmlString.match(/<item[^>]*>[\s\S]*?<\/item>/gi) || [];
    
    return itemMatches.map((itemXml, index) => {
      const getTagContent = (tag: string): string => {
        const match = itemXml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
        if (!match) return '';
        
        let content = match[1].trim();
        content = content.replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1');
        content = content
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/&nbsp;/g, ' ')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'");
        
        return content;
      };

      const title = getTagContent('title') || 'Global Disaster';
      const link = getTagContent('link') || '#';
      const pubDate = getTagContent('pubDate') || '';
      const description = getTagContent('description') || '';
      const guid = getTagContent('guid') || link || `reliefweb-${index}`;

      // Extract structured data from categories and content
      const categories = [...itemXml.matchAll(/<category>([^<]+)<\/category>/gi)];
      let country = '';
      let glideCode = '';
      
      // Find country and GLIDE code from categories
      categories.forEach(([, categoryText]) => {
        const category = categoryText.trim();
        if (category.includes('-') && category.includes('202')) {
          glideCode = category; // GLIDE codes look like "EQ-2025-000111-GTM"
        } else if (!country && category.length > 2) {
          country = category; // Country names
        }
      });

      // Extract disaster type from title
      const disasterTypes = {
        'earthquake': ['earthquake', 'eq-'],
        'flood': ['flood', 'fl-'],
        'wildfire': ['wildfire', 'fire', 'wf-'],
        'hurricane': ['hurricane', 'typhoon', 'cyclone', 'tc-'],
        'drought': ['drought', 'dr-'],
        'volcano': ['volcano', 'vo-'],
        'landslide': ['landslide', 'ls-'],
        'storm': ['storm', 'st-'],
        'tsunami': ['tsunami', 'ts-'],
        'other': ['pollution', 'accident', 'ac-']
      };

      let disasterType = 'other';
      const titleLower = title.toLowerCase();
      const glideLower = glideCode.toLowerCase();
      
      for (const [type, keywords] of Object.entries(disasterTypes)) {
        if (keywords.some(keyword => titleLower.includes(keyword) || glideLower.includes(keyword))) {
          disasterType = type;
          break;
        }
      }

      // Clean up description by removing HTML tags and extracting key info
      const cleanDescription = description
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/\s+/g, ' ') // Normalize whitespace
        .substring(0, 300) + (description.length > 300 ? '...' : '');

      return {
        title,
        link,
        pubDate,
        description: cleanDescription,
        guid,
        country: country || 'Unknown',
        glideCode: glideCode || '',
        disasterType
      };
    });
  } catch (error) {
    console.error('ReliefWeb RSS parsing error:', error);
    return [];
  }
}

export function parseRssXml(xmlString: string): RssItem[] {
  try {
    // Simple regex-based XML parsing for RSS items
    const itemMatches = xmlString.match(/<item[^>]*>[\s\S]*?<\/item>/gi) || [];
    
    return itemMatches.map((itemXml, index) => {
      const getTagContent = (tag: string): string => {
        const match = itemXml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
        if (!match) return '';
        
        let content = match[1].trim();
        
        // Remove CDATA wrapper
        content = content.replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1');
        
        // Clean up HTML entities
        content = content
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/&nbsp;/g, ' ')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'");
        
        return content;
      };

      const rawTitle = getTagContent('title') || 'Emergency Alert';
      const link = getTagContent('link') || '#';
      const pubDate = getTagContent('pubDate') || '';
      const rawDescription = getTagContent('description') || '';
      const guid = getTagContent('guid') || link || `item-${index}`;

      // Extract meaningful information from the HTML description
      const extractFromDescription = (html: string) => {
        // Extract disaster summary
        const summaryMatch = html.match(/field--name-field-dv2-disaster-summary[\s\S]*?<div class="field__item">(.*?)<\/div>/i);
        const disasterType = summaryMatch ? summaryMatch[1].trim() : '';
        
        // Extract state
        const stateMatch = html.match(/field--name-field-dv2-state-territory-tribal[\s\S]*?<div class="field__item">(.*?)<\/div>/i);
        const state = stateMatch ? stateMatch[1].trim() : '';
        
        // Extract declaration type
        const declarationMatch = html.match(/field--name-field-dv2-declaration-type[\s\S]*?<div class="field__item">(.*?)<\/div>/i);
        const declarationType = declarationMatch ? declarationMatch[1].trim() : '';
        
        // Extract incident date
        const dateMatch = html.match(/field--name-field-dv2-declaration-date[\s\S]*?<time[^>]*>(.*?)<\/time>/i);
        const incidentDate = dateMatch ? dateMatch[1].trim() : '';
        
        return {
          disasterType,
          state,
          declarationType,
          incidentDate
        };
      };

      const extractedInfo = extractFromDescription(rawDescription);
      
      // Create meaningful title and description
      const title = extractedInfo.disasterType && extractedInfo.state 
        ? `${extractedInfo.disasterType} - ${extractedInfo.state}`
        : extractedInfo.disasterType || `Emergency Alert #${rawTitle}`;
        
      const description = [
        extractedInfo.declarationType,
        extractedInfo.incidentDate ? `Date: ${extractedInfo.incidentDate}` : '',
        extractedInfo.state ? `Location: ${extractedInfo.state}` : ''
      ].filter(Boolean).join(' • ');

      return {
        title: title.length > 100 ? title.substring(0, 100) + '...' : title,
        link,
        pubDate: extractedInfo.incidentDate || pubDate,
        description: description || 'Emergency disaster declaration',
        guid
      };
    });
  } catch (error) {
    console.error('RSS parsing error:', error);
    return [];
  }
}