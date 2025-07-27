// Server-side Airtable API integration
import { type AirtableShift } from '../client/src/lib/api';

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const BASE_ID = process.env.VITE_BASE_ID;
const TABLE_NAME = 'Shifts'; // Common alternatives: 'shifts', 'Volunteer Shifts', 'VolunteerShifts'

export async function fetchShiftsFromAirtableServer(): Promise<AirtableShift[]> {
  if (!AIRTABLE_TOKEN || !BASE_ID) {
    throw new Error('Missing Airtable credentials');
  }

  const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;
  console.log(`Attempting to fetch from: ${url}`);

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${AIRTABLE_TOKEN}`
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Airtable API error: ${response.status} ${response.statusText}`, errorText);
    throw new Error(`Failed to fetch shifts: ${response.status} ${response.statusText} - ${errorText}`);
  }

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