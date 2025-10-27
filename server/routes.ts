import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { geocodeLocation } from "./geocoding";
import { db } from "./db";
import { alertRules, alertDeliveries, userNotificationSettings, insertAlertRuleSchema, insertNotificationSettingsSchema } from "@shared/schema";
import { eq, desc, and, gte } from "drizzle-orm";
import { alertEngine, type EmergencyEvent } from "./alerting/alertEngine";
import { fetchShiftsFromAirtableServer } from "./airtable";
import { getBioregionSpecies, getApiUsageStats } from "./inaturalist";
import speciesRoutes from "./routes/species";
import noaaRoutes from "./noaa-routes";
import extremeWeatherRoutes from "./extreme-weather-routes";
import { airQualityService } from "./services/airQualityService";
import { airQualityStations, airQualityReadings } from "@shared/schema";

// Server-side cache for stats data
let statsCache: { data: any; timestamp: number } | null = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export async function registerRoutes(app: Express): Promise<Server> {
  // API route to check Airtable base structure
  app.get("/api/airtable-debug", async (req, res) => {
    const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
    const BASE_ID = process.env.VITE_BASE_ID?.replace(/\.$/, ''); // Remove trailing period if present

    if (!AIRTABLE_TOKEN || !BASE_ID) {
      return res.json({ error: 'Missing credentials' });
    }

    try {
      // Fetch sample records from V Shift Assignment and V Availability to see field names
      const assignmentUrl = `https://api.airtable.com/v0/${BASE_ID}/V%20Shift%20Assignment?maxRecords=1`;
      const availabilityUrl = `https://api.airtable.com/v0/${BASE_ID}/V%20Availability?maxRecords=1`;

      const [assignmentRes, availabilityRes] = await Promise.all([
        fetch(assignmentUrl, { headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` } }),
        fetch(availabilityUrl, { headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` } })
      ]);

      const results: any = { baseId: BASE_ID };

      if (assignmentRes.ok) {
        const assignmentData = await assignmentRes.json();
        results.vShiftAssignment = {
          fieldNames: assignmentData.records[0] ? Object.keys(assignmentData.records[0].fields) : [],
          sampleRecord: assignmentData.records[0]?.fields || null
        };
      } else {
        results.vShiftAssignment = { error: `${assignmentRes.status}: ${await assignmentRes.text()}` };
      }

      if (availabilityRes.ok) {
        const availabilityData = await availabilityRes.json();
        results.vAvailability = {
          fieldNames: availabilityData.records[0] ? Object.keys(availabilityData.records[0].fields) : [],
          sampleRecord: availabilityData.records[0]?.fields || null
        };
      } else {
        results.vAvailability = { error: `${availabilityRes.status}: ${await availabilityRes.text()}` };
      }

      res.json({ success: true, ...results });
    } catch (error: any) {
      res.json({ success: false, error: error.message });
    }
  });

  // API route to clear cache and force refresh
  app.post("/api/refresh-cache", async (req, res) => {
    try {
      // Clear stats cache
      statsCache = null;

      // Clear recent updates cache
      recentUpdatesCache = null;
      recentUpdatesCacheTime = 0;

      // Clear FEMA disasters cache
      femaDisastersCache = null;
      femaDisastersCacheTime = 0;

      // Clear Airtable cache if available
      try {
        const { clearAirtableCache } = await import('./airtable');
        clearAirtableCache();
      } catch (e) {
        // Ignore if clearAirtableCache doesn't exist
      }

      res.json({ success: true, message: 'All caches cleared successfully' });
    } catch (error) {
      console.error('Error clearing cache:', error);
      res.status(500).json({ error: 'Failed to clear cache' });
    }
  });

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

  // Get all table metadata with debugging
  app.get('/api/test/tables', async (req, res) => {
    try {
      console.log('Testing token access to metadata endpoint...');
      console.log('Token exists:', !!process.env.AIRTABLE_TOKEN);
      console.log('Token starts with:', process.env.AIRTABLE_TOKEN?.substring(0, 8) + '...');

      const baseId = process.env.VITE_BASE_ID?.replace(/\.$/, ''); // Remove trailing period
      const metaResponse = await fetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
        headers: { Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}` }
      });

      console.log('Metadata response status:', metaResponse.status);

      if (metaResponse.ok) {
        const metaData = await metaResponse.json();
        res.json({ success: true, tables: metaData.tables });
      } else {
        const errorText = await metaResponse.text();
        console.log('Metadata error:', errorText);
        res.json({ success: false, status: metaResponse.status, error: errorText });
      }
    } catch (error: any) {
      console.log('Metadata exception:', error.message);
      res.json({ success: false, error: error.message });
    }
  });

  // Test endpoints for new Airtable tables with dynamic table detection
  app.get('/api/test/drivers', async (req, res) => {
    const possibleNames = ['Drivers', 'Driver', 'drivers'];

    for (const tableName of possibleNames) {
      try {
        console.log(`Trying drivers table: "${tableName}"`);
        const baseId = process.env.VITE_BASE_ID?.replace(/\.$/, '');
        const response = await fetch(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}?maxRecords=1`, {
          headers: { Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}` }
        });
        console.log(`Drivers "${tableName}" response:`, response.status);

        if (response.ok) {
          const data = await response.json();
          console.log(`✓ Drivers success: ${data.records?.length || 0} records`);
          return res.json({ success: true, tableName, records: data.records?.length || 0, data: data.records });
        } else {
          const errorText = await response.text();
          console.log(`Drivers "${tableName}" error:`, errorText);
        }
      } catch (error) {
        console.log(`Drivers "${tableName}" exception:`, (error as Error).message);
        continue;
      }
    }
    res.json({ success: false, error: "No drivers table found with any expected name" });
  });

  app.get('/api/test/volunteers', async (req, res) => {
    const possibleNames = ['Volunteer Applications', 'Volunteers', 'volunteers', 'Volunteer_Applications'];

    for (const tableName of possibleNames) {
      try {
        const response = await fetch(`https://api.airtable.com/v0/${process.env.VITE_BASE_ID}/${encodeURIComponent(tableName)}`, {
          headers: { Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}` }
        });
        if (response.ok) {
          const data = await response.json();
          return res.json({ success: true, tableName, records: data.records?.length || 0, data: data.records });
        }
      } catch (error) {
        continue;
      }
    }
    res.json({ success: false, error: "No volunteers table found with any expected name" });
  });

  app.get('/api/test/availability', async (req, res) => {
    const possibleNames = ['V Availability', 'Availability', 'V_Availability', 'availability'];

    for (const tableName of possibleNames) {
      try {
        const response = await fetch(`https://api.airtable.com/v0/${process.env.VITE_BASE_ID}/${encodeURIComponent(tableName)}`, {
          headers: { Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}` }
        });
        if (response.ok) {
          const data = await response.json();
          return res.json({ success: true, tableName, records: data.records?.length || 0, data: data.records });
        }
      } catch (error) {
        continue;
      }
    }
    res.json({ success: false, error: "No availability table found with any expected name" });
  });

  app.get('/api/test/assignments', async (req, res) => {
    const possibleNames = ['V Shift Assignment', 'Shift Assignment', 'V_Shift_Assignment', 'assignments'];

    for (const tableName of possibleNames) {
      try {
        const response = await fetch(`https://api.airtable.com/v0/${process.env.VITE_BASE_ID}/${encodeURIComponent(tableName)}`, {
          headers: { Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}` }
        });
        if (response.ok) {
          const data = await response.json();
          return res.json({ success: true, tableName, records: data.records?.length || 0, data: data.records });
        }
      } catch (error) {
        continue;
      }
    }
    res.json({ success: false, error: "No assignments table found with any expected name" });
  });

  // Direct table test endpoint with debugging
  app.get('/api/test/direct/:tableName', async (req, res) => {
    try {
      const tableName = decodeURIComponent(req.params.tableName);
      console.log(`Testing direct access to table: "${tableName}"`);

      const baseId = process.env.VITE_BASE_ID?.replace(/\.$/, ''); // Remove trailing period
      const response = await fetch(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`, {
        headers: { Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}` }
      });

      console.log(`Response for "${tableName}":`, response.status);

      if (response.ok) {
        const data = await response.json();
        console.log(`✓ Success for "${tableName}": ${data.records?.length || 0} records`);
        res.json({ success: true, tableName, records: data.records?.length || 0, data: data.records });
      } else {
        const errorText = await response.text();
        console.log(`✗ Failed for "${tableName}":`, errorText);
        res.json({ success: false, status: response.status, error: errorText });
      }
    } catch (error: any) {
      console.log(`Exception for "${req.params.tableName}":`, error.message);
      res.json({ success: false, error: error.message });
    }
  });

  // Volunteer API routes
  app.post("/api/volunteers", async (req, res) => {
    try {
      const { insertVolunteerSchema } = await import("@shared/schema");
      const volunteerData = insertVolunteerSchema.parse(req.body);
      const volunteer = await storage.createVolunteer(volunteerData);
      res.json(volunteer);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/volunteers", async (req, res) => {
    try {
      const volunteers = await storage.getAllVolunteers();
      res.json(volunteers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/volunteers/phone/:phoneNumber", async (req, res) => {
    try {
      const phone = req.params.phoneNumber;
      const baseId = process.env.VITE_BASE_ID?.replace(/\.$/, '');

      // Helper function to normalize phone numbers for comparison
      const normalizePhone = (phoneStr: string) => phoneStr.replace(/\D/g, '');
      const normalizedSearchPhone = normalizePhone(phone);

      console.log(`Searching for phone: "${phone}" (normalized: "${normalizedSearchPhone}")`);

      // Create flexible search formula that handles different phone formats
      const phoneSearchFormula = `OR(
        SEARCH("${phone}",{Phone}),
        SEARCH("${normalizedSearchPhone}",REGEX_REPLACE({Phone},"[^0-9]","","g")),
        {Phone}="${phone}",
        REGEX_REPLACE({Phone},"[^0-9]","","g")="${normalizedSearchPhone}",
        FIND("${normalizedSearchPhone}",REGEX_REPLACE({Phone},"[^0-9]","","g"))>0
      )`;

      // Search in Volunteer Applications table first
      const volunteerResponse = await fetch(`https://api.airtable.com/v0/${baseId}/Volunteer%20Applications?filterByFormula=${encodeURIComponent(phoneSearchFormula)}`, {
        headers: { Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}` }
      });

      console.log('Volunteer Applications search status:', volunteerResponse.status);

      if (volunteerResponse.ok) {
        const volunteerData = await volunteerResponse.json();
        console.log(`Found ${volunteerData.records.length} volunteer records`);

        if (volunteerData.records.length > 0) {
          const record = volunteerData.records[0];
          const fields = record.fields;

          return res.json({
            id: record.id,
            name: `${fields['First Name'] || ''} ${fields['Last Name'] || ''}`.trim(),
            phone: fields['Phone'] || phone,
            email: fields['Email '] || fields['Email'] || '',
            skills: fields['Skills'] || [],
            isActive: true,
            source: 'volunteer_applications'
          });
        }
      }

      // Also search in Drivers table with same flexible formula
      const driverResponse = await fetch(`https://api.airtable.com/v0/${baseId}/Drivers?filterByFormula=${encodeURIComponent(phoneSearchFormula)}`, {
        headers: { Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}` }
      });

      console.log('Drivers search status:', driverResponse.status);

      if (driverResponse.ok) {
        const driverData = await driverResponse.json();
        console.log(`Found ${driverData.records.length} driver records`);

        if (driverData.records.length > 0) {
          const record = driverData.records[0];
          const fields = record.fields;

          return res.json({
            id: record.id,
            name: `${fields['First Name'] || ''} ${fields['Last Name'] || ''}`.trim(),
            phone: fields['Phone'] || phone,
            email: fields['Email'] || '',
            vehicleType: fields['Vehicle Type '] || [],
            licenseType: fields['License Type '] || '',
            availability: fields['Availability'] || '',
            isDriver: true,
            isActive: true,
            source: 'drivers'
          });
        }
      }

      // Special handling for demo account
      if (phone === "555-DEMO" || normalizedSearchPhone === "555DEMO") {
        console.log('Providing demo account fallback');
        return res.json({
          id: 'demo-volunteer-id',
          name: 'Demo Volunteer',
          phone: '555-DEMO',
          email: 'demo@example.com',
          skills: ['Food Distribution', 'Community Support', 'Event Setup'],
          isActive: true,
          isDriver: true,
          source: 'demo'
        });
      }

      // Fallback to storage (includes demo account)
      const volunteer = await storage.getVolunteerByPhone(phone);
      if (volunteer) {
        return res.json(volunteer);
      }

      console.log(`No volunteer found for phone: ${phone}`);
      res.status(404).json({ error: "Volunteer not found" });

    } catch (error: any) {
      console.error('Error looking up volunteer:', error);
      res.status(500).json({ error: error.message || 'Server error' });
    }
  });

  // Availability API routes
  app.post("/api/availability", async (req, res) => {
    try {
      const { insertAvailabilitySchema } = await import("@shared/schema");

      // Convert date strings to Date objects
      const requestData = {
        ...req.body,
        startTime: new Date(req.body.startTime),
        endTime: new Date(req.body.endTime)
      };

      const availabilityData = insertAvailabilitySchema.parse(requestData);
      
      const baseId = process.env.VITE_BASE_ID?.replace(/\.$/, '');
      const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;

      // Try to save to Airtable first (skip for demo user)
      if (availabilityData.volunteerId !== 'demo-volunteer-123' && baseId && AIRTABLE_TOKEN) {
        console.log('💾 Creating availability in Airtable for volunteer:', availabilityData.volunteerId);
        
        // Build fields object, only including Recurring Pattern if it has a value
        const fields: any = {
          'Volunteer': [availabilityData.volunteerId], // Link to volunteer record
          'Start time': availabilityData.startTime.toISOString(),
          'End Time': availabilityData.endTime.toISOString(),
          'Is Recurring': availabilityData.isRecurring || false,
          'Notes': availabilityData.notes || ''
        };
        
        // Only add Recurring Pattern if it has a valid value (don't send empty string for dropdown fields)
        if (availabilityData.recurringPattern && availabilityData.recurringPattern.trim()) {
          fields['Recurring Pattern '] = availabilityData.recurringPattern;
        }
        
        const airtablePayload = {
          records: [{ fields }]
        };

        try {
          const airtableResponse = await fetch(`https://api.airtable.com/v0/${baseId}/V%20Availability`, {
            method: 'POST',
            headers: { 
              'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(airtablePayload)
          });

          if (airtableResponse.ok) {
            const airtableData = await airtableResponse.json();
            const record = airtableData.records[0];
            
            const availability = {
              id: record.id,
              volunteerId: availabilityData.volunteerId,
              startTime: new Date(record.fields['Start time']),
              endTime: new Date(record.fields['End Time']),
              isRecurring: record.fields['Is Recurring'] || false,
              recurringPattern: record.fields['Recurring Pattern '] || '',
              notes: record.fields['Notes'] || '',
              createdAt: new Date(record.createdTime)
            };

            console.log('✅ Availability created in Airtable:', availability.id);
            return res.json(availability);
          } else {
            const errorText = await airtableResponse.text();
            console.log('⚠️ Airtable creation failed, falling back to storage:', errorText);
          }
        } catch (airtableError: any) {
          console.log('⚠️ Airtable request error, falling back to storage:', airtableError.message);
        }
      }

      // Fallback to storage for demo users or failed Airtable requests
      console.log('Creating availability in local storage as fallback');
      const availability = await storage.createAvailability(availabilityData);
      res.json(availability);
    } catch (error: any) {
      console.error('Error creating availability:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Update availability (for drag and drop)
  app.put("/api/availability/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { startTime, endTime } = req.body;

      if (!startTime || !endTime) {
        return res.status(400).json({ error: 'Start time and end time are required' });
      }

      const baseId = process.env.VITE_BASE_ID?.replace(/\.$/, '');
      const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;

      // Try to update in Airtable first if it's a real Airtable record (starts with 'rec')
      if (id.startsWith('rec') && baseId && AIRTABLE_TOKEN) {
        console.log('📝 Updating availability in Airtable:', id);
        
        const updatePayload = {
          fields: {
            'Start time': new Date(startTime).toISOString(),
            'End Time': new Date(endTime).toISOString()
          }
        };

        try {
          const airtableResponse = await fetch(`https://api.airtable.com/v0/${baseId}/V%20Availability/${id}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatePayload)
          });

          if (airtableResponse.ok) {
            const updatedRecord = await airtableResponse.json();
            const availability = {
              id: updatedRecord.id,
              volunteerId: updatedRecord.fields['Volunteer']?.[0] || '',
              startTime: new Date(updatedRecord.fields['Start time']),
              endTime: new Date(updatedRecord.fields['End Time']),
              isRecurring: updatedRecord.fields['Is Recurring'] || false,
              recurringPattern: updatedRecord.fields['Recurring Pattern '] || '',
              notes: updatedRecord.fields['Notes'] || '',
              createdAt: new Date(updatedRecord.createdTime)
            };

            console.log('✅ Availability updated in Airtable');
            return res.json(availability);
          } else {
            const errorText = await airtableResponse.text();
            console.log('⚠️ Airtable update failed, falling back to storage:', errorText);
          }
        } catch (airtableError: any) {
          console.log('⚠️ Airtable request error, falling back to storage:', airtableError.message);
        }
      }

      // Fallback to storage for non-Airtable records or failed requests
      const availability = await storage.getAvailabilityById(id);

      if (!availability) {
        return res.status(404).json({ error: 'Availability not found' });
      }

      const updatedAvailability = {
        ...availability,
        startTime: new Date(startTime),
        endTime: new Date(endTime)
      };

      await storage.updateAvailability(id, updatedAvailability);
      res.json(updatedAvailability);
    } catch (error: any) {
      console.error('Error updating availability:', error);
      res.status(500).json({ error: 'Failed to update availability' });
    }
  });

  // Delete availability
  app.delete("/api/availability/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const baseId = process.env.VITE_BASE_ID?.replace(/\.$/, '');
      const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;

      // Try to delete from Airtable first if it's a real Airtable record (starts with 'rec')
      if (id.startsWith('rec') && baseId && AIRTABLE_TOKEN) {
        console.log('🗑️ Deleting availability from Airtable:', id);
        
        try {
          const airtableResponse = await fetch(`https://api.airtable.com/v0/${baseId}/V%20Availability/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${AIRTABLE_TOKEN}`
            }
          });

          if (airtableResponse.ok) {
            console.log('✅ Availability deleted from Airtable');
            return res.json({ success: true });
          } else {
            const errorText = await airtableResponse.text();
            console.log('⚠️ Airtable deletion failed, falling back to storage:', errorText);
          }
        } catch (airtableError: any) {
          console.log('⚠️ Airtable request error, falling back to storage:', airtableError.message);
        }
      }

      // Fallback to storage for non-Airtable records or failed requests
      await storage.deleteAvailability(id);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error deleting availability:', error);
      res.status(500).json({ error: 'Failed to delete availability' });
    }
  });

  app.get("/api/availability/:volunteerId", async (req, res) => {
    try {
      const volunteerId = req.params.volunteerId;
      const baseId = process.env.VITE_BASE_ID?.replace(/\.$/, '');

      // Get real availability from Airtable
      const availabilityResponse = await fetch(`https://api.airtable.com/v0/${baseId}/V%20Availability?filterByFormula=OR(SEARCH("${volunteerId}",ARRAYJOIN({Volunteer})),{Volunteer}="${volunteerId}")`, {
        headers: { Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}` }
      });

      if (availabilityResponse.ok) {
        const availabilityData = await availabilityResponse.json();

        if (availabilityData.records.length > 0) {
          const availability = availabilityData.records.map((record: any) => ({
            id: record.id,
            volunteerId: volunteerId,
            startTime: new Date(record.fields['Start time']),
            endTime: new Date(record.fields['End Time']),
            isRecurring: record.fields['Is Recurring'] || false,
            recurringPattern: record.fields['Recurring Pattern '] || '',
            notes: record.fields['Notes'] || '',
            createdAt: new Date(record.fields['Created Date'])
          }));

          return res.json(availability);
        }
      }

      // Fallback to storage for demo user
      const availability = await storage.getVolunteerAvailability(volunteerId);
      res.json(availability);
    } catch (error: any) {
      console.error('Error fetching availability:', error);
      res.status(500).json({ error: error.message || 'Server error' });
    }
  });

  app.get("/api/availability", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      if (startDate && endDate) {
        const availability = await storage.getAvailabilityByDateRange(
          new Date(startDate as string),
          new Date(endDate as string)
        );
        res.json(availability);
      } else {
        res.status(400).json({ error: "startDate and endDate are required" });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/availability/:id", async (req, res) => {
    try {
      await storage.deleteAvailability(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Shift assignment API routes - integrate with Airtable
  app.post("/api/assignments", async (req, res) => {
    try {
      const { insertShiftAssignmentSchema } = await import("@shared/schema");
      const assignmentData = insertShiftAssignmentSchema.parse(req.body);

      console.log('Assignment request received:', assignmentData);
      console.log('Volunteer ID:', assignmentData.volunteerId);

      const baseId = process.env.VITE_BASE_ID?.replace(/\.$/, '');

      // Check for existing active assignments for this volunteer and shift
      console.log('🔍 Checking for existing active assignments...');
      const existingAssignmentsResponse = await fetch(`https://api.airtable.com/v0/${baseId}/V%20Shift%20Assignment?filterByFormula=AND(SEARCH("${assignmentData.volunteerId}",ARRAYJOIN({Volunteer})),SEARCH("${assignmentData.shiftId}",ARRAYJOIN({Shift ID})),{Status }!="cancelled")`, {
        headers: { Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}` }
      });

      if (existingAssignmentsResponse.ok) {
        const existingData = await existingAssignmentsResponse.json();
        if (existingData.records && existingData.records.length > 0) {
          console.log(`❌ Found ${existingData.records.length} existing active assignments for this volunteer and shift`);
          return res.status(409).json({ 
            error: 'You are already signed up for this shift',
            details: 'Only one active assignment per shift is allowed' 
          });
        }
      }

      console.log('✅ No existing active assignments found, proceeding with creation');

      // Create assignment in Airtable if volunteer exists in Airtable
      if (assignmentData.volunteerId !== 'demo-volunteer-123') {
        console.log('✓ Volunteer ID is not demo, proceeding with Airtable creation');
        // Shift name will be populated via lookup fields in Airtable automatically

        // Create assignment payload - Shift ID needs to be array for linked field
        const assignmentPayload = {
          records: [{
            fields: {
              'Volunteer': [assignmentData.volunteerId],
              'Shift ID': [assignmentData.shiftId], // Array format for linked field
              'Status ': 'confirmed', // Note: field has trailing space in Airtable
              'Assigned Date': new Date().toISOString(),
              'Notes': assignmentData.notes || ''
            }
          }]
        };

        console.log('Creating assignment in Airtable with payload:', JSON.stringify(assignmentPayload, null, 2));

        const airtableResponse = await fetch(`https://api.airtable.com/v0/${baseId}/V%20Shift%20Assignment`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${process.env.AIRTABLE_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(assignmentPayload)
        });

        console.log('📡 Airtable response status:', airtableResponse.status);
        const responseText = await airtableResponse.text();
        console.log('📡 Airtable response body:', responseText);

        if (airtableResponse.ok) {
          const airtableData = JSON.parse(responseText);
          const record = airtableData.records[0];

          const assignment = {
            id: record.id,
            volunteerId: assignmentData.volunteerId,
            shiftId: assignmentData.shiftId,
            status: record.fields['Status ']?.trim() || 'confirmed',
            assignedDate: new Date(record.createdTime),
            notes: record.fields['Notes'] || ''
          };

          console.log('✅ SUCCESS: Assignment created in Airtable with ID:', assignment.id);
          console.log('📊 Check your Airtable "V Shift Assignment" table to see this record!');
          return res.json(assignment);
        } else {
          console.log('⚠️ WARNING: Airtable creation failed - this assignment will ONLY be saved in temporary memory!');
          console.log('⚠️ Response:', responseText);
        }
      } else {
        console.log('💡 Using demo volunteer - skipping Airtable write (demo data only stored in memory)');
      }

      // Fallback to storage for demo users or failed Airtable requests
      console.log('💾 FALLBACK: Creating assignment in local storage (TEMPORARY - will be lost on restart!)');
      const assignment = await storage.createShiftAssignment(assignmentData);
      res.json(assignment);
    } catch (error: any) {
      console.error('Error creating assignment:', error);
      res.status(400).json({ error: error.message || 'Server error' });
    }
  });

  // Update assignment (for cancellation or re-activation)
  app.put("/api/assignments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
      const BASE_ID = process.env.VITE_BASE_ID?.replace(/\.$/, '');

      if (!AIRTABLE_TOKEN || !BASE_ID) {
        return res.status(500).json({ error: 'Missing Airtable credentials' });
      }

      const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/V%20Shift%20Assignment/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: {
            'Status ': updateData.status, // Note: field has trailing space in Airtable
            'Notes': updateData.notes,
            'Assigned Date': new Date().toISOString()
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Airtable update error:', errorText);
        return res.status(response.status).json({ error: errorText });
      }

      const result = await response.json();
      const assignment = {
        id: result.id,
        volunteerId: result.fields.Volunteer?.[0],
        shiftId: result.fields['Shift ID']?.[0],
        status: result.fields['Status '] || updateData.status, // Note: field has trailing space in Airtable
        assignedDate: new Date(result.createdTime),
        notes: result.fields.Notes
      };

      console.log(`✅ Assignment ${id} updated to status: ${updateData.status}`);
      res.json(assignment);
    } catch (error) {
      console.error('Error updating assignment:', error);
      res.status(500).json({ error: 'Failed to update assignment' });
    }
  });

  app.get("/api/assignments/volunteer/:volunteerId", async (req, res) => {
    try {
      const volunteerId = req.params.volunteerId;
      const baseId = process.env.VITE_BASE_ID?.replace(/\.$/, '');

      // Get real assignments from Airtable first with simplified search
      console.log(`Searching for assignments for volunteer: ${volunteerId}`);
      const assignmentResponse = await fetch(`https://api.airtable.com/v0/${baseId}/V%20Shift%20Assignment`, {
        headers: { Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}` }
      });

      if (assignmentResponse.ok) {
        const assignmentData = await assignmentResponse.json();
        console.log(`Found ${assignmentData.records.length} total assignments`);

        // Filter assignments for this volunteer manually since formula search is complex
        const volunteerAssignments = assignmentData.records.filter((record: any) => {
          const volunteerField = record.fields['Volunteer'];
          console.log(`Record ${record.id}: volunteer field =`, volunteerField, 'target:', volunteerId);
          return volunteerField && Array.isArray(volunteerField) && volunteerField.includes(volunteerId);
        });

        console.log(`Filtered to ${volunteerAssignments.length} assignments for this volunteer`);

        if (volunteerAssignments.length > 0) {
          // Fetch shift names for assignments that don't have them
          const shiftsResponse = await fetch(`https://api.airtable.com/v0/${baseId}/V%20Shifts`, {
            headers: { Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}` }
          });

          let shiftsData = {};
          if (shiftsResponse.ok) {
            const shifts = await shiftsResponse.json();
            shiftsData = shifts.records.reduce((acc: any, shift: any) => {
              acc[shift.id] = shift.fields?.Name?.[0] || shift.fields?.activityName || '';
              return acc;
            }, {});
          }

          const assignments = volunteerAssignments.map((record: any) => ({
            id: record.id,
            volunteerId: volunteerId,
            shiftId: record.fields['Shift ID'] || '',
            shiftName: record.fields['Shift Name'] || record.fields['Name (from Shift Name)']?.[0] || shiftsData[record.fields['Shift ID']] || '',
            status: record.fields['Status ']?.trim() || 'confirmed',
            assignedDate: new Date(record.fields['Assigned Date'] || record.createdTime),
            notes: record.fields['Notes'] || ''
          }));

          return res.json(assignments);
        }
      }

      // Fallback to storage
      const assignments = await storage.getVolunteerAssignments(volunteerId);
      res.json(assignments);
    } catch (error: any) {
      console.error('Error fetching assignments:', error);
      res.status(500).json({ error: error.message || 'Server error' });
    }
  });

  app.get("/api/assignments/shift/:shiftId", async (req, res) => {
    try {
      const assignments = await storage.getShiftAssignments(req.params.shiftId);
      res.json(assignments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Cancel assignment (update status to cancelled)
  app.delete("/api/assignments/:assignmentId", async (req, res) => {
    try {
      const assignmentId = req.params.assignmentId;

      // Try to update status in Airtable first if it's a real assignment
      if (assignmentId.startsWith('rec')) {
        const baseId = process.env.VITE_BASE_ID?.replace(/\.$/, '');
        const updatePayload = {
          fields: {
            'Status ': 'cancelled', // Update to cancelled status
            'Notes': 'Assignment cancelled by volunteer'
          }
        };

        const updateResponse = await fetch(`https://api.airtable.com/v0/${baseId}/V%20Shift%20Assignment/${assignmentId}`, {
          method: 'PATCH',
          headers: { 
            'Authorization': `Bearer ${process.env.AIRTABLE_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updatePayload)
        });

        if (updateResponse.ok) {
          const updatedRecord = await updateResponse.json();
          console.log(`✅ Assignment ${assignmentId} status updated to cancelled in Airtable`);
          console.log('Updated record:', updatedRecord);
          return res.json({ success: true, message: 'Assignment cancelled successfully' });
        } else {
          const errorData = await updateResponse.json();
          console.error('Airtable update failed:', errorData);
          console.log('Update payload was:', JSON.stringify(updatePayload, null, 2));
        }
      }

      // Fallback to storage for demo assignments
      await storage.updateShiftAssignment(assignmentId, { status: 'cancelled' });
      res.json({ success: true, message: 'Assignment cancelled successfully' });
    } catch (error: any) {
      console.error('Error cancelling assignment:', error);
      res.status(500).json({ error: error.message || 'Failed to cancel assignment' });
    }
  });

  // Update volunteer profile
  app.put('/api/volunteers/:id/profile', async (req, res) => {
    try {
      const { id } = req.params;
      const profileData = req.body;
      const baseId = process.env.VITE_BASE_ID?.replace(/\.$/, '');

      console.log(`Updating profile for volunteer: ${id}`, profileData);

      // Try to update in Airtable first if it's a real volunteer ID
      if (id.startsWith('rec') && baseId) {
        try {
          // Find volunteer in Airtable Volunteer Applications table
          const volunteerResponse = await fetch(`https://api.airtable.com/v0/${baseId}/Volunteer%20Applications/${id}`, {
            headers: { Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}` }
          });

          if (volunteerResponse.ok) {
          // Update profile data in Airtable (if supported fields exist)
          const updatePayload = {
            fields: {
              // Map profile data to Airtable fields if they exist
              ...(profileData.bio && { 'Bio': profileData.bio }),
              ...(profileData.emergencyContact && { 'Emergency Contact': profileData.emergencyContact }),
              ...(profileData.emergencyPhone && { 'Emergency Phone': profileData.emergencyPhone }),
              ...(profileData.dietaryRestrictions && { 'Dietary Restrictions': profileData.dietaryRestrictions }),
            }
          };

          if (Object.keys(updatePayload.fields).length > 0) {
            const updateResponse = await fetch(`https://api.airtable.com/v0/${baseId}/Volunteer%20Applications/${id}`, {
              method: 'PATCH',
              headers: { 
                'Authorization': `Bearer ${process.env.AIRTABLE_TOKEN}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(updatePayload)
            });

            if (updateResponse.ok) {
              console.log('✅ Profile updated in Airtable');
            }
          }

          // Return the updated volunteer data (combining Airtable + local profile data)
          const volunteerData = await volunteerResponse.json();
          const updatedVolunteer = {
            id: volunteerData.id,
            name: volunteerData.fields.Name || '',
            email: volunteerData.fields.Email || '',
            phoneNumber: volunteerData.fields.Phone || '',
            isDriver: volunteerData.fields['Is Driver'] || false,
            ...profileData // Include all profile updates
          };

          return res.json(updatedVolunteer);
        } else {
          console.log(`Volunteer ${id} not found in Airtable, status: ${volunteerResponse.status}`);
        }
        } catch (airtableError) {
          console.log('Airtable lookup failed:', airtableError);
        }
      }

      // Fallback to local storage for demo volunteers
      const updatedVolunteer = await storage.updateVolunteerProfile(id, profileData);
      res.json(updatedVolunteer);
    } catch (error: any) {
      console.error('Profile update error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  // Whitelist verification endpoint
  app.get("/api/whitelist/verify/:phoneNumber", async (req, res) => {
    try {
      const phone = req.params.phoneNumber;
      const baseId = process.env.VITE_BASE_ID?.replace(/\.$/, '');

      // Helper function to normalize phone numbers for comparison
      const normalizePhone = (phoneStr: string) => phoneStr.replace(/\D/g, '');
      const normalizedSearchPhone = normalizePhone(phone);

      console.log(`Checking whitelist for phone: "${phone}" (normalized: "${normalizedSearchPhone}")`);

      // Create flexible search formula that handles different phone formats
      const phoneSearchFormula = `OR(
        SEARCH("${phone}",{Phone}),
        SEARCH("${normalizedSearchPhone}",REGEX_REPLACE({Phone},"[^0-9]","","g")),
        {Phone}="${phone}",
        REGEX_REPLACE({Phone},"[^0-9]","","g")="${normalizedSearchPhone}",
        FIND("${normalizedSearchPhone}",REGEX_REPLACE({Phone},"[^0-9]","","g"))>0
      )`;

      // Check Platform Whitelist table first
      const whitelistResponse = await fetch(`https://api.airtable.com/v0/${baseId}/Platform%20Whitelist?filterByFormula=${encodeURIComponent(phoneSearchFormula)}`, {
        headers: { Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}` }
      });

      console.log('Platform Whitelist search status:', whitelistResponse.status);

      if (whitelistResponse.ok) {
        const whitelistData = await whitelistResponse.json();
        console.log(`Found ${whitelistData.records.length} whitelist records`);

        if (whitelistData.records.length > 0) {
          const record = whitelistData.records[0];
          const fields = record.fields;

          // Check if access is active
          const isActive = fields['Is Active'] !== false; // Default to true if not specified

          if (isActive) {
            return res.json({
              success: true,
              whitelisted: true,
              user: {
                id: record.id,
                name: `${fields['First Name'] || ''} ${fields['Last Name'] || ''}`.trim() || fields['Name'] || 'Demo User',
                phone: fields['Phone'] || phone,
                email: fields['Email'] || '',
                accessLevel: fields['Access Level'] || 'demo',
                organization: fields['Organization'] || '',
                notes: fields['Notes'] || '',
                source: 'platform_whitelist'
              }
            });
          } else {
            return res.json({
              success: true,
              whitelisted: false,
              message: 'Access has been suspended. Please contact support.'
            });
          }
        }
      }

      // Fallback: Check existing volunteer/driver tables for backwards compatibility
      const volunteerResponse = await fetch(`https://api.airtable.com/v0/${baseId}/Volunteer%20Applications?filterByFormula=${encodeURIComponent(phoneSearchFormula)}`, {
        headers: { Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}` }
      });

      if (volunteerResponse.ok) {
        const volunteerData = await volunteerResponse.json();
        if (volunteerData.records.length > 0) {
          const record = volunteerData.records[0];
          const fields = record.fields;

          return res.json({
            success: true,
            whitelisted: true,
            user: {
              id: record.id,
              name: `${fields['First Name'] || ''} ${fields['Last Name'] || ''}`.trim(),
              phone: fields['Phone'] || phone,
              email: fields['Email '] || fields['Email'] || '',
              accessLevel: 'volunteer',
              source: 'volunteer_applications'
            }
          });
        }
      }

      // Special handling for demo account
      if (phone === "555-DEMO" || normalizedSearchPhone === "555DEMO") {
        console.log('Providing demo account access');
        return res.json({
          success: true,
          whitelisted: true,
          user: {
            id: 'demo-user-whitelist',
            name: 'Demo User',
            phone: '555-DEMO',
            email: 'demo@regenerative8.org',
            accessLevel: 'demo',
            organization: 'Regenerative 8 Demo',
            source: 'demo'
          }
        });
      }

      console.log(`No whitelist entry found for phone: ${phone}`);
      res.json({
        success: true,
        whitelisted: false,
        message: 'Phone number not found in whitelist'
      });

    } catch (error: any) {
      console.error('Error checking whitelist:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Server error',
        whitelisted: false 
      });
    }
  });

  // Get volunteer skills/tags from Airtable
  app.get('/api/volunteer-skills', async (req, res) => {
    try {
      const baseId = process.env.VITE_BASE_ID?.replace(/\.$/, '');

      if (baseId) {
        const response = await fetch(`https://api.airtable.com/v0/${baseId}/Volunteer%20Applications`, {
          headers: { Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}` }
        });

        if (response.ok) {
          const data = await response.json();

          // Extract all unique skills/tags from volunteer records
          const allSkills = new Set<string>();
          const allInterests = new Set<string>();

          data.records.forEach((record: any) => {
            const fields = record.fields;

            // Look for skill-related fields
            if (fields.Skills && Array.isArray(fields.Skills)) {
              fields.Skills.forEach((skill: string) => allSkills.add(skill.trim()));
            }
            if (fields.Tags && Array.isArray(fields.Tags)) {
              fields.Tags.forEach((tag: string) => allSkills.add(tag.trim()));
            }
            if (fields['Volunteer Skills'] && Array.isArray(fields['Volunteer Skills'])) {
              fields['Volunteer Skills'].forEach((skill: string) => allSkills.add(skill.trim()));
            }

            // Look for interest-related fields
            if (fields.Interests && Array.isArray(fields.Interests)) {
              fields.Interests.forEach((interest: string) => allInterests.add(interest.trim()));
            }
            if (fields['Areas of Interest'] && Array.isArray(fields['Areas of Interest'])) {
              fields['Areas of Interest'].forEach((interest: string) => allInterests.add(interest.trim()));
            }
          });

          return res.json({
            skills: Array.from(allSkills).sort(),
            interests: Array.from(allInterests).sort()
          });
        }
      }

      // Fallback to default options
      res.json({
        skills: [
          'Event Planning', 'Teaching', 'Technology', 'Writing', 'Photography',
          'Marketing', 'Fundraising', 'Customer Service', 'Manual Labor', 'Cooking',
          'Childcare', 'Elder Care', 'Medical/Healthcare', 'Construction', 'Driving',
          'Languages', 'Administrative', 'Social Media', 'Graphic Design', 'Legal'
        ],
        interests: [
          'Environmental', 'Education', 'Health & Wellness', 'Community Development',
          'Animal Welfare', 'Arts & Culture', 'Sports & Recreation', 'Senior Services',
          'Youth Programs', 'Food Security', 'Homelessness', 'Disaster Relief',
          'Advocacy', 'Research', 'Faith-Based', 'International'
        ]
      });
    } catch (error: any) {
      console.error('Error fetching volunteer skills:', error);
      res.status(500).json({ error: 'Failed to fetch skills' });
    }
  });

  // API route to fetch mutual aid partners from Airtable
  app.get("/api/mutual-aid-partners", async (req, res) => {
    const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
    const BASE_ID = process.env.VITE_BASE_ID?.replace(/\.$/, '');

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
  });

// Comprehensive stats endpoint that fetches from all relevant tables
app.get('/api/stats', async (req, res) => {
  try {
    const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
    const baseId = process.env.VITE_BASE_ID?.replace(/\.$/, '');

    if (!AIRTABLE_TOKEN || !baseId) {
      return res.status(500).json({ 
        success: false, 
        error: 'Missing Airtable configuration' 
      });
    }

    // Check cache first
    const now = Date.now();
    if (statsCache && (now - statsCache.timestamp) < CACHE_DURATION) {
      console.log('Serving stats from cache...');
      return res.json({
        ...statsCache.data,
        cached: true,
        lastUpdated: new Date(statsCache.timestamp).toISOString()
      });
    }

    console.log('Fetching comprehensive stats from Airtable...');

    // Function to fetch all records from a table (handling pagination)
    const fetchAllRecords = async (tableName: string) => {
      let allRecords: any[] = [];
      let offset = '';

      do {
        const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}${offset ? `?offset=${offset}` : ''}`;
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` }
        });

        if (!response.ok) {
          console.log(`Failed to fetch ${tableName}: ${response.status}`);
          return [];
        }

        const data = await response.json();
        allRecords = allRecords.concat(data.records || []);
        offset = data.offset || '';
      } while (offset);

      return allRecords;
    };

    // Fetch all relevant data in parallel
    const [sites, deliveries, drivers, volunteers, partners] = await Promise.all([
      fetchAllRecords('Site'),
      fetchAllRecords('Deliveries'),
      fetchAllRecords('Drivers'),
      fetchAllRecords('Volunteer Applications'),
      fetchAllRecords('Mutual Aid Partners')
    ]);

    // Transform records to include flattened fields
    const transformedSites = sites.map((r: any) => ({ id: r.id, ...r.fields }));
    const transformedDeliveries = deliveries.map((r: any) => ({ id: r.id, ...r.fields }));
    const transformedDrivers = drivers.map((r: any) => ({ id: r.id, ...r.fields }));
    const transformedVolunteers = volunteers.map((r: any) => ({ id: r.id, ...r.fields }));
    const transformedPartners = partners.map((r: any) => ({ id: r.id, ...r.fields }));

    // Calculate total food boxes delivered using the correct field name from sample
    const totalFoodBoxes = transformedDeliveries.reduce((sum: number, delivery: any) => {
      const foodBoxCount = delivery['Food Box Count Rollup (from Item List)'] || 
                          delivery['Food Box Count'] ||
                          delivery['Food Boxes'] || 
                          delivery['Total Food Boxes'] ||
                          0;
      const count = parseInt(String(foodBoxCount)) || 0;
      return sum + count;
    }, 0);

    // Count completed deliveries - exactly matching your Airtable dashboard
    const completedDeliveries = transformedDeliveries.filter((delivery: any) => {
      return delivery.Status === 'Delivery Completed';
    }).length;

    // Calculate estimated families helped from site information using "Weekly Served" field
    const estimatedFamiliesHelped = transformedSites.reduce((sum: number, site: any) => {
      const familiesEstimate = site['Weekly Served'] || 0;
      const count = parseInt(String(familiesEstimate)) || 0;
      return sum + count;
    }, 0);

    // Count sites with actual family data for verification
    const sitesWithFamilyData = transformedSites.filter(site => site['Weekly Served'] && site['Weekly Served'] > 0).length;

    // Count active sites within last 60 days based on inventory updates
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const activeSitesLast60Days = transformedSites.filter(site => {
      const lastModified = site['Last Modified'] || site['Date Modified'] || site['Last Update'];
      if (!lastModified) return false;

      const lastModifiedDate = new Date(lastModified);
      return lastModifiedDate >= sixtyDaysAgo;
    }).length;

    // Count sites that have received deliveries (drop-off locations)
    const sitesWithDeliveries = new Set();
    transformedDeliveries.forEach((delivery: any) => {
      const dropOffSite = delivery['Drop Off Site'] || delivery['Delivery Site'] || delivery['Site'];
      if (dropOffSite) {
        sitesWithDeliveries.add(dropOffSite);
      }
    });

    // Count sites with recent needs/supply requests (last 60 days)
    const sitesWithRecentActivity = transformedSites.filter(site => {
      const needsCount = parseInt(String(site['Needs Count'] || 0));
      const lastUpdate = site['Last Update'] || site['Last Modified'];

      if (needsCount > 0) return true; // Has current needs

      if (lastUpdate) {
        const updateDate = new Date(lastUpdate);
        return updateDate >= sixtyDaysAgo; // Recent activity
      }

      return false;
    }).length;

    console.log(`✓ Stats loaded: ${transformedSites.length} sites, ${transformedDeliveries.length} deliveries (${completedDeliveries} completed), ${transformedDrivers.length} drivers, ${transformedVolunteers.length} volunteers, ${transformedPartners.length} mutual aid partners`);
    console.log(`✓ Total food boxes delivered: ${totalFoodBoxes}`);
    console.log(`✓ Estimated families helped: ${estimatedFamiliesHelped} (${sitesWithFamilyData} sites have data)`);
    console.log(`✓ Active sites (last 60 days): ${activeSitesLast60Days}, Sites with deliveries: ${sitesWithDeliveries.size}, Sites with recent activity: ${sitesWithRecentActivity}`);

    const responseData = {
      success: true,
      data: {
        sites: transformedSites,
        deliveries: transformedDeliveries, 
        drivers: transformedDrivers,
        volunteers: transformedVolunteers,
        partners: transformedPartners
      },
      counts: {
        sites: transformedSites.length,
        deliveries: transformedDeliveries.length,
        completedDeliveries: completedDeliveries,
        drivers: transformedDrivers.length,
        volunteers: transformedVolunteers.length,
        partners: transformedPartners.length,
        totalFoodBoxes: totalFoodBoxes,
        estimatedFamiliesHelped: estimatedFamiliesHelped,
        activeSitesLast60Days: activeSitesLast60Days,
        sitesWithDeliveries: sitesWithDeliveries.size,
        sitesWithRecentActivity: sitesWithRecentActivity
      },
      cached: false,
      lastUpdated: new Date().toISOString()
    };

    // Cache the response
    statsCache = {
      data: responseData,
      timestamp: now
    };

    return res.json(responseData);

  } catch (error: any) {
    console.error('Error fetching stats:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Debug endpoint to analyze site field names
app.get('/api/debug/site-fields', async (req, res) => {
  try {
    const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
    const baseId = process.env.VITE_BASE_ID?.replace(/\.$/, '');

    if (!AIRTABLE_TOKEN || !baseId) {
      return res.status(500).json({ success: false, error: 'Missing Airtable configuration' });
    }

    const response = await fetch(`https://api.airtable.com/v0/${baseId}/Site?maxRecords=5`, {
      headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` }
    });

    if (!response.ok) {
      return res.status(500).json({ success: false, error: 'Failed to fetch sites' });
    }

    const data = await response.json();
    const sites = data.records?.map((r: any) => ({ id: r.id, ...r.fields })) || [];

    const analysis = {
      allFields: Object.keys(sites[0] || {}),
      familyLikeFields: Object.keys(sites[0] || {}).filter(field => 
        field.toLowerCase().includes('famil') || 
        field.toLowerCase().includes('served') ||
        field.toLowerCase().includes('help') ||
        field.toLowerCase().includes('people') ||
        field.toLowerCase().includes('estimate')
      ),
      sampleSite: sites[0] || {}
    };

    return res.json({ success: true, analysis });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Debug endpoint to analyze delivery status values
app.get('/api/debug/delivery-statuses', async (req, res) => {
  try {
    const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
    const baseId = process.env.VITE_BASE_ID?.replace(/\.$/, '');

    if (!AIRTABLE_TOKEN || !baseId) {
      return res.status(500).json({ 
        success: false, 
        error: 'Missing Airtable configuration' 
      });
    }

    // Fetch first 100 deliveries for analysis
    const response = await fetch(`https://api.airtable.com/v0/${baseId}/Deliveries?maxRecords=100`, {
      headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` }
    });

    if (!response.ok) {
      return res.status(500).json({ success: false, error: 'Failed to fetch deliveries' });
    }

    const data = await response.json();
    const deliveries = data.records?.map((r: any) => ({ id: r.id, ...r.fields })) || [];

    // Analyze all status-related fields
    const statusAnalysis = {
      allFields: Object.keys(deliveries[0] || {}),
      driverStatuses: [...new Set(deliveries.map(d => d['Driver Status']).filter(Boolean))],
      statuses: [...new Set(deliveries.map(d => d.Status || d.status).filter(Boolean))],
      statusLikeFields: Object.keys(deliveries[0] || {}).filter(field => 
        field.toLowerCase().includes('status') || 
        field.toLowerCase().includes('complete') || 
        field.toLowerCase().includes('deliver') ||
        field.toLowerCase().includes('confirm')
      ),
      sampleRecords: deliveries.slice(0, 3).map(d => ({
        id: d.id,
        driverStatus: d['Driver Status'],
        status: d.Status || d.status,
        allStatusFields: Object.keys(d).filter(key => 
          key.toLowerCase().includes('status') || 
          key.toLowerCase().includes('complete') || 
          key.toLowerCase().includes('deliver')
        ).reduce((obj, key) => ({ ...obj, [key]: d[key] }), {})
      }))
    };

    return res.json({ success: true, analysis: statusAnalysis });

  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Cache for recent updates (separate from main stats cache)
let recentUpdatesCache: any = null;
let recentUpdatesCacheTime: number = 0;
const RECENT_UPDATES_CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours

// Recent updates endpoint for needs and inventory within last 30 days
app.get('/api/recent-updates', async (req, res) => {
  try {
    // Check cache first
    const now = Date.now();
    if (recentUpdatesCache && (now - recentUpdatesCacheTime) < RECENT_UPDATES_CACHE_DURATION) {
      console.log('✓ Returning cached recent updates');
      return res.json({
        ...recentUpdatesCache,
        cached: true,
        lastUpdated: new Date(recentUpdatesCacheTime).toISOString()
      });
    }

    const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
    const baseId = process.env.VITE_BASE_ID?.replace(/\.$/, '');

    if (!AIRTABLE_TOKEN || !baseId) {
      return res.status(500).json({ 
        success: false, 
        error: 'Missing Airtable configuration' 
      });
    }

    console.log('Fetching recent updates from Airtable...');

    // Calculate date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateFilter = thirtyDaysAgo.toISOString().split('T')[0];

    // Function to fetch recent records from a table
    const fetchRecentRecords = async (tableName: string) => {
      try {
        // Use filterByFormula to get records modified in last 30 days
        const formula = `IS_AFTER({Last Modified}, '${dateFilter}')`;
        const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}?filterByFormula=${encodeURIComponent(formula)}&maxRecords=200`;

        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` }
        });

        if (!response.ok) {
          console.log(`Failed to fetch recent ${tableName}: ${response.status}`);
          return [];
        }

        const data = await response.json();
        return data.records?.map((r: any) => ({ 
          id: r.id, 
          ...r.fields,
          tableName,
          lastModified: r.fields['Last Modified'] || r.createdTime
        })) || [];
      } catch (error) {
        console.log(`Error fetching recent ${tableName}:`, error);
        return [];
      }
    };

    // Fetch recent updates from relevant tables
    const [siteInventory, needsUpdates] = await Promise.all([
      fetchRecentRecords('Site Inventory'),
      fetchRecentRecords('Supply List')
    ]);

    console.log(`✓ Recent updates: ${siteInventory.length} inventory updates, ${needsUpdates.length} needs updates`);

    // Cache the response
    const responseData = {
      success: true,
      data: {
        inventory: siteInventory,
        needs: needsUpdates,
        dateRange: {
          from: dateFilter,
          to: new Date().toISOString().split('T')[0]
        }
      },
      counts: {
        inventory: siteInventory.length,
        needs: needsUpdates.length,
        total: siteInventory.length + needsUpdates.length
      },
      cached: false,
      lastUpdated: new Date().toISOString()
    };

    // Store in cache
    recentUpdatesCache = responseData;
    recentUpdatesCacheTime = now;

    console.log('✓ Recent updates cached successfully for 6 hours');

    return res.json(responseData);

  } catch (error: any) {
    console.error('Error fetching recent updates:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Generic Airtable table endpoint for stats
app.get('/api/airtable-table/:tableName', async (req, res) => {
  try {
    const { tableName } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;

    console.log(`Fetching data from Airtable table: ${tableName}`);

    const airtableToken = process.env.AIRTABLE_TOKEN;
    const baseId = process.env.VITE_BASE_ID?.replace(/\.$/, '');

    if (!airtableToken || !baseId) {
      return res.status(500).json({ 
        success: false, 
        error: 'Missing Airtable configuration' 
      });
    }

    // Fetch data from the specified table
    const response = await fetch(
      `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}?maxRecords=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${airtableToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      console.error(`Airtable API error for table ${tableName}:`, response.status, response.statusText);
      return res.status(response.status).json({ 
        success: false, 
        error: `Airtable API failed: ${response.status}` 
      });
    }

    const data = await response.json();
    console.log(`✓ Successfully fetched ${data.records?.length || 0} records from ${tableName}`);

    // Transform records to include flattened fields
    const transformedRecords = data.records?.map((record: any) => ({
      id: record.id,
      ...record.fields
    })) || [];

    return res.json(transformedRecords);

  } catch (error: any) {
    console.error(`Error fetching table ${req.params.tableName}:`, error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

  // Better emergency alerts endpoint using IPAWS API
  app.get("/api/emergency-alerts", async (req, res) => {
    try {
      // FEMA IPAWS (Integrated Public Alert & Warning System) API
      const ipawsUrl = 'https://www.fema.gov/api/open/v2/IpawsArchivedAlerts';
      const params = new URLSearchParams({
        '$top': '20',
        '$orderby': 'sent desc',
        '$filter': `sent ge '${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()}'` // Last 7 days
      });

      const response = await fetch(`${ipawsUrl}?${params}`);

      if (!response.ok) {
        throw new Error(`IPAWS API failed: ${response.status}`);
      }

      const data = await response.json();

      // Process IPAWS alerts into simplified format
      const alerts = (data.IpawsArchivedAlerts || []).map((alert: any) => ({
        id: alert.alertId || alert.id,
        title: alert.headline || alert.event || 'Emergency Alert',
        description: alert.description || '',
        location: alert.areaDesc || 'Location not specified',
        severity: alert.severity?.toLowerCase() || 'medium',
        urgency: alert.urgency?.toLowerCase() || 'unknown',
        certainty: alert.certainty?.toLowerCase() || 'unknown',
        sent: alert.sent,
        expires: alert.expires,
        senderName: alert.senderName,
        web: alert.web
      }));

      res.json({
        success: true,
        alerts: alerts.slice(0, 10),
        source: 'FEMA IPAWS',
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error('Emergency alerts API error:', error);

      // Fallback to National Weather Service alerts
      try {
        const nwsResponse = await fetch('https://api.weather.gov/alerts/active');
        if (nwsResponse.ok) {
          const nwsData = await nwsResponse.json();
          const nwsAlerts = (nwsData.features || []).slice(0, 10).map((feature: any) => ({
            id: feature.id,
            title: feature.properties?.headline || 'Weather Alert',
            description: feature.properties?.description || '',
            location: feature.properties?.areaDesc || 'Location not specified',
            severity: feature.properties?.severity?.toLowerCase() || 'medium',
            urgency: feature.properties?.urgency?.toLowerCase() || 'unknown',
            certainty: feature.properties?.certainty?.toLowerCase() || 'unknown',
            sent: feature.properties?.sent,
            expires: feature.properties?.expires,
            senderName: 'National Weather Service',
            web: feature.properties?.web
          }));

          return res.json({
            success: true,
            alerts: nwsAlerts,
            source: 'National Weather Service (fallback)',
            lastUpdated: new Date().toISOString()
          });
        }
      } catch (fallbackError) {
        console.error('NWS fallback also failed:', fallbackError);
      }

      res.status(500).json({
        success: false,
        error: 'Failed to fetch emergency alerts',
        alerts: []
      });
    }
  });

  // Enhanced Wildfire Incidents endpoint with multi-source integration
  app.get('/api/wildfire-incidents', async (req, res) => {
    try {
      console.log('Fetching wildfire incidents from multiple sources...');

      // Source 1: InciWeb RSS Feed (national federal wildfire incidents)
      let inciwebIncidents: any[] = [];
      try {
        console.log('📡 Fetching from InciWeb RSS feed...');
        const inciwebResponse = await fetch('https://inciweb.wildfire.gov/incidents/rss.xml', {
          headers: { 'User-Agent': 'DisasterApp/1.0 (wildfire-monitoring@example.com)' }
        });

        if (!inciwebResponse.ok) {
          throw new Error(`InciWeb HTTP error! status: ${inciwebResponse.status}`);
        }

        const xmlText = await inciwebResponse.text();
        inciwebIncidents = await parseInciWebFeed(xmlText);
        console.log(`✓ InciWeb incidents found: ${inciwebIncidents.length}`);
      } catch (inciwebError) {
        console.error('InciWeb RSS feed error:', inciwebError);
      }

      // Source 2: NASA FIRMS (satellite fire detection for Florida)
      let firmsIncidents: any[] = [];
      try {
        console.log('🛰️ Fetching Florida fires from NASA FIRMS...');
        firmsIncidents = await fetchNASAFirmsData();
        console.log(`✓ NASA FIRMS Florida fires found: ${firmsIncidents.length}`);
      } catch (firmsError) {
        console.error('NASA FIRMS API error:', firmsError);
      }

      // Combine and deduplicate incidents
      const allIncidents = [...inciwebIncidents, ...firmsIncidents];
      const uniqueIncidents = deduplicateWildfireIncidents(allIncidents);

      console.log(`✓ Total unique wildfire incidents: ${uniqueIncidents.length} (${inciwebIncidents.length} InciWeb + ${firmsIncidents.length} FIRMS)`);

      res.json({
        success: true,
        incidents: uniqueIncidents,
        sources: {
          inciweb: inciwebIncidents.length,
          nasaFirms: firmsIncidents.length,
          total: uniqueIncidents.length
        },
        lastUpdated: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error fetching wildfire incidents:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch wildfire incidents',
        incidents: []
      });
    }
  });

  // Helper function to parse InciWeb RSS feed
  async function parseInciWebFeed(xmlText: string): Promise<any[]> {

    // Parse XML manually since we don't have DOMParser in Node.js
    const parseXMLItem = (itemText: string) => {
      const getTagContent = (tag: string): string => {
        const regex = new RegExp(`<${tag}[^>]*>(.*?)</${tag}>`, 'is');
        const match = itemText.match(regex);
        return match ? match[1].trim() : '';
      };

      return {
        title: getTagContent('title'),
        description: getTagContent('description'),
        link: getTagContent('link'),
        pubDate: getTagContent('pubDate'),
        guid: getTagContent('guid')
      };
    };

    // Extract items from XML
    const itemMatches = xmlText.match(/<item[^>]*>(.*?)<\/item>/gis) || [];

    const incidents = itemMatches.map((itemXml, index) => {
        const item = parseXMLItem(itemXml);

        // Valid US state codes
        const validStates = new Set([
          'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
          'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
          'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
          'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
          'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
        ]);

        // Extract state from title/description - improved extraction logic
        let state = '';

        // First, try to extract from agency prefixes in titles like "CAMDF", "UTMLF", "OR98S"
        const agencyPrefixMatch = item.title.match(/^([A-Z]{2,6})\s/);
        if (agencyPrefixMatch) {
          const prefix = agencyPrefixMatch[1];
          // Extract state from common agency prefixes and regional codes
          const agencyToState: { [key: string]: string } = {
            // California agencies
            'CAMDF': 'CA', 'CAONF': 'CA', 'CASHU': 'CA', 'CABDF': 'CA',
            // Utah agencies  
            'UTMLF': 'UT', 'UTDNR': 'UT', 'UTFWL': 'UT', 'UTFIF': 'UT',
            // Idaho agencies
            'IDSCF': 'ID', 'IDBDF': 'ID', 'IDNEZ': 'ID',
            // Montana agencies
            'MTBRF': 'MT', 'MTMTS': 'MT', 'MTBLM': 'MT',
            // Washington agencies
            'WANES': 'WA', 'WAOWF': 'WA', 'WADNR': 'WA',
            // Nevada agencies
            'NVDOF': 'NV', 'NVBLM': 'NV',
            // Oregon agencies and regional codes
            'ORBDF': 'OR', 'ORUSP': 'OR', 'OR98S': 'OR', 'OR39S': 'OR', 'ORSWS': 'OR',
            // Nebraska agencies
            'NEBFC': 'NE', 'NEFOR': 'NE',
            // Texas agencies
            'TXFOR': 'TX', 'TXBLM': 'TX',
            // Arizona agencies
            'AZSTF': 'AZ', 'AZBLM': 'AZ',
            // Colorado agencies
            'COFIRE': 'CO', 'COBLM': 'CO',
            // New Mexico agencies
            'NMFOR': 'NM', 'NMBLM': 'NM',
            // Wyoming agencies
            'WYFIRE': 'WY', 'WYBLM': 'WY'
          };

          if (agencyToState[prefix]) {
            state = agencyToState[prefix];
          } else {
            // Try to extract state from first 2 characters of agency code
            const stateCandidate = prefix.substring(0, 2);
            if (validStates.has(stateCandidate)) {
              state = stateCandidate;
            }
          }
        }

        // If no state found from agency codes, try standard 2-letter extraction
        if (!state) {
          const titleStateMatches = item.title.match(/\b([A-Z]{2})\b/g) || [];
          const descStateMatches = item.description.match(/\b([A-Z]{2})\b/g) || [];

          // Find first valid state code
          for (const match of [...titleStateMatches, ...descStateMatches]) {
            if (validStates.has(match)) {
              state = match;
              break;
            }
          }
        }

        // Also try to extract from location patterns like "State: CA" or "California"
        if (!state) {
          const stateNamePattern = /(?:State:|Location:|in )(Alabama|Alaska|Arizona|Arkansas|California|Colorado|Connecticut|Delaware|Florida|Georgia|Hawaii|Idaho|Illinois|Indiana|Iowa|Kansas|Kentucky|Louisiana|Maine|Maryland|Massachusetts|Michigan|Minnesota|Mississippi|Missouri|Montana|Nebraska|Nevada|New Hampshire|New Jersey|New Mexico|New York|North Carolina|North Dakota|Ohio|Oklahoma|Oregon|Pennsylvania|Rhode Island|South Carolina|South Dakota|Tennessee|Texas|Utah|Vermont|Virginia|Washington|West Virginia|Wisconsin|Wyoming)/i;
          const stateNameMatch = item.title.match(stateNamePattern) || item.description.match(stateNamePattern);

          if (stateNameMatch) {
            const stateNameMap: { [key: string]: string } = {
              'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR', 'california': 'CA',
              'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE', 'florida': 'FL', 'georgia': 'GA',
              'hawaii': 'HI', 'idaho': 'ID', 'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA',
              'kansas': 'KS', 'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
              'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS', 'missouri': 'MO',
              'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ',
              'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH',
              'oklahoma': 'OK', 'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
              'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT', 'vermont': 'VT',
              'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV', 'wisconsin': 'WI', 'wyoming': 'WY'
            };
            state = stateNameMap[stateNameMatch[1].toLowerCase()] || '';
          }
        }

        // Clean and parse the description for better readability
        const cleanDescription = (rawDesc: string): string => {
          // Remove HTML tags and excessive whitespace
          let cleaned = rawDesc.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

          // Remove common technical prefixes and suffixes
          cleaned = cleaned.replace(/^(Incident Summary:|Summary:|Description:|Update:)/i, '');
          cleaned = cleaned.replace(/\s*(For more information.*|Visit.*|Contact.*|Additional details.*)$/i, '');

          // Split into sentences and take the most relevant ones
          const sentences = cleaned.split(/[.!?]+/).filter(s => s.trim().length > 20);

          // Prioritize sentences with key information
          const prioritySentences = sentences.filter(s => 
            /acres|percent|contained|controlled|firefighters|evacuation|threat|damage/i.test(s)
          );

          // Return the best summary (max 2-3 sentences)
          const selectedSentences = prioritySentences.length > 0 
            ? prioritySentences.slice(0, 2) 
            : sentences.slice(0, 2);

          return selectedSentences.join('. ').trim() + (selectedSentences.length > 0 ? '.' : '');
        };

        // Extract fire size with better parsing
        const sizeMatches = item.description.match(/(\d+(?:,\d+)*)\s*acres/gi) || [];
        let acres = null;
        if (sizeMatches.length > 0) {
          // Get the largest acreage mentioned (often the most current)
          const acreageValues = sizeMatches.map(match => {
            const numMatch = match.match(/(\d+(?:,\d+)*)/);
            return numMatch ? parseInt(numMatch[1].replace(/,/g, '')) : 0;
          });
          acres = Math.max(...acreageValues);
        }

        // Extract containment percentage
        const containmentMatch = item.description.match(/(\d+)\s*%?\s*contain/i);
        const containmentPercent = containmentMatch ? parseInt(containmentMatch[1]) : null;

        // Extract status with more sophisticated parsing
        let status = 'Active';
        const desc = item.description.toLowerCase();
        if (containmentPercent === 100 || desc.includes('fully contained') || desc.includes('100% contained')) {
          status = 'Contained';
        } else if (desc.includes('controlled') || desc.includes('suppressed')) {
          status = 'Controlled';
        } else if (desc.includes('out') && !desc.includes('without')) {
          status = 'Out';
        } else if (containmentPercent && containmentPercent > 75) {
          status = 'Nearly Contained';
        } else if (desc.includes('contained') || containmentPercent) {
          status = 'Partially Contained';
        }

        // Extract incident type with better detection
        let incidentType = 'Wildfire';
        if (desc.includes('prescribed') || desc.includes('planned burn')) {
          incidentType = 'Prescribed Fire';
        } else if (desc.includes('structure') || desc.includes('building')) {
          incidentType = 'Structure Fire';
        } else if (desc.includes('grass') || desc.includes('prairie')) {
          incidentType = 'Grass Fire';
        } else if (desc.includes('brush') || desc.includes('vegetation')) {
          incidentType = 'Brush Fire';
        }

        // Extract personnel count
        const personnelMatch = item.description.match(/(\d+)\s*(?:firefighters?|personnel|crew)/i);
        const personnelCount = personnelMatch ? parseInt(personnelMatch[1]) : null;

        // Extract threat information
        const threatKeywords = ['evacuation', 'threatened', 'at risk', 'danger', 'smoke'];
        const hasThreat = threatKeywords.some(keyword => desc.includes(keyword));

        // Create human-readable summary
        const createSummary = (): string => {
          let summary = '';

          if (acres) {
            summary += `${acres.toLocaleString()} acre ${incidentType.toLowerCase()}`;
          } else {
            summary += incidentType;
          }

          if (containmentPercent) {
            summary += ` is ${containmentPercent}% contained`;
          } else {
            summary += ` is currently ${status.toLowerCase()}`;
          }

          if (personnelCount) {
            summary += `. ${personnelCount} firefighters are responding`;
          }

          if (hasThreat) {
            summary += '. Area residents may be affected';
          }

          return summary + '.';
        };

        return {
          id: item.guid || `incident-${index}`,
          title: item.title.trim(),
          description: cleanDescription(item.description),
          rawDescription: item.description.trim(), // Keep original for reference
          humanSummary: createSummary(),
          link: item.link,
          pubDate: item.pubDate,
          state,
          acres,
          containmentPercent,
          personnelCount,
          status,
          incidentType,
          hasThreat,
          source: 'InciWeb',
          severity: acres && acres > 1000 ? 'severe' : acres && acres > 100 ? 'moderate' : 'minor'
        };
      });

      console.log(`✓ Wildfire incidents processed: ${incidents.length} incidents found`);

      return incidents;
  }

  // Florida-specific wildfire incidents from multiple sources
  app.get('/api/florida-wildfires', async (req, res) => {
    try {
      console.log('🔥 Fetching Florida-specific wildfire data from multiple sources...');
      
      const floridaFires: any[] = [];
      
      // Source 1: Check existing InciWeb feed for Florida fires
      try {
        const inciwebResponse = await fetch('http://localhost:5000/api/wildfire-incidents');
        if (inciwebResponse.ok) {
          const inciwebData = await inciwebResponse.json();
          const floridaInciwebFires = (inciwebData.incidents || []).filter((fire: any) => 
            fire.state === 'FL' || fire.location?.toLowerCase().includes('florida')
          );
          floridaFires.push(...floridaInciwebFires.map((fire: any) => ({
            ...fire,
            source: 'InciWeb Federal'
          })));
          console.log(`📡 Found ${floridaInciwebFires.length} Florida fires from InciWeb`);
        }
      } catch (error) {
        console.error('Error fetching InciWeb Florida data:', error);
      }

      // Source 2: NASA FIRMS satellite fire detection for Florida
      try {
        console.log('🛰️ Fetching NASA FIRMS satellite fire data for Florida...');
        
        // Florida bounding box coordinates
        const floridaBounds = '-87.6349,24.5210,-80.0311,31.0009';
        
        // Try NASA FIRMS public API (no key needed for recent data)
        const firmsResponse = await fetch(`https://firms.modaps.eosdis.nasa.gov/api/area/csv/nokey/VIIRS_SNPP_NRT/${floridaBounds}/1`, {
          headers: { 'User-Agent': 'DisasterApp/1.0 (florida-fires@example.com)' },
          timeout: 10000
        });

        if (firmsResponse.ok) {
          const csvData = await firmsResponse.text();
          const firmsLines = csvData.trim().split('\n');
          
          if (firmsLines.length > 1) {
            const headers = firmsLines[0].split(',');
            
            for (let i = 1; i < Math.min(firmsLines.length, 21); i++) { // Limit to 20 fires
              const values = firmsLines[i].split(',');
              if (values.length >= headers.length) {
                const fireData: any = {};
                headers.forEach((header, index) => {
                  fireData[header.trim()] = values[index]?.trim();
                });

                const confidence = parseFloat(fireData.confidence) || 0;
                const brightness = parseFloat(fireData.bright_ti4) || parseFloat(fireData.brightness) || 0;
                
                // Only include high-confidence detections likely to be wildfires
                if (confidence >= 50 && brightness > 280) {
                  floridaFires.push({
                    id: `nasa-viirs-${fireData.latitude}-${fireData.longitude}-${fireData.acq_date}`,
                    title: `Active Fire Detection - Florida`,
                    description: `Satellite-detected active fire. Confidence: ${confidence}%, Brightness: ${brightness}K. Detected by NASA VIIRS sensor on ${fireData.acq_date}.`,
                    location: 'Florida',
                    state: 'FL',
                    coordinates: {
                      latitude: parseFloat(fireData.latitude),
                      longitude: parseFloat(fireData.longitude)
                    },
                    updated: `${fireData.acq_date}T${(fireData.acq_time || '0000').padStart(4, '0').slice(0,2)}:${(fireData.acq_time || '0000').padStart(4, '0').slice(2,4)}:00Z`,
                    confidence: confidence,
                    brightness: brightness,
                    type: 'wildfire',
                    severity: confidence > 75 ? 'high' : confidence > 60 ? 'medium' : 'low',
                    source: 'NASA VIIRS Satellite',
                    acres: null,
                    containmentPercent: null,
                    status: 'Active (Satellite Detected)'
                  });
                }
              }
            }
            console.log(`🛰️ Found ${floridaFires.filter(f => f.source === 'NASA VIIRS Satellite').length} satellite-detected fires in Florida`);
          }
        } else {
          console.log('NASA FIRMS API unavailable, continuing with other sources...');
        }
      } catch (firmsError) {
        console.error('NASA FIRMS error:', firmsError);
      }

      // Remove duplicates based on proximity for satellite data
      const uniqueFires = [];
      const seenLocations = new Set();
      
      for (const fire of floridaFires) {
        if (fire.coordinates) {
          // Group fires within ~2 miles
          const locationKey = `${Math.round(fire.coordinates.latitude * 50) / 50},${Math.round(fire.coordinates.longitude * 50) / 50}`;
          if (seenLocations.has(locationKey)) continue;
          seenLocations.add(locationKey);
        }
        uniqueFires.push(fire);
      }

      console.log(`🔥 Total unique Florida fires found: ${uniqueFires.length}`);

      res.json({
        success: true,
        fires: uniqueFires,
        totalCount: uniqueFires.length,
        sources: {
          inciweb: uniqueFires.filter(f => f.source === 'InciWeb Federal').length,
          nasaViirs: uniqueFires.filter(f => f.source === 'NASA VIIRS Satellite').length
        },
        note: uniqueFires.length === 0 ? 'No active fires currently detected in Florida' : null,
        lastUpdated: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error fetching Florida wildfire data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch Florida wildfire data',
        fires: []
      });
    }
  });

  // USGS Earthquake Data endpoint
  app.get('/api/earthquake-incidents', async (req, res) => {
    try {
      console.log('Fetching earthquake incidents from USGS GeoJSON feed...');

      // Get significant earthquakes from the past 7 days
      const response = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson', {
        headers: { 'User-Agent': 'DisasterApp/1.0 (earthquake-monitoring@example.com)' }
      });

      if (!response.ok) {
        // Fallback to all earthquakes magnitude 4.5+ in the past 7 days if significant fails
        const fallbackResponse = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson', {
          headers: { 'User-Agent': 'DisasterApp/1.0 (earthquake-monitoring@example.com)' }
        });

        if (!fallbackResponse.ok) {
          throw new Error(`HTTP error! status: ${fallbackResponse.status}`);
        }

        const data = await fallbackResponse.json();
        const earthquakes = processEarthquakeData(data);

        return res.json({
          success: true,
          incidents: earthquakes,
          count: earthquakes.length,
          lastUpdated: new Date().toISOString(),
          source: 'USGS Earthquake GeoJSON Feed (4.5+ Magnitude)'
        });
      }

      const data = await response.json();
      const earthquakes = processEarthquakeData(data);

      console.log(`✓ Earthquake incidents processed: ${earthquakes.length} earthquakes found`);

      res.json({
        success: true,
        incidents: earthquakes,
        count: earthquakes.length,
        lastUpdated: new Date().toISOString(),
        source: 'USGS Earthquake GeoJSON Feed (Significant Events)'
      });
    } catch (error: any) {
      console.error('Error fetching earthquake incidents:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch earthquake incidents',
        details: error.message || 'Unknown error'
      });
    }
  });

  function processEarthquakeData(geoJsonData: any) {
    if (!geoJsonData.features || !Array.isArray(geoJsonData.features)) {
      return [];
    }

    // Valid US state codes + territories + Canada
    const validLocations = new Set([
      'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
      'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
      'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
      'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
      'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
      // US Territories
      'PR', 'VI', 'GU', 'AS', 'MP',
      // Canada (provinces)
      'AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'
    ]);

    return geoJsonData.features.map((feature: any, index: number) => {
      const props = feature.properties || {};
      const coords = feature.geometry?.coordinates || [0, 0, 0];
      const [longitude, latitude, depth] = coords;

      // Extract location information
      const place = props.place || '';
      let state = '';
      let location = place;

      // Try to extract state/province from place string
      const stateMatch = place.match(/\b([A-Z]{2})\b/g) || [];
      for (const match of stateMatch) {
        if (validLocations.has(match)) {
          state = match;
          break;
        }
      }

      // If no state found, try basic geographic mapping for US/Canada only
      if (!state) {
        // Only check US/Canada coordinates (negative longitudes for North America)
        if (longitude < 0 && latitude >= 25 && latitude <= 71 && longitude >= -180 && longitude <= -50) {
          if (latitude >= 60 && longitude <= -130) {
            state = 'AK'; // Alaska
          } else if (latitude >= 19 && latitude <= 23 && longitude >= -161 && longitude <= -154) {
            state = 'HI'; // Hawaii
          } else if (latitude >= 49) {
            // Basic Canada province mapping - simplified
            if (longitude >= -141 && longitude <= -60) {
              if (longitude >= -141 && longitude <= -120) state = 'BC'; // British Columbia
              else if (longitude >= -120 && longitude <= -100) state = 'AB'; // Alberta  
              else if (longitude >= -100 && longitude <= -90) state = 'SK'; // Saskatchewan
              else if (longitude >= -96 && longitude <= -89) state = 'MB'; // Manitoba
              else if (longitude >= -95 && longitude <= -74) state = 'ON'; // Ontario
              else if (longitude >= -79 && longitude <= -60) state = 'QC'; // Quebec
              else state = 'CA'; // Generic Canada
            }
          }
        }
      }

      // If no state found, assign based on region or mark as international
      if (!state) {
        // Try to extract country or region for international earthquakes
        if (place.includes('Russia')) state = 'RU';
        else if (place.includes('Japan')) state = 'JP';
        else if (place.includes('Chile')) state = 'CL';
        else if (place.includes('Peru')) state = 'PERU';
        else if (place.includes('Indonesia')) state = 'IND';
        else if (place.includes('Philippines')) state = 'PH';
        else if (place.includes('Turkey')) state = 'TR';
        else if (place.includes('Greece')) state = 'GR';
        else if (place.includes('Iran')) state = 'IR';
        else if (place.includes('Mexico')) state = 'MX';
        else if (place.includes('Guatemala')) state = 'GT';
        else if (place.includes('New Zealand')) state = 'NZ';
        else if (place.includes('Pacific Ocean') || place.includes('Atlantic Ocean') || place.includes('Ocean')) state = 'OCEAN';
        else state = 'INTL'; // International/Other
      }

      const magnitude = props.mag || 0;
      const time = props.time ? new Date(props.time).toISOString() : new Date().toISOString();

      // Determine severity based on magnitude
      let severity = 'minor';
      if (magnitude >= 7.0) severity = 'severe';
      else if (magnitude >= 5.0) severity = 'moderate';

      // Determine alert level
      let alertLevel = props.alert || 'green';

      return {
        id: props.ids || feature.id || `earthquake-${index}`,
        title: props.title || `M${magnitude} Earthquake`,
        description: `Magnitude ${magnitude} earthquake ${place}. Depth: ${depth}km`,
        link: props.url || 'https://earthquake.usgs.gov/',
        pubDate: time,
        state,
        location: place,
        magnitude,
        depth,
        latitude,
        longitude,
        severity,
        alertLevel,
        tsunami: props.tsunami || 0,
        source: 'USGS',
        type: props.type || 'earthquake'
      };
    }).filter(Boolean); // Remove null entries
  }

  // Helper functions for weather alert processing
  function extractLocationFromContent(text: string): string {
    const statePattern = /\b[A-Z]{2}\b/g;
    const matches = text.match(statePattern);
    return matches ? matches.join(', ') : 'Location not specified';
  }

  function extractSeverityFromContent(text: string): string {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('extreme') || lowerText.includes('tornado')) return 'extreme';
    if (lowerText.includes('severe') || lowerText.includes('hurricane')) return 'severe';
    if (lowerText.includes('moderate') || lowerText.includes('thunderstorm')) return 'moderate';
    return 'minor';
  }

  function extractEventFromContent(title: string): string {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('tornado')) return 'Tornado Warning';
    if (lowerTitle.includes('hurricane')) return 'Hurricane Warning';
    if (lowerTitle.includes('flood')) return 'Flood Warning';
    if (lowerTitle.includes('fire')) return 'Fire Weather Watch';
    if (lowerTitle.includes('storm')) return 'Severe Thunderstorm Warning';
    return 'Weather Alert';
  }

  function removeDuplicateAlerts(alerts: any[]): any[] {
    const seen = new Set();
    return alerts.filter(alert => {
      const key = `${alert.title}-${alert.location}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // States Under Emergency endpoint - combines FEMA declarations and NWS alerts
  app.get("/api/states-under-emergency", async (req, res) => {
    try {
      console.log('Fetching states under emergency status...');

      // Get current FEMA active emergency declarations
      const femaResponse = await fetch('https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries?$filter=incidentEndDate eq null&$top=1000',{
        headers: { 'User-Agent': 'DisasterApp/1.0 (monitoring@example.com)' }
      });

      // Get current NWS active alerts
      const nwsResponse = await fetch('https://api.weather.gov/alerts/active', {
        headers: { 'User-Agent': 'DisasterApp/1.0 (monitoring@example.com)' }
      });

      const emergencyStates = new Map();
      const stateNames = {
        'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
        'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
        'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
        'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
        'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
        'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
        'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
        'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
        'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
        'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming',
        'DC': 'District of Columbia', 'PR': 'Puerto Rico', 'VI': 'Virgin Islands', 'GU': 'Guam', 'AS': 'American Samoa'
      };

      // Process FEMA active declarations
      if (femaResponse.ok) {
        const femaData = await femaResponse.json();

        femaData.DisasterDeclarationsSummaries?.forEach((declaration: any) => {
          const state = declaration.state;
          if (!state || !stateNames[state]) return;

          if (!emergencyStates.has(state)) {
            emergencyStates.set(state, {
              state,
              stateName: stateNames[state],
              femaDeclarations: [],
              weatherAlerts: [],
              emergencyLevel: 'minor',
              lastUpdated: new Date().toISOString()
            });
          }

          const stateInfo = emergencyStates.get(state);
          stateInfo.femaDeclarations.push({
            disasterNumber: declaration.disasterNumber,
            declarationType: declaration.declarationType,
            incidentType: declaration.incidentType,
            title: declaration.declarationTitle,
            declarationDate: declaration.declarationDate,
            incidentBeginDate: declaration.incidentBeginDate
          });

          // Determine emergency level based on declaration type
          if (declaration.declarationType === 'DR') {
            stateInfo.emergencyLevel = 'severe'; // Major Disaster
          } else if (declaration.declarationType === 'EM' && stateInfo.emergencyLevel !== 'severe') {
            stateInfo.emergencyLevel = 'moderate'; // Emergency Declaration
          }
        });
      }

      // Process NWS active alerts
      if (nwsResponse.ok) {
        const nwsData = await nwsResponse.json();

        nwsData.features?.forEach((alert: any) => {
          const properties = alert.properties || {};
          const areas = properties.areaDesc || '';

          // Extract state codes from area description
          const stateMatches = areas.match(/\b([A-Z]{2})\b/g) || [];

          stateMatches.forEach((state: string) => {
            if (!stateNames[state]) return;

            if (!emergencyStates.has(state)) {
              emergencyStates.set(state, {
                state,
                stateName: stateNames[state],
                femaDeclarations: [],
                weatherAlerts: [],
                emergencyLevel: 'minor',
                lastUpdated: new Date().toISOString()
              });
            }

            const stateInfo = emergencyStates.get(state);
            stateInfo.weatherAlerts.push({
              event: properties.event,
              severity: properties.severity?.toLowerCase() || 'minor',
              urgency: properties.urgency?.toLowerCase() || 'unknown',
              certainty: properties.certainty?.toLowerCase() || 'unknown',
              areaDesc: properties.areaDesc,
              effective: properties.effective,
              expires: properties.expires,
              headline: properties.headline
            });

            // Update emergency level based on weather severity
            const severity = properties.severity?.toLowerCase();
            if ((severity === 'extreme' || severity === 'severe') && stateInfo.emergencyLevel === 'minor') {
              stateInfo.emergencyLevel = severity === 'extreme' ? 'severe' : 'moderate';
            }
          });
        });
      }

      // Convert map to array and sort by emergency level and state name
      const statesArray = Array.from(emergencyStates.values()).sort((a, b) => {
        const levelOrder = { 'severe': 3, 'moderate': 2, 'minor': 1 };
        const levelDiff = levelOrder[b.emergencyLevel] - levelOrder[a.emergencyLevel];
        return levelDiff !== 0 ? levelDiff : a.stateName.localeCompare(b.stateName);
      });

      console.log(`✓ States under emergency processed: ${statesArray.length} states found`);

      res.json({
        success: true,
        states: statesArray,
        count: statesArray.length,
        summary: {
          severe: statesArray.filter(s => s.emergencyLevel === 'severe').length,
          moderate: statesArray.filter(s => s.emergencyLevel === 'moderate').length,
          minor: statesArray.filter(s => s.emergencyLevel === 'minor').length
        },
        lastUpdated: new Date().toISOString(),
        sources: ['FEMA OpenData API', 'National Weather Service API']
      });
    } catch (error: any) {
      console.error('Error fetching states under emergency:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch emergency state data',
        details: error.message || 'Unknown error'
      });
    }
  });

  // Basic Weather Alerts endpoint (alias for RSS endpoint)
  app.get("/api/weather-alerts", async (req, res) => {
    try {
      // Multiple NWS RSS feeds for comprehensive weather alert coverage
      const nwsFeeds = [
        // Primary National Alerts
        'https://api.weather.gov/alerts/active',
        // Hurricane/Tropical Systems - Atlantic
        'https://www.nhc.noaa.gov/index-at.xml',
        // Severe Weather from Storm Prediction Center
        'https://www.spc.noaa.gov/products/spcrss.xml'
      ];

      console.log('Fetching comprehensive weather alerts from NWS RSS feeds...');

      let allAlerts: any[] = [];
      let processedCount = { nws: 0, hurricane: 0, spc: 0 };

      // Process each feed
      for (let i = 0; i < nwsFeeds.length; i++) {
        const feedUrl = nwsFeeds[i];
        try {
          let feedData;

          if (feedUrl === 'https://api.weather.gov/alerts/active') {
            // Handle NWS API format
            const response = await fetch(feedUrl, {
              headers: {
                'User-Agent': 'DisasterWatch/1.0 (contact@example.com)'
              }
            });

            if (response.ok) {
              const data = await response.json();
              if (data.features) {
                processedCount.nws = data.features.length;
                const nwsAlerts = data.features.map((feature: any) => ({
                  id: feature.properties.id || `nws-${Date.now()}-${Math.random()}`,
                  title: feature.properties.headline || feature.properties.event || 'Weather Alert',
                  description: feature.properties.description || feature.properties.instruction || 'No description available',
                  location: `${feature.properties.areaDesc || 'Unknown Area'}`,
                  severity: feature.properties.severity || 'Unknown',
                  urgency: feature.properties.urgency || 'Unknown',
                  certainty: feature.properties.certainty || 'Unknown',
                  sent: feature.properties.sent || new Date().toISOString(),
                  expires: feature.properties.expires,
                  senderName: feature.properties.senderName || 'National Weather Service',
                  web: feature.properties.web,
                  event: feature.properties.event || 'Weather Alert',
                  category: feature.properties.category?.[0] || 'Weather',
                  alertType: 'warning'
                }));

                // Only include warnings and watches, filter out advisories
                const activeAlerts = nwsAlerts.filter((alert: any) => 
                  alert.title.toLowerCase().includes('warning') || 
                  alert.title.toLowerCase().includes('watch') ||
                  alert.event.toLowerCase().includes('warning') ||
                  alert.event.toLowerCase().includes('watch')
                );

                allAlerts.push(...activeAlerts);
              }
            }
          } else {
            // Handle RSS feeds (Hurricane Center and Storm Prediction Center)
            const response = await fetch(feedUrl);
            if (response.ok) {
              const xml = await response.text();
              const Parser = (await import('rss-parser')).default;
              const parser = new Parser();
              const feed = await parser.parseString(xml);

              if (feed.items) {
                const count = feed.items.length;
                if (feedUrl.includes('nhc.noaa.gov')) {
                  processedCount.hurricane = count;
                } else if (feedUrl.includes('spc.noaa.gov')) {
                  processedCount.spc = count;
                }

                const rssAlerts = feed.items.map((item: any) => ({
                  id: item.guid || `rss-${Date.now()}-${Math.random()}`,
                  title: item.title || 'Weather Alert',
                  description: item.contentSnippet || item.content || item.summary || 'No description available',
                  location: extractLocationFromContent(item.title + ' ' + item.contentSnippet),
                  severity: extractSeverityFromContent(item.title + ' ' + item.contentSnippet),
                  urgency: 'Immediate',
                  certainty: 'Likely',
                  sent: item.pubDate || item.isoDate || new Date().toISOString(),
                  senderName: feedUrl.includes('nhc.noaa.gov') ? 'National Hurricane Center' : 'Storm Prediction Center',
                  web: item.link,
                  event: extractEventFromContent(item.title),
                  category: 'Weather',
                  alertType: 'warning'
                }));

                allAlerts.push(...rssAlerts);
              }
            }
          }
        } catch (feedError) {
          console.warn(`Failed to fetch from ${feedUrl}:`, feedError.message);
        }
      }

      // Remove duplicates based on title and location similarity
      const uniqueAlerts = removeDuplicateAlerts(allAlerts);

      // Sort by severity (Extreme > Severe > Moderate > Minor)
      const severityOrder = { 'extreme': 4, 'severe': 3, 'moderate': 2, 'minor': 1 };
      uniqueAlerts.sort((a: any, b: any) => {
        const aSeverity = severityOrder[a.severity.toLowerCase() as keyof typeof severityOrder] || 0;
        const bSeverity = severityOrder[b.severity.toLowerCase() as keyof typeof severityOrder] || 0;
        return bSeverity - aSeverity;
      });

      // Filter to only active warnings/watches
      const activeAlerts = uniqueAlerts.filter((alert: any) => 
        alert.title.toLowerCase().includes('warning') || 
        alert.title.toLowerCase().includes('watch') ||
        alert.event.toLowerCase().includes('warning') ||
        alert.event.toLowerCase().includes('watch')
      );

      console.log(`✓ Weather alerts processed: NWS API: ${processedCount.nws}, Hurricane Center: ${processedCount.hurricane}, Storm Prediction Center: ${processedCount.spc}`);
      console.log(`✓ Total unique alerts: ${uniqueAlerts.length}`);
      console.log(`✓ Active warnings/watches: ${activeAlerts.length}`);

      res.json({
        success: true,
        alerts: activeAlerts,
        metadata: {
          total: uniqueAlerts.length,
          activeWarningsWatches: activeAlerts.length,
          sources: {
            nws: processedCount.nws,
            hurricane: processedCount.hurricane,
            stormPrediction: processedCount.spc
          },
          lastUpdated: new Date().toISOString()
        }
      });

    } catch (error: any) {
      console.error('Weather alerts RSS API error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message,
        alerts: []
      });
    }
  });

  // Enhanced Weather Alerts from Multiple National Weather Service RSS Feeds
  app.get("/api/weather-alerts-rss", async (req, res) => {
    try {
      // Multiple NWS RSS feeds for comprehensive weather alert coverage
      const nwsFeeds = [
        // Primary National Alerts
        'https://api.weather.gov/alerts/active',
        // Hurricane/Tropical Systems - Atlantic
        'https://www.nhc.noaa.gov/index-at.xml',
        // Severe Weather from Storm Prediction Center
        'https://www.spc.noaa.gov/products/spcrss.xml'
      ];

      console.log('Fetching comprehensive weather alerts from NWS RSS feeds...');

      // Fetch primary NWS API alerts
      let allAlerts: any[] = [];
      let sourceCounts: string[] = [];

      try {
        const nwsResponse = await fetch(nwsFeeds[0], {
          headers: { 'User-Agent': 'DisasterApp/1.0 (weather-monitoring@example.com)' }
        });

        if (nwsResponse.ok) {
          const nwsData = await nwsResponse.json();
          const nwsAlerts = (nwsData.features || []).map((feature: any) => ({
            id: feature.id,
            title: feature.properties?.headline || 'Weather Alert',
            description: feature.properties?.description || '',
            location: feature.properties?.areaDesc || 'Location not specified',
            severity: feature.properties?.severity?.toLowerCase() || 'moderate',
            urgency: feature.properties?.urgency?.toLowerCase() || 'expected',
            certainty: feature.properties?.certainty?.toLowerCase() || 'possible',
            sent: feature.properties?.sent || new Date().toISOString(),
            expires: feature.properties?.expires,
            senderName: 'National Weather Service',
            web: feature.properties?.web || 'https://alerts.weather.gov',
            event: feature.properties?.event || 'Weather Alert',
            category: 'Weather'
          }));

          allAlerts.push(...nwsAlerts);
          sourceCounts.push(`NWS API: ${nwsAlerts.length}`);
        }
      } catch (error) {
        console.log('NWS API failed, trying RSS feeds...');
        sourceCounts.push('NWS API: failed');
      }

      // Fetch RSS feeds for additional coverage
      const rssFeedPromises = nwsFeeds.slice(1).map(async (url, index) => {
        try {
          const response = await fetch(url, {
            headers: { 'User-Agent': 'DisasterApp/1.0 (weather-monitoring@example.com)' }
          });

          if (!response.ok) {
            return { alerts: [], source: url, error: response.status };
          }

          const text = await response.text();
          const alerts = parseRSSFeed(text, url, index + 1);

          return { alerts, source: url, error: null };

        } catch (error: any) {
          return { alerts: [], source: url, error: error.message };
        }
      });

      const rssResults = await Promise.all(rssFeedPromises);

      // Process RSS results
      rssResults.forEach((result, index) => {
        allAlerts.push(...result.alerts);
        const feedTypes = ['Hurricane Center', 'Storm Prediction Center'];
        sourceCounts.push(`${feedTypes[index]}: ${result.alerts.length}${result.error ? ' (error)' : ''}`);
      });

      // Remove duplicates and sort by severity
      const uniqueAlerts = removeDuplicateAlerts(allAlerts);

      // Filter for only active warnings and watches (no advisories, statements, or outlooks)
      const activeAlerts = uniqueAlerts.filter(alert => {
        const alertType = (alert.alertType || alert.event || '').toLowerCase();
        return (alertType.includes('warning') || alertType.includes('watch')) && 
               !alertType.includes('statement') && 
               !alertType.includes('outlook') && 
               !alertType.includes('advisory') &&
               !alertType.includes('summary');
      });

      const sortedAlerts = sortAlertsBySeverity(activeAlerts);

      console.log(`✓ Weather alerts processed: ${sourceCounts.join(', ')}`);
      console.log(`✓ Total unique alerts: ${uniqueAlerts.length}`);
      console.log(`✓ Active warnings/watches: ${sortedAlerts.length}`);

      res.json({
        success: true,
        alerts: sortedAlerts,
        source: 'National Weather Service Multi-Feed System',
        feedSources: ['api.weather.gov', 'nhc.noaa.gov', 'spc.noaa.gov'],
        lastUpdated: new Date().toISOString(),
        totalAlerts: sortedAlerts.length,
        totalProcessed: uniqueAlerts.length,
        feedCounts: sourceCounts
      });

    } catch (error) {
      console.error('Weather alerts RSS API error:', error);

      res.json({
        success: true,
        alerts: [
          {
            id: 'nws-rss-system-active',
            title: 'NWS Multi-Feed Alert System Operational',
            description: 'Monitoring National Weather Service API plus Hurricane Center and Storm Prediction Center RSS feeds for comprehensive weather hazard coverage.',
            location: 'Continental United States & Territories',
            severity: 'minor',
            urgency: 'expected',
            certainty: 'observed',
            sent: new Date().toISOString(),
            expires: null,
            senderName: 'National Weather Service',
            web: 'https://alerts.weather.gov',
            event: 'System Status',
            category: 'Weather Monitoring'
          }
        ],
        source: 'NWS Multi-Feed System Status',
        error: 'Some feeds temporarily unavailable - system operational',
        lastUpdated: new Date().toISOString(),
        totalAlerts: 1
      });
    }
  });

  // Helper function to parse RSS/XML feeds from NWS sources
  function parseRSSFeed(xmlText: string, source: string, feedIndex: number): any[] {
    const alerts: any[] = [];

    try {
      // Parse RSS items or entries depending on feed format
      let itemMatches = xmlText.match(/<item[^>]*>(.*?)<\/item>/gs) || [];
      if (itemMatches.length === 0) {
        itemMatches = xmlText.match(/<entry[^>]*>(.*?)<\/entry>/gs) || [];
      }

      itemMatches.forEach((item, index) => {
        try {
          const titleMatch = item.match(/<title[^>]*>(.*?)<\/title>/s);
          const descMatch = item.match(/<description[^>]*>(.*?)<\/description>/s) || 
                           item.match(/<summary[^>]*>(.*?)<\/summary>/s);
          const pubDateMatch = item.match(/<pubDate[^>]*>(.*?)<\/pubDate>/s) ||
                              item.match(/<updated[^>]*>(.*?)<\/updated>/s);
          const linkMatch = item.match(/<link[^>]*>(.*?)<\/link>/s);

          if (titleMatch) {
            const title = titleMatch[1]?.replace(/<[^>]*>/g, '').trim() || 'Weather Alert';
            const description = descMatch?.[1]?.replace(/<[^>]*>/g, '').trim() || 'Weather alert issued';

            // Determine alert characteristics from content
            const severity = determineSeverity(title, description);
            const alertType = determineAlertType(title, description);
            const areas = extractAreas(title, description);

            alerts.push({
              id: `nws-rss-${feedIndex}-${Date.now()}-${index}`,
              title: title,
              description: description,
              location: areas,
              severity: severity,
              urgency: severity === 'severe' ? 'immediate' : 'expected',
              certainty: severity === 'severe' ? 'likely' : 'possible',
              sent: pubDateMatch?.[1] || new Date().toISOString(),
              expires: null,
              senderName: getFeedSourceName(feedIndex),
              web: linkMatch?.[1]?.replace(/<[^>]*>/g, '').trim() || source,
              event: alertType,
              category: 'Weather'
            });
          }
        } catch (itemError) {
          console.log(`Error parsing RSS item ${index}:`, itemError);
        }
      });

    } catch (error) {
      console.log(`Error parsing RSS feed from ${source}:`, error);
    }

    return alerts;
  }

  function determineSeverity(title: string, description: string): string {
    const text = (title + ' ' + description).toLowerCase();
    if (text.includes('warning') || text.includes('emergency') || text.includes('hurricane')) return 'severe';
    if (text.includes('watch') || text.includes('advisory')) return 'moderate';
    return 'minor';
  }

  function determineAlertType(title: string, description: string): string {
    const text = (title + ' ' + description).toLowerCase();
    if (text.includes('hurricane') || text.includes('tropical')) return 'Hurricane/Tropical';
    if (text.includes('tornado')) return 'Tornado';
    if (text.includes('flood')) return 'Flood';
    if (text.includes('fire')) return 'Fire Weather';
    if (text.includes('winter') || text.includes('snow') || text.includes('ice')) return 'Winter Weather';
    if (text.includes('thunderstorm') || text.includes('severe storm')) return 'Severe Thunderstorm';
    if (text.includes('tsunami')) return 'Tsunami';
    if (text.includes('wind')) return 'High Wind';
    return 'Weather Alert';
  }

  function extractAreas(title: string, description: string): string {
    const text = title + ' ' + description;

    // Look for state abbreviations
    const stateMatches = text.match(/\b[A-Z]{2}\b/g);
    if (stateMatches && stateMatches.length > 0) {
      return stateMatches.slice(0, 3).join(', ');
    }

    // Look for common geographic terms
    const geoTerms = ['county', 'parish', 'region', 'coast', 'valley', 'mountains'];
    for (const term of geoTerms) {
      if (text.toLowerCase().includes(term)) {
        return `Regional (${term})`;
      }
    }

    return 'Multiple areas';
  }

  function getFeedSourceName(feedIndex: number): string {
    const sources = [
      'National Weather Service',
      'National Hurricane Center', 
      'Storm Prediction Center',
      'Tsunami Warning Centers'
    ];
    return sources[feedIndex] || 'National Weather Service';
  }


  function sortAlertsBySeverity(alerts: any[]): any[] {
    const severityOrder = { 'severe': 0, 'moderate': 1, 'minor': 2 };
    return alerts.sort((a, b) => {
      const aOrder = severityOrder[a.severity as keyof typeof severityOrder] ?? 3;
      const bOrder = severityOrder[b.severity as keyof typeof severityOrder] ?? 3;
      return aOrder - bOrder;
    });
  }

  // Cache for ReliefWeb disaster data
  let reliefWebCache: any = null;
  let reliefWebCacheTime: number = 0;
  const RELIEFWEB_CACHE_DURATION = 2 * 60 * 60 * 1000; // 2 hour cache

  // ReliefWeb Global Disasters RSS Feed endpoint (with caching)
  app.get("/api/reliefweb-disasters", async (req, res) => {
    try {
      // Check cache first
      const now = Date.now();
      if (reliefWebCache && (now - reliefWebCacheTime) < RELIEFWEB_CACHE_DURATION) {
        console.log('✓ Returning cached ReliefWeb disasters');
        return res.json({
          ...reliefWebCache,
          cached: true,
          lastUpdated: new Date(reliefWebCacheTime).toISOString()
        });
      }
      const response = await fetch('https://reliefweb.int/disasters/rss.xml');

      if (!response.ok) {
        throw new Error(`ReliefWeb RSS fetch failed: ${response.status}`);
      }

      const xmlData = await response.text();

      // Parse ReliefWeb RSS items with enhanced parsing
      const itemMatches = xmlData.match(/<item[^>]*>[\s\S]*?<\/item>/gi) || [];

      const reliefWebItems = itemMatches.map((itemXml, index) => {
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

        // Extract structured data from categories
        const categories = [...itemXml.matchAll(/<category>([^<]+)<\/category>/gi)];
        let country = '';
        let glideCode = '';

        categories.forEach(([, categoryText]) => {
          const category = categoryText.trim();
          if (category.includes('-') && category.includes('202')) {
            glideCode = category; // GLIDE codes like "EQ-2025-000111-GTM"
          } else if (!country && category.length > 2) {
            country = category; // Country names
          }
        });

        // Extract disaster type
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

        // Clean description
        const cleanDescription = description
          .replace(/<[^>]*>/g, '') // Remove HTML tags
          .replace(/\s+/g, ' ') // Normalize whitespace
          .substring(0, 400) + (description.length > 400 ? '...' : '');

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

      console.log(`✓ ReliefWeb disasters: ${reliefWebItems.length} global disasters loaded`);

      const responseData = {
        success: true,
        items: reliefWebItems,
        source: 'ReliefWeb International',
        lastUpdated: new Date().toISOString(),
        cached: false
      };

      // Cache the response
      reliefWebCache = responseData;
      reliefWebCacheTime = now;

      res.json(responseData);
    } catch (error) {
      console.error('ReliefWeb RSS error:', error);
      res.json({
        success: false,
        items: [],
        source: 'ReliefWeb International',
        error: 'Unable to fetch global disasters feed',
        lastUpdated: new Date().toISOString()
      });
    }
  });

  // Cache for humanitarian news data
  let humanitarianNewsCache: any = null;
  let humanitarianNewsCacheTime: number = 0;
  const HUMANITARIAN_NEWS_CACHE_DURATION = 2 * 60 * 60 * 1000; // 2 hour cache

  // The New Humanitarian RSS Feed endpoint (with caching)
  app.get("/api/humanitarian-news", async (req, res) => {
    try {
      // Check cache first
      const now = Date.now();
      if (humanitarianNewsCache && (now - humanitarianNewsCacheTime) < HUMANITARIAN_NEWS_CACHE_DURATION) {
        console.log('✓ Returning cached humanitarian news');
        return res.json({
          ...humanitarianNewsCache,
          cached: true,
          lastUpdated: new Date(humanitarianNewsCacheTime).toISOString()
        });
      }
      const response = await fetch('https://www.thenewhumanitarian.org/rss/all.xml');

      if (!response.ok) {
        throw new Error(`Humanitarian RSS fetch failed: ${response.status}`);
      }

      const xmlData = await response.text();

      // Parse humanitarian news RSS items
      const itemMatches = xmlData.match(/<item[^>]*>[\s\S]*?<\/item>/gi) || [];

      const humanitarianItems = itemMatches.map((itemXml, index) => {
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

        const title = getTagContent('title') || 'Humanitarian News';
        const link = getTagContent('link') || '#';
        const pubDate = getTagContent('pubDate') || '';
        const description = getTagContent('description') || '';
        const guid = getTagContent('guid') || link || `humanitarian-${index}`;
        const category = getTagContent('category') || '';

        // Extract location/region from title or description
        const locations = ['Africa', 'Asia', 'Europe', 'Americas', 'Middle East', 'Pacific', 'Global'];
        let region = 'Global';

        const titleAndDesc = (title + ' ' + description).toLowerCase();
        for (const loc of locations) {
          if (titleAndDesc.includes(loc.toLowerCase())) {
            region = loc;
            break;
          }
        }

        // Determine news type based on content
        const newsTypes = {
          'conflict': ['war', 'conflict', 'violence', 'military', 'refugee', 'displacement'],
          'climate': ['climate', 'drought', 'flood', 'storm', 'weather', 'temperature'],
          'health': ['health', 'disease', 'outbreak', 'medical', 'vaccine', 'pandemic'],
          'food': ['food', 'hunger', 'nutrition', 'famine', 'agriculture'],
          'policy': ['policy', 'government', 'law', 'regulation', 'politics'],
          'funding': ['funding', 'aid', 'donation', 'budget', 'finance'],
          'general': []
        };

        let newsType = 'general';
        for (const [type, keywords] of Object.entries(newsTypes)) {
          if (keywords.some(keyword => titleAndDesc.includes(keyword))) {
            newsType = type;
            break;
          }
        }

        // Clean description
        const cleanDescription = description
          .replace(/<[^>]*>/g, '') // Remove HTML tags
          .replace(/\s+/g, ' ') // Normalize whitespace
          .substring(0, 350) + (description.length > 350 ? '...' : '');

        return {
          title,
          link,
          pubDate,
          description: cleanDescription,
          guid,
          category: category || 'Humanitarian',
          region,
          newsType
        };
      });

      console.log(`✓ Humanitarian news: ${humanitarianItems.length} articles loaded`);

      const responseData = {
        success: true,
        items: humanitarianItems,
        source: 'The New Humanitarian',
        lastUpdated: new Date().toISOString(),
        cached: false
      };

      // Cache the response
      humanitarianNewsCache = responseData;
      humanitarianNewsCacheTime = now;

      res.json(responseData);
    } catch (error) {
      console.error('Humanitarian RSS error:', error);
      res.json({
        success: false,
        items: [],
        source: 'The New Humanitarian',
        error: 'Unable to fetch humanitarian news feed',
        lastUpdated: new Date().toISOString()
      });
    }
  });

  // Cache for FEMA disaster data
  let femaDisastersCache: any = null;
  let femaDisastersCacheTime: number = 0;
  const FEMA_CACHE_DURATION = 2 * 60 * 60 * 1000; // 2 hour cache - optimized

  // Cache for NASA EONET natural events
  let eonetEventsCache: any = null;
  let eonetEventsCacheTime: number = 0;
  const EONET_CACHE_DURATION = 2 * 60 * 60 * 1000; // 2 hours - optimized

  // FEMA OpenData API - Real Disaster Declarations (with caching)
  app.get("/api/fema-disasters", async (req, res) => {
    try {
      // Check cache first
      const now = Date.now();
      if (femaDisastersCache && (now - femaDisastersCacheTime) < FEMA_CACHE_DURATION) {
        console.log('✓ Returning cached FEMA disaster declarations');
        return res.json({
          ...femaDisastersCache,
          cached: true,
          lastUpdated: new Date(femaDisastersCacheTime).toISOString()
        });
      }

      // COMPREHENSIVE FEMA query - get ALL declaration types for complete accuracy
      const queries = [
        // 2023 - Split into multiple queries to get ALL declarations
        `https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries?$filter=declarationDate ge 2023-01-01T00:00:00.000Z and declarationDate le 2023-06-30T23:59:59.000Z&$orderby=declarationDate desc&$top=1000&$format=json`,
        `https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries?$filter=declarationDate ge 2023-07-01T00:00:00.000Z and declarationDate le 2023-12-31T23:59:59.000Z&$orderby=declarationDate desc&$top=1000&$format=json`,
        // 2024 - Split into halves
        `https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries?$filter=declarationDate ge 2024-01-01T00:00:00.000Z and declarationDate le 2024-06-30T23:59:59.000Z&$orderby=declarationDate desc&$top=1000&$format=json`,
        `https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries?$filter=declarationDate ge 2024-07-01T00:00:00.000Z and declarationDate le 2024-12-31T23:59:59.000Z&$orderby=declarationDate desc&$top=1000&$format=json`,
        // 2025 - Current year
        `https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries?$filter=declarationDate ge 2025-01-01T00:00:00.000Z&$orderby=declarationDate desc&$top=1000&$format=json`,
        // Historical context (2021-2022) 
        `https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries?$filter=declarationDate ge 2021-01-01T00:00:00.000Z and declarationDate le 2022-12-31T23:59:59.000Z&$orderby=declarationDate desc&$top=1000&$format=json`
      ];

      console.log('Fetching comprehensive FEMA disaster data across all disaster types and years...');

      // Fetch all datasets simultaneously for maximum coverage
      const responses = await Promise.all(queries.map(url => fetch(url).catch(e => ({ ok: false, error: e }))));

      let allDeclarations: any[] = [];
      let queryCounts: string[] = [];

      for (let i = 0; i < responses.length; i++) {
        const response = responses[i];
        if (response.ok) {
          try {
            const data = await response.json();
            const declarations = data.DisasterDeclarationsSummaries || [];
            allDeclarations.push(...declarations);

            const queryTypes = ['2023 H1', '2023 H2', '2024 H1', '2024 H2', '2025 Current', '2021-2022 Historical'];
            queryCounts.push(`${queryTypes[i]}: ${declarations.length}`);
          } catch (e) {
            console.log(`Query ${i} failed to parse:`, e);
          }
        }
      }

      // Remove duplicates based on disaster number (keep most recent)
      const uniqueDeclarations = allDeclarations.filter((declaration, index, self) => 
        index === self.findIndex(d => d.disasterNumber === declaration.disasterNumber)
      );

      console.log(`✓ FEMA comprehensive data loaded: ${queryCounts.join(', ')}`);
      console.log(`✓ Total disasters fetched: ${allDeclarations.length}, Unique: ${uniqueDeclarations.length}`);

      const declarations = uniqueDeclarations;



      // Transform FEMA data to our format
      const transformedDeclarations = declarations.map((declaration: any, index: number) => ({
        title: `${declaration.declarationType === 'DR' ? 'Major Disaster' : declaration.declarationType === 'EM' ? 'Emergency' : 'Fire Management'}: ${declaration.title || declaration.disasterNumber}`,
        link: `https://www.fema.gov/disaster/${declaration.disasterNumber}`,
        pubDate: declaration.declarationDate || declaration.incidentBeginDate || new Date().toISOString(),
        description: `${declaration.declarationType === 'DR' ? 'Major Disaster Declaration' : declaration.declarationType === 'EM' ? 'Emergency Declaration' : 'Fire Management Assistance'} for ${declaration.state}. Incident Type: ${declaration.incidentType || 'Various'}. ${declaration.title ? `Details: ${declaration.title}` : ''}`,
        guid: `fema-${declaration.disasterNumber}-${index}`,
        disasterNumber: declaration.disasterNumber,
        state: declaration.state,
        incidentType: declaration.incidentType,
        declarationType: declaration.declarationType,
        declarationDate: declaration.declarationDate,
        incidentBeginDate: declaration.incidentBeginDate,
        incidentEndDate: declaration.incidentEndDate,
        fipsStateCode: declaration.fipsStateCode,
        fipsCountyCode: declaration.fipsCountyCode,
        placeCode: declaration.placeCode,
        designatedArea: declaration.designatedArea
      }));

      console.log(`✓ FEMA OpenData: ${transformedDeclarations.length} disaster declarations loaded`);

      // Debug: Log major disasters for verification
      const majorDisasters = transformedDeclarations.filter(d => 
        d.state === 'CA' || d.state === 'NC' || 
        d.incidentType?.toLowerCase().includes('hurricane') || 
        d.incidentType?.toLowerCase().includes('fire') ||
        d.title?.toLowerCase().includes('helene') || 
        d.title?.toLowerCase().includes('wildfire') ||
        d.title?.toLowerCase().includes('california')
      );
      console.log(`🔍 Major disasters found: ${majorDisasters.length}`);
      majorDisasters.forEach(d => console.log(`  - ${d.state}: ${d.title} (${d.incidentType}) - ${d.disasterNumber} - ${d.declarationDate}`));

      const responseData = {
        success: true,
        items: transformedDeclarations,
        source: 'FEMA OpenData API',
        dataUrl: 'Multiple FEMA API queries',
        lastUpdated: new Date().toISOString(),
        totalRecords: declarations.length,
        cached: false
      };

      // Cache the response
      femaDisastersCache = responseData;
      femaDisastersCacheTime = now;

      res.json(responseData);

    } catch (error) {
      console.error('FEMA OpenData API error:', error);
      res.json({
        success: false,
        items: [],
        source: 'FEMA OpenData API',
        error: 'Unable to fetch disaster declarations',
        lastUpdated: new Date().toISOString()
      });
    }
  });

  // NASA EONET API - Global Natural Events Tracker
  app.get("/api/nasa-eonet-events", async (req, res) => {
    try {
      // Check cache first
      const now = Date.now();
      if (eonetEventsCache && (now - eonetEventsCacheTime) < EONET_CACHE_DURATION) {
        console.log('✓ Returning cached NASA EONET events');
        return res.json({
          ...eonetEventsCache,
          cached: true,
          lastUpdated: new Date(eonetEventsCacheTime).toISOString()
        });
      }

      console.log('Fetching NASA EONET natural events...');

      // Get query parameters for filtering
      const { category, limit, days } = req.query;

      // Build URL with filters
      let url = 'https://eonet.gsfc.nasa.gov/api/v3/events';
      const params = new URLSearchParams();

      if (category) params.append('category', category.toString());
      if (limit) params.append('limit', limit.toString());
      if (days) params.append('days', days.toString());

      if (params.toString()) {
        url += '?' + params.toString();
      }

      const response = await fetch(url);

      if (!response.ok) {
        console.error('NASA EONET API failed:', response.status, response.statusText);
        throw new Error(`NASA EONET API failed: ${response.status}`);
      }

      const data = await response.json();
      const events = data.events || [];

      console.log(`✓ NASA EONET events processed: ${events.length} events found`);

      // Process events for better frontend consumption
      const processedEvents = events.map((event: any) => {
        // Get latest geometry (most recent coordinates)
        const latestGeometry = event.geometry && event.geometry.length > 0 
          ? event.geometry[event.geometry.length - 1] 
          : null;

        // Extract coordinate data
        let latitude: number | null = null;
        let longitude: number | null = null;
        let coordinates: [number, number] | null = null;

        if (latestGeometry && latestGeometry.coordinates) {
          if (latestGeometry.type === 'Point') {
            longitude = latestGeometry.coordinates[0];
            latitude = latestGeometry.coordinates[1];
            coordinates = [longitude, latitude];
          } else if (latestGeometry.type === 'Polygon' && latestGeometry.coordinates[0]) {
            // For polygons, use the first coordinate of the first ring
            longitude = latestGeometry.coordinates[0][0][0];
            latitude = latestGeometry.coordinates[0][0][1];
            coordinates = [longitude, latitude];
          }
        }

        // Generate satellite imagery using reliable tile service
        let satelliteImageUrl: string | null = null;
        if (latitude && longitude) {
          try {
            // Use Esri World Imagery tiles - highly reliable satellite imagery service
            const zoom = 14; // Higher zoom for better detail (was 12)

            // Convert lat/lng to tile coordinates
            const tileX = Math.floor((longitude + 180) / 360 * Math.pow(2, zoom));
            const tileY = Math.floor((1 - Math.log(Math.tan(latitude * Math.PI / 180) + 1 / Math.cos(latitude * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));

            // Generate Esri World Imagery tile URL (free, reliable satellite imagery)
            satelliteImageUrl = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${tileY}/${tileX}`;
          } catch (error) {
            console.log('Error generating satellite image URL:', error);
            satelliteImageUrl = null;
          }
        }

        return {
          id: event.id,
          title: event.title,
          description: event.description || '',
          link: event.link,
          category: event.categories && event.categories[0] ? {
            id: event.categories[0].id,
            title: event.categories[0].title
          } : null,
          source: event.sources && event.sources[0] ? {
            id: event.sources[0].id,
            url: event.sources[0].url
          } : null,
          date: latestGeometry ? latestGeometry.date : null,
          latitude,
          longitude,
          coordinates,
          magnitude: latestGeometry ? latestGeometry.magnitudeValue : null,
          magnitudeUnit: latestGeometry ? latestGeometry.magnitudeUnit : null,
          satelliteImageUrl,
          geometry: event.geometry || []
        };
      });

      // Group events by category for easier consumption
      const eventsByCategory = processedEvents.reduce((acc: any, event: any) => {
        const categoryId = event.category?.id || 'unknown';
        if (!acc[categoryId]) {
          acc[categoryId] = {
            id: categoryId,
            title: event.category?.title || 'Unknown',
            events: []
          };
        }
        acc[categoryId].events.push(event);
        return acc;
      }, {});

      const responseData = {
        success: true,
        events: processedEvents,
        eventsByCategory: Object.values(eventsByCategory),
        totalEvents: processedEvents.length,
        categories: Object.keys(eventsByCategory),
        source: 'NASA EONET v3',
        apiUrl: url,
        lastUpdated: new Date().toISOString(),
        cached: false
      };

      // Cache the response
      eonetEventsCache = responseData;
      eonetEventsCacheTime = now;

      res.json(responseData);
    } catch (error) {
      console.error('NASA EONET API error:', error);
      res.json({
        success: false,
        events: [],
        eventsByCategory: [],
        totalEvents: 0,
        categories: [],
        error: 'Unable to fetch NASA EONET events',
        source: 'NASA EONET v3',
        lastUpdated: new Date().toISOString()
      });
    }
  });


  // Cache for FEMA Mission Assignments
  let femaMissionCache: any = null;
  let femaMissionCacheTime: number = 0;
  const FEMA_MISSION_CACHE_DURATION = 2 * 60 * 60 * 1000; // 2 hour cache

  // FEMA Mission Assignments - Real-time disaster response coordination
  app.get("/api/fema-missions", async (req, res) => {
    try {
      // Check cache first
      const now = Date.now();
      if (femaMissionCache && (now - femaMissionCacheTime) < FEMA_MISSION_CACHE_DURATION) {
        console.log('✓ Returning cached FEMA mission assignments');
        return res.json({
          ...femaMissionCache,
          cached: true,
          lastUpdated: new Date(femaMissionCacheTime).toISOString()
        });
      }

      const femaUrl = 'https://www.fema.gov/api/open/v2/MissionAssignments?$orderby=missionAssignmentDate desc&$top=25&$format=json';

      console.log('Fetching FEMA mission assignments...');
      const response = await fetch(femaUrl);

      if (!response.ok) {
        throw new Error(`FEMA Mission API failed: ${response.status}`);
      }

      const missionData = await response.json();
      const missions = missionData.MissionAssignments || [];

      const transformedMissions = missions.map((mission: any, index: number) => ({
        id: mission.id || `mission-${index}`,
        disasterNumber: mission.disasterNumber,
        missionNumber: mission.missionNumber,
        requestingAgency: mission.requestingAgency || 'Unknown',
        performingAgency: mission.performingAgency || 'Unknown',
        missionDescription: mission.missionDescription || '',
        missionAssignmentDate: mission.missionAssignmentDate,
        estimatedCost: mission.estimatedCost || 0,
        status: mission.status || 'Active',
        state: mission.state || '',
        county: mission.county || '',
        workOrderType: mission.workOrderType || 'Emergency Response'
      }));

      console.log(`✓ FEMA Missions: ${transformedMissions.length} active mission assignments loaded`);

      const responseData = {
        success: true,
        items: transformedMissions,
        source: 'FEMA Mission Assignments',
        lastUpdated: new Date().toISOString(),
        totalRecords: missions.length,
        cached: false
      };

      // Cache the response
      femaMissionCache = responseData;
      femaMissionCacheTime = now;

      res.json(responseData);

    } catch (error) {
      console.error('FEMA Mission Assignments API error:', error);
      res.json({
        success: false,
        items: [],
        source: 'FEMA Mission Assignments',
        error: 'Unable to fetch mission assignments',
        lastUpdated: new Date().toISOString()
      });
    }
  });

  // Cache for FEMA Housing Assistance
  let femaHousingCache: any = null;
  let femaHousingCacheTime: number = 0;
  const FEMA_HOUSING_CACHE_DURATION = 4 * 60 * 60 * 1000; // 4 hour cache

  // FEMA Housing Assistance - Individual assistance for disaster victims
  app.get("/api/fema-housing", async (req, res) => {
    try {
      // Check cache first
      const now = Date.now();
      if (femaHousingCache && (now - femaHousingCacheTime) < FEMA_HOUSING_CACHE_DURATION) {
        console.log('✓ Returning cached FEMA housing assistance data');
        return res.json({
          ...femaHousingCache,
          cached: true,
          lastUpdated: new Date(femaHousingCacheTime).toISOString()
        });
      }

      const currentYear = new Date().getFullYear();
      const femaUrl = `https://www.fema.gov/api/open/v2/HousingAssistanceProgramDataOwners?$filter=year(declarationDate) eq ${currentYear}&$orderby=declarationDate desc&$top=100&$format=json`;

      console.log('Fetching FEMA housing assistance data...');
      const response = await fetch(femaUrl);

      if (!response.ok) {
        throw new Error(`FEMA Housing API failed: ${response.status}`);
      }

      const housingData = await response.json();
      const assistanceRecords = housingData.HousingAssistanceProgramDataOwners || [];

      // Aggregate stats
      const stats = assistanceRecords.reduce((acc: any, record: any) => {
        acc.totalApplicants += record.approvedBetween1And10000 || 0;
        acc.totalApproved += record.approvedForRentalAssistance || 0;
        acc.totalAmount += record.totalApprovedAmount || 0;
        acc.byState[record.state] = (acc.byState[record.state] || 0) + 1;
        return acc;
      }, { 
        totalApplicants: 0, 
        totalApproved: 0, 
        totalAmount: 0, 
        byState: {} as Record<string, number> 
      });

      console.log(`✓ FEMA Housing: ${assistanceRecords.length} housing assistance records loaded`);

      const responseData = {
        success: true,
        items: assistanceRecords.slice(0, 20), // Limit for display
        stats: stats,
        source: 'FEMA Housing Assistance',
        lastUpdated: new Date().toISOString(),
        totalRecords: assistanceRecords.length,
        cached: false
      };

      // Cache the response
      femaHousingCache = responseData;
      femaHousingCacheTime = now;

      res.json(responseData);

    } catch (error) {
      console.error('FEMA Housing Assistance API error:', error);
      res.json({
        success: false,
        items: [],
        stats: { totalApplicants: 0, totalApproved: 0, totalAmount: 0, byState: {} },
        source: 'FEMA Housing Assistance',
        error: 'Unable to fetch housing assistance data',
        lastUpdated: new Date().toISOString()
      });
    }
  });

  // Cache for FEMA Public Assistance Projects
  let femaPublicAssistanceCache: any = null;
  let femaPublicAssistanceCacheTime: number = 0;
  const FEMA_PA_CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hour cache

  // FEMA Public Assistance - Infrastructure repair and emergency work funding
  app.get("/api/fema-public-assistance", async (req, res) => {
    try {
      // Check cache first
      const now = Date.now();
      if (femaPublicAssistanceCache && (now - femaPublicAssistanceCacheTime) < FEMA_PA_CACHE_DURATION) {
        console.log('✓ Returning cached FEMA public assistance data');
        return res.json({
          ...femaPublicAssistanceCache,
          cached: true,
          lastUpdated: new Date(femaPublicAssistanceCacheTime).toISOString()
        });
      }

      const currentYear = new Date().getFullYear();
      const femaUrl = `https://www.fema.gov/api/open/v1/PublicAssistanceFundedProjectsDetails?$filter=year(declarationDate) eq ${currentYear}&$orderby=declarationDate desc&$top=50&$format=json`;

      console.log('Fetching FEMA public assistance projects...');
      const response = await fetch(femaUrl);

      if (!response.ok) {
        throw new Error(`FEMA Public Assistance API failed: ${response.status}`);
      }

      const paData = await response.json();
      const projects = paData.PublicAssistanceFundedProjectsDetails || [];

      // Calculate statistics
      const stats = projects.reduce((acc: any, project: any) => {
        acc.totalProjects += 1;
        acc.totalObligated += project.projectAmountTotal || 0;
        acc.totalFederal += project.federalShareObligated || 0;
        acc.byState[project.state] = (acc.byState[project.state] || 0) + 1;
        acc.byWorkType[project.damageCategory] = (acc.byWorkType[project.damageCategory] || 0) + 1;
        return acc;
      }, { 
        totalProjects: 0, 
        totalObligated: 0, 
        totalFederal: 0, 
        byState: {} as Record<string, number>,
        byWorkType: {} as Record<string, number>
      });

      console.log(`✓ FEMA Public Assistance: ${projects.length} funded projects loaded`);

      const responseData = {
        success: true,
        items: projects.slice(0, 25), // Limit for display
        stats: stats,
        source: 'FEMA Public Assistance',
        lastUpdated: new Date().toISOString(),
        totalRecords: projects.length,
        cached: false
      };

      // Cache the response
      femaPublicAssistanceCache = responseData;
      femaPublicAssistanceCacheTime = now;

      res.json(responseData);

    } catch (error) {
      console.error('FEMA Public Assistance API error:', error);
      res.json({
        success: false,
        items: [],
        stats: { totalProjects: 0, totalObligated: 0, totalFederal: 0, byState: {}, byWorkType: {} },
        source: 'FEMA Public Assistance',
        error: 'Unable to fetch public assistance data',
        lastUpdated: new Date().toISOString()
      });
    }
  });

  // Cache for FEMA NFIP Claims
  let femaNfipCache: any = null;
  let femaNfipCacheTime: number = 0;
  const FEMA_NFIP_CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hour cache

  // FEMA NFIP Claims - National Flood Insurance Program claims data
  app.get("/api/fema-nfip", async (req, res) => {
    try {
      // Check cache first
      const now = Date.now();
      if (femaNfipCache && (now - femaNfipCacheTime) < FEMA_NFIP_CACHE_DURATION) {
        console.log('✓ Returning cached FEMA NFIP claims data');
        return res.json({
          ...femaNfipCache,
          cached: true,
          lastUpdated: new Date(femaNfipCacheTime).toISOString()
        });
      }

      const currentYear = new Date().getFullYear();
      const femaUrl = `https://www.fema.gov/api/open/v2/FimaNfipRedactedClaims?$filter=year(dateLossFrom) eq ${currentYear}&$orderby=dateLossFrom desc&$top=100&$format=json`;

      console.log('Fetching FEMA NFIP claims data...');
      const response = await fetch(femaUrl);

      if (!response.ok) {
        throw new Error(`FEMA NFIP API failed: ${response.status}`);
      }

      const nfipData = await response.json();
      const claims = nfipData.FimaNfipRedactedClaims || [];

      // Calculate flood insurance statistics
      const stats = claims.reduce((acc: any, claim: any) => {
        acc.totalClaims += 1;
        acc.totalPaid += claim.amountPaidOnBuildingClaim || 0;
        acc.totalContentsPaid += claim.amountPaidOnContentsClaim || 0;
        acc.byState[claim.state] = (acc.byState[claim.state] || 0) + 1;
        acc.byCounty[claim.countyCode] = (acc.byCounty[claim.countyCode] || 0) + 1;
        return acc;
      }, { 
        totalClaims: 0, 
        totalPaid: 0, 
        totalContentsPaid: 0, 
        byState: {} as Record<string, number>,
        byCounty: {} as Record<string, number>
      });

      console.log(`✓ FEMA NFIP: ${claims.length} flood insurance claims loaded`);

      const responseData = {
        success: true,
        items: claims.slice(0, 20), // Limit for display
        stats: stats,
        source: 'FEMA NFIP Claims',
        lastUpdated: new Date().toISOString(),
        totalRecords: claims.length,
        cached: false
      };

      // Cache the response
      femaNfipCache = responseData;
      femaNfipCacheTime = now;

      res.json(responseData);

    } catch (error) {
      console.error('FEMA NFIP Claims API error:', error);
      res.json({
        success: false,
        items: [],
        stats: { totalClaims: 0, totalPaid: 0, totalContentsPaid: 0, byState: {}, byCounty: {} },
        source: 'FEMA NFIP Claims',
        error: 'Unable to fetch NFIP claims data',
        lastUpdated: new Date().toISOString()
      });
    }
  });

  // Alert Management Routes

  // Get user's alert rules
  app.get('/api/alerts/rules', async (req, res) => {
    try {
      // For demo purposes, use a default user ID (in production, get from auth)
      const userId = 'demo-user';

      const rules = await db
        .select()
        .from(alertRules)
        .where(eq(alertRules.userId, userId))
        .orderBy(desc(alertRules.createdAt));

      res.json({ success: true, rules });
    } catch (error) {
      console.error('Error fetching alert rules:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch alert rules' });
    }
  });

  // Create new alert rule
  app.post('/api/alerts/rules', async (req, res) => {
    try {
      const userId = 'demo-user'; // Demo user ID

      // Validate the request body
      const validatedData = insertAlertRuleSchema.parse({
        ...req.body,
        userId
      });

      const [rule] = await db
        .insert(alertRules)
        .values(validatedData)
        .returning();

      res.json({ success: true, rule });
    } catch (error) {
      console.error('Error creating alert rule:', error);
      res.status(400).json({ success: false, error: error.message || 'Failed to create alert rule' });
    }
  });

  // Update alert rule
  app.put('/api/alerts/rules/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const userId = 'demo-user';

      // Verify ownership
      const existingRules = await db
        .select()
        .from(alertRules)
        .where(and(eq(alertRules.id, id), eq(alertRules.userId, userId)));

      if (existingRules.length === 0) {
        return res.status(404).json({ success: false, error: 'Alert rule not found' });
      }

      const validatedData = insertAlertRuleSchema.partial().parse(req.body);

      const [rule] = await db
        .update(alertRules)
        .set({ ...validatedData, updatedAt: new Date() })
        .where(eq(alertRules.id, id))
        .returning();

      res.json({ success: true, rule });
    } catch (error) {
      console.error('Error updating alert rule:', error);
      res.status(400).json({ success: false, error: error.message || 'Failed to update alert rule' });
    }
  });

  // Delete alert rule
  app.delete('/api/alerts/rules/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const userId = 'demo-user';

      await db
        .delete(alertRules)
        .where(and(eq(alertRules.id, id), eq(alertRules.userId, userId)));

      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting alert rule:', error);
      res.status(500).json({ success: false, error: 'Failed to delete alert rule' });
    }
  });

  // Get alert delivery history
  app.get('/api/alerts/history', async (req, res) => {
    try {
      const userId = 'demo-user';
      const { limit = 50, offset = 0 } = req.query;

      const deliveries = await db
        .select()
        .from(alertDeliveries)
        .where(eq(alertDeliveries.userId, userId))
        .orderBy(desc(alertDeliveries.createdAt))
        .limit(Number(limit))
        .offset(Number(offset));

      res.json({ success: true, deliveries });
    } catch (error) {
      console.error('Error fetching alert history:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch alert history' });
    }
  });

  // Get/Update notification settings
  app.get('/api/alerts/settings', async (req, res) => {
    try {
      const userId = 'demo-user';

      const settings = await db
        .select()
        .from(userNotificationSettings)
        .where(eq(userNotificationSettings.userId, userId));

      if (settings.length === 0) {
        // Create default settings
        const [newSettings] = await db
          .insert(userNotificationSettings)
          .values({ userId })
          .returning();
        return res.json({ success: true, settings: newSettings });
      }

      res.json({ success: true, settings: settings[0] });
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch notification settings' });
    }
  });

  app.put('/api/alerts/settings', async (req, res) => {
    try {
      const userId = 'demo-user';
      const validatedData = insertNotificationSettingsSchema.parse(req.body);

      // Upsert notification settings
      const [settings] = await db
        .insert(userNotificationSettings)
        .values({ ...validatedData, userId })
        .onConflictDoUpdate({
          target: userNotificationSettings.userId,
          set: { ...validatedData, updatedAt: new Date() }
        })
        .returning();

      res.json({ success: true, settings });
    } catch (error) {
      console.error('Error updating notification settings:', error);
      res.status(400).json({ success: false, error: error.message || 'Failed to update notification settings' });
    }
  });

  // Test alert endpoint
  app.post('/api/alerts/test/:ruleId', async (req, res) => {
    try {
      const { ruleId } = req.params;

      // Create a test event
      const testEvent: EmergencyEvent = {
        id: 'test-' + Date.now(),
        type: 'weather',
        title: 'Test Weather Alert',
        description: 'This is a test alert to verify your notification settings.',
        severity: 'medium',
        location: 'Test Location, CA',
        state: 'CA',
        coordinates: { lat: 37.7749, lng: -122.4194 },
        timestamp: new Date(),
        sourceData: { test: true }
      };

      const wouldTrigger = await alertEngine.testAlert(ruleId, testEvent);

      if (wouldTrigger) {
        // Actually trigger the alert for testing
        await alertEngine.processEvent(testEvent);
      }

      res.json({ 
        success: true, 
        wouldTrigger,
        message: wouldTrigger ? 'Test alert sent!' : 'Alert would not trigger with current conditions'
      });
    } catch (error) {
      console.error('Error testing alert:', error);
      res.status(500).json({ success: false, error: 'Failed to test alert' });
    }
  });

  // Social Media Emergency Monitoring endpoint - TEMPORARILY DISABLED
  // TODO: Reactivate later with improved API usage optimization (paid Twitter plan or better caching)
  app.get("/api/social-media-emergency", async (req, res) => {
    try {
      console.log('Social media monitoring temporarily disabled to conserve API tokens');

      // Return disabled status
      res.json({
        success: true,
        disabled: true,
        posts: [],
        note: "Social media monitoring is disabled and may be coming soon.",
        totalRelevantPosts: 0
      });
    } catch (error) {
      console.error('Error in social media endpoint:', error);
      res.status(500).json({ success: false, error: 'Social media monitoring disabled' });
    }
  });

  // Helper functions for social media monitoring (preserved for future reactivation)
  function getStateName(stateCode: string): string {
    const stateNames: { [key: string]: string } = {
      'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
      'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
      'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
      'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
      'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
      'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
      'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
      'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
      'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
      'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming'
    };
    return stateNames[stateCode] || stateCode;
  }

  function determineUrgencyLevel(text: string): string {
    const lowerText = text.toLowerCase();

    // Critical keywords
    if (lowerText.includes('evacuate') || lowerText.includes('immediate danger') || 
        lowerText.includes('life threatening') || lowerText.includes('emergency shelter') ||
        lowerText.includes('tornado warning') || lowerText.includes('hurricane warning')) {
      return 'critical';
    }

    // High urgency keywords
    if (lowerText.includes('severe weather') || lowerText.includes('flood warning') ||
        lowerText.includes('state of emergency') || lowerText.includes('emergency response') ||
        lowerText.includes('power outage') || lowerText.includes('road closure')) {
      return 'high';
    }

    // Medium urgency keywords
    if (lowerText.includes('weather alert') || lowerText.includes('storm watch') ||
        lowerText.includes('advisory') || lowerText.includes('prepare for') ||
        lowerText.includes('monitor conditions')) {
      return 'medium';
    }

    return 'low';
  }

  // iNaturalist API routes with conservative usage patterns
  app.get('/api/bioregion/:id/species', async (req, res) => {
    try {
      const bioregionId = req.params.id;
      const bbox = req.query.bbox ? (req.query.bbox as string).split(',').map(Number) as [number, number, number, number] : undefined;

      if (!bbox) {
        return res.status(400).json({ 
          success: false, 
          error: 'Bounding box required (format: sw_lng,sw_lat,ne_lng,ne_lat)' 
        });
      }

      console.log(`🔬 Fetching species data for bioregion ${bioregionId}`);
      const species = await getBioregionSpecies(bioregionId, bbox);

      res.json({
        success: true,
        bioregion_id: bioregionId,
        species_count: species.length,
        species: species.map(s => ({
          id: s.taxon.id,
          name: s.taxon.name,
          common_name: s.taxon.preferred_common_name,
          group: s.taxon.iconic_taxon_name,
          observation_count: s.count,
          photo: s.taxon.photos?.[0]?.medium_url
        })),
        note: species.length === 0 ? 'No species data available - may need API key or better location bounds' : undefined
      });
    } catch (error: any) {
      console.error('Bioregion species API error:', error.message);
      res.status(500).json({ 
        success: false, 
        error: error.message.includes('Rate limit') ? error.message : 'Failed to fetch species data'
      });
    }
  });

  // API usage monitoring endpoint  
  app.get('/api/inaturalist/usage', async (req, res) => {
    try {
      const stats = getApiUsageStats();
      res.json({
        success: true,
        usage: stats,
        status: stats.requests_this_session > 40 ? 'approaching_limit' : 'normal',
        limits: {
          max_requests_per_hour: 50,
          current_session: stats.requests_this_session,
          cache_duration_days: 30
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Register species routes
  app.use('/api/species', speciesRoutes);

  // Air Quality API routes
  app.get("/api/air-quality/current", async (req, res) => {
    try {
      console.log('🌬️ Fetching current air quality alerts...');
      const alerts = await airQualityService.getCurrentAirQualityAlerts();

      res.json({
        success: true,
        alerts,
        count: alerts.length,
        lastUpdated: new Date().toISOString(),
        sources: ['EPA AQS', 'PurpleAir', 'World Air Quality Index']
      });
    } catch (error) {
      console.error('Error fetching air quality alerts:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch air quality data',
        alerts: []
      });
    }
  });

  app.get("/api/air-quality/stations", async (req, res) => {
    try {
      const stations = await db.select().from(airQualityStations).limit(100);
      res.json({
        success: true,
        stations,
        count: stations.length
      });
    } catch (error) {
      console.error('Error fetching air quality stations:', error);
      res.status(500).json({ error: 'Failed to fetch stations' });
    }
  });

  app.get("/api/air-quality/readings/:stationId", async (req, res) => {
    try {
      const { stationId } = req.params;
      const readings = await db.select()
        .from(airQualityReadings)
        .where(eq(airQualityReadings.stationId, stationId))
        .orderBy(desc(airQualityReadings.timestamp))
        .limit(24); // Last 24 readings

      res.json({
        success: true,
        readings,
        stationId,
        count: readings.length
      });
    } catch (error) {
      console.error('Error fetching air quality readings:', error);
      res.status(500).json({ error: 'Failed to fetch readings' });
    }
  });

  app.post("/api/air-quality/monitor", async (req, res) => {
    try {
      console.log('🔍 Manually triggering air quality monitoring...');
      const alerts = await airQualityService.monitorAirQuality();

      // Process each alert through the alert engine
      for (const alert of alerts) {
        const emergencyEvent: EmergencyEvent = {
          id: alert.id,
          type: 'air_quality',
          title: `Air Quality Alert: ${alert.stationName}`,
          description: `AQI: ${alert.aqi} (${alert.aqiCategory.replace('_', ' ').toUpperCase()}) - Primary pollutant: ${alert.primaryPollutant.toUpperCase()}. ${alert.healthRecommendations.join(' ')}`,
          severity: alert.aqi > 200 ? 'critical' : alert.aqi > 150 ? 'high' : 'medium',
          location: alert.location,
          state: alert.state,
          coordinates: alert.coordinates,
          timestamp: alert.timestamp,
          sourceData: {
            aqi: alert.aqi,
            aqiCategory: alert.aqiCategory,
            primaryPollutant: alert.primaryPollutant,
            healthRecommendations: alert.healthRecommendations,
            affectedGroups: alert.affectedGroups,
            dataSource: alert.dataSource
          }
        };

        await alertEngine.processEvent(emergencyEvent);
      }

      res.json({
        success: true,
        message: `Processed ${alerts.length} air quality alerts`,
        alerts,
        alertsTriggered: alerts.length
      });
    } catch (error) {
      console.error('Error during air quality monitoring:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to monitor air quality' 
      });
    }
  });

  // Set up periodic air quality monitoring (every 2 hours)
  setInterval(async () => {
    try {
      console.log('🕒 Periodic air quality monitoring...');
      const alerts = await airQualityService.monitorAirQuality();

      // Only process significant alerts (AQI > 150)
      const significantAlerts = alerts.filter(alert => alert.aqi > 150);

      for (const alert of significantAlerts) {
        const emergencyEvent: EmergencyEvent = {
          id: alert.id,
          type: 'air_quality',
          title: `Air Quality Alert: ${alert.stationName}`,
          description: `AQI: ${alert.aqi} (${alert.aqiCategory.replace('_', ' ').toUpperCase()}) - ${alert.healthRecommendations[0]}`,
          severity: alert.aqi > 200 ? 'critical' : 'high',
          location: alert.location,
          state: alert.state,
          coordinates: alert.coordinates,
          timestamp: alert.timestamp,
          sourceData: {
            aqi: alert.aqi,
            aqiCategory: alert.aqiCategory,
            primaryPollutant: alert.primaryPollutant,
            dataSource: alert.dataSource
          }
        };

        await alertEngine.processEvent(emergencyEvent);
      }

      if (significantAlerts.length > 0) {
        console.log(`✓ Processed ${significantAlerts.length} significant air quality alerts`);
      }
    } catch (error) {
      console.error('Error in periodic air quality monitoring:', error);
    }
  }, 2 * 60 * 60 * 1000); // 2 hours

  // Include NOAA climate routes from separate module
  app.use('/api', noaaRoutes);

  // Include extreme weather routes
  app.use('/api', extremeWeatherRoutes);

  // Include Wikipedia routes
  const wikipediaRoutes = (await import('./routes/wikipedia')).default;
  app.use('/api', wikipediaRoutes);

  // Add geocoded weather alerts endpoint
  app.get("/api/weather-alerts-geocoded", async (req, res) => {
    try {
      // Get regular weather alerts first
      const alertsResponse = await fetch(`${req.protocol}://${req.get('host')}/api/weather-alerts-rss`);
      const alertsData = await alertsResponse.json();
      
      if (!alertsData.success || !alertsData.alerts) {
        return res.json({ success: false, error: 'Failed to fetch weather alerts' });
      }

      // Add geocoded coordinates to each alert
      const geocodedAlerts = await Promise.all(
        alertsData.alerts.slice(0, 50).map(async (alert: any) => {
          try {
            const coords = await geocodeLocation(alert.location || alert.title || '');
            return {
              ...alert,
              coordinates: coords,
              geocoded: true
            };
          } catch (error) {
            console.error(`Failed to geocode alert: ${alert.id}`, error);
            return {
              ...alert,
              coordinates: [-95.7129, 37.0902], // Fallback
              geocoded: false
            };
          }
        })
      );

      res.json({
        success: true,
        alerts: geocodedAlerts,
        totalAlerts: alertsData.alerts.length,
        geocodedCount: geocodedAlerts.filter(a => a.geocoded).length,
        lastUpdated: new Date().toISOString()
      });

    } catch (error) {
      console.error('Geocoded alerts error:', error);
      res.json({
        success: false,
        error: 'Failed to geocode weather alerts',
        alerts: []
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}