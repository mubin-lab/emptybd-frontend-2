import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

// Dummy data for Google Ads content requirement
const blogPosts = {
  "how-to-win-online-auctions": {
    title: "How to Win Online Auctions: A Beginner's Guide",
    date: "July 12, 2026",
    content: `
      Winning online auctions takes a mix of patience, strategy, and timing. 
      In this guide, we cover the essential tips you need to secure the best deals on EmptyBD.
      
      First, always set a maximum bid limit. It's easy to get caught up in a bidding war, but knowing your limit ensures you don't overpay.
      Second, try "sniping" — placing your bid in the final seconds of the auction. This gives other bidders less time to react.
      Lastly, make sure your internet connection is stable and keep a close eye on the countdown timer. Happy bidding!
    `,
  },
  "smartphone-buying-guide-2026": {
    title: "The Ultimate Smartphone Buying Guide for 2026",
    date: "July 5, 2026",
    content: `
      Choosing the right smartphone can be overwhelming with so many options available. 
      This guide helps you prioritize the features that matter most to you.
      
      If you are a photographer, focus on camera specifications, particularly low-light performance and optical zoom.
      For gamers, look for high refresh rate screens (120Hz or more) and top-tier processors.
      Don't forget battery life; a phone with at least 5000mAh will comfortably get you through a heavy day of usage.
      Find the best smartphone deals here on EmptyBD.
    `,
  },
  "understanding-digital-wallets": {
    title: "Understanding Digital Wallets on EmptyBD",
    date: "June 28, 2026",
    content: `
      The EmptyBD digital wallet is the safest and most efficient way to handle transactions on our platform.
      
      To add funds, navigate to your dashboard and select 'Top Up'. You can use various local and international payment methods.
      When you win an auction or purchase an item, funds are held securely until the transaction is complete, offering peace of mind.
      Withdrawals are processed within 2-3 business days directly to your linked bank account or mobile financial service.
    `,
  }
};

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const params = await props.params;
  const post = blogPosts[params.slug as keyof typeof blogPosts];
  
  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: `${post.title} | EmptyBD Blog`,
    description: post.content.substring(0, 150) + "...",
  };
}

export default async function BlogPostPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const post = blogPosts[params.slug as keyof typeof blogPosts];

  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8 font-parkinsans min-h-screen text-gray-300">
      <Link prefetch={false} href="/blog" className="text-blue-400 hover:underline mb-6 inline-block">
        &larr; Back to Blog
      </Link>
      
      <article className="bg-neutral-900 p-8 rounded-lg border border-neutral-800">
        <h1 className="text-3xl font-bold mb-4 font-orbitron text-white">{post.title}</h1>
        <div className="text-sm text-gray-500 mb-8 border-b border-neutral-800 pb-4">
          Published on {post.date}
        </div>
        
        <div className="prose prose-invert max-w-none">
          {post.content.split('\n').map((paragraph, idx) => (
            <p key={idx} className="mb-4">
              {paragraph.trim()}
            </p>
          ))}
        </div>
      </article>
    </div>
  );
}
