"use client";

import { BiShield, BiLock, BiUser, BiCookie, BiData, BiShare, BiRevision } from "react-icons/bi";

const sections = [
  {
    icon: BiData,
    title: "১. তথ্য সংগ্রহ",
    content: `EmptyBD.com ব্যবহার করার সময় আমরা আপনার নাম, ইমেইল, মোবাইল নম্বর, পেমেন্ট সংক্রান্ত তথ্য, IP Address, ব্রাউজার তথ্য এবং অন্যান্য প্রয়োজনীয় তথ্য সংগ্রহ করতে পারি।`,
  },
  {
    icon: BiShare,
    title: "২. তথ্যের ব্যবহার",
    content: `সংগৃহীত তথ্য নিম্নলিখিত উদ্দেশ্যে ব্যবহার করা হবে:

• ব্যবহারকারীর অ্যাকাউন্ট পরিচালনা।
• নিরাপত্তা নিশ্চিত করা।
• পেমেন্ট ও উইথড্র প্রক্রিয়া সম্পন্ন করা।
• প্রতারণা ও অবৈধ কার্যক্রম প্রতিরোধ করা।
• নতুন ফিচার ও সেবা উন্নয়ন করা।`,
  },
  {
    icon: BiShield,
    title: "৩. তথ্যের নিরাপত্তা",
    content: `ব্যবহারকারীর ব্যক্তিগত তথ্য নিরাপদ রাখতে EmptyBD.com সর্বোচ্চ চেষ্টা করবে। তবে ইন্টারনেটের মাধ্যমে তথ্য আদান-প্রদানে শতভাগ নিরাপত্তার নিশ্চয়তা দেওয়া সম্ভব নয়।`,
  },
  {
    icon: BiUser,
    title: "৪. তৃতীয় পক্ষের সেবা",
    content: `EmptyBD.com প্রয়োজনে তৃতীয় পক্ষের পেমেন্ট গেটওয়ে, বিজ্ঞাপন বা অন্যান্য সেবা ব্যবহার করতে পারে। এসব সেবার নিজস্ব Privacy Policy প্রযোজ্য হবে।`,
  },
  {
    icon: BiCookie,
    title: "৫. Cookies",
    content: `ব্যবহারকারীর অভিজ্ঞতা উন্নত করতে Cookies ব্যবহার করা হতে পারে।`,
  },
  {
    icon: BiRevision,
    title: "৬. তথ্য হালনাগাদ",
    content: `ব্যবহারকারী তার অ্যাকাউন্টের তথ্য সঠিক ও হালনাগাদ রাখার জন্য দায়ী থাকবেন।`,
  },
  {
    icon: BiLock,
    title: "৭. আর্থিক লেনদেন ও দায়বদ্ধতা",
    content: `EmptyBD.com প্রমোশন বা প্রমোট করা ছাড়া কারও কাছ থেকে কোনো প্রকার টাকা গ্রহণ করে না। কোনো ব্যবহারকারী যদি কোনো কারণে অন্য কারও সাথে ব্যক্তিগতভাবে আর্থিক লেনদেন করেন, সে ক্ষেত্রে EmptyBD.com-এর কোনো দায়বদ্ধতা থাকবে না।`,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-[1440px] w-[95%] mx-auto py-6 md:py-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-primary/20 rounded-full mb-4">
            <BiShield className="text-3xl md:text-4xl text-primary" />
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3">
            Privacy Policy (গোপনীয়তা নীতি)
          </h1>
          <p className="text-gray-400 text-sm md:text-base">
            Last updated: April 21, 2026
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {sections.map((section, index) => (
            <div
              key={index}
              className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden"
            >
              <div className="p-4 md:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <section.icon className="text-xl text-primary" />
                  </div>
                  <h2 className="text-lg md:text-xl font-semibold text-white">
                    {section.title}
                  </h2>
                </div>
                <div className="text-gray-400 text-sm md:text-base leading-relaxed whitespace-pre-line">
                  {section.content}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        {/* <div className="mt-8 bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 rounded-lg p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold text-white mb-2">
            Contact Us
          </h2>
          <p className="text-gray-400 text-sm md:text-base">
            If you have any questions about this Privacy Policy or our data practices, 
            please contact us at:{" "}
            <a
              href="mailto:mubinulislam14@gmail.com"
              className="text-primary hover:text-primary/80 underline"
            >
              mubinulislam14@gmail.com
            </a>
          </p>
        </div> */}

        {/* Footer Note */}
        <p className="text-center text-gray-500 text-xs md:text-sm mt-8">
          By using EmptyBD, you agree to the collection and use of information in accordance with this Privacy Policy.
        </p>
      </div>
    </div>
  );
}
