import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { fetchShiftsFromAirtableServer } from "./airtable";

export async function registerRoutes(app: Express): Promise<Server> {
  // API route to check Airtable base structure
  app.get("/api/airtable-debug", async (req, res) => {
    const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
    const BASE_ID = process.env.VITE_BASE_ID?.replace(/\.$/, ''); // Remove trailing period if present
    
    if (!AIRTABLE_TOKEN || !BASE_ID) {
      return res.json({ error: 'Missing credentials' });
    }

    try {
      // Get base metadata
      const metaUrl = `https://api.airtable.com/v0/meta/bases/${BASE_ID}/tables`;
      const metaResponse = await fetch(metaUrl, {
        headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` }
      });

      if (metaResponse.ok) {
        const metaData = await metaResponse.json();
        res.json({
          success: true,
          baseId: BASE_ID,
          tables: metaData.tables?.map((t: any) => ({
            name: t.name,
            id: t.id,
            fields: t.fields?.map((f: any) => ({ name: f.name, type: f.type }))
          })) || []
        });
      } else {
        const error = await metaResponse.text();
        res.json({ 
          success: false, 
          error: `Base metadata error: ${metaResponse.status} - ${error}`,
          baseId: BASE_ID
        });
      }
    } catch (error) {
      res.json({ success: false, error: error.message });
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
    } catch (error) {
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
        console.log(`Drivers "${tableName}" exception:`, error.message);
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
    } catch (error) {
      console.log(`Exception for "${tableName}":`, error.message);
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
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/volunteers", async (req, res) => {
    try {
      const volunteers = await storage.getAllVolunteers();
      res.json(volunteers);
    } catch (error) {
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
      
      // Fallback to storage (includes demo account)
      const volunteer = await storage.getVolunteerByPhone(phone);
      if (volunteer) {
        return res.json(volunteer);
      }
      
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
      const availability = await storage.createAvailability(availabilityData);
      res.json(availability);
    } catch (error) {
      res.status(400).json({ error: error.message });
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
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/availability/:id", async (req, res) => {
    try {
      await storage.deleteAvailability(req.params.id);
      res.json({ success: true });
    } catch (error) {
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
      
      // Create assignment in Airtable if volunteer exists in Airtable
      if (assignmentData.volunteerId !== 'demo-volunteer-123') {
        console.log('✓ Volunteer ID is not demo, proceeding with Airtable creation');
        const baseId = process.env.VITE_BASE_ID?.replace(/\.$/, '');
        // Create payload without Status field since Airtable only has 'cancelled' option
        const fields = {
          'Volunteer': [assignmentData.volunteerId],
          'Shift ID': assignmentData.shiftId,
          'Assigned Date': new Date().toISOString(),
          'Notes': assignmentData.notes || ''
        };
        
        const assignmentPayload = {
          records: [{ fields }]
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
        
        console.log('Airtable response status:', airtableResponse.status);
        const responseText = await airtableResponse.text();
        console.log('Airtable response body:', responseText);
        
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
          
          console.log('✅ Assignment created in Airtable:', assignment);
          return res.json(assignment);
        } else {
          console.log('❌ Airtable creation failed, falling back to storage');
        }
      } else {
        console.log('Using demo volunteer, skipping Airtable');
      }
      
      // Fallback to storage for demo users or failed Airtable requests
      console.log('Creating assignment in local storage as fallback');
      const assignment = await storage.createShiftAssignment(assignmentData);
      res.json(assignment);
    } catch (error: any) {
      console.error('Error creating assignment:', error);
      res.status(400).json({ error: error.message || 'Server error' });
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
          const assignments = volunteerAssignments.map((record: any) => ({
            id: record.id,
            volunteerId: volunteerId,
            shiftId: record.fields['Shift ID'] || '',
            shiftName: record.fields['Name (from Shift Name)']?.[0] || '',
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
    } catch (error) {
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

  const httpServer = createServer(app);
  return httpServer;
}
