import Link from "next/link";
import { ArrowLeft, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-ocean-100 text-ocean-600 mb-2">
          <Search className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-bold font-display text-ocean-950">404 — Page Not Found</h1>
        <p className="text-ocean-700">
          The civic resource, initiative, or page you are looking for does not exist or has been relocated within South Tongu District.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-ocean-600 text-white font-medium hover:bg-ocean-700 transition"
          >
            <Home className="w-4 h-4" /> Return Home
          </Link>
          <Link
            href="/initiatives"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-ocean-200 text-ocean-800 font-medium hover:bg-ocean-50 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Explore Initiatives
          </Link>
        </div>
      </div>
    </div>
  );
}
