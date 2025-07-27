// Server-side Airtable API integration
import { type AirtableShift } from '../client/src/lib/api';

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const BASE_ID = process.env.VITE_BASE_ID?.replace(/\.$/, ''); // Remove trailing period if present
const TABLE_NAME = 'Shifts'; // Common alternatives: 'shifts', 'Volunteer Shifts', 'VolunteerShifts'

export async function fetchShiftsFromAirtableServer(): Promise<AirtableShift[]> {
  if (!AIRTABLE_TOKEN || !BASE_ID) {
    throw new Error('Missing Airtable credentials');
  }

  // First, let's try to list all tables to see what's available
  const metaUrl = `https://api.airtable.com/v0/meta/bases/${BASE_ID}/tables`;
  console.log(`Checking available tables at: ${metaUrl}`);

  try {
    const metaResponse = await fetch(metaUrl, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`
      }
    });

    if (metaResponse.ok) {
      const metaData = await metaResponse.json();
      console.log('Available tables:', metaData.tables?.map((t: any) => t.name) || 'Unable to list tables');
    }
  } catch (metaError) {
    console.log('Could not fetch table metadata:', metaError);
  }

  // Try multiple common table names including the ones found in your base
  const possibleTableNames = ['V Shifts', 'V Activities', 'Shifts', 'shifts', 'Volunteer Shifts', 'VolunteerShifts', 'Table 1'];
  
  for (const tableName of possibleTableNames) {
    const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(tableName)}`;
    console.log(`Trying table name: "${tableName}" at: ${url}`);

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${AIRTABLE_TOKEN}`
        }
      });

      if (response.ok) {
        console.log(`✓ Successfully connected to table: "${tableName}"`);
        const data = await response.json();
        console.log(`Found ${data.records?.length || 0} records`);
        
        // Debug: Log the first record's field names to understand the structure
        if (data.records && data.records.length > 0) {
          console.log('Available field names in first record:', Object.keys(data.records[0].fields));
          console.log('First record fields:', data.records[0].fields);
        }

        // Convert Airtable format to our application format
        return data.records.map((record: any) => ({
          id: record.id,
          activityName: record.fields.activityName || record.fields['Activity Name'] || 'Unknown Activity',
          dateTime: record.fields.dateTime || record.fields['Date Time'] || 'TBD',
          location: record.fields.location || record.fields['Location'] || 'TBD',
          volunteersNeeded: record.fields.volunteersNeeded || record.fields['Volunteers Needed'] || 0,
          volunteersSignedUp: record.fields.volunteersSignedUp || record.fields['Volunteers Signed Up'] || 0,
          status: record.fields.status || record.fields['Status'] || 'active',
          category: record.fields.category || record.fields['Category'] || 'general',
          icon: record.fields.icon || record.fields['Icon'] || 'users'
        }));
      } else {
        const errorText = await response.text();
        console.log(`✗ Table "${tableName}" not found: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.log(`✗ Error trying table "${tableName}":`, error);
    }
  }

  throw new Error('No accessible table found. Please check your Airtable base has a table named "Shifts" or provide the correct table name.');

  const data = await response.json();

  // Convert Airtable format to our application format
  return data.records.map((record: any) => ({
    id: record.id,
    activityName: record.fields.activityName || record.fields['Activity Name'] || 'Unknown Activity',
    dateTime: record.fields.dateTime || record.fields['Date Time'] || 'TBD',
    location: record.fields.location || record.fields['Location'] || 'TBD',
    volunteersNeeded: record.fields.volunteersNeeded || record.fields['Volunteers Needed'] || 0,
    volunteersSignedUp: record.fields.volunteersSignedUp || record.fields['Volunteers Signed Up'] || 0,
    status: record.fields.status || record.fields['Status'] || 'active',
    category: record.fields.category || record.fields['Category'] || 'general',
    icon: record.fields.icon || record.fields['Icon'] || 'users'
  }));
}