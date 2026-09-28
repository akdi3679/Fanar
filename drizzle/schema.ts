import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const briefs = pgTable("briefs", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 254 }).notNull(),
  phone: varchar("phone", { length: 30 }),
  businessName: varchar("business_name", { length: 200 }),
  businessType: varchar("business_type", { length: 100 }),
  oldWebsite: varchar("old_website", { length: 500 }),
  business: text("business").notNull(),
  goal: varchar("goal", { length: 500 }),
  timeline: varchar("timeline", { length: 100 }),
  trigger: text("trigger"),
  budget: varchar("budget", { length: 50 }),
  language: varchar("language", { length: 10 }).notNull(),
  country: varchar("country", { length: 10 }).notNull(),
  ip: varchar("ip", { length: 45 }).notNull(),
  userAgent: text("user_agent"),
  audioTranscript: text("audio_transcript"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const visitors = pgTable("visitors", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  ip: varchar("ip", { length: 45 }).notNull(),
  country: varchar("country", { length: 10 }).notNull(),
  language: varchar("language", { length: 10 }).notNull(),
  page: varchar("page", { length: 500 }).notNull(),
  referrer: text("referrer"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});