"use client";

import { BiFile, BiWallet, BiPurchaseTag, BiStore, BiError, BiBlock, BiUserX, BiEnvelope } from "react-icons/bi";

const sections = [
  {
    icon: BiUserX,
    title: "১. অ্যাকাউন্ট সম্পর্কিত",
    content: `• প্রতিটি ব্যক্তি শুধুমাত্র একটি অ্যাকাউন্ট ব্যবহার করতে পারবেন।
• ভুয়া তথ্য দিয়ে অ্যাকাউন্ট তৈরি করলে কর্তৃপক্ষ পূর্ব নোটিশ ছাড়াই অ্যাকাউন্ট স্থগিত বা বাতিল করতে পারবে।
• একই ব্যক্তি একাধিক অ্যাকাউন্ট ব্যবহার করলে সকল অ্যাকাউন্ট স্থায়ীভাবে নিষিদ্ধ করা হতে পারে।`,
  },
  {
    icon: BiStore,
    title: "২. রেফারেল নীতি",
    content: `• ভুয়া, নিজস্ব বা প্রতারণামূলক রেফারেল সম্পূর্ণ নিষিদ্ধ।
• Fake Referral, Self Referral, Bot Referral বা যেকোনো ধরনের অনিয়ম ধরা পড়লে অ্যাকাউন্ট সাময়িক বা স্থায়ীভাবে স্থগিত করা হবে।
• প্রতারণার মাধ্যমে অর্জিত সকল আয় বাতিল করার অধিকার EmptyBD.com সংরক্ষণ করে।`,
  },
  {
    icon: BiFile,
    title: "৩. পরিচয় যাচাইকরণ",
    content: `• EmptyBD.com যেকোনো সময় ব্যবহারকারীর পরিচয় যাচাইয়ের জন্য NID, Passport, Driving License, জন্ম নিবন্ধন অথবা অন্যান্য প্রয়োজনীয় ডকুমেন্ট চাইতে পারে।
• ব্যবহারকারী নির্ধারিত সময়ের মধ্যে সঠিক ডকুমেন্ট প্রদান করতে বাধ্য থাকবেন।
• ডকুমেন্ট প্রদান করতে ব্যর্থ হলে অ্যাকাউন্ট সীমাবদ্ধ, স্থগিত বা বাতিল করা হতে পারে।`,
  },
  {
    icon: BiWallet,
    title: "৪. উইথড্র নীতি",
    content: `• ব্যবহারকারী নিজ দায়িত্বে সঠিক মোবাইল নম্বর, ব্যাংক অ্যাকাউন্ট বা পেমেন্ট তথ্য প্রদান করবেন।
• ভুল তথ্যের কারণে অর্থ অন্যত্র চলে গেলে EmptyBD.com কোনো দায়ভার গ্রহণ করবে না।
• ভুল তথ্যের কারণে হারিয়ে যাওয়া অর্থ ফেরত দেওয়ার বাধ্যবাধকতা কর্তৃপক্ষের থাকবে না।
• সন্দেহজনক লেনদেনের ক্ষেত্রে উইথড্র সাময়িকভাবে স্থগিত রাখা হতে পারে।`,
  },
  {
    icon: BiBlock,
    title: "৫. আয় বাতিল করার অধিকার",
    content: `EmptyBD.com নিম্নলিখিত ক্ষেত্রে ব্যবহারকারীর অর্জিত আয় বাতিল করার অধিকার সংরক্ষণ করে:

• প্রতারণা।
• Bot ব্যবহার।
• Fake Referral।
• VPN বা Proxy ব্যবহার করে অনিয়ম।
• সিস্টেমের ত্রুটির অপব্যবহার।
• Terms & Conditions লঙ্ঘন।`,
  },
  {
    icon: BiPurchaseTag,
    title: "৬. বিজ্ঞাপন ও অফার",
    content: `• ব্যবহারকারীকে বিজ্ঞাপন বা অফার সম্পূর্ণ ও সঠিকভাবে সম্পন্ন করতে হবে।
• প্রতারণামূলক উপায়ে Reward অর্জনের চেষ্টা করলে Reward বাতিল করা হবে।`,
  },
  {
    icon: BiError,
    title: "৭. অ্যাকাউন্ট স্থগিত বা বাতিল",
    content: `EmptyBD.com পূর্ব নোটিশ ছাড়াই নিম্নলিখিত ক্ষেত্রে অ্যাকাউন্ট Suspend বা Ban করতে পারে:

• ভুয়া তথ্য প্রদান।
• Spam।
• অবৈধ কার্যক্রম।
• অন্য ব্যবহারকারীকে হয়রানি।
• সাইটের নিরাপত্তা ক্ষতিগ্রস্ত করার চেষ্টা।
• Terms & Conditions লঙ্ঘন।`,
  },
  {
    icon: BiError,
    title: "৮. সিস্টেম ত্রুটি",
    content: `সিস্টেম, সার্ভার বা সফটওয়্যারের কোনো Bug বা Error-এর কারণে ভুলবশত অতিরিক্ত Balance, Reward বা Bonus যুক্ত হলে কর্তৃপক্ষ তা পূর্ব নোটিশ ছাড়াই সংশোধন বা বাতিল করতে পারবে।`,
  },
  {
    icon: BiBlock,
    title: "৯. অ্যাকাউন্ট নিরাপত্তা",
    content: `ব্যবহারকারী তার Password, OTP এবং Login তথ্য গোপন রাখার জন্য সম্পূর্ণ দায়ী থাকবেন।`,
  },
  {
    icon: BiFile,
    title: "১০. সেবা পরিবর্তনের অধিকার",
    content: `EmptyBD.com যেকোনো সময় পূর্ব নোটিশ ছাড়াই:

• নিয়ম পরিবর্তন,
• Reward পরিবর্তন,
• কমিশন পরিবর্তন,
• Feature যোগ বা বাতিল,
• Service বন্ধ করার অধিকার সংরক্ষণ করে।`,
  },
  {
    icon: BiStore,
    title: "১১. আইনগত ব্যবস্থা",
    content: `প্রতারণা, জালিয়াতি, অর্থ আত্মসাৎ বা সাইবার অপরাধের ক্ষেত্রে EmptyBD.com প্রয়োজনীয় আইনগত ব্যবস্থা গ্রহণের অধিকার সংরক্ষণ করে।`,
  },
  {
    icon: BiFile,
    title: "১২. চূড়ান্ত সিদ্ধান্ত",
    content: `EmptyBD.com-এর নিরাপত্তা, Reward, Referral, Withdraw, Account Verification এবং অন্যান্য বিষয়ে কর্তৃপক্ষের সিদ্ধান্তই চূড়ান্ত বলে গণ্য হবে।`,
  },
  {
    icon: BiError,
    title: "১৩. দায় সীমাবদ্ধতা",
    content: `ইন্টারনেট বিভ্রাট, বিদ্যুৎ সমস্যা, ব্যাংকিং বিলম্ব, মোবাইল ব্যাংকিং সেবা, তৃতীয় পক্ষের সিস্টেম ত্রুটি বা প্রাকৃতিক দুর্যোগের কারণে সেবা বিঘ্নিত হলে EmptyBD.com দায়ী থাকবে না।`,
  },
  {
    icon: BiPurchaseTag,
    title: "১৪. মেধাস্বত্ব",
    content: `EmptyBD.com-এর সকল লোগো, ডিজাইন, কনটেন্ট, সফটওয়্যার ও ট্রেডমার্ক কর্তৃপক্ষের সম্পত্তি। অনুমতি ছাড়া এগুলো কপি, পরিবর্তন বা পুনঃপ্রকাশ করা যাবে না।`,
  },
  {
    icon: BiBlock,
    title: "১৫. নিষিদ্ধ কার্যক্রম",
    content: `নিম্নলিখিত কাজগুলো সম্পূর্ণ নিষিদ্ধ:

• Auto Clicker, Bot বা Script ব্যবহার।
• VPN/Proxy ব্যবহার করে Reward নেওয়া।
• Fake Document জমা দেওয়া।
• অন্যের পরিচয় ব্যবহার করা।
• সিস্টেম Hack বা Exploit করার চেষ্টা।
• Spam Referral বা Bulk Account তৈরি করা।
• Money Laundering বা অবৈধ লেনদেন।`,
  },
  {
    icon: BiUserX,
    title: "১৬. অ্যাকাউন্ট মুছে ফেলা",
    content: `• কোনো ব্যবহারকারী তার অ্যাকাউন্ট ডিলিট করে দিলে তার সকল ব্যক্তিগত ডেটা মুছে ফেলা হবে।
• তবে, ব্যবহারকারীর পাবলিক ডেটা (যেমন: পোস্ট, কমেন্ট) সুরক্ষার স্বার্থে ৪০ কর্মদিবস পর্যন্ত কর্তৃপক্ষের কাছে সংরক্ষিত থাকবে।
• ৪০ কর্মদিবস পর সকল ডেটা স্থায়ীভাবে ডিলিট হয়ে যাবে।`,
  }
];

export default function TermsOfServicePage() {
  return (
    <div className="max-w-[1440px] w-[95%] mx-auto py-6 md:py-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-secondary/20 rounded-full mb-4">
            <BiFile className="text-3xl md:text-4xl text-secondary" />
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3">
            Terms & Conditions (শর্তাবলী)
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
                  <div className="p-2 bg-secondary/20 rounded-lg">
                    <section.icon className="text-xl text-secondary" />
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

        {/* Agreement Note */}
        <p className="text-center text-gray-500 text-xs md:text-sm mt-8">
          By using EmptyBD, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
        </p>
      </div>
    </div>
  );
}
