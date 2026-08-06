import {
  boolean,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { users } from "./user.js";

export const addresses = pgTable("addresses", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),

  name: text("name").notNull(),

  phone: text("phone").notNull(),

  line1: text("line1").notNull(),

  line2: text("line2"),

  city: text("city").notNull(),

  state: text("state").notNull(),

  country: text("country"),

  pincode: text("pincode").notNull(),

  isDefault: boolean("is_default")
    .notNull()
    .default(false),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  }).defaultNow(),
});