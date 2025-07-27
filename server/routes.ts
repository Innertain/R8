import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { fetchShiftsFromAirtableServer } from "./airtable";

export async function registerRoutes(app: Express): Promise<Server> {
  // API route to fetch shifts from Airtable
  app.get("/api/shifts", async (req, res) => {
    console.log('API route /api/shifts called');
    try {
      console.log('Attempting to fetch from Airtable...');
      const shifts = await fetchShiftsFromAirtableServer();
      console.log(`Successfully fetched ${shifts.length} shifts from Airtable`);
      res.json(shifts);
    } catch (error) {
      console.error('Error fetching shifts from Airtable:', error);
      // Return mock data as fallback
      const mockShifts = [
        {
          id: '1',
          activityName: "Deliver Food",
          dateTime: "Monday, Dec 18 • 10:00 AM - 2:00 PM",
          location: "Downtown Community Center",
          volunteersNeeded: 12,
          volunteersSignedUp: 8,
          status: "active" as const,
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
          status: "active" as const,
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
          status: "urgent" as const,
          category: "education",
          icon: "book"
        }
      ];
      res.json(mockShifts);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
