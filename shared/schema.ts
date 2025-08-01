import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, json, jsonb, real, index } from "drizzle-orm/pg-core";
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
  // Profile and preferences
  bio: text("bio"),
  skills: json("skills").$type<string[]>().default([]),
  interests: json("interests").$type<string[]>().default([]),
  emergencyContact: text("emergency_contact"),
  emergencyPhone: text("emergency_phone"),
  dietaryRestrictions: text("dietary_restrictions"),
  hasTransportation: boolean("has_transportation").default(false),
  maxHoursPerWeek: integer("max_hours_per_week"),
  preferredShiftTypes: json("preferred_shift_types").$type<string[]>().default([]),
  notifications: json("notifications").$type<{
    email: boolean;
    sms: boolean;
    reminders: boolean;
    newShifts: boolean;
  }>().default({
    email: true,
    sms: false,
    reminders: true,
    newShifts: true
  }),
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

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Alert rules defined by users
export const alertRules = pgTable("alert_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(), // Removed foreign key constraint for demo
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  
  // Alert conditions
  alertType: varchar("alert_type", { length: 50 }).notNull(), // 'weather', 'wildfire', 'earthquake', 'disaster'
  conditions: jsonb("conditions").notNull(), // Store complex conditions as JSON
  
  // Geographic filters
  states: text("states").array(), // Array of state codes
  regions: text("regions").array(), // Array of regions
  
  // Notification preferences
  notificationMethods: text("notification_methods").array().notNull(), // ['email', 'sms', 'webhook']
  webhookUrl: varchar("webhook_url"),
  
  // Frequency controls
  cooldownMinutes: integer("cooldown_minutes").default(60), // Prevent spam
  maxAlertsPerDay: integer("max_alerts_per_day").default(10),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Alert history and delivery tracking
export const alertDeliveries = pgTable("alert_deliveries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  alertRuleId: varchar("alert_rule_id").references(() => alertRules.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull(), // Removed foreign key constraint for demo
  
  // Alert content
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  severity: varchar("severity", { length: 20 }).notNull(), // 'low', 'medium', 'high', 'critical'
  alertType: varchar("alert_type", { length: 50 }).notNull(),
  
  // Source data
  sourceData: jsonb("source_data"), // Original event data that triggered alert
  location: varchar("location"),
  coordinates: jsonb("coordinates"), // {lat, lng}
  
  // Delivery tracking
  deliveryMethod: varchar("delivery_method", { length: 20 }).notNull(),
  deliveryStatus: varchar("delivery_status", { length: 20 }).default("pending"), // 'pending', 'sent', 'failed'
  deliveredAt: timestamp("delivered_at"),
  errorMessage: text("error_message"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// User notification preferences
export const userNotificationSettings = pgTable("user_notification_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(), // Removed foreign key constraint for demo
  
  // Contact methods
  email: varchar("email"),
  phoneNumber: varchar("phone_number"),
  
  // Global preferences
  emailEnabled: boolean("email_enabled").default(true),
  smsEnabled: boolean("sms_enabled").default(false),
  webhookEnabled: boolean("webhook_enabled").default(false),
  
  // Quiet hours (local time)
  quietHoursEnabled: boolean("quiet_hours_enabled").default(false),
  quietHoursStart: varchar("quiet_hours_start"), // "22:00"
  quietHoursEnd: varchar("quiet_hours_end"), // "08:00"
  timezone: varchar("timezone").default("America/New_York"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type AlertRule = typeof alertRules.$inferSelect;
export type InsertAlertRule = typeof alertRules.$inferInsert;

export type AlertDelivery = typeof alertDeliveries.$inferSelect;
export type InsertAlertDelivery = typeof alertDeliveries.$inferInsert;

export type UserNotificationSettings = typeof userNotificationSettings.$inferSelect;
export type InsertUserNotificationSettings = typeof userNotificationSettings.$inferInsert;

// Zod schemas for validation
export const insertAlertRuleSchema = createInsertSchema(alertRules, {
  name: z.string().min(1, "Alert name is required").max(255),
  alertType: z.enum(["weather", "wildfire", "earthquake", "disaster"]),
  notificationMethods: z.array(z.enum(["email", "sms", "webhook"])).min(1, "At least one notification method required"),
  cooldownMinutes: z.number().min(1).max(1440), // 1 minute to 24 hours
  maxAlertsPerDay: z.number().min(1).max(100),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationSettingsSchema = createInsertSchema(userNotificationSettings, {
  email: z.string().email().optional().or(z.literal("")),
  phoneNumber: z.string().regex(/^\+?[\d\s\-\(\)]+$/, "Invalid phone number").optional().or(z.literal("")),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAlertRuleType = z.infer<typeof insertAlertRuleSchema>;
export type InsertNotificationSettingsType = z.infer<typeof insertNotificationSettingsSchema>;

// Emergency Declarations Table for State-Level Database
export const emergencyDeclarations = pgTable("emergency_declarations", {
  id: varchar("id").primaryKey(),
  state: varchar("state", { length: 2 }).notNull(),
  stateName: varchar("state_name", { length: 100 }).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  description: varchar("description", { length: 2000 }),
  emergencyType: varchar("emergency_type", { length: 100 }).notNull(),
  publishedAt: timestamp("published_at").notNull(),
  source: varchar("source", { length: 200 }).notNull(),
  sourceType: varchar("source_type", { length: 50 }).notNull().default('official'), // 'official', 'news', 'scraped'
  url: varchar("url", { length: 1000 }),
  author: varchar("author", { length: 200 }),
  urlToImage: varchar("url_to_image", { length: 1000 }),
  confidence: varchar("confidence", { length: 20 }).notNull().default('high'), // 'high', 'medium', 'low'
  verified: timestamp("verified_at"),
  verifiedBy: varchar("verified_by", { length: 100 }),
  relatedFemaId: varchar("related_fema_id", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_emergency_state").on(table.state),
  index("idx_emergency_date").on(table.publishedAt),
  index("idx_emergency_type").on(table.emergencyType),
  index("idx_emergency_source").on(table.sourceType),
]);

export type EmergencyDeclaration = typeof emergencyDeclarations.$inferSelect;
export type InsertEmergencyDeclaration = typeof emergencyDeclarations.$inferInsert;

export const insertEmergencyDeclarationSchema = createInsertSchema(emergencyDeclarations, {
  title: z.string().min(1, "Title is required").max(500),
  state: z.string().length(2, "State code must be 2 characters"),
  emergencyType: z.string().min(1, "Emergency type is required"),
  sourceType: z.enum(["official", "news", "scraped"]),
  confidence: z.enum(["high", "medium", "low"]),
}).omit({
  createdAt: true,
  updatedAt: true,
});

export type InsertEmergencyDeclarationType = z.infer<typeof insertEmergencyDeclarationSchema>;
