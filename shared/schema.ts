import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for OTP authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phoneNumber: text("phone_number").notNull().unique(),
  name: text("name"),
  isVerified: boolean("is_verified").default(false),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// OTP verification table
export const otpVerifications = pgTable("otp_verifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phoneNumber: text("phone_number").notNull(),
  otpCode: text("otp_code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  isUsed: boolean("is_used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Farms/Land information
export const farms = pgTable("farms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  area: decimal("area", { precision: 10, scale: 2 }).notNull(), // in acres
  soilType: text("soil_type").notNull(),
  cropType: text("crop_type").notNull(),
  ph: decimal("ph", { precision: 3, scale: 1 }),
  organicMatter: decimal("organic_matter", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Soil test results
export const soilTests = pgTable("soil_tests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  farmId: varchar("farm_id").references(() => farms.id).notNull(),
  nitrogen: decimal("nitrogen", { precision: 10, scale: 2 }), // N content
  phosphorus: decimal("phosphorus", { precision: 10, scale: 2 }), // P content  
  potassium: decimal("potassium", { precision: 10, scale: 2 }), // K content
  ph: decimal("ph", { precision: 3, scale: 1 }),
  organicMatter: decimal("organic_matter", { precision: 5, scale: 2 }),
  testDate: timestamp("test_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Fertilizer recommendations
export const fertilizerRecommendations = pgTable("fertilizer_recommendations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  soilTestId: varchar("soil_test_id").references(() => soilTests.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  farmId: varchar("farm_id").references(() => farms.id).notNull(),
  nitrogenReq: decimal("nitrogen_req", { precision: 10, scale: 2 }).notNull(),
  phosphorusReq: decimal("phosphorus_req", { precision: 10, scale: 2 }).notNull(),
  potassiumReq: decimal("potassium_req", { precision: 10, scale: 2 }).notNull(),
  recommendedFertilizers: jsonb("recommended_fertilizers").notNull(), // Array of fertilizer objects
  applicationRate: decimal("application_rate", { precision: 10, scale: 2 }),
  applicationTiming: text("application_timing"),
  expectedYieldIncrease: decimal("expected_yield_increase", { precision: 5, scale: 2 }),
  sustainabilityScore: integer("sustainability_score"), // 1-10 scale
  createdAt: timestamp("created_at").defaultNow(),
});

// Fertilizer usage tracking
export const fertilizerUsage = pgTable("fertilizer_usage", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  farmId: varchar("farm_id").references(() => farms.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  recommendationId: varchar("recommendation_id").references(() => fertilizerRecommendations.id),
  fertilizerName: text("fertilizer_name").notNull(),
  npkRatio: text("npk_ratio"), // e.g., "10-10-10"
  quantityApplied: decimal("quantity_applied", { precision: 10, scale: 2 }).notNull(),
  applicationDate: timestamp("application_date").notNull(),
  cost: decimal("cost", { precision: 10, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Session storage table (required for authentication)
export const sessions = pgTable("sessions", {
  sid: varchar("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire").notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOtpSchema = createInsertSchema(otpVerifications).omit({
  id: true,
  createdAt: true,
});

export const insertFarmSchema = createInsertSchema(farms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSoilTestSchema = createInsertSchema(soilTests).omit({
  id: true,
  createdAt: true,
});

export const insertFertilizerRecommendationSchema = createInsertSchema(fertilizerRecommendations).omit({
  id: true,
  createdAt: true,
});

export const insertFertilizerUsageSchema = createInsertSchema(fertilizerUsage).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type OtpVerification = typeof otpVerifications.$inferSelect;
export type InsertOtp = z.infer<typeof insertOtpSchema>;

export type Farm = typeof farms.$inferSelect;
export type InsertFarm = z.infer<typeof insertFarmSchema>;

export type SoilTest = typeof soilTests.$inferSelect;
export type InsertSoilTest = z.infer<typeof insertSoilTestSchema>;

export type FertilizerRecommendation = typeof fertilizerRecommendations.$inferSelect;
export type InsertFertilizerRecommendation = z.infer<typeof insertFertilizerRecommendationSchema>;

export type FertilizerUsage = typeof fertilizerUsage.$inferSelect;
export type InsertFertilizerUsage = z.infer<typeof insertFertilizerUsageSchema>;

// Extended types for API responses
export type FarmWithDetails = Farm & {
  soilTests?: SoilTest[];
  latestRecommendation?: FertilizerRecommendation;
  totalUsage?: number;
};

export type SoilTestWithRecommendation = SoilTest & {
  recommendation?: FertilizerRecommendation;
  farm?: Farm;
};

export type RecommendationWithDetails = FertilizerRecommendation & {
  soilTest?: SoilTest;
  farm?: Farm;
  usage?: FertilizerUsage[];
};

// NPK Calculator types
export type NPKRequirement = {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
};

export type FertilizerOption = {
  name: string;
  npkRatio: string;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  price: number; // per kg
  availability: 'high' | 'medium' | 'low';
  sustainability: number; // 1-10 scale
  type: 'organic' | 'synthetic' | 'bio';
};

export type CalculationResult = {
  requirements: NPKRequirement;
  recommendedFertilizers: Array<{
    fertilizer: FertilizerOption;
    quantity: number; // in kg per acre
    cost: number;
    coverage: number; // percentage of NPK needs met
  }>;
  sustainabilityScore: number;
  expectedYieldIncrease: number;
  applicationTiming: string;
};
