import {
  date,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { users } from "./user.js";
import { orderStatusEnum } from "./enums.js";

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id").references(() => users.id, {
    onDelete: "set null",
  }),

  phoneNumber: text("phone_number"),

  email: text("email"),

  status: orderStatusEnum("status")
    .notNull()
    .default("pending"),

  shippingAddress: jsonb("shipping_address").notNull(),

  total: integer("total").notNull(),

  estimatedDelivery: date("estimated_delivery"),

  trackingNumber: text("tracking_number"),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  }).defaultNow(),

  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  }).defaultNow(),
});