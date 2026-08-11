"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { fetchProductBySlug } from "@/lib/api";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  Tag,
  Palette,
  Layers,
  ShieldCheck,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useState } from "react";

export default function ProductDetailPage() {
  const params = useParams();
  const slugParam = params?.slug as string;

  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ["product", slugParam],
    queryFn: () => fetchProductBySlug(slugParam),
    enabled: !!slugParam,
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
        <p className="text-sm font-medium text-gray-600">Loading product details...</p>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-serif font-bold text-gray-900">Product Not Found</h2>
        <p className="text-sm text-gray-500">The product you are looking for does not exist.</p>
        <Link href="/" className="inline-block text-rose-600 text-sm font-semibold hover:underline">
          Return to Collection
        </Link>
      </div>
    );
  }

  const allImages =
    product.images && product.images.length > 0
      ? product.images
      : ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800"];

  const currentImage = selectedImg || allImages[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-rose-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Collection
        </Link>

        <Link
          href={`/products/${product.slug}/edit`}
          className="inline-flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 text-xs font-semibold px-4 py-2 rounded-full transition-colors"
        >
          <Edit className="w-3.5 h-3.5" /> Edit Product
        </Link>
      </div>

      {/* Product View Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
        {/* Left Column: Image Gallery */}
        <div className="space-y-4">
          <div className="relative w-full h-[450px] bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
            <img src={currentImage} alt={product.title} className="w-full h-full object-cover" />
          </div>

          {allImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImg(img)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                    currentImage === img ? "border-rose-500 shadow-md" : "border-gray-200 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Specs & Info */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="bg-rose-50 text-rose-600 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-rose-100">
                {product.category || "Boutique Collection"}
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
              {product.title}
            </h1>

            <div className="text-3xl font-bold text-rose-600">
              ₹{product.mrp?.toLocaleString("en-IN")}
            </div>

            <p className="text-sm text-gray-600 leading-relaxed pt-2 border-t border-gray-100">
              {product.description || "Handcrafted designer boutique apparel with delicate finish."}
            </p>

            <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-100">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-pink-500" />
                <div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Color</span>
                  <span className="text-sm font-semibold text-gray-800">{product.color || "Standard"}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-rose-500" />
                <div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Fabric</span>
                  <span className="text-sm font-semibold text-gray-800">{product.fabric || "Pure Silk / Cotton"}</span>
                </div>
              </div>
            </div>

            {/* Care Instructions */}
            {product.careInstructions && product.careInstructions.length > 0 && (
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> Care Instructions
                </h4>
                <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside bg-gray-50 p-3 rounded-xl">
                  {product.careInstructions.map((instruction, idx) => (
                    <li key={idx}>{instruction}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="pt-6 flex gap-4">
            <Link
              href={`/products/${product.slug}/edit`}
              className="w-full text-center bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-medium py-3 rounded-full shadow-lg shadow-rose-500/25 transition-all text-sm"
            >
              Edit Product Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
