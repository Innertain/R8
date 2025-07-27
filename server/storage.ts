import { type User, type InsertUser, type Volunteer, type InsertVolunteer, type Availability, type InsertAvailability, type ShiftAssignment, type InsertShiftAssignment } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Volunteer management
  createVolunteer(volunteer: InsertVolunteer): Promise<Volunteer>;
  getVolunteerByPhone(phoneNumber: string): Promise<Volunteer | null>;
  getVolunteerById(id: string): Promise<Volunteer | null>;
  getAllVolunteers(): Promise<Volunteer[]>;
  updateVolunteer(id: string, updates: Partial<InsertVolunteer>): Promise<Volunteer>;
  updateVolunteerProfile(id: string, profileData: any): Promise<Volunteer>;

  // Availability management
  createAvailability(availability: InsertAvailability): Promise<Availability>;
  getVolunteerAvailability(volunteerId: string): Promise<Availability[]>;
  getAvailabilityByDateRange(startDate: Date, endDate: Date): Promise<Availability[]>;
  updateAvailability(id: string, updates: Partial<InsertAvailability>): Promise<Availability>;
  deleteAvailability(id: string): Promise<void>;

  // Shift assignments
  createShiftAssignment(assignment: InsertShiftAssignment): Promise<ShiftAssignment>;
  getShiftAssignments(shiftId?: string): Promise<ShiftAssignment[]>;
  getVolunteerAssignments(volunteerId: string): Promise<ShiftAssignment[]>;
  updateShiftAssignment(id: string, updates: Partial<InsertShiftAssignment>): Promise<ShiftAssignment>;
  deleteShiftAssignment(id: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private volunteers: Map<string, Volunteer>;
  private availability: Map<string, Availability>;
  private shiftAssignments: Map<string, ShiftAssignment>;

  constructor() {
    this.users = new Map();
    this.volunteers = new Map();
    this.availability = new Map();
    this.shiftAssignments = new Map();
    
    // Create demo volunteer for testing
    this.createDemoVolunteer();
  }
  
  private createDemoVolunteer() {
    const demoId = "demo-volunteer-123";
    const demoVolunteer: Volunteer = {
      id: demoId,
      airtableId: null,
      name: "Demo Volunteer",
      phoneNumber: "555-DEMO",
      email: "demo@volunteer.org",
      isDriver: true,
      isActive: true,
      bio: null,
      skills: [],
      interests: [],
      emergencyContact: null,
      emergencyPhone: null,
      dietaryRestrictions: null,
      hasTransportation: false,
      maxHoursPerWeek: null,
      preferredShiftTypes: [],
      notifications: {
        email: true,
        sms: false,
        reminders: true,
        newShifts: true
      },
      createdAt: new Date()
    };
    this.volunteers.set(demoId, demoVolunteer);
    
    // Add some demo availability for the current week
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    
    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(17, 0, 0, 0);
    
    const demoAvailability: Availability = {
      id: "demo-availability-1",
      volunteerId: demoId,
      startTime: tomorrow,
      endTime: tomorrowEnd,
      isRecurring: false,
      recurringPattern: null,
      notes: "Demo availability - available all day tomorrow",
      createdAt: new Date()
    };
    this.availability.set("demo-availability-1", demoAvailability);
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Volunteer methods
  async createVolunteer(insertVolunteer: InsertVolunteer): Promise<Volunteer> {
    const id = randomUUID();
    const volunteer: Volunteer = { 
      ...insertVolunteer, 
      id, 
      createdAt: new Date() 
    };
    this.volunteers.set(id, volunteer);
    return volunteer;
  }

  async getVolunteerByPhone(phoneNumber: string): Promise<Volunteer | null> {
    const volunteer = Array.from(this.volunteers.values()).find(
      (v) => v.phoneNumber === phoneNumber
    );
    return volunteer || null;
  }

  async getVolunteerById(id: string): Promise<Volunteer | null> {
    return this.volunteers.get(id) || null;
  }

  async getAllVolunteers(): Promise<Volunteer[]> {
    return Array.from(this.volunteers.values());
  }

  async updateVolunteer(id: string, updates: Partial<InsertVolunteer>): Promise<Volunteer> {
    const volunteer = this.volunteers.get(id);
    if (!volunteer) throw new Error('Volunteer not found');
    
    const updated = { ...volunteer, ...updates };
    this.volunteers.set(id, updated);
    return updated;
  }

  async updateVolunteerProfile(id: string, profileData: any): Promise<Volunteer> {
    const volunteer = this.volunteers.get(id);
    if (!volunteer) throw new Error('Volunteer not found');
    
    const updated = { ...volunteer, ...profileData };
    this.volunteers.set(id, updated);
    return updated;
  }

  // Availability methods
  async createAvailability(insertAvailability: InsertAvailability): Promise<Availability> {
    const id = randomUUID();
    const availability: Availability = { 
      ...insertAvailability, 
      id, 
      createdAt: new Date() 
    };
    this.availability.set(id, availability);
    return availability;
  }

  async getVolunteerAvailability(volunteerId: string): Promise<Availability[]> {
    return Array.from(this.availability.values()).filter(
      (a) => a.volunteerId === volunteerId
    );
  }

  async getAvailabilityByDateRange(startDate: Date, endDate: Date): Promise<Availability[]> {
    return Array.from(this.availability.values()).filter(
      (a) => a.startTime >= startDate && a.endTime <= endDate
    );
  }

  async updateAvailability(id: string, updates: Partial<InsertAvailability>): Promise<Availability> {
    const availability = this.availability.get(id);
    if (!availability) throw new Error('Availability not found');
    
    const updated = { ...availability, ...updates };
    this.availability.set(id, updated);
    return updated;
  }

  async deleteAvailability(id: string): Promise<void> {
    this.availability.delete(id);
  }

  // Shift assignment methods
  async createShiftAssignment(insertAssignment: InsertShiftAssignment): Promise<ShiftAssignment> {
    const id = randomUUID();
    const assignment: ShiftAssignment = { 
      ...insertAssignment, 
      id, 
      assignedAt: new Date() 
    };
    this.shiftAssignments.set(id, assignment);
    return assignment;
  }

  async getShiftAssignments(shiftId?: string): Promise<ShiftAssignment[]> {
    const assignments = Array.from(this.shiftAssignments.values());
    return shiftId ? assignments.filter(a => a.shiftId === shiftId) : assignments;
  }

  async getVolunteerAssignments(volunteerId: string): Promise<ShiftAssignment[]> {
    return Array.from(this.shiftAssignments.values()).filter(
      (a) => a.volunteerId === volunteerId
    );
  }

  async updateShiftAssignment(id: string, updates: Partial<InsertShiftAssignment>): Promise<ShiftAssignment> {
    const assignment = this.shiftAssignments.get(id);
    if (!assignment) throw new Error('Shift assignment not found');
    
    const updated = { ...assignment, ...updates };
    this.shiftAssignments.set(id, updated);
    return updated;
  }

  async deleteShiftAssignment(id: string): Promise<void> {
    this.shiftAssignments.delete(id);
  }
}

export const storage = new MemStorage();
