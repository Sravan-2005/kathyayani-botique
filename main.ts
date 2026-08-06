import express, { type Express, type Request, type Response } from "express";
import { products } from "./src/db/product.js";
import { orders } from "./src/db/order.js";
import { drizzle } from 'drizzle-orm/node-postgres';
import { users } from "./src/db/user.js";
import {addresses} from "./src/db/address.js"
import { eq } from "drizzle-orm";
import 'dotenv/config';
const app: Express = express();
const db = drizzle(process.env.DATABASE_URL!);

app.use(express.json());
//create a product
app.post("/products", async (req: Request, res: Response) => {
  try {
    const {
      category,
      slug,
      title,
      description,
      mrp,
      color,
      fabric,
      variants,
    } = req.body;

    const result = await db
      .insert(products)
      .values({
        category,
        slug,
        title,
        description,
        mrp,
        color,
        fabric,
        variants,
      })
      .returning();

    res.status(201).json({
      message: "Product created successfully",
      data: result,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create product",
    });
  }
});

// getting all the products
app.get("/products", async (req: Request, res: Response) => {
  try {
    const result = await db.select().from(products);

    console.log("Getting all products from the database:", result);

    res.status(200).json({
      message: "Products fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch products",
    });
  }
});

//editing the products
app.put("/products/:slug", async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const {
      category,
      id,
      title,
      description,
      mrp,
      color,
      fabric,
      variants,
    } = req.body;

    const result = await db
      .update(products)
      .set({
        category,
        id,
        title,
        description,
        mrp,
        color,
        fabric,
        variants,
      })
      .where(eq(products.slug,slug))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json({
      message: "Product updated successfully",
      data: result,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update product",
    });
  }
});

// delete the product
app.delete("/products/:slug", async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const result = await db
      .delete(products)
      .where(eq(products.slug,slug))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json({
      message: "Product deleted successfully",
      data: result,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete product",
    });
  }
});

// get a paticular product using slug
app.get("/products/:slug", async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const result = await db
      .select()
      .from(products)
      .where(eq(products.slug, slug));

    if (result.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json({
      message: "Product fetched successfully",
      data: result[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch product",
    });
  }
});

// get all the orders from the order table
app.get("/orders", async (req: Request, res: Response) => {
  try {
    const result = await db.select().from(orders);

    console.log("Getting all orders from the database:", result);

    res.status(200).json({
      message: "orders fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch orders",
    });
  }
});

// create an order
// app.post("/orders", async (req: Request, res: Response) => {
//   try {
//     const {
//       user_id,
//       phoneNumber,
//       email,
//       shipping_address,
//       estimated_delivery,
//       tracking_number
//     } = req.body;

//     const result = await db
//       .insert(orders)
//       .values({
//      user_id,
//       phoneNumber,
//       email,
//       shipping_address,
//       estimated_delivery,
//       tracking_number
//       })
//       .returning();

//     res.status(201).json({
//       message: "order created successfully",
//       data: result,
//     });
//   } catch (error) {
//     console.error(error);

//     res.status(500).json({
//       message: "Failed to create order",
//     });
//   }
// });

//get all the users in the table
app.get("/users", async (req: Request, res: Response) => {
  try {
    const result = await db.select().from(users);

    console.log("Getting all users from the database:", result);

    res.status(200).json({
      message: "Products fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch products",
    });
  }
});

// create an user 
app.post("/users", async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      passwordHash,
      image
    } = req.body;

    const result = await db
      .insert(users)
      .values({
        name,
      email,
      passwordHash,
      image
      })
      .returning();

    res.status(201).json({
      message: "user created successfully",
      data: result,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create user",
    });
  }
});

//  edit an user
app.put("/user/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const {
      name,
      email,
      passwordHash,
      image
    } = req.body;

    const result = await db
      .update(users)
      .set({
        name,
      email,
      passwordHash,
      image
      })
      .where(eq(users.id,id))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({
        message: "user not found",
      });
    }

    res.status(200).json({
      message: "user updated successfully",
      data: result,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update user",
    });
  }
});

// delete an user
app.delete("/user/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await db
      .delete(users)
      .where(eq(users.id,id))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({
        message: "user not found",
      });
    }

    res.status(200).json({
      message: "user deleted successfully",
      data: result,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete user account",
    });
  }
});

// get the details of the user using id
app.get("/user/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, id));

    if (result.length === 0) {
      return res.status(404).json({
        message: "user not found",
      });
    }

    res.status(200).json({
      message: "user fetched successfully",
      data: result[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch product",
    });
  }
});

// get all the addresses of user
app.get("/api/user/:id/addresses", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await db
      .select()
      .from(addresses)
      .where(eq(addresses.userId, id));

    res.status(200).json({
      message: "Addresses fetched successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch addresses",
    });
  }
});

//post an address for the user
app.post("/api/user/:id/addresses", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const {
       userId,
       name,
       phone,
       line1,
       line2,
       city,
       state,
       country,
       pincode
    } = req.body;

    const result = await db
      .insert(addresses)
      .values({
       userId:id,
       name,
       phone,
       line1,
       line2,
       city,
       state,
       country,
       pincode
      })
      .returning();

    res.status(201).json({
      message: "Address created successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create address",
    });
  }
});

// edit the address of an user 
app.put("/api/user/:id/address/:addid", async (req: Request, res: Response) => {
  try {
    const { id, addid } = req.params;

    const {
      userId,
       name,
       phone,
       line1,
       line2,
       city,
       state,
       country,
       pincode
    } = req.body;

    const result = await db
      .update(addresses)
      .set({
        userId,
       name,
       phone,
       line1,
       line2,
       city,
       state,
       country,
       pincode
      })
      .where(
        and(
          eq(addresses.userId, id),
          eq(addresses.id, addid)
        )
      )
      .returning();

    if (result.length === 0) {
      return res.status(404).json({
        message: "Address not found",
      });
    }

    res.status(200).json({
      message: "Address updated successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update address",
    });
  }
});

// delete an address of an user
app.delete("/api/user/:id/address/:addid", async (req: Request, res: Response) => {
  try {
    const { id, addid } = req.params;

    const result = await db
      .delete(addresses)
      .where(
        and(
          eq(addresses.userId, id),
          eq(addresses.id, addid)
        )
      )
      .returning();

    if (result.length === 0) {
      return res.status(404).json({
        message: "Address not found",
      });
    }

    res.status(200).json({
      message: "Address deleted successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete address",
    });
  }
});

// get an paticular address by user id and address id
app.get("/api/user/:id/address/:addid", async (req: Request, res: Response) => {
  try {
    const { id, addid } = req.params;

    const result = await db
      .select()
      .from(addresses)
      .where(
        and(
          eq(addresses.userId, id),
          eq(addresses.id, addid)
        )
      );

    if (result.length === 0) {
      return res.status(404).json({
        message: "Address not found",
      });
    }

    res.status(200).json({
      message: "Address fetched successfully",
      data: result[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch address",
    });
  }
});


app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});

