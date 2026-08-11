"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchProducts, deleteProduct, Product } from "@/lib/api";
import Link from "next/link";
import {
  Sparkles,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Tag,
  Palette,
  Layers,
  ArrowRight,
} from "lucide-react";

const CATEGORIES = ["all", "women", "men", "kids", "unisex"];

export default function HomePage() {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: products = [], isLoading, isError } = useQuery({
    queryKey: ["products", selectedCategory, searchTerm],
    queryFn: () => fetchProducts(selectedCategory, searchTerm),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const handleDelete = async (slug: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteMutation.mutate(slug);
    }
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-r from-rose-950 via-rose-900 to-pink-950 text-white py-20 px-4 sm:px-6 lg:px-8 shadow-xl">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 bg-rose-800/60 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider text-rose-200 border border-rose-700/50 uppercase">
            <Sparkles className="w-3.5 h-3.5" /> Luxury Boutique Apparel
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-white leading-tight">
            Kathyayani Couture Collection
          </h1>
          <p className="text-rose-100/80 max-w-2xl mx-auto text-base sm:text-lg font-light leading-relaxed">
            Discover artisan-crafted ethnic & modern luxury wear designed for timeless elegance. Upload, customize, and manage products effortlessly.
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <Link
              href="/products/create"
              className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-medium px-6 py-3 rounded-full shadow-lg hover:shadow-rose-500/25 transition-all"
            >
              <Plus className="w-4 h-4" /> Add New Product
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Search & Category Filter Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-rose-100 shadow-sm">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`capitalize text-xs sm:text-sm font-medium px-4 py-2 rounded-full transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="bg-white rounded-2xl p-4 border border-gray-100 space-y-3 animate-pulse"
              >
                <div className="w-full h-64 bg-gray-200 rounded-xl"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-rose-100">
            <p className="text-rose-600 font-medium">Failed to load products from server.</p>
            <p className="text-xs text-gray-500 mt-1">Please ensure Express backend server is running on http://localhost:3000</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300 space-y-4">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
              <Tag className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-serif font-bold text-gray-900">No products found</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              Get started by adding your first luxury boutique item with images.
            </p>
            <Link
              href="/products/create"
              className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium px-5 py-2.5 rounded-full shadow transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Product Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const displayImage =
                product.images && product.images.length > 0
                  ? product.images[0]
                  : "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800";

              return (
                <div
                  key={product.id}
                  className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Image Container */}
                    <div className="relative w-full h-72 bg-gray-100 overflow-hidden">
                      <img
                        src={displayImage}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {product.category && (
                        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-gray-900 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                          {product.category}
                        </span>
                      )}
                      <span className="absolute top-3 right-3 bg-rose-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
                        ₹{product.mrp?.toLocaleString("en-IN")}
                      </span>
                    </div>

                    {/* Content Details */}
                    <div className="p-5 space-y-2">
                      <h3 className="font-serif text-lg font-bold text-gray-900 group-hover:text-rose-600 transition-colors line-clamp-1">
                        {product.title}
                      </h3>

                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {product.description || "Fine handcrafted boutique apparel."}
                      </p>

                      <div className="pt-2 flex items-center justify-between text-xs text-gray-600 border-t border-gray-50">
                        {product.fabric && (
                          <span className="flex items-center gap-1">
                            <Layers className="w-3.5 h-3.5 text-rose-500" />
                            {product.fabric}
                          </span>
                        )}
                        {product.color && (
                          <span className="flex items-center gap-1">
                            <Palette className="w-3.5 h-3.5 text-pink-500" />
                            {product.color}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-4 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between gap-2">
                    <Link
                      href={`/products/${product.slug}`}
                      className="flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-rose-600 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </Link>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/products/${product.slug}/edit`}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Product (Full Page)"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(product.slug, product.title)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
