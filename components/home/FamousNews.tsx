"use client";

import Link from "next/link";
import { FC, useEffect, useState } from "react";
import BackendImage from "@/components/shared/BackendImage";

export interface Author {
  author_name: string;
  author_img: string;
  author_email?: string;
}

export interface NewsItem {
  _id: string;
  news_img?: string;
  news_description: string;
  publish: string;
  author: Author;
  reactions: string[];
}

export default function FamousNews() {
  const [topNews, setTopNews] = useState<NewsItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTopNews = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/news-data/limit?page=1`);
        if (res.ok) {
          const data: NewsItem[] = await res.json();
          if (data && data.length > 0) {
            // Sort by most reactions as a proxy for "Famous", or just take the latest
            const sortedByReactions = data.sort((a, b) => (b.reactions?.length || 0) - (a.reactions?.length || 0));
            setTopNews(sortedByReactions[0]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch top news:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTopNews();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-48 bg-gray-950 animate-pulse rounded-lg border border-gray-900"></div>
    );
  }

  if (!topNews) {
    return null;
  }

  return (
    <div>
      <NewsCard news={topNews} />
    </div>
  );
}

const NewsCard: FC<{ news: NewsItem }> = ({ news }) => {
  return (
    <div className="group bg-black/30 rounded-sm overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
      {/* Image section */}
      {news.news_img && (
        <div className="relative aspect-[16/7] overflow-hidden">
          <BackendImage
            src={news.news_img}
            alt="news banner"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-3 flex flex-col">
        {/* Title / Description */}
        <p className="text-gray-300 text-sm lg:text-base font-medium font-hind line-clamp-3 mb-4 flex-grow">
          {news.news_description}
        </p>

        {/* Meta info */}
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-800">
              <BackendImage
                src={news.author.author_img}
                alt={news.author.author_name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-xs lg:text-sm font-medium text-white">
                {news.author.author_name}
              </p>
              <p className="text-[10px] lg:text-xs text-gray-400">
                {new Date(news.publish).toLocaleDateString("en-BD", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="flex text-xs lg:text-sm items-center gap-1 text-gray-400">
            <svg
              className="w-4 h-4 text-emerald-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
              />
            </svg>
            <span>{news.reactions?.length || 0}</span>
          </div>
        </div>

        {/* Action */}
        <div className="flex items-center justify-end mt-3 pt-2 border-t border-gray-900">
          <Link
            href={`/news/${news._id}`}
            className="text-secondary text-[11px] lg:text-sm font-medium flex items-center gap-1 hover:text-white transition-colors"
          >
            Read Full Post
            <span className="text-lg" aria-hidden="true">
              →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};
