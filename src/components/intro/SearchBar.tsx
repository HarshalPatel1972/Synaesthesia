"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { searchYouTube, YouTubeSearchResult } from "@/lib/youtube";
import SearchResults from "@/components/youtube/SearchResults";
import { cn } from "@/lib/utils";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<YouTubeSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(async () => {
      setIsLoading(true);
      const data = await searchYouTube(query);
      setResults(data);
      setIsLoading(false);
    }, 400);

    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [query]);

  return (
    <div className="w-full max-w-2xl mx-auto relative z-20 px-4">
      <div
        className={cn(
          "relative group transition-all duration-500",
          isFocused ? "scale-105" : "scale-100"
        )}
      >
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-neon-violet animate-spin" />
          ) : (
            <Search className="w-5 h-5 text-text-secondary group-hover:text-neon-violet transition-colors" />
          )}
        </div>
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder="Search a song or paste a YouTube URL..."
          className={cn(
            "w-full bg-smoke border border-border-glass rounded-2xl py-4 pl-12 pr-4 text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-neon-violet focus:ring-1 focus:ring-neon-violet/30 transition-all",
            "backdrop-blur-xl shadow-2xl"
          )}
        />
      </div>

      <AnimatePresence>
        {(results.length > 0 || isLoading) && isFocused && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 right-0 mt-4 max-h-[60vh] overflow-y-auto bg-void/90 backdrop-blur-2xl border border-border-glass rounded-2xl shadow-3xl p-4 scrollbar-hide"
          >
            <SearchResults results={results} isLoading={isLoading} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
