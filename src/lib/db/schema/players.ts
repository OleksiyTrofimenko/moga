import { pgTable, serial, varchar, text, timestamp } from "drizzle-orm/pg-core";

export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
