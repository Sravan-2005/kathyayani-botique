"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingBag, PlusCircle, User as UserIcon, LogOut, Sparkles } from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-rose-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="font-serif text-xl font-bold text-gray-900 tracking-wide block">
              Kathyayani
            </span>
            <span className="text-[10px] tracking-widest uppercase text-rose-500 font-semibold block -mt-1">
              Boutique
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className="text-sm font-medium text-gray-700 hover:text-rose-600 transition-colors"
          >
            Collection
          </Link>

          <Link
            href="/products/create"
            className="flex items-center gap-1.5 text-sm font-medium text-rose-600 hover:text-rose-700 bg-rose-50 px-3.5 py-1.5 rounded-full hover:bg-rose-100 transition-all border border-rose-200"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
        </nav>

        {/* User Actions */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full text-xs font-medium text-gray-700">
                <UserIcon className="w-3.5 h-3.5 text-rose-500" />
                <span>{user.name || user.email}</span>
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                className="p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="text-sm font-medium text-gray-700 hover:text-rose-600 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="text-sm font-medium text-white bg-gradient-to-r from-rose-500 to-pink-600 px-4 py-2 rounded-full hover:shadow-md hover:from-rose-600 hover:to-pink-700 transition-all"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
