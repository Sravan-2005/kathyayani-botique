import axios from "axios";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface Product {
  id: string;
  category?: string;
  title: string;
  slug: string;
  description: string;
  mrp: number;
  color: string;
  fabric: string;
  careInstructions: string[];
  images: string[];
  status: string;
  isShownOnWebsite: boolean;
  variants?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string;
  isEmailVerified?: boolean;
}

// API Functions
export const fetchProducts = async (category?: string, search?: string): Promise<Product[]> => {
  const params: Record<string, string> = {};
  if (category && category !== "all") params.category = category;
  if (search) params.search = search;

  const response = await api.get("/products", { params });
  return response.data.data;
};

export const fetchProductBySlug = async (slug: string): Promise<Product> => {
  const response = await api.get(`/products/${slug}`);
  return response.data.data;
};

export const createProduct = async (productData: Partial<Product>): Promise<Product> => {
  const response = await api.post("/products", productData);
  return response.data.data;
};

export const updateProduct = async ({ slug, data }: { slug: string; data: Partial<Product> }): Promise<Product> => {
  const response = await api.put(`/products/${slug}`, data);
  return response.data.data;
};

export const deleteProduct = async (slug: string): Promise<void> => {
  await api.delete(`/products/${slug}`);
};

export const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post(`${API_BASE_URL}/api/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.url;
};

export const sendOtp = async (email: string): Promise<{ message: string; devOtp?: string }> => {
  const response = await api.post("/api/auth/send-otp", { email });
  return response.data;
};

export const verifyOtp = async (email: string, otp: string): Promise<{ message: string }> => {
  const response = await api.post("/api/auth/verify-otp", { email, otp });
  return response.data;
};

export const registerUser = async (name: string, email: string, password: string): Promise<{ message: string; data: User }> => {
  const response = await api.post("/api/auth/register", { name, email, password });
  return response.data;
};

export const loginUser = async (email: string, password: string): Promise<{ message: string; accessToken: string; user: User }> => {
  const response = await api.post("/api/auth/login", { email, password });
  return response.data;
};
