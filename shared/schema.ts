import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const lambCalculations = pgTable("lamb_calculations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  people: integer("people").notNull(),
  hungerLevel: text("hunger_level").notNull(),
  totalWeight: decimal("total_weight", { precision: 5, scale: 2 }).notNull(),
  recommendations: text("recommendations").notNull(), // JSON string of cut recommendations
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertLambCalculationSchema = createInsertSchema(lambCalculations).pick({
  people: true,
  hungerLevel: true,
  totalWeight: true,
  recommendations: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LambCalculation = typeof lambCalculations.$inferSelect;
export type InsertLambCalculation = z.infer<typeof insertLambCalculationSchema>;

// Calculation types
export interface LambCut {
  name: string;
  amount: string;
  icon: string;
}

export interface CalculationResult {
  totalWeight: string;
  totalDescription: string;
  cuts: LambCut[];
  servingTips: string[];
}

export interface CalculationRequest {
  people: number;
  hungerLevel: 'snacky' | 'hungry' | 'starving';
}
