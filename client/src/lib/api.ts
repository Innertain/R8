// API service for fetching volunteer shifts from Airtable

const AIRTABLE_TOKEN = import.meta.env.VITE_AIRTABLE_TOKEN;
const BASE_ID = import.meta.env.VITE_BASE_ID || 'appXXXXXXXXXXXXXX'; // Default placeholder
const TABLE_NAME = 'Shifts';

export interface AirtableShift {
  id: string;
  activityName: string;
  dateTime: string;
  location: string;
  volunteersNeeded: number;
  volunteersSignedUp: number;
  status: "active" | "urgent" | "remote" | "full";
  category: string;
  icon: string;
}

export async function fetchShiftsFromAirtable(): Promise<AirtableShift[]> {
  // Return mock data if no Airtable credentials are provided
  if (!AIRTABLE_TOKEN || !BASE_ID || BASE_ID === 'appXXXXXXXXXXXXXX') {
    console.log('No Airtable credentials found, using mock data');
    return getMockShifts();
  }

  try {
    const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch shifts: ${response.status} ${response.statusText}`);
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
  } catch (error) {
    console.error('Error fetching from Airtable:', error);
    // Fallback to mock data on error
    return getMockShifts();
  }
}

// Mock data for development/fallback
function getMockShifts(): AirtableShift[] {
  return [
    {
      id: '1',
      activityName: "Deliver Food",
      dateTime: "Monday, Dec 18 • 10:00 AM - 2:00 PM",
      location: "Downtown Community Center",
      volunteersNeeded: 12,
      volunteersSignedUp: 8,
      status: "active",
      category: "food-service",
      icon: "utensils"
    },
    {
      id: '2',
      activityName: "Community Cleanup",
      dateTime: "Saturday, Dec 23 • 9:00 AM - 1:00 PM",
      location: "Riverside Park",
      volunteersNeeded: 20,
      volunteersSignedUp: 15,
      status: "active",
      category: "environment",
      icon: "users"
    },
    {
      id: '3',
      activityName: "Reading Tutor",
      dateTime: "Tuesday, Dec 19 • 3:00 PM - 5:00 PM",
      location: "Lincoln Elementary School",
      volunteersNeeded: 8,
      volunteersSignedUp: 3,
      status: "urgent",
      category: "education",
      icon: "book"
    },
    {
      id: '4',
      activityName: "Gift Wrapping",
      dateTime: "Friday, Dec 22 • 6:00 PM - 9:00 PM",
      location: "Community Mall",
      volunteersNeeded: 6,
      volunteersSignedUp: 6,
      status: "full",
      category: "community",
      icon: "gift"
    },
    {
      id: '5',
      activityName: "Tech Support",
      dateTime: "Thursday, Dec 21 • 7:00 PM - 9:00 PM",
      location: "Remote (Online)",
      volunteersNeeded: 5,
      volunteersSignedUp: 2,
      status: "remote",
      category: "technology",
      icon: "laptop"
    },
    {
      id: '6',
      activityName: "Senior Care",
      dateTime: "Sunday, Dec 24 • 1:00 PM - 4:00 PM",
      location: "Sunset Senior Center",
      volunteersNeeded: 15,
      volunteersSignedUp: 9,
      status: "active",
      category: "healthcare",
      icon: "heart"
    }
  ];
}