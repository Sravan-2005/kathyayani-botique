"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProduct, uploadFile } from "@/lib/api";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  X,
  Sparkles,
  CheckCircle2,
  Plus,
  Layers,
  Palette,
  Tag,
  FileText,
} from "lucide-react";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "custom"];
const CATEGORIES = ["women", "men", "kids", "unisex"];

export default function CreateProductPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("women");
  const [mrp, setMrp] = useState("");
  const [color, setColor] = useState("");
  const [fabric, setFabric] = useState("");
  const [description, setDescription] = useState("");
  const [careInstructions, setCareInstructions] = useState("Wash with care. Handle delicately.");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    // Auto generate slug
    const generatedSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    setSlug(generatedSlug);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setErrorMsg("");

    try {
      const uploadPromises = Array.from(files).map((file) => uploadFile(file));
      const uploadedUrls = await Promise.all(uploadPromises);
      setImages((prev) => [...prev, ...uploadedUrls]);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to upload image to Object Storage.");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      router.push("/");
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || "Failed to create product.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !mrp) {
      setErrorMsg("Title, slug, and MRP price are required.");
      return;
    }

    createMutation.mutate({
      title,
      slug,
      category,
      mrp: Number(mrp),
      color,
      fabric,
      description,
      careInstructions: careInstructions.split("\n").filter(Boolean),
      images,
      status: "active",
      isShownOnWebsite: true,
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-5">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-rose-600 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Collection
          </Link>
          <h1 className="font-serif text-3xl font-bold text-gray-900 flex items-center gap-2">
            Add New Product <Sparkles className="w-5 h-5 text-rose-500" />
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Fill in the details below to publish a new luxury boutique item.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm font-medium">
          {errorMsg}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
        {/* Image Uploader */}
        <div className="space-y-3">
          <label className="block text-sm font-bold text-gray-900 uppercase tracking-wider">
            Product Images (Cloud / Object Storage)
          </label>
          <p className="text-xs text-gray-500">
            Upload high-resolution boutique images. Images are uploaded to Cloudflare R2 / S3 storage.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            {images.map((url, index) => (
              <div key={index} className="relative group rounded-xl overflow-hidden border border-gray-200 h-32 bg-gray-50">
                <img src={url} alt={`Upload ${index}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1.5 right-1.5 bg-red-600 text-white p-1 rounded-full shadow hover:bg-red-700 transition-colors opacity-90 group-hover:opacity-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            <label className="border-2 border-dashed border-rose-200 hover:border-rose-500 bg-rose-50/50 hover:bg-rose-50 rounded-xl h-32 flex flex-col items-center justify-center cursor-pointer transition-colors text-center p-2">
              <Upload className="w-6 h-6 text-rose-500 mb-1" />
              <span className="text-xs font-semibold text-rose-600">
                {uploading ? "Uploading..." : "Upload Image"}
              </span>
              <span className="text-[10px] text-gray-400">JPG, PNG, WEBP</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Basic Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Product Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Royal Silk Kanjeevaram Saree"
              value={title}
              onChange={handleTitleChange}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Slug (URL Identifier) *
            </label>
            <input
              type="text"
              required
              placeholder="royal-silk-kanjeevaram-saree"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all capitalize"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              MRP Price (₹) *
            </label>
            <input
              type="number"
              required
              min="0"
              placeholder="e.g. 14999"
              value={mrp}
              onChange={(e) => setMrp(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Color
            </label>
            <input
              type="text"
              placeholder="e.g. Crimson Red / Gold"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Fabric Material
            </label>
            <input
              type="text"
              placeholder="e.g. Pure Mulberry Silk"
              value={fabric}
              onChange={(e) => setFabric(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Description & Care */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Product Description
            </label>
            <textarea
              rows={4}
              placeholder="Provide an elegant description of craftsmanship, weaving technique, and occasion..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Care Instructions
            </label>
            <textarea
              rows={2}
              placeholder="Dry clean only. Store in muslin cloth."
              value={careInstructions}
              onChange={(e) => setCareInstructions(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all resize-none"
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-4">
          <Link
            href="/"
            className="px-6 py-2.5 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={createMutation.isPending || uploading}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-sm font-medium px-8 py-2.5 rounded-full shadow-lg shadow-rose-500/25 transition-all disabled:opacity-50"
          >
            {createMutation.isPending ? "Publishing..." : "Publish Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
