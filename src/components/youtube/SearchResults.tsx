"use client";

import { motion, AnimatePresence } from "framer-motion";
import { YouTubeSearchResult } from "@/lib/youtube";
import { Music, User } from "lucide-react";
import Image from "next/image";

interface SearchResultsProps {
  results: YouTubeSearchResult[];
  onSelect: (videoId: string) => void;
  isLoading: boolean;
}

export default function SearchResults({ results, onSelect, isLoading }: SearchResultsProps) {
  if (!isLoading && results.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="absolute top-full left-0 right-0 mt-4 bg-void/80 backdrop-blur-2xl rounded-2xl border border-border-glass overflow-hidden z-[100] shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
      >
        {isLoading ? (
          <div className="p-12 flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-neon-violet/20 border-t-neon-violet rounded-full animate-spin" />
            <p className="font-ui text-[10px] uppercase tracking-widest text-text-secondary">Searching the void...</p>
          </div>
        ) : (
          <div className="max-h-[60vh] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-white/10">
            {results.map((result, i) => (
              <motion.button
                key={result.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => onSelect(result.id)}
                className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all text-left group border border-transparent hover:border-white/5"
              >
                <div className="relative w-24 h-14 flex-shrink-0 rounded-lg overflow-hidden border border-white/10 group-hover:border-neon-violet/50 transition-colors">
                  <Image
                    src={result.thumbnail}
                    alt={result.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-void/20 group-hover:bg-transparent transition-colors" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 
                    className="text-sm font-medium text-text-primary truncate group-hover:text-neon-violet transition-colors"
                    dangerouslySetInnerHTML={{ __html: result.title }}
                  />
                  <div className="flex items-center gap-2 mt-1 opacity-60">
                    <User className="w-3 h-3" />
                    <p className="text-[10px] uppercase tracking-wider font-ui truncate">{result.channelTitle}</p>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-neon-violet group-hover:text-white transition-all mr-2">
                  <Music className="w-4 h-4" />
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
