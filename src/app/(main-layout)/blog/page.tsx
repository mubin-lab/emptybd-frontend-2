import React from "react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog & Guides",
  description: "Read the latest buying guides, how-to articles, and editorial content from EmptyBD.",
};

const blogPosts = [
  {
    id: 1,
    title: "How to Win Online Auctions: A Beginner's Guide",
    excerpt: "Learn the essential strategies and timing techniques to secure the best deals in our online auctions.",
    date: "July 12, 2026",
    slug: "how-to-win-online-auctions",
    category: "How-To",
  },
  {
    id: 2,
    title: "The Ultimate Smartphone Buying Guide for 2026",
    excerpt: "Looking for a new phone? Read our comprehensive breakdown of the latest features, specs, and prices.",
    date: "July 5, 2026",
    slug: "smartphone-buying-guide-2026",
    category: "Buying Guide",
  },
  {
    id: 3,
    title: "Understanding Digital Wallets on EmptyBD",
    excerpt: "A deep dive into how to securely add funds, withdraw, and manage your EmptyBD digital wallet.",
    date: "June 28, 2026",
    slug: "understanding-digital-wallets",
    category: "Platform Tips",
  }
];

export default function BlogPage() {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 font-parkinsans min-h-screen">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold mb-4 font-orbitron text-white">EmptyBD Blog & Guides</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Discover original editorial content, expert buying guides, and tips to get the most out of your online shopping and auction experience.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogPosts.map((post) => (
          <div key={post.id} className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden flex flex-col hover:border-neutral-600 transition-colors">
            <div className="p-6 flex-grow">
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">{post.category}</span>
              <h2 className="text-xl font-bold mt-2 mb-3 text-white">
                <Link prefetch={false} href={`/blog/${post.slug}`} className="hover:underline">
                  {post.title}
                </Link>
              </h2>
              <p className="text-gray-400 text-sm mb-4">
                {post.excerpt}
              </p>
            </div>
            <div className="px-6 py-4 border-t border-neutral-800 text-xs text-gray-500">
              Published on {post.date}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
