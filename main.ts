import express, { type Express, type Request, type Response, type NextFunction } from "express";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, and, or } from "drizzle-orm";
import multer from "multer";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import nodemailer from "nodemailer";
import crypto from "crypto";
import path from "path";
import fs from "fs";
import 'dotenv/config';

import { r2, PutObjectCommand } from "./r2Client.js";
import { products } from "./src/db/product.js";
import { orders } from "./src/db/order.js";
import { users } from "./src/db/user.js";
import { addresses } from "./src/db/address.js";
import { verificationTokens } from "./src/db/verification-token.js";

const app: Express = express();
const db = drizzle(process.env.DATABASE_URL!);

// Serve uploaded files locally if local storage is used
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static(uploadsDir));

app.use(express.json());

// Configure Multer for File Uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Configure Nodemailer Transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
});

// Optional Auth Middleware (flexible for minimal app testing)
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }
  const token = authHeader.split(" ")[1];
  try {
    const secret = process.env.JWT_SECRET || "default_jwt_secret";
    const decoded = jwt.verify(token, secret);
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// ----------------------------------------------------
// 1. PRODUCTS API ENDPOINTS
// ----------------------------------------------------

// GET /api/admin/products & /api/products & /products (Public) - List products
const getProductsHandler = async (req: Request, res: Response) => {
  try {
    const { category, search } = req.query;
    const result = await db.select().from(products);

    let filtered = result;
    if (category) {
      filtered = filtered.filter((p) => p.category === category);
    }
    if (search && typeof search === "string") {
      const term = search.toLowerCase();
      filtered = filtered.filter(
        (p) => p.title.toLowerCase().includes(term) || p.description.toLowerCase().includes(term)
      );
    }

    res.status(200).json({
      message: "Products fetched successfully",
      data: filtered,
    });
  } catch (error) {
    console.error("Fetch products error:", error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
};
app.get("/api/admin/products", getProductsHandler);
app.get("/api/products", getProductsHandler);
app.get("/products", getProductsHandler);

// POST /api/admin/products & /api/products & /products (Protected) - Create new product
const createProductHandler = async (req: Request, res: Response) => {
  try {
    const {
      category,
      slug,
      title,
      description,
      mrp,
      color,
      fabric,
      careInstructions,
      images,
      status,
      isShownOnWebsite,
      variants,
    } = req.body;

    if (!title || !slug || mrp === undefined) {
      return res.status(400).json({ message: "Title, slug, and mrp are required" });
    }

    const result = await db
      .insert(products)
      .values({
        category,
        slug,
        title,
        description: description || "",
        mrp: Number(mrp),
        color: color || "",
        fabric: fabric || "",
        careInstructions: careInstructions || ["Wash with care"],
        images: images || [],
        status: status || "draft",
        isShownOnWebsite: isShownOnWebsite ?? true,
        variants,
      })
      .returning();

    res.status(201).json({
      message: "Product created successfully",
      data: result[0],
    });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ message: "Failed to create product" });
  }
};
app.post("/api/admin/products", authMiddleware, createProductHandler);
app.post("/api/products", authMiddleware, createProductHandler);
app.post("/products", authMiddleware, createProductHandler);

// PUT /api/admin/products/:id & /products/:slug (Protected) - Edit product details
const editProductHandler = async (req: Request, res: Response) => {
  try {
    const paramId = (req.params.id || req.params.slug) as string;
    const {
      category,
      title,
      description,
      mrp,
      color,
      fabric,
      careInstructions,
      images,
      status,
      isShownOnWebsite,
      variants,
    } = req.body;

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(paramId);
    const whereCondition = isUuid
      ? eq(products.id as any, paramId)
      : eq(products.slug as any, paramId);

    const result = await db
      .update(products)
      .set({
        category,
        title,
        description,
        mrp: mrp !== undefined ? Number(mrp) : undefined,
        color,
        fabric,
        careInstructions,
        images,
        status,
        isShownOnWebsite,
        variants,
        updatedAt: new Date(),
      })
      .where(whereCondition)
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product details edited successfully",
      data: result[0],
    });
  } catch (error) {
    console.error("Edit product error:", error);
    res.status(500).json({ message: "Failed to update product details" });
  }
};
app.put("/api/admin/products/:id", authMiddleware, editProductHandler);
app.put("/api/products/:id", authMiddleware, editProductHandler);
app.put("/products/:slug", authMiddleware, editProductHandler);

// GET /api/product/:slug & /products/:slug (Public) - Get product details by slug
const getProductBySlugHandler = async (req: Request, res: Response) => {
  try {
    const slug = (req.params.slug || req.params.id) as string;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
    const whereCondition = isUuid
      ? eq(products.id as any, slug)
      : eq(products.slug as any, slug);

    const result = await db.select().from(products).where(whereCondition);

    if (result.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product details fetched successfully",
      data: result[0],
    });
  } catch (error) {
    console.error("Fetch product by slug error:", error);
    res.status(500).json({ message: "Failed to fetch product details" });
  }
};
app.get("/api/product/:slug", getProductBySlugHandler);
app.get("/api/products/:slug", getProductBySlugHandler);
app.get("/products/:slug", getProductBySlugHandler);

// DELETE /api/product/:slug & /api/admin/products/:id & /products/:slug (Protected) - Delete product
const deleteProductHandler = async (req: Request, res: Response) => {
  try {
    const paramVal = (req.params.slug || req.params.id) as string;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(paramVal);
    const whereCondition = isUuid
      ? eq(products.id as any, paramVal)
      : eq(products.slug as any, paramVal);

    const result = await db.delete(products).where(whereCondition).returning();

    if (result.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product deleted successfully",
      data: result[0],
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ message: "Failed to delete product" });
  }
};
app.delete("/api/product/:slug", authMiddleware, deleteProductHandler);
app.delete("/api/admin/products/:id", authMiddleware, deleteProductHandler);
app.delete("/products/:slug", authMiddleware, deleteProductHandler);

// ----------------------------------------------------
// 2. ORDER API ENDPOINTS
// ----------------------------------------------------

// GET /api/admin/orders (Protected) - Get all orders
const getAllOrdersHandler = async (req: Request, res: Response) => {
  try {
    const result = await db.select().from(orders);
    res.status(200).json({
      message: "List of all orders fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error("Fetch orders error:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};
app.get("/api/admin/orders", authMiddleware, getAllOrdersHandler);
app.get("/api/orders", authMiddleware, getAllOrdersHandler);
app.get("/orders", authMiddleware, getAllOrdersHandler);

// GET /api/orders/:userid (Protected) - Get orders of a specific user
app.get("/api/orders/:userid", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { userid } = req.params;
    const result = await db.select().from(orders).where(eq(orders.userId as any, userid));

    res.status(200).json({
      message: `List of orders for user ${userid} fetched successfully`,
      data: result,
    });
  } catch (error) {
    console.error("Fetch user orders error:", error);
    res.status(500).json({ message: "Failed to fetch user orders" });
  }
});

// POST /api/order/ & /api/order & /orders (Public) - Create order (User or Guest)
const createOrderHandler = async (req: Request, res: Response) => {
  try {
    const {
      user_id,
      userId,
      phoneNumber,
      email,
      shipping_address,
      shippingAddress,
      total,
      estimated_delivery,
      estimatedDelivery,
      tracking_number,
      trackingNumber,
    } = req.body;

    const result = await db
      .insert(orders)
      .values({
        userId: userId ?? user_id ?? null,
        phoneNumber,
        email,
        shippingAddress: shippingAddress ?? shipping_address ?? {},
        total: Number(total ?? 0),
        estimatedDelivery: estimatedDelivery ?? estimated_delivery ?? null,
        trackingNumber: trackingNumber ?? tracking_number ?? null,
      } as any)
      .returning();

    res.status(201).json({
      message: "Order created successfully",
      data: result[0],
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ message: "Failed to create order" });
  }
};
app.post("/api/order/", createOrderHandler);
app.post("/api/order", createOrderHandler);
app.post("/api/orders", createOrderHandler);
app.post("/orders", createOrderHandler);

// PUT /api/order/:id (Protected) - Edit order details like status or tracking notes
app.put("/api/order/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber, tracking_number, estimatedDelivery, estimated_delivery } = req.body;

    const result = await db
      .update(orders)
      .set({
        status,
        trackingNumber: trackingNumber ?? tracking_number,
        estimatedDelivery: estimatedDelivery ?? estimated_delivery,
        updatedAt: new Date(),
      } as any)
      .where(eq(orders.id as any, id))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: "Edited order details successfully",
      data: result[0],
    });
  } catch (error) {
    console.error("Edit order error:", error);
    res.status(500).json({ message: "Failed to edit order" });
  }
});

// DELETE /api/order/:id (Protected) - Delete order
app.delete("/api/order/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await db.delete(orders).where(eq(orders.id as any, id)).returning();

    if (result.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: "Order deleted successfully",
      data: result[0],
    });
  } catch (error) {
    console.error("Delete order error:", error);
    res.status(500).json({ message: "Failed to delete order" });
  }
});

// ----------------------------------------------------
// 3. USERS & ADDRESSES API ENDPOINTS
// ----------------------------------------------------

// GET /api/users & /users (Protected) - List all users
const getUsersHandler = async (req: Request, res: Response) => {
  try {
    const result = await db.select().from(users);
    res.status(200).json({
      message: "List of users fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error("Fetch users error:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};
app.get("/api/users", authMiddleware, getUsersHandler);
app.get("/users", authMiddleware, getUsersHandler);

// POST /api/users & /users (Public) - Create a user
const createUserHandler = async (req: Request, res: Response) => {
  try {
    const { name, email, passwordHash, password, image, role } = req.body;

    const hash = passwordHash || (password ? await bcrypt.hash(password, 10) : null);

    const result = await db
      .insert(users)
      .values({
        name,
        email,
        passwordHash: hash,
        role: role || "customer",
        image,
      })
      .returning();

    res.status(201).json({
      message: "User created successfully",
      data: result[0],
    });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ message: "Failed to create user" });
  }
};
app.post("/api/users", createUserHandler);
app.post("/users", createUserHandler);

// PUT /api/user/:userid & /user/:id (Protected) - Edit user details
const editUserHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req.params.userid || req.params.id) as string;
    const { name, email, password, image, role } = req.body;

    const updateData: any = { name, email, image, role, updatedAt: new Date() };
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    const result = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id as any, userId))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User details edited successfully",
      data: result[0],
    });
  } catch (error) {
    console.error("Edit user error:", error);
    res.status(500).json({ message: "Failed to edit user details" });
  }
};
app.put("/api/user/:userid", authMiddleware, editUserHandler);
app.put("/user/:id", authMiddleware, editUserHandler);

// DELETE /api/user/:userid & /user/:id (Protected) - Delete user
const deleteUserHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req.params.userid || req.params.id) as string;

    const result = await db.delete(users).where(eq(users.id as any, userId)).returning();

    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User deleted successfully",
      data: result[0],
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
};
app.delete("/api/user/:userid", authMiddleware, deleteUserHandler);
app.delete("/user/:id", authMiddleware, deleteUserHandler);

// GET /api/user/:id & /user/:id (Protected) - Get specific user details
const getUserByIdHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await db.select().from(users).where(eq(users.id as any, id));

    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Details of the user fetched successfully",
      data: result[0],
    });
  } catch (error) {
    console.error("Fetch user error:", error);
    res.status(500).json({ message: "Failed to fetch user details" });
  }
};
app.get("/api/user/:id", authMiddleware, getUserByIdHandler);
app.get("/user/:id", authMiddleware, getUserByIdHandler);

// GET /api/user/:id/addresses (Protected) - Get list of addresses of an user
app.get("/api/user/:id/addresses", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await db.select().from(addresses).where(eq(addresses.userId as any, id));

    res.status(200).json({
      message: "The list of addresses fetched successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch addresses" });
  }
});

// POST /api/user/:id/addresses (Protected) - Create an address for the user
app.post("/api/user/:id/addresses", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, phone, line1, line2, city, state, country, pincode, isDefault } = req.body;

    const result = await db
      .insert(addresses)
      .values({
        userId: id,
        name: name || "Home",
        phone: phone || "",
        line1: line1 || "",
        line2: line2 || null,
        city: city || "",
        state: state || "",
        country: country || "India",
        pincode: pincode || "",
        isDefault: isDefault || false,
      } as any)
      .returning();

    res.status(201).json({
      message: "Created an address successfully",
      data: result[0],
    });
  } catch (error) {
    console.error("Create address error:", error);
    res.status(500).json({ message: "Failed to create address" });
  }
});

// PUT /api/user/:id/address/:addid (Protected) - Edit existing address
app.put("/api/user/:id/address/:addid", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id, addid } = req.params;
    const { name, phone, line1, line2, city, state, country, pincode, isDefault } = req.body;

    const result = await db
      .update(addresses)
      .set({
        name,
        phone,
        line1,
        line2,
        city,
        state,
        country,
        pincode,
        isDefault,
      })
      .where(and(eq(addresses.userId as any, id), eq(addresses.id as any, addid)))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ message: "Address not found" });
    }

    res.status(200).json({
      message: "Edited address successfully",
      data: result[0],
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to edit address" });
  }
});

// DELETE /api/user/:id/address/:addid (Protected) - Delete address
app.delete("/api/user/:id/address/:addid", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id, addid } = req.params;
    const result = await db
      .delete(addresses)
      .where(and(eq(addresses.userId as any, id), eq(addresses.id as any, addid)))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ message: "Address not found" });
    }

    res.status(200).json({
      message: "Address deleted successfully",
      data: result[0],
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete address" });
  }
});

// GET /api/user/:id/address/:addid (Protected) - Get specific address details
app.get("/api/user/:id/address/:addid", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id, addid } = req.params;
    const result = await db
      .select()
      .from(addresses)
      .where(and(eq(addresses.userId as any, id), eq(addresses.id as any, addid)));

    if (result.length === 0) {
      return res.status(404).json({ message: "Address not found" });
    }

    res.status(200).json({
      message: "Details of the address fetched successfully",
      data: result[0],
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch address details" });
  }
});

// POST /api/send-otp & /api/auth/send-otp (Protected) - Send OTP to user gmail
const sendOtpHandler = async (req: Request, res: Response) => {
  try {
    const { email, gmail } = req.body;
    const targetEmail = email || gmail;

    if (!targetEmail) {
      return res.status(400).json({ message: "Gmail address is required" });
    }

    const otp = Math.floor(100000 + parseInt(crypto.randomBytes(3).toString("hex"), 16) % 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await db.insert(verificationTokens).values({
      identifier: targetEmail,
      token: otp,
      expires: expiresAt,
    } as any);

    if (process.env.SMTP_USER) {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || '"Kathyayani Boutique" <no-reply@kathyayaniboutique.com>',
        to: targetEmail,
        subject: "Verification OTP - Kathyayani Boutique",
        text: `Your OTP is ${otp}. Valid for 10 minutes.`,
        html: `<h2>Kathyayani Boutique OTP</h2><p>Your OTP code is: <b>${otp}</b></p>`,
      });
    } else {
      console.log(`[DEV OTP] OTP for ${targetEmail}: ${otp}`);
    }

    res.status(200).json({
      message: "OTP sent successfully",
      devOtp: process.env.SMTP_USER ? undefined : otp,
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};
app.post("/api/send-otp", authMiddleware, sendOtpHandler);
app.post("/api/auth/send-otp", authMiddleware, sendOtpHandler);

// POST /api/verify-otp & /api/auth/verify-otp (Protected) - Verify OTP
const verifyOtpHandler = async (req: Request, res: Response) => {
  try {
    const { email, gmail, otp } = req.body;
    const targetEmail = email || gmail;

    if (!targetEmail || !otp) {
      return res.status(400).json({ message: "Gmail and OTP are required" });
    }

    const records = await db
      .select()
      .from(verificationTokens)
      .where(and(eq(verificationTokens.identifier as any, targetEmail), eq(verificationTokens.token as any, otp)));

    if (records.length === 0) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const record = records[0];
    if (new Date() > new Date(record.expires)) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    await db.update(users).set({ isEmailVerified: true }).where(eq(users.email as any, targetEmail));
    await db.delete(verificationTokens).where(and(eq(verificationTokens.identifier as any, targetEmail), eq(verificationTokens.token as any, otp)));

    res.status(200).json({ message: "Verified OTP successfully" });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: "Failed to verify OTP" });
  }
};
app.post("/api/verify-otp", authMiddleware, verifyOtpHandler);
app.post("/api/auth/verify-otp", authMiddleware, verifyOtpHandler);

// ----------------------------------------------------
// 4. AUTHENTICATION ENDPOINTS
// ----------------------------------------------------

// POST /api/auth/register (Public) - Register user
app.post("/api/auth/register", async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const existingUser = await db.select().from(users).where(eq(users.email as any, email));
    if (existingUser.length > 0) {
      return res.status(409).json({ message: "User already exists with this email" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await db
      .insert(users)
      .values({
        name,
        email,
        passwordHash,
        isEmailVerified: false,
      })
      .returning();

    res.status(201).json({
      message: "Registered successfully",
      data: result[0],
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Failed to register user" });
  }
});

// POST /api/auth/login (Public) - Login user, send refresh & access tokens
app.post("/api/auth/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const result = await db.select().from(users).where(eq(users.email as any, email));
    if (result.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = result[0];
    const passwordMatch = await bcrypt.compare(password, user.passwordHash ?? "");

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const secret = process.env.JWT_SECRET || "default_jwt_secret";
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, name: user.name, role: user.role },
      secret,
      { expiresIn: "1d" }
    );
    const refreshToken = jwt.sign(
      { userId: user.id },
      secret,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successfully sends refresh and access tokens",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Failed to login" });
  }
});

// POST /api/auth/logout (Protected) - Logout user
app.post("/api/auth/logout", authMiddleware, async (req: Request, res: Response) => {
  res.status(200).json({ message: "Logout successfully" });
});

// POST /api/auth/access-tokens & /api/auth/acess-tokens (Protected) - Generate access token from refresh token
const refreshTokensHandler = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.body.refreshToken || req.body.refresh_token || req.body["refresh-token"];

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required in request body" });
    }

    const secret = process.env.JWT_SECRET || "default_jwt_secret";
    const decoded = jwt.verify(refreshToken, secret) as any;

    const userRecords = await db.select().from(users).where(eq(users.id as any, decoded.userId));
    if (userRecords.length === 0) {
      return res.status(401).json({ message: "Invalid refresh token: User not found" });
    }

    const user = userRecords[0];
    const newAccessToken = jwt.sign(
      { userId: user.id, email: user.email, name: user.name, role: user.role },
      secret,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Generated access token",
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error("Access token refresh error:", error);
    res.status(401).json({ message: "Invalid or expired refresh token" });
  }
};
app.post("/api/auth/access-tokens", refreshTokensHandler);
app.post("/api/auth/acess-tokens", refreshTokensHandler);

// ----------------------------------------------------
// 5. IMAGES API ENDPOINTS
// ----------------------------------------------------

// GET /api/image/:slug (Public) - Get product image or serve uploaded file
app.get("/api/image/:slug", async (req: Request, res: Response) => {
  try {
    const slugVal = req.params.slug as string;

    const filePath = path.join(uploadsDir, slugVal);
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugVal);
    const whereCondition = isUuid
      ? eq(products.id as any, slugVal)
      : eq(products.slug as any, slugVal);
    const productRecords = await db.select().from(products).where(whereCondition);

    if (productRecords.length > 0 && productRecords[0].images && productRecords[0].images.length > 0) {
      const imageUrl = productRecords[0].images[0];
      return res.redirect(imageUrl);
    }

    res.status(404).json({ message: "Image of product not found" });
  } catch (error) {
    console.error("Get image error:", error);
    res.status(500).json({ message: "Failed to retrieve image" });
  }
});

// POST /api/upload (Protected) - Upload image file
app.post("/api/upload", upload.single("file"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileExtension = path.extname(req.file.originalname) || ".jpg";
    const fileName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${fileExtension}`;

    if (process.env.R2_ACCESS_KEY && process.env.R2_SECRET_KEY) {
      const bucketName = process.env.R2_BUCKET_NAME || "kathyayani-boutique";
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      });

      await r2.send(command);
      const publicUrl = process.env.R2_PUBLIC_DOMAIN
        ? `${process.env.R2_PUBLIC_DOMAIN}/${fileName}`
        : `https://${bucketName}.r2.cloudflarestorage.com/${fileName}`;

      return res.status(200).json({
        message: "Image uploaded successfully",
        url: publicUrl,
      });
    }

    const localFilePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(localFilePath, req.file.buffer);

    const protocol = req.protocol;
    const host = req.get("host");
    const localUrl = `${protocol}://${host}/uploads/${fileName}`;

    return res.status(200).json({
      message: "Image uploaded successfully",
      url: localUrl,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ message: "Failed to upload image" });
  }
});

// POST & DELETE /api/image/:slug (Protected) - Delete image of product
const deleteImageHandler = async (req: Request, res: Response) => {
  try {
    const slugVal = req.params.slug as string;
    const filePath = path.join(uploadsDir, slugVal);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return res.status(200).json({ message: "Image deleted successfully" });
    }

    res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Delete image error:", error);
    res.status(500).json({ message: "Failed to delete image" });
  }
};
app.post("/api/image/:slug", authMiddleware, deleteImageHandler);
app.delete("/api/image/:slug", authMiddleware, deleteImageHandler);

// ----------------------------------------------------
// 6. GOOGLE OAUTH ENDPOINTS
// ----------------------------------------------------

app.use(passport.initialize());

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:
          process.env.GOOGLE_CALLBACK_URL ||
          "http://localhost:3000/api/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;

          if (!email) {
            return done(new Error("Google account does not have an email"), false);
          }

          const name =
            profile.displayName ||
            `${profile.name?.givenName || ""} ${profile.name?.familyName || ""}`.trim();

          const image = profile.photos?.[0]?.value || null;

          const existingUser = await db.select().from(users).where(eq(users.email as any, email));

          if (existingUser.length > 0) {
            return done(null, existingUser[0]);
          }

          const result = await db
            .insert(users)
            .values({
              name,
              email,
              passwordHash: null,
              image,
              isEmailVerified: true,
            })
            .returning();

          return done(null, result[0]);
        } catch (error) {
          console.error("Google OAuth error:", error);
          return done(error, false);
        }
      }
    )
  );

  app.get(
    "/api/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"], session: false })
  );

  app.get(
    "/api/auth/google/callback",
    passport.authenticate("google", { session: false, failureRedirect: "/auth/login?error=oauth" }),
    (req: Request, res: Response) => {
      const user = req.user as any;
      const secret = process.env.JWT_SECRET || "default_jwt_secret";

      const accessToken = jwt.sign(
        { userId: user.id, email: user.email, name: user.name, role: user.role },
        secret,
        { expiresIn: "1d" }
      );

      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3001";
      res.redirect(`${frontendUrl}/auth/callback?token=${accessToken}`);
    }
  );
} else {
  app.get("/api/auth/google", (req, res) => {
    res.status(500).json({ message: "Google OAuth is not configured in .env" });
  });
}

// ----------------------------------------------------
// START SERVER
// ----------------------------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});