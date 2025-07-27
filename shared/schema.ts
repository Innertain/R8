import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Volunteers table - linked to Airtable volunteers
export const volunteers = pgTable("volunteers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  airtableId: text("airtable_id").unique(), // Link to Airtable record
  name: text("name").notNull(),
  phoneNumber: text("phone_number").unique(),
  email: text("email"),
  isDriver: boolean("is_driver").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Volunteer availability - when volunteers are available to work
export const volunteerAvailability = pgTable("volunteer_availability", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  volunteerId: varchar("volunteer_id").notNull().references(() => volunteers.id),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  isRecurring: boolean("is_recurring").default(false),
  recurringPattern: text("recurring_pattern"), // "weekly", "daily", etc.
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Shift assignments - volunteers assigned to specific shifts
export const shiftAssignments = pgTable("shift_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shiftId: text("shift_id").notNull(), // Airtable shift ID
  volunteerId: varchar("volunteer_id").notNull().references(() => volunteers.id),
  status: text("status").notNull().default("confirmed"), // confirmed, pending, cancelled
  assignedAt: timestamp("assigned_at").defaultNow(),
  notes: text("notes"),
});

// Create insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertVolunteerSchema = createInsertSchema(volunteers).omit({
  id: true,
  createdAt: true,
});

export const insertAvailabilitySchema = createInsertSchema(volunteerAvailability).omit({
  id: true,
  createdAt: true,
});

export const insertShiftAssignmentSchema = createInsertSchema(shiftAssignments).omit({
  id: true,
  assignedAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertVolunteer = z.infer<typeof insertVolunteerSchema>;
export type Volunteer = typeof volunteers.$inferSelect;

export type InsertAvailability = z.infer<typeof insertAvailabilitySchema>;
export type Availability = typeof volunteerAvailability.$inferSelect;

export type InsertShiftAssignment = z.infer<typeof insertShiftAssignmentSchema>;
export type ShiftAssignment = typeof shiftAssignments.$inferSelect;
