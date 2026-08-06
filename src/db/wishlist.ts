import {
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import { users } from "./user.js";
import { products } from "./product.js"

export const wishlists = pgTable(
  "wishlists",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id").references(() => users.id, {
      onDelete: "cascade",
    }),

    guestSessionId: text("guest_session_id"),

    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, {
        onDelete: "cascade",
      }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    }).defaultNow(),
  },
  (table) => ({
    userProductUnique: unique(
      "wishlists_user_product_unique"
    ).on(table.userId, table.productId),

    guestProductUnique: unique(
      "wishlists_session_product_unique"
    ).on(table.guestSessionId, table.productId),
  })
);