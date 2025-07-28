// API service for fetching volunteer shifts from Airtable via server

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
  host?: {
    id: string;
    name: string;
    logo?: string;
  } | null;
}

export async function fetchShiftsFromAirtable(): Promise<AirtableShift[]> {
  try {
    const response = await fetch('/api/shifts', {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch shifts: ${response.status} ${response.statusText}`);
    }

    const shifts = await response.json();
    return shifts;
  } catch (error) {
    console.error('Error fetching shifts:', error);
    throw error;
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