import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { users } from "./user.js";
import { categoryEnum, productStatusEnum,productSizeEnum} from "./enums.js";

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),

  category: categoryEnum("category"),

  title: text("title").notNull(),

  slug: text("slug").notNull().unique(),

  description: text("description")
    .notNull()
    .default(""),

  mrp: integer("mrp").notNull(),

  color: text("color")
    .notNull()
    .default(""),

  fabric: text("fabric")
    .notNull()
    .default(""),

  careInstructions: text("care_instructions")
    .array()
    .notNull()
    .default([
      "it is so delicate so, wash with care",
    ]),

  images: text("images")
    .array()
    .notNull()
    .default([]),

  status: productStatusEnum("status")
    .notNull()
    .default("draft"),

  isShownOnWebsite: boolean("is_shown_on_website")
    .notNull()
    .default(false),

  /**
   * Your DBML stores variants as text.
   * Keeping it exactly as defined.
   */
  variants: productSizeEnum("variants"),

  createdBy: uuid("created_by").references(
    () => users.id,
    {
      onDelete: "set null",
    }
  ),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  }).defaultNow(),

  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  }).defaultNow(),
});