"use client";

import { YouTubeSearchResult } from "@/lib/youtube";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Music } from "lucide-react";

interface SearchResultsProps {
  results: YouTubeSearchResult[];
  isLoading: boolean;
}

export default function SearchResults({ results, isLoading }: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-2 animate-pulse">
            <div className="w-16 h-12 bg-white/5 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="w-3/4 h-4 bg-white/5 rounded" />
              <div className="w-1/2 h-3 bg-white/5 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {results.map((result, i) => (
        <motion.div
          key={result.videoId}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <Link
            href={`/visualizer?v=${result.videoId}`}
            className="flex items-center gap-4 p-2 rounded-xl hover:bg-neon-violet/10 border border-transparent hover:border-border-glass transition-all group"
          >
            <div className="relative w-20 h-12 flex-shrink-0 overflow-hidden rounded-lg">
              <Image
                src={result.thumbnailUrl}
                alt={result.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Music className="w-4 h-4 text-white" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 
                className="text-text-primary text-sm font-medium truncate group-hover:text-neon-violet transition-colors"
                dangerouslySetInnerHTML={{ __html: result.title }}
              />
              <p className="text-text-secondary text-xs truncate uppercase tracking-tighter font-ui mt-1">
                {result.channelTitle}
              </p>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
