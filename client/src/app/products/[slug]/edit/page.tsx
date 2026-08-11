"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchProductBySlug, updateProduct, uploadFile } from "@/lib/api";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  X,
  Sparkles,
  Save,
  Loader2,
} from "lucide-react";

const CATEGORIES = ["women", "men", "kids", "unisex"];

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const slugParam = params?.slug as string;

  const { data: product, isLoading: isFetchingProduct, isError } = useQuery({
    queryKey: ["product", slugParam],
    queryFn: () => fetchProductBySlug(slugParam),
    enabled: !!slugParam,
  });

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("women");
  const [mrp, setMrp] = useState("");
  const [color, setColor] = useState("");
  const [fabric, setFabric] = useState("");
  const [description, setDescription] = useState("");
  const [careInstructions, setCareInstructions] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (product) {
      setTitle(product.title || "");
      setCategory(product.category || "women");
      setMrp(product.mrp ? String(product.mrp) : "");
      setColor(product.color || "");
      setFabric(product.fabric || "");
      setDescription(product.description || "");
      setCareInstructions(product.careInstructions ? product.careInstructions.join("\n") : "");
      setImages(product.images || []);
    }
  }, [product]);

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

  const updateMutation = useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", slugParam] });
      router.push("/");
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || "Failed to update product.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !mrp) {
      setErrorMsg("Title and MRP price are required.");
      return;
    }

    updateMutation.mutate({
      slug: slugParam,
      data: {
        title,
        category,
        mrp: Number(mrp),
        color,
        fabric,
        description,
        careInstructions: careInstructions.split("\n").filter(Boolean),
        images,
      },
    });
  };

  if (isFetchingProduct) {
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
        <p className="text-sm text-gray-500">The requested product could not be retrieved.</p>
        <Link href="/" className="inline-block text-rose-600 text-sm font-semibold hover:underline">
          Return to Collection
        </Link>
      </div>
    );
  }

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
            Edit Product: <span className="text-rose-600">{product.title}</span>
          </h1>
          <p className="text-xs text-gray-400 font-mono mt-1">Slug: {slugParam}</p>
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
            Product Images (Cloud Storage)
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            {images.map((url, index) => (
              <div key={index} className="relative group rounded-xl overflow-hidden border border-gray-200 h-32 bg-gray-50">
                <img src={url} alt={`Upload ${index}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1.5 right-1.5 bg-red-600 text-white p-1 rounded-full shadow hover:bg-red-700 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            <label className="border-2 border-dashed border-rose-200 hover:border-rose-500 bg-rose-50/50 hover:bg-rose-50 rounded-xl h-32 flex flex-col items-center justify-center cursor-pointer transition-colors text-center p-2">
              <Upload className="w-6 h-6 text-rose-500 mb-1" />
              <span className="text-xs font-semibold text-rose-600">
                {uploading ? "Uploading..." : "Upload New Image"}
              </span>
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
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
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
            disabled={updateMutation.isPending || uploading}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-sm font-medium px-8 py-2.5 rounded-full shadow-lg shadow-rose-500/25 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {updateMutation.isPending ? "Saving Changes..." : "Save Product Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
