import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
	addresses: {
		user: r.one.users({
			from: r.addresses.userId,
			to: r.users.id
		}),
	},
	users: {
		addresses: r.many.addresses(),
		carts: r.many.carts(),
		orders: r.many.orders(),
		productsCreatedBy: r.many.products({
			alias: "products_createdBy_users_id"
		}),
		productsViaWishlists: r.many.products({
			alias: "products_id_users_id_via_wishlists"
		}),
	},
	carts: {
		productVariants: r.many.productVariants({
			from: r.carts.id.through(r.cartItems.cartId),
			to: r.productVariants.id.through(r.cartItems.variantId)
		}),
		user: r.one.users({
			from: r.carts.userId,
			to: r.users.id
		}),
	},
	productVariants: {
		carts: r.many.carts(),
		orders: r.many.orders(),
		product: r.one.products({
			from: r.productVariants.productId,
			to: r.products.id
		}),
	},
	orders: {
		productVariants: r.many.productVariants({
			from: r.orders.id.through(r.orderItems.orderId),
			to: r.productVariants.id.through(r.orderItems.variantId)
		}),
		user: r.one.users({
			from: r.orders.userId,
			to: r.users.id
		}),
	},
	products: {
		productVariants: r.many.productVariants(),
		user: r.one.users({
			from: r.products.createdBy,
			to: r.users.id,
			alias: "products_createdBy_users_id"
		}),
		users: r.many.users({
			from: r.products.id.through(r.wishlists.productId),
			to: r.users.id.through(r.wishlists.userId),
			alias: "products_id_users_id_via_wishlists"
		}),
	},
}))