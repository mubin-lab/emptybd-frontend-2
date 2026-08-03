"use client"

import React from "react";

// Onclick (Popunder)
// কীভাবে কাজ করে: ব্যবহারকারী আপনার ওয়েবসাইটে প্রথমবার যেকোনো জায়গায় ক্লিক করার সাথে সাথে ব্যাকগ্রাউন্ডে বা নতুন ট্যাবে সম্পূর্ণ একটি বিজ্ঞাপন উইন্ডো খুলে যাবে।
// কখন ব্যবহার করবেন: যখন সাইটে ভিজিটর প্রচুর ক্লিকে ইন্টারঅ্যাক্ট করে (যেমন: মুভি দেখা, গান বা ফাইল ডাউনলোড, স্পোর্টস বা যেকোনো বাটনে ক্লিক)। এর CPM বা প্রতি ক্লিকে আয়ের হার অনেক বেশি হয়।
export default function MyButtonComponent() {
  
  const handleAdLoad = () => {
    const script = document.createElement("script");
    script.dataset.zone = "11370664";
    script.src = "https://al5sm.com/tag.min.js";
    script.async = true; // যেন পেজ লোডিং ব্লক না হয়
    // বডি বা পেজের শেষে স্ক্রিপ্টটি যুক্ত করা হচ্ছে
    const target = document.body || document.documentElement;
    target.appendChild(script);
    console.log("Ad script loaded!");
  };
  return (
    <button 
      onClick={handleAdLoad}
      className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
    >
      Load Ad (Click Me)
    </button>
  );
}




// . In-Page Push (Banner)
// কীভাবে কাজ করে: সাধারণ ওয়েবসাইট ব্যানারের মতো এটি দেখতে, তবে এটি চ্যাট বা কোনো মেসেজের স্টাইলে সাইটের কোনো এক কোনায় পপ-আপ হয়ে আসে। এটি ভিজিটরের মূল কনটেন্ট দেখার ক্ষেত্রে বাধা তৈরি করে না।
// কখন ব্যবহার করবেন: আপনার সাইটটি যদি কোনো ব্লগ, নিউজ বা সার্ভিস টাইপ হয় যেখানে
{/* <Script
          src="https://5gvci.com/act/files/tag.min.js?z=11370693"
          strategy="afterInteractive"
          data-cfasync="false"
        /> */}



// Vignette Banner
// কীভাবে কাজ করে: এটি মূলত গুগল অ্যাডসেন্সের Anchor/Vignette বিজ্ঞাপনের মতো। পুরো বা আংশিক স্ক্রিন জুড়ে অত্যন্ত ক্লিন ডিজাইনের একটি ক্রিয়েটিভ ব্যানার টাইপ বিজ্ঞাপন দেখায়, যার ওপরে স্পষ্ট "Close (X)" বাটন থাকে।
// কখন ব্যবহার করবেন: ক্লাসিকাল ব্যানার বিজ্ঞাপনের চেয়ে ৬৫% বেশি আয় দিতে পারে এবং এডব্লক (AdBlock) ব্যবহার করা ডিভাইসেও এটি চমৎকার কাজ করে।
        // <Script
        //   src="https://5gvci.com/act/files/tag.min.js?z=11370693"
        //   strategy="afterInteractive"
        //   data-cfasync="false"
        // />



// 1. Multitag (all-in-one)
// কীভাবে কাজ করে: এটি হলো Monetag-এর অল-ইন-ওয়ান সিস্টেম। একটিমাত্র কোড আপনার সাইটে বসালে এআই (AI) নিজেই ব্যবহারকারীর আচরণ বিশ্লেষণ করে সেরা বিজ্ঞাপনটি (Popunder, Push, বা Vignette) তাদের সামনে দেখায়।
// কখন ব্যবহার করবেন: আপনি যদি কোনো ঝামেলা ছাড়া সবচেয়ে বেশি আয় করতে চান এবং আলাদাভাবে বিজ্ঞাপনের টাইপ সেটআপ করার সময় না থাকে।

        // <Script
        //   src="https://quge5.com/88/tag.min.js"
        //   strategy="afterInteractive"
        //   data-zone="262405"
        //   data-cfasync="false"
        // />




        // 4. In-Page Push (Banner)
// কীভাবে কাজ করে: সাধারণ ওয়েবসাইট ব্যানারের মতো এটি দেখতে, তবে এটি চ্যাট বা কোনো মেসেজের স্টাইলে সাইটের কোনো এক কোনায় পপ-আপ হয়ে আসে। এটি ভিজিটরের মূল কনটেন্ট দেখার ক্ষেত্রে বাধা তৈরি করে না।
// কখন ব্যবহার করবেন: আপনার সাইটটি যদি কোনো ব্লগ, নিউজ বা সার্ভিস টাইপ হয় যেখানে ব্যবহা
{/* <Script
          src="https://nap5k.com/tag.min.js"
          strategy="afterInteractive"
          data-zone="11371546"
        /> */}



        // dirrect-links
        // onClick={()=>router.push('https://omg10.com/4/11370716')}