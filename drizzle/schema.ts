import { pgEnum, pgTable, uuid, text, timestamp, integer, jsonb, date, boolean, foreignKey, primaryKey, unique } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const category = pgEnum("category", ["women", "men", "kids", "unisex"])
export const orderStatus = pgEnum("order_status", ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"])
export const productSize = pgEnum("product_size", ["XS", "S", "M", "L", "XL", "XXL", "3XL", "custom"])
export const productStatus = pgEnum("product_status", ["draft", "active", "archived"])
export const role = pgEnum("role", ["admin", "customer"])


export const addresses = pgTable("addresses", {
	id: uuid().defaultRandom().primaryKey(),
	userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	name: text().notNull(),
	phone: text().notNull(),
	line1: text().notNull(),
	line2: text(),
	city: text().notNull(),
	state: text().notNull(),
	country: text(),
	pincode: text().notNull(),
	isDefault: boolean("is_default").default(false).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
});

export const cartItems = pgTable("cart_items", {
	id: uuid().defaultRandom().primaryKey(),
	cartId: uuid("cart_id").notNull().references(() => carts.id, { onDelete: "cascade" } ),
	variantId: uuid("variant_id").notNull().references(() => productVariants.id, { onDelete: "cascade" } ),
	quantity: integer().default(1).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
	updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`now()`),
}, (table) => [
	unique("cart_items_cart_variant_unique").on(table.cartId, table.variantId),]);

export const carts = pgTable("carts", {
	id: uuid().defaultRandom().primaryKey(),
	userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" } ),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
	updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`now()`),
}, (table) => [
	unique("carts_user_id_key").on(table.userId),]);

export const orderItems = pgTable("order_items", {
	id: uuid().defaultRandom().primaryKey(),
	orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" } ),
	variantId: uuid("variant_id").notNull().references(() => productVariants.id, { onDelete: "restrict" } ),
	quantity: integer().notNull(),
	unitPrice: integer("unit_price").notNull(),
	productTitle: text("product_title").notNull(),
	size: text().notNull(),
	sku: text().notNull(),
});

export const orders = pgTable("orders", {
	id: uuid().defaultRandom().primaryKey(),
	userId: uuid("user_id").references(() => users.id, { onDelete: "set null" } ),
	phoneNumber: text("phone_number"),
	email: text(),
	status: orderStatus().default("pending").notNull(),
	shippingAddress: jsonb("shipping_address").notNull(),
	total: integer().notNull(),
	estimatedDelivery: date("estimated_delivery"),
	trackingNumber: text("tracking_number"),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
	updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`now()`),
});

export const productVariants = pgTable("product_variants", {
	id: uuid().defaultRandom().primaryKey(),
	productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" } ),
	size: productSize().notNull(),
	sku: text().notNull(),
	stock: integer().default(0).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
	updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`now()`),
}, (table) => [
	unique("product_variants_sku_key").on(table.sku),]);

export const products = pgTable("products", {
	id: uuid().defaultRandom().primaryKey(),
	title: text().notNull(),
	slug: text().notNull(),
	description: text().default("").notNull(),
	mrp: integer().notNull(),
	color: text().default("").notNull(),
	fabric: text().default("").notNull(),
	careInstructions: text("care_instructions").array().default(["it is so delicate so, wash with care"]).notNull(),
	status: productStatus().default("draft").notNull(),
	isShownOnWebsite: boolean("is_shown_on_website").default(false).notNull(),
	variants: text(),
	createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" } ),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
	updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`now()`),
	category: category(),
}, (table) => [
	unique("products_slug_key").on(table.slug),]);

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey(),
	name: text(),
	email: text().notNull(),
	passwordHash: text("password_hash"),
	role: role().default("customer").notNull(),
	image: text(),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
	updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`now()`),
}, (table) => [
	unique("users_email_key").on(table.email),]);

export const verificationTokens = pgTable("verification_tokens", {
	identifier: text().notNull(),
	token: text().notNull(),
	expires: timestamp({ withTimezone: true }).notNull(),
}, (table) => [
	primaryKey({ columns: [table.identifier, table.token], name: "verification_tokens_pkey"}),
]);

export const wishlists = pgTable("wishlists", {
	id: uuid().defaultRandom().primaryKey(),
	userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" } ),
	guestSessionId: text("guest_session_id"),
	productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" } ),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
}, (table) => [
	unique("wishlists_session_product_unique").on(table.guestSessionId, table.productId),	unique("wishlists_user_product_unique").on(table.userId, table.productId),]);
