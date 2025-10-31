// Server-side Airtable API integration
import { type AirtableShift } from '../client/src/lib/api';
import * as fs from 'fs';
import * as path from 'path';

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const BASE_ID = process.env.VITE_BASE_ID?.replace(/\.$/, ''); // Remove trailing period if present
const TABLE_NAME = 'Shifts'; // Common alternatives: 'shifts', 'Volunteer Shifts', 'VolunteerShifts'

// Persistent geocoding cache (saved to disk to survive restarts)
const GEOCODE_CACHE_FILE = path.join(process.cwd(), 'geocode-cache.json');
const geocodeCache: { [address: string]: { lat: number; lng: number } | null } = {};

// Load geocoding cache from disk on startup
function loadGeocodeCache() {
  try {
    if (fs.existsSync(GEOCODE_CACHE_FILE)) {
      const data = fs.readFileSync(GEOCODE_CACHE_FILE, 'utf-8');
      const loadedCache = JSON.parse(data);
      Object.assign(geocodeCache, loadedCache);
      console.log(`✓ Loaded ${Object.keys(loadedCache).length} cached geocodes from disk`);
    }
  } catch (error) {
    console.log('Could not load geocode cache, starting fresh');
  }
}

// Save geocoding cache to disk
function saveGeocodeCache() {
  try {
    fs.writeFileSync(GEOCODE_CACHE_FILE, JSON.stringify(geocodeCache, null, 2));
  } catch (error) {
    console.log('Could not save geocode cache:', error);
  }
}

// Load cache on module initialization (also called from fetchPublicSupplySitesFromAirtable as backup)
loadGeocodeCache();

// Background geocoding queue
const geocodingQueue: Array<{ address: string; city: string; state: string }> = [];
let isProcessingQueue = false;

// Background worker that processes geocoding queue
async function processGeocodingQueue() {
  if (isProcessingQueue || geocodingQueue.length === 0) return;
  
  isProcessingQueue = true;
  console.log(`📍 Starting background geocoding of ${geocodingQueue.length} addresses...`);
  
  while (geocodingQueue.length > 0) {
    const { address, city, state } = geocodingQueue.shift()!;
    const fullAddress = `${address}, ${city}, ${state}`;
    
    // Skip if already cached (might have been added while queue was processing)
    if (geocodeCache[fullAddress] !== undefined) {
      continue;
    }
    
    try {
      const query = encodeURIComponent(fullAddress);
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'R8-Supply-Sites-Map/1.0'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          const result = {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon)
          };
          geocodeCache[fullAddress] = result;
          saveGeocodeCache();
          console.log(`  ✓ Background geocoded: ${fullAddress} -> ${result.lat}, ${result.lng}`);
        } else {
          geocodeCache[fullAddress] = null; // Mark as failed
          saveGeocodeCache();
          console.log(`  ✗ No results for: ${fullAddress}`);
        }
      }
      
      // Respect Nominatim rate limit (max 1 req/sec)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log(`  ✗ Error geocoding ${fullAddress}:`, error);
      geocodeCache[fullAddress] = null; // Mark as failed to avoid retrying
      saveGeocodeCache();
    }
  }
  
  isProcessingQueue = false;
  console.log(`✓ Background geocoding complete. Cache now has ${Object.keys(geocodeCache).length} addresses.`);
}

// Helper to queue an address for background geocoding
function queueAddressForGeocoding(address: string, city: string, state: string) {
  const fullAddress = `${address}, ${city}, ${state}`;
  
  // Only queue if not already cached and not already in queue
  if (geocodeCache[fullAddress] === undefined && 
      !geocodingQueue.some(item => `${item.address}, ${item.city}, ${item.state}` === fullAddress)) {
    geocodingQueue.push({ address, city, state });
    
    // Start processing if not already running
    if (!isProcessingQueue) {
      // Use setImmediate to avoid blocking the response
      setImmediate(() => processGeocodingQueue());
    }
  }
}

// Helper function to fetch all records from Airtable with pagination
async function fetchAllAirtableRecords(url: string, token: string): Promise<any[]> {
  let allRecords: any[] = [];
  let offset: string | undefined = undefined;
  
  do {
    const paginatedUrl: string = offset ? `${url}?offset=${offset}` : url;
    const response: Response = await fetch(paginatedUrl, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch from Airtable: ${response.status}`);
    }
    
    const data: any = await response.json();
    allRecords = allRecords.concat(data.records || []);
    offset = data.offset; // Will be undefined when no more pages
    
    if (offset) {
      console.log(`  ↳ Fetched ${data.records.length} records, fetching next page...`);
    }
  } while (offset);
  
  return allRecords;
}

// Free geocoding function using Nominatim (OpenStreetMap)
async function geocodeAddress(address: string, city: string, state: string): Promise<{ lat: number; lng: number } | null> {
  const fullAddress = `${address}, ${city}, ${state}`;
  
  // Check cache first (returns immediately if already cached)
  if (geocodeCache[fullAddress] !== undefined) {
    return geocodeCache[fullAddress];
  }
  
  try {
    // Use Nominatim (free, no API key required)
    const query = encodeURIComponent(fullAddress);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'R8-Supply-Sites-Map/1.0' // Required by Nominatim
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.length > 0) {
        const result = {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
        geocodeCache[fullAddress] = result;
        saveGeocodeCache(); // Persist to disk
        // Add small delay to respect Nominatim's usage policy (max 1 request/second)
        await new Promise(resolve => setTimeout(resolve, 1000));
        return result;
      }
    }
  } catch (error) {
    console.log(`Geocoding failed for: ${fullAddress}`, error);
  }
  
  geocodeCache[fullAddress] = null;
  saveGeocodeCache(); // Persist failed attempts too (avoid retrying known failures)
  return null;
}

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
}

export async function fetchPublicSupplySitesFromAirtable(
  greenThresholdDays: number = 7,
  yellowThresholdDays: number = 30
): Promise<PublicSupplySite[]> {
  if (!AIRTABLE_TOKEN || !BASE_ID) {
    throw new Error('Missing Airtable credentials');
  }

  // Load cache if not already loaded (backup for module-level load)
  if (Object.keys(geocodeCache).length === 0) {
    loadGeocodeCache();
  }
  
  // Log cache status for debugging
  const cacheSize = Object.keys(geocodeCache).length;
  console.log(`📍 Geocoding cache status: ${cacheSize} addresses cached`);

  try {
    // Fetch ALL Site records with pagination
    const siteUrl = `https://api.airtable.com/v0/${BASE_ID}/Site`;
    console.log(`Fetching all supply sites from: ${siteUrl}`);
    
    const allSiteRecords = await fetchAllAirtableRecords(siteUrl, AIRTABLE_TOKEN);
    console.log(`✓ Fetched ${allSiteRecords.length} supply sites (all pages)`);
    
    // Debug: Log first record's fields to see what's available
    if (allSiteRecords.length > 0) {
      console.log('First site record fields:', Object.keys(allSiteRecords[0].fields));
      console.log('First site sample data:', JSON.stringify(allSiteRecords[0].fields, null, 2));
    }

    // Fetch ALL Site Inventory records with pagination to determine last update times
    const inventoryUrl = `https://api.airtable.com/v0/${BASE_ID}/Site%20Inventory`;
    console.log(`Fetching all inventory data from: ${inventoryUrl}`);
    
    let inventoryBySite: { [siteId: string]: Date } = {};
    try {
      const allInventoryRecords = await fetchAllAirtableRecords(inventoryUrl, AIRTABLE_TOKEN);
      console.log(`✓ Fetched ${allInventoryRecords.length} inventory records (all pages)`);
      
      // Successfully fetched inventory records - timestamps will be used for recency calculation
      
      // Build lookup of most recent inventory update per site
      allInventoryRecords.forEach((record: any) => {
        const siteIds = record.fields.Site || record.fields['Site (from Site)'] || [];
        // Use Update Timestamp (Unix ms) if available, fallback to Last Modified, then createdTime
        const updateTimestamp = record.fields['Update Timestamp'];
        const lastModified = record.fields['Last Modified'];
        const createdTime = record.createdTime;
        
        let updateTime: Date | null = null;
        
        if (updateTimestamp && typeof updateTimestamp === 'number') {
          // Update Timestamp is Unix timestamp in milliseconds
          updateTime = new Date(updateTimestamp);
        } else if (lastModified) {
          updateTime = new Date(lastModified);
        } else if (createdTime) {
          updateTime = new Date(createdTime);
        }
        
        if (siteIds.length > 0 && updateTime) {
          siteIds.forEach((siteId: string) => {
            if (!inventoryBySite[siteId] || updateTime > inventoryBySite[siteId]) {
              inventoryBySite[siteId] = updateTime;
            }
          });
        }
      });
    } catch (err) {
      console.log('Could not fetch inventory data, will show all sites as gray');
    }

    // Process sites and filter for public ones
    const filteredSites = allSiteRecords.filter((record: any) => {
      const fields = record.fields;
      // Include all sites UNLESS explicitly marked as private (opt-out, not opt-in)
      const isPublic = fields['Public Visibility'] !== false;
      // Check if status is not explicitly marked as closed/inactive
      const status = (fields['Status'] || '').toLowerCase();
      const isActive = !status.includes('closed') && !status.includes('inactive');
      
      return isPublic && isActive;
    });

    console.log(`✓ Filtered to ${filteredSites.length} public active sites`);

    // Process sites and check geocoding cache
    const publicSites: PublicSupplySite[] = [];
    let cachedCount = 0;
    let queuedCount = 0;
    
    for (const record of filteredSites) {
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
      
      // Check for coordinates in Airtable first
      let lat = fields.Latitude || fields.lat || fields.Lat || fields['Latitude'] || null;
      let lng = fields.Longitude || fields.lng || fields.lon || fields.Lng || fields['Longitude'] || null;
      
      // If no coordinates in Airtable, check cache (synchronous lookup)
      if ((!lat || !lng) && fields['Street Address'] && fields.City && fields.State) {
        const fullAddress = `${fields['Street Address']}, ${fields.City}, ${fields.State}`;
        const cached = geocodeCache[fullAddress];
        
        if (cached !== undefined) {
          // Found in cache
          if (cached) {
            lat = cached.lat;
            lng = cached.lng;
            cachedCount++;
          }
          // If cached === null, it means geocoding failed before, skip it
        } else {
          // Not in cache - queue for background processing
          queueAddressForGeocoding(fields['Street Address'], fields.City, fields.State);
          queuedCount++;
        }
      }
      
      publicSites.push({
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
      });
    }

    console.log(`✓ Returning ${publicSites.length} public supply sites (${cachedCount} from cache, ${queuedCount} queued for background geocoding)`);
    return publicSites;

  } catch (error) {
    console.error('Error fetching public supply sites:', error);
    throw error;
  }
}