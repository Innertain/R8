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
  alertType: varchar("alert_type", { length: 50 }).notNull(), // 'weather', 'wildfire', 'earthquake', 'disaster', 'air_quality'
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
  alertType: z.enum(["weather", "wildfire", "earthquake", "disaster", "air_quality"]),
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

// Species cache for bioregion explorer
export const bioregionSpeciesCache = pgTable("bioregion_species_cache", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bioregionId: varchar("bioregion_id").notNull().unique(), // e.g., 'na_pacific_northwest'
  
  // Species summary data
  totalSpeciesCount: integer("total_species_count").default(0),
  endemicSpeciesCount: integer("endemic_species_count").default(0),
  threatenedSpeciesCount: integer("threatened_species_count").default(0),
  
  // Flagship/representative species (arrays of species names)
  flagshipSpecies: text("flagship_species").array(),
  endemicSpecies: text("endemic_species").array(),
  threatenedSpecies: text("threatened_species").array(),
  
  // Top taxa counts
  topTaxa: jsonb("top_taxa"), // {"Aves": 245, "Mammalia": 89, "Plantae": 1200}
  
  // Recent activity data
  recentSightings: jsonb("recent_sightings"), // [{species, location, date, photo, url}]
  seasonalTrends: jsonb("seasonal_trends"), // {species: trend_data}
  identificationNeeds: jsonb("identification_needs"), // [{species, observations, url}]
  speciesPhotos: jsonb("species_photos"), // {species_name: photo_url}
  
  // Conservation projects and citizen science opportunities
  conservationProjects: jsonb("conservation_projects"), // [{name, url, description}]
  citizenScienceProjects: jsonb("citizen_science_projects"),
  
  // Climate impact data - Climate Refugees feature
  climateImpactData: jsonb("climate_impact_data"), // {
  //   rangeShifts: [{species, oldRange, newRange, shiftDirection, magnitude, timespan}],
  //   climateRefugees: [{species, lastSeenYear, disappearanceReason, severity}],
  //   elevationChanges: [{species, avgElevationChange, timespan}],
  //   seasonalShifts: [{species, oldSeasonStart, newSeasonStart, daysDifference}]
  // }
  
  // Cache metadata
  dataSource: varchar("data_source").default("inaturalist"),
  lastSyncedAt: timestamp("last_synced_at").notNull(),
  syncStatus: varchar("sync_status").default("success"), // 'success', 'failed', 'pending'
  errorMessage: text("error_message"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Individual species records for detailed information
export const speciesRecords = pgTable("species_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bioregionIds: text("bioregion_ids").array(), // Can belong to multiple bioregions
  
  // Species identification
  scientificName: varchar("scientific_name").notNull(),
  commonName: varchar("common_name"),
  taxonomicRank: varchar("taxonomic_rank"), // 'species', 'subspecies', etc.
  
  // Taxonomy
  kingdom: varchar("kingdom"),
  phylum: varchar("phylum"),
  class: varchar("class"),
  order: varchar("order"),
  family: varchar("family"),
  genus: varchar("genus"),
  
  // Enhanced Conservation Status Integration
  conservationStatus: varchar("conservation_status"), // 'CR', 'EN', 'VU', 'NT', 'LC', 'DD', 'NE'
  iucnStatus: varchar("iucn_status"), // Global IUCN Red List status
  regionalStatus: varchar("regional_status"), // Regional conservation status (e.g., state level)
  populationTrend: varchar("population_trend"), // 'increasing', 'stable', 'decreasing', 'unknown'
  threatCategories: text("threat_categories").array(), // ['habitat_loss', 'climate_change', 'pollution', etc.]
  conservationActions: jsonb("conservation_actions"), // [{action, organization, status, url, startDate}]
  assessmentDate: timestamp("assessment_date"),
  generationLength: real("generation_length"), // In years
  isEndemic: boolean("is_endemic").default(false),
  isThreatened: boolean("is_threatened").default(false),
  isClimateRefugee: boolean("is_climate_refugee").default(false), // Species displaced by climate change
  
  // Occurrence data
  observationCount: integer("observation_count").default(0),
  lastObservedAt: timestamp("last_observed_at"),
  
  // External links
  inaturalistUrl: varchar("inaturalist_url"),
  gbifId: varchar("gbif_id"),
  
  // Photos (URLs)
  photoUrls: text("photo_urls").array(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// API usage tracking to prevent rate limiting
export const apiUsageLog = pgTable("api_usage_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  service: varchar("service").notNull(), // 'inaturalist', 'gbif', etc.
  endpoint: varchar("endpoint").notNull(),
  requestCount: integer("request_count").default(1),
  responseStatus: integer("response_status"),
  rateLimitRemaining: integer("rate_limit_remaining"),
  rateLimitReset: timestamp("rate_limit_reset"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type BioregionSpeciesCache = typeof bioregionSpeciesCache.$inferSelect;
export type InsertBioregionSpeciesCache = typeof bioregionSpeciesCache.$inferInsert;

export type SpeciesRecord = typeof speciesRecords.$inferSelect;
export type InsertSpeciesRecord = typeof speciesRecords.$inferInsert;

export type ApiUsageLog = typeof apiUsageLog.$inferSelect;
export type InsertApiUsageLog = typeof apiUsageLog.$inferInsert;

// Zod schemas for validation
export const insertBioregionSpeciesCacheSchema = createInsertSchema(bioregionSpeciesCache).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSpeciesRecordSchema = createInsertSchema(speciesRecords).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBioregionSpeciesCacheType = z.infer<typeof insertBioregionSpeciesCacheSchema>;
export type InsertSpeciesRecordType = z.infer<typeof insertSpeciesRecordSchema>;

// Air Quality monitoring tables
export const airQualityStations = pgTable("air_quality_stations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  stationId: varchar("station_id").notNull().unique(), // EPA/PurpleAir station ID
  name: varchar("name").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  state: varchar("state", { length: 2 }),
  county: varchar("county"),
  dataSource: varchar("data_source").notNull(), // 'epa', 'purpleair', 'waqi'
  isActive: boolean("is_active").default(true),
  lastReportedAt: timestamp("last_reported_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const airQualityReadings = pgTable("air_quality_readings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  stationId: varchar("station_id").notNull().references(() => airQualityStations.stationId),
  timestamp: timestamp("timestamp").notNull(),
  
  // Air Quality Index and pollutants
  aqi: integer("aqi"), // Overall AQI (0-500)
  aqiCategory: varchar("aqi_category"), // 'good', 'moderate', 'unhealthy_sensitive', 'unhealthy', 'very_unhealthy', 'hazardous'
  primaryPollutant: varchar("primary_pollutant"), // 'pm25', 'pm10', 'ozone', 'no2', 'so2', 'co'
  
  // Individual pollutant concentrations (μg/m³)
  pm25: real("pm25"), // PM2.5
  pm10: real("pm10"), // PM10
  ozone: real("ozone"), // O3 (ppb)
  no2: real("no2"), // NO2 (ppb)
  so2: real("so2"), // SO2 (ppb)
  co: real("co"), // CO (ppm)
  
  // Weather conditions that affect air quality
  temperature: real("temperature"), // °C
  humidity: real("humidity"), // %
  windSpeed: real("wind_speed"), // m/s
  windDirection: real("wind_direction"), // degrees
  
  dataSource: varchar("data_source").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Air quality alert zones for geographic targeting
export const airQualityAlertZones = pgTable("air_quality_alert_zones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(), // "Downtown Los Angeles", "San Francisco Bay Area"
  description: text("description"),
  
  // Geographic bounds
  northLat: real("north_lat").notNull(),
  southLat: real("south_lat").notNull(),
  eastLng: real("east_lng").notNull(),
  westLng: real("west_lng").notNull(),
  
  // Zone characteristics
  populationDensity: varchar("population_density"), // 'low', 'medium', 'high'
  vulnerablePopulation: boolean("vulnerable_population").default(false), // Schools, hospitals, elderly care
  industrialActivity: boolean("industrial_activity").default(false),
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export type AirQualityStation = typeof airQualityStations.$inferSelect;
export type InsertAirQualityStation = typeof airQualityStations.$inferInsert;

export type AirQualityReading = typeof airQualityReadings.$inferSelect;
export type InsertAirQualityReading = typeof airQualityReadings.$inferInsert;

export type AirQualityAlertZone = typeof airQualityAlertZones.$inferSelect;
export type InsertAirQualityAlertZone = typeof airQualityAlertZones.$inferInsert;

// Zod schemas for validation
export const insertAirQualityStationSchema = createInsertSchema(airQualityStations).omit({
  id: true,
  createdAt: true,
});

export const insertAirQualityReadingSchema = createInsertSchema(airQualityReadings).omit({
  id: true,
  createdAt: true,
});

export const insertAirQualityAlertZoneSchema = createInsertSchema(airQualityAlertZones).omit({
  id: true,
  createdAt: true,
});

export type InsertAirQualityStationType = z.infer<typeof insertAirQualityStationSchema>;
export type InsertAirQualityReadingType = z.infer<typeof insertAirQualityReadingSchema>;
export type InsertAirQualityAlertZoneType = z.infer<typeof insertAirQualityAlertZoneSchema>;
