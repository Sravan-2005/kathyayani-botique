import Link from "next/link";
import { Sparkles, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-serif text-lg font-bold text-white tracking-wide">
                Kathyayani Boutique
              </span>
            </div>
            <p className="text-sm text-gray-400 max-w-md leading-relaxed">
              Exquisite hand-crafted traditional & contemporary women, men, and kids boutique collections tailored for elegance, luxury, and comfort.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-rose-400 transition-colors">
                  Collection
                </Link>
              </li>
              <li>
                <Link href="/products/create" className="hover:text-rose-400 transition-colors">
                  Create Product
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="hover:text-rose-400 transition-colors">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Connect & Support
            </h4>
            <p className="text-sm text-gray-400">
              Domain: <span className="text-rose-400 font-mono">sravanvagicherla.in</span>
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Protected by Cloudflare SSL & R2 Storage.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} Kathyayani Boutique. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Crafted with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for elegance.
          </p>
        </div>
      </div>
    </footer>
  );
}
