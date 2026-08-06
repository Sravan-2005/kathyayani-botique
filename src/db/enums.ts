import { pgEnum } from "drizzle-orm/pg-core";

export const productStatusEnum = pgEnum("product_status", [
  "draft",
  "active",
  "archived",
]);

export const productSizeEnum = pgEnum("product_size", [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "3XL",
  "custom",
]);

export const roleEnum = pgEnum("role", [
  "admin",
  "customer",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
]);

export const categoryEnum = pgEnum("category", [
  "women",
  "men",
  "kids",
  "unisex",
]);