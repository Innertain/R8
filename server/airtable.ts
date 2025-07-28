// Server-side Airtable API integration
import { type AirtableShift } from '../client/src/lib/api';

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const BASE_ID = process.env.VITE_BASE_ID?.replace(/\.$/, ''); // Remove trailing period if present
const TABLE_NAME = 'Shifts'; // Common alternatives: 'shifts', 'Volunteer Shifts', 'VolunteerShifts'

// Cache for mutual aid partners to avoid repeated API calls
let partnersCache: { [key: string]: { name: string; logo?: string } } | null = null;
let cacheExpiry: number = 0;

// Clear cache function for development/debugging
export function clearAirtableCache() {
  partnersCache = null;
  cacheExpiry = 0;
  console.log('🔄 Airtable cache cleared');
}

async function fetchMutualAidPartners(): Promise<{ [key: string]: { name: string; logo?: string } }> {
  // Return cached data if still valid (5 minutes)
  if (partnersCache && Date.now() < cacheExpiry) {
    return partnersCache;
  }

  const url = `https://api.airtable.com/v0/${BASE_ID}/Mutual%20Aid%20Partners`;
  console.log(`Fetching Mutual Aid Partners for host data: ${url}`);

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`✓ Fetched ${data.records?.length || 0} mutual aid partners for host mapping`);
      
      // Create lookup map by record ID
      partnersCache = {};
      data.records.forEach((record: any) => {
        partnersCache![record.id] = {
          name: record.fields.Name || 'Unknown Partner',
          logo: record.fields.Logo?.[0]?.url || null
        };
      });
      
      cacheExpiry = Date.now() + (5 * 60 * 1000); // Cache for 5 minutes
      return partnersCache;
    }
  } catch (error) {
    console.log('Could not fetch Mutual Aid Partners:', error);
  }

  return {};
}

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

  // Fetch host data for lookup
  const hostsLookup = await fetchMutualAidPartners();

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
        
        // Successfully connected to Airtable with proper field mapping

        // Convert Airtable format to our application format using your actual field names
        return data.records.map((record: any) => {
          const fields = record.fields;
          
          // Extract activity name from Name or Name (from Activity)
          const activityName = fields['Name (from Activity )']?.[0] || fields['Name']?.[0] || 'Unknown Activity';
          
          // Extract location from Site Name (from Location)
          const location = fields['Site Name (from Location )']?.[0] || 'TBD';
          
          // Extract host information from Host field (linked to Mutual Aid Partners)
          const hostId = fields['Host']?.[0] || null; // Linked record ID
          const hostData = hostId && hostsLookup[hostId] ? hostsLookup[hostId] : null;
          
          // Format date/time from Start Time and End Time
          let dateTime = 'TBD';
          if (fields['Start Time'] && fields['End Time']) {
            const startDate = new Date(fields['Start Time']);
            const endDate = new Date(fields['End Time']);
            const formatOptions: Intl.DateTimeFormatOptions = { 
              weekday: 'long', 
              month: 'short', 
              day: 'numeric' 
            };
            const startTime = startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
            const endTime = endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
            dateTime = `${startDate.toLocaleDateString('en-US', formatOptions)} • ${startTime} - ${endTime}`;
          }
          
          // Determine icon based on activity name
          let icon = 'users';
          const activityLower = activityName.toLowerCase();
          if (activityLower.includes('food') || activityLower.includes('box')) icon = 'utensils';
          else if (activityLower.includes('clean') || activityLower.includes('river')) icon = 'users';
          else if (activityLower.includes('deliver') || activityLower.includes('truck')) icon = 'truck';
          
          // Determine category
          let category = 'general';
          if (activityLower.includes('food')) category = 'food-service';
          else if (activityLower.includes('clean')) category = 'environment';
          else if (activityLower.includes('deliver')) category = 'logistics';
          
          return {
            id: record.id,
            activityName,
            dateTime,
            location,
            volunteersNeeded: 0, // Will add this mapping when you provide the field
            volunteersSignedUp: 0, // Will add this mapping when you provide the field  
            status: 'active',
            category,
            icon,
            host: hostData ? {
              id: hostId,
              name: hostData.name,
              logo: hostData.logo
            } : null
          };
        });
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