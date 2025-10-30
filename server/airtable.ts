// Server-side Airtable API integration
import { type AirtableShift } from '../client/src/lib/api';

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const BASE_ID = process.env.VITE_BASE_ID?.replace(/\.$/, ''); // Remove trailing period if present
const TABLE_NAME = 'Shifts'; // Common alternatives: 'shifts', 'Volunteer Shifts', 'VolunteerShifts'

// Types for public supply sites map
export interface PublicSupplySite {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  latitude?: number;
  longitude?: number;
  siteHours?: string;
  acceptingDonations: boolean;
  distributingSupplies: boolean;
  siteType: string;
  lastInventoryUpdate?: string;
  inventoryRecency: 'green' | 'yellow' | 'red' | 'gray';
  daysSinceUpdate: number;
}

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
          
          // Extract activity name - note the trailing space in "Activity "
          const activityName = fields['Activity '] || fields['Activity'] || fields['Name (from Activity )']?.[0] || fields['Name']?.[0] || 'Unknown Activity';
          
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
          
          // Extract volunteer counts with fallback for trailing space
          const maxVolunteers = Number(fields['Max Volunteers '] || fields['Max Volunteers'] || 0);
          const remainingSpots = Number(fields['Remaining Spots '] || fields['Remaining Spots'] || 0);
          
          return {
            id: record.id,
            activityName,
            dateTime,
            location,
            volunteersNeeded: maxVolunteers,
            volunteersSignedUp: Math.max(0, maxVolunteers - remainingSpots),
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

export async function fetchPublicSupplySitesFromAirtable(
  greenThresholdDays: number = 7,
  yellowThresholdDays: number = 30
): Promise<PublicSupplySite[]> {
  if (!AIRTABLE_TOKEN || !BASE_ID) {
    throw new Error('Missing Airtable credentials');
  }

  try {
    // Fetch Site records
    const siteUrl = `https://api.airtable.com/v0/${BASE_ID}/Site`;
    console.log(`Fetching public supply sites from: ${siteUrl}`);
    
    const siteResponse = await fetch(siteUrl, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`
      }
    });

    if (!siteResponse.ok) {
      throw new Error(`Failed to fetch sites: ${siteResponse.status}`);
    }

    const siteData = await siteResponse.json();
    console.log(`✓ Fetched ${siteData.records?.length || 0} supply sites`);
    
    // Debug: Log first record's fields to see what's available
    if (siteData.records.length > 0) {
      console.log('First site record fields:', Object.keys(siteData.records[0].fields));
      console.log('First site sample data:', JSON.stringify(siteData.records[0].fields, null, 2));
    }

    // Fetch Site Inventory records to determine last update times
    const inventoryUrl = `https://api.airtable.com/v0/${BASE_ID}/Site%20Inventory`;
    console.log(`Fetching inventory data from: ${inventoryUrl}`);
    
    const inventoryResponse = await fetch(inventoryUrl, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`
      }
    });

    let inventoryBySite: { [siteId: string]: Date } = {};
    if (inventoryResponse.ok) {
      const inventoryData = await inventoryResponse.json();
      console.log(`✓ Fetched ${inventoryData.records?.length || 0} inventory records`);
      
      // Build lookup of most recent inventory update per site
      inventoryData.records.forEach((record: any) => {
        const siteIds = record.fields.Site || record.fields['Site (from Site)'] || [];
        const updatedDate = record.fields['Last Modified'] || record.fields.createdTime;
        
        if (siteIds.length > 0 && updatedDate) {
          const updateTime = new Date(updatedDate);
          siteIds.forEach((siteId: string) => {
            if (!inventoryBySite[siteId] || updateTime > inventoryBySite[siteId]) {
              inventoryBySite[siteId] = updateTime;
            }
          });
        }
      });
    } else {
      console.log('Could not fetch inventory data, will show all sites as gray');
    }

    // Process sites and filter for public ones
    const publicSites: PublicSupplySite[] = siteData.records
      .filter((record: any) => {
        const fields = record.fields;
        // Only include sites that are explicitly marked as public (your field is "Public Visibility")
        const isPublic = fields['Public Visibility'] === true;
        // Check if status is not explicitly marked as closed/inactive
        const status = (fields['Status'] || '').toLowerCase();
        const isActive = !status.includes('closed') && !status.includes('inactive');
        
        console.log(`Site "${fields['Site Name'] || 'Unknown'}": public=${isPublic}, status="${fields['Status']}", active=${isActive}`);
        return isPublic && isActive;
      })
      .map((record: any) => {
        const fields = record.fields;
        const now = new Date();
        
        // Calculate inventory recency
        const lastUpdate = inventoryBySite[record.id];
        let daysSinceUpdate = 9999;
        let inventoryRecency: 'green' | 'yellow' | 'red' | 'gray' = 'gray';
        
        if (lastUpdate) {
          daysSinceUpdate = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
          if (daysSinceUpdate <= greenThresholdDays) {
            inventoryRecency = 'green';
          } else if (daysSinceUpdate <= yellowThresholdDays) {
            inventoryRecency = 'yellow';
          } else {
            inventoryRecency = 'red';
          }
        }

        // Extract site type from Site Category array
        const siteCategory = Array.isArray(fields['Site Category']) ? fields['Site Category'].join(', ') : (fields['Site Category'] || 'Distribution Center');
        
        // Check for coordinates in various possible field names
        const lat = fields.Latitude || fields.lat || fields.Lat || fields['Latitude'] || null;
        const lng = fields.Longitude || fields.lng || fields.lon || fields.Lng || fields['Longitude'] || null;
        
        if (!lat || !lng) {
          console.log(`  ⚠️  Site "${fields['Site Name']}" has no coordinates (lat=${lat}, lng=${lng})`);
        }
        
        return {
          id: record.id,
          name: fields['Site Name'] || 'Unnamed Site',
          address: fields['Street Address'] || '',
          city: fields.City || '',
          state: fields.State || '',
          latitude: lat ? parseFloat(lat) : undefined,
          longitude: lng ? parseFloat(lng) : undefined,
          siteHours: fields['Hours'] || fields['Site Hours'] || fields['Operating Hours'],
          acceptingDonations: (fields['Status'] || '').toLowerCase().includes('accepting'),
          distributingSupplies: (fields['Status'] || '').toLowerCase().includes('distributing') || (fields['Status'] || '').toLowerCase().includes('accepting'),
          siteType: siteCategory,
          lastInventoryUpdate: lastUpdate ? lastUpdate.toISOString() : undefined,
          inventoryRecency,
          daysSinceUpdate
        };
      });

    console.log(`✓ Returning ${publicSites.length} public supply sites`);
    return publicSites;

  } catch (error) {
    console.error('Error fetching public supply sites:', error);
    throw error;
  }
}