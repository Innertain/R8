// Server route for fetching Mutual Aid Partners from Airtable
import type { Request, Response } from 'express';

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const BASE_ID = process.env.VITE_BASE_ID?.replace(/\.$/, '');

export async function getMutualAidPartners(req: Request, res: Response) {
  if (!AIRTABLE_TOKEN || !BASE_ID) {
    return res.status(500).json({ error: 'Missing Airtable credentials' });
  }

  try {
    const url = `https://api.airtable.com/v0/${BASE_ID}/Mutual%20Aid%20Partners`;
    console.log(`Fetching Mutual Aid Partners from: ${url}`);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`
      }
    });

    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✓ Successfully fetched ${data.records?.length || 0} mutual aid partners`);

    // Convert Airtable format to our application format
    const partners = data.records.map((record: any) => {
      const fields = record.fields;
      
      return {
        id: record.id,
        name: fields.Name || 'Unknown Partner',
        logo: fields.Logo?.[0]?.url || null, // Get logo URL from attachment field
        description: fields.Description || null,
        website: fields.Website || null,
        contact: fields.Contact || null
      };
    });

    res.json(partners);
  } catch (error) {
    console.error('Error fetching mutual aid partners:', error);
    res.status(500).json({ 
      error: 'Failed to fetch mutual aid partners',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}