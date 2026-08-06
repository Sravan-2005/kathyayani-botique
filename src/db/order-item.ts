import {
  integer,
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core";

import { orders } from "./order.js";
import { productVariants } from "./product-variant.js";

export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),

  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, {
      onDelete: "cascade",
    }),

  variantId: uuid("variant_id")
    .notNull()
    .references(() => productVariants.id, {
      onDelete: "restrict",
    }),

  quantity: integer("quantity").notNull(),

  unitPrice: integer("unit_price").notNull(),

  productTitle: text("product_title").notNull(),

  size: text("size").notNull(),

  sku: text("sku").notNull(),
});