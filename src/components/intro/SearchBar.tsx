"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { searchYouTube, YouTubeSearchResult } from "@/lib/youtube";
import SearchResults from "@/components/youtube/SearchResults";
import { cn } from "@/lib/utils";

export default function SearchBar() {
  const router = useRouter();
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

  const handleSelect = (videoId: string) => {
    router.push(`/visualizer?v=${videoId}`);
  };

  return (
    <div className="w-full max-w-2xl mx-auto relative z-50 px-4">
      <div
        className={cn(
          "relative group transition-all duration-700",
          isFocused ? "scale-105" : "scale-100"
        )}
      >
        {/* Input Glow */}
        <div className={cn(
          "absolute -inset-1 bg-gradient-to-r from-neon-violet to-cyan rounded-2xl blur-xl opacity-0 transition-opacity duration-500",
          isFocused ? "opacity-20" : "group-hover:opacity-10"
        )} />

        <div className="relative">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-neon-violet animate-spin" />
            ) : (
              <Search className={cn(
                "w-5 h-5 transition-colors duration-300",
                isFocused ? "text-neon-violet" : "text-text-secondary"
              )} />
            )}
          </div>
          
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 300)}
            placeholder="Summon your masterpiece..."
            className={cn(
              "w-full bg-void/80 border border-border-glass rounded-2xl py-5 pl-14 pr-6 text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-neon-violet/50 focus:ring-0 transition-all font-body text-lg",
              "backdrop-blur-3xl shadow-[0_0_50px_rgba(0,0,0,0.4)]"
            )}
          />
        </div>

        <SearchResults 
          results={results} 
          isLoading={isLoading} 
          onSelect={handleSelect}
        />
      </div>
    </div>
  );
}
