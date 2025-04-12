import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const miningAccounts = pgTable("mining_accounts", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  api_key: text("api_key").notNull(),
  mining_username: text("mining_username").notNull(),
  currency: text("currency").notNull().default("bitcoin"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const miningData = pgTable("mining_data", {
  id: serial("id").primaryKey(),
  mining_account_id: integer("mining_account_id").references(() => miningAccounts.id).notNull(),
  hashrate: jsonb("hashrate").notNull(),
  balance: jsonb("balance").notNull(),
  workers: jsonb("workers"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const advisorRecommendations = pgTable("advisor_recommendations", {
  id: serial("id").primaryKey(),
  mining_account_id: integer("mining_account_id").references(() => miningAccounts.id).notNull(),
  recommendation: text("recommendation").notNull(),
  reason: text("reason").notNull(),
  balance_amount: text("balance_amount").notNull(),
  currency: text("currency").notNull(),
  market_data: jsonb("market_data").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  auto_payout: boolean("auto_payout").default(true),
  email_alerts: boolean("email_alerts").default(true),
  ai_advisory: boolean("ai_advisory").default(true),
  dark_mode: boolean("dark_mode").default(true),
});

export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  activity_type: text("activity_type").notNull(),
  description: text("description").notNull(),
  metadata: jsonb("metadata"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertMiningAccountSchema = createInsertSchema(miningAccounts).pick({
  user_id: true,
  api_key: true,
  mining_username: true,
  currency: true,
});

export const insertUserSettingsSchema = createInsertSchema(userSettings).pick({
  user_id: true,
  auto_payout: true,
  email_alerts: true,
  ai_advisory: true,
  dark_mode: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).pick({
  user_id: true,
  activity_type: true,
  description: true,
  metadata: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertMiningAccount = z.infer<typeof insertMiningAccountSchema>;
export type MiningAccount = typeof miningAccounts.$inferSelect;

export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type UserSettings = typeof userSettings.$inferSelect;

export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;
