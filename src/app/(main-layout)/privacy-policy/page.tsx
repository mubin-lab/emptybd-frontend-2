"use client";

import { BiShield, BiLock, BiUser, BiCookie, BiData, BiShare, BiRevision } from "react-icons/bi";

const sections = [
  {
    icon: BiShield,
    title: "Information We Collect",
    content: `We collect information that you provide directly to us when using EmptyBD, including:

• Account Information: Name, email address, phone number, NID, and address when you register
• Transaction Data: Payment method details, transaction IDs, deposit/withdrawal history, and wallet balance
• Content & Activity: Posts you create, news you share, comments, likes, and interactions
• Media: Photos or short videos you upload to your profile or feed
• Communications: Messages with other users, customer support inquiries, and notifications`,
  },
  {
    icon: BiLock,
    title: "How We Use Your Information",
    content: `We use the information we collect to:

• Provide and maintain our social networking, blogging, and content sharing services
• Personalize your content feed and user experience
• Facilitate communication between users and community members
• Send you transaction confirmations, updates, and promotional messages
• Verify your identity and prevent fraud
• Comply with legal obligations and resolve disputes`,
  },
  {
    icon: BiUser,
    title: "Account Security",
    content: `• Your account is protected by authentication tokens stored securely
• You are responsible for maintaining the confidentiality of your login credentials
• We implement industry-standard security measures to protect your data
• Enable two-factor authentication when available for enhanced security
• Report any unauthorized account activity immediately to our support team`,
  },
  {
    icon: BiCookie,
    title: "Cookies and Tracking",
    content: `We use cookies and similar technologies to:

• Keep you logged in and maintain your session
• Remember your preferences and settings
• Analyze how you use our platform to improve services
• Deliver personalized content and advertisements

You can manage cookie preferences through your browser settings.`,
  },
  {
    icon: BiData,
    title: "Data Storage and Retention",
    content: `• Your data is stored on secure servers located in Bangladesh
• We retain your information as long as your account is active
• Transaction records are kept for 5 years for legal and tax compliance
• You can request account deletion, which will remove personal data within 30 days
• Some anonymized data may be retained for analytics purposes`,
  },
  {
    icon: BiShare,
    title: "Information Sharing",
    content: `We may share your information with:

• Other users as necessary to display your public profile, posts, and comments
• Payment processors to facilitate deposits and withdrawals
• Law enforcement when required by law or to protect our rights
• Service providers who assist in operating our platform

We do not sell your personal information to third parties for marketing purposes.`,
  },
  {
    icon: BiRevision,
    title: "Your Rights",
    content: `You have the right to:

• Access and review the personal information we hold about you
• Update or correct inaccurate information through your profile
• Request deletion of your account and associated data
• Opt-out of promotional communications
• Export your transaction history

Contact us at mubinulislam14@gmail.com to exercise these rights.`,
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
            Privacy Policy
          </h1>
          <p className="text-gray-400 text-sm md:text-base">
            Last updated: April 21, 2026
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 md:p-6 mb-6">
          <p className="text-gray-300 leading-relaxed">
            EmptyBD (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) is committed to protecting your privacy. 
            This Privacy Policy explains how we collect, use, store, and protect your personal information 
            when you use our social media platform, read our blogs, and interact with our community.
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
        <div className="mt-8 bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 rounded-lg p-4 md:p-6">
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
        </div>

        {/* Footer Note */}
        <p className="text-center text-gray-500 text-xs md:text-sm mt-8">
          By using EmptyBD, you agree to the collection and use of information in accordance with this Privacy Policy.
        </p>
      </div>
    </div>
  );
}
