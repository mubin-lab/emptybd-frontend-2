/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react'
import Empty from '../NotFound.tsx/Empty';
import Link from 'next/link';
import Countdown from '../short-component/Countdown';
import { SpinnerCustom } from '../loading/Spinner';

export default function UserNewsPostTable({ email }: { email: string }) {
    const [news, setNews] = useState<any[]>([]);
    
      const [loading, setLoading] = useState(true);
    
      const token = localStorage.getItem("auth_token");
    
      useEffect(() => {
        const getNewsByEmail = async (email: string) => {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_NODE_API_URL}/news-data/by-email/${email}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            },
          );
          return res.json();
        };
    
        const fetchBid = async () => {
          const data = await getNewsByEmail(email);
          setNews(data);
          setLoading(false);
        };
    
        fetchBid();
      }, [email, token]);
      console.log(news, email);
    
      if (loading) return <SpinnerCustom />;
      if (news.length === 0) return <Empty description="Ohh! No Data availabe for you."/>;
  return (
    <div className="flex items-center flex-col">
      {news.reverse().map((item: any, idx: React.Key | null | undefined) => (
        <Link
          href={`/news/${item?._id}`}
          className="bg-black/30 py-2 px-2 my-1 rounded-md w-full flex items-center gap-3"
          key={idx}
          >
            {item.news_img && <img
            src={item.news_img}
            alt="img"
            className="w-[62px] h-[40px] rounded-sm"
          />}
          
          {/* {item.product.media_type === "image" ? (
          ) : (
            <video
              src={item.product.media_url}
              autoPlay
              loop
              muted
              playsInline
              className="w-[62px] h-[40px] border rounded-sm"
            >
              <source src={item.product.media_url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )} */}

          <div className="w-[48%] flex-1">
            <h5 className="text-sm lg:text-xl font-medium font-parkinsans line-clamp-1">
              {item.news_description}
            </h5>
            <p className="text-xs lg:text-sm font-medium font-parkinsans text-gray-400 items-center">
              Total Impressed: {item.reactions.length}
            </p>
          </div>
          <div>
            <p className="text-xs lg:text-sm text-gray-400 font-medium font-averia-gruesa-libre">
             Earning {item.reactions.length * 1} <span className="font-orbitron">৳</span> 
            </p> 
          </div>
        </Link>
      ))}
    </div>
  )
}
