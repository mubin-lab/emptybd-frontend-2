"use client";

import { BiFile, BiWallet, BiPurchaseTag, BiStore, BiError, BiBlock, BiUserX, BiEnvelope } from "react-icons/bi";

const sections = [
  {
    icon: BiFile,
    title: "Acceptance of Terms",
    content: `By accessing or using EmptyBD, you agree to be bound by these Terms of Service. 
    
• You must be at least 18 years old to use our platform
• You agree to provide accurate and complete information during registration
• You are responsible for maintaining the confidentiality of your account credentials
• We reserve the right to modify these terms at any time with notice to users
• Continued use after changes constitutes acceptance of new terms`,
  },
  {
    icon: BiWallet,
    title: "Wallet and Payments",
    content: `Our digital wallet system allows you to deposit and withdraw funds:

• Minimum deposit: No minimum required
• Minimum withdrawal: ৳250 per transaction
• Withdrawal processing time: Up to 24 hours
• You must complete identity verification (NID) to withdraw funds
• Deposits require transaction ID verification and may take time to process
• We are not responsible for incorrect transaction details provided by users
• Wallet funds can only be used within the EmptyBD platform`,
  },
  {
    icon: BiPurchaseTag,
    title: "Content Guidelines",
    content: `When posting content on EmptyBD:

• You are solely responsible for the content you share, post, or upload
• Do not post copyrighted material unless you own the rights
• Content promoting hate speech, violence, or discrimination will be removed
• Spam, deceptive practices, and repetitive low-quality posts are prohibited
• We reserve the right to remove any content that violates these guidelines
• Repeated violations may result in a permanent ban`,
  },
  {
    icon: BiStore,
    title: "Community Standards",
    content: `For all users interacting in our community:

• Treat fellow community members with respect and courtesy
• Do not engage in harassment, bullying, or targeted abuse
• Do not share false information or participate in malicious campaigns
• Respect the privacy of others and do not post their personal information
• Use the reporting tools to flag inappropriate behavior
• We encourage constructive discussions and healthy debate`,
  },
  {
    icon: BiError,
    title: "Prohibited Activities",
    content: `Users may not engage in:

• Posting deceptive, misleading, or fraudulent content
• Selling illegal items or promoting illegal activities
• Harassment, abuse, or inappropriate communication with other users
• Attempting to circumvent platform moderation or security measures
• Using automated systems (bots) to place bids or make purchases
• Creating multiple accounts to manipulate the system
• Sharing another user&rsquo;s personal information without consent`,
  },
  {
    icon: BiBlock,
    title: "Account Suspension and Termination",
    content: `We may suspend or terminate your account if you:

• Violate these Terms of Service
• Engage in fraudulent, illegal, or abusive activities
• Post content that severely violates our Community Standards
• Receive multiple reports or complaints from other users
• Attempt to hack, disrupt, or damage the platform
• Provide false information during registration

Upon termination:
• Outstanding wallet balances may be forfeited (if applicable)
• Your posts, comments, and profile may be hidden or permanently deleted
• You may be prohibited from creating new accounts`,
  },
  {
    icon: BiUserX,
    title: "Limitation of Liability",
    content: `EmptyBD is provided &ldquo;as is&rdquo; without warranties:

• We do not guarantee uninterrupted or error-free service
• We are not liable for the accuracy or reliability of user-generated content
• We are not responsible for losses due to account compromise (keep your credentials secure)
• Platform downtime does not entitle users to compensation
• Maximum liability is limited to the amount in dispute or ৳5,000, whichever is less
• We are not responsible for third-party payment processor issues`,
  },
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
            Terms of Service
          </h1>
          <p className="text-gray-400 text-sm md:text-base">
            Last updated: April 21, 2026
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 md:p-6 mb-6">
          <p className="text-gray-300 leading-relaxed">
            Welcome to EmptyBD. These Terms of Service govern your use of our social media, 
            blogging, and digital content sharing platform. Please read these terms 
            carefully before using our services.
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

        {/* Governing Law */}
        <div className="mt-6 bg-gray-900 border border-gray-800 rounded-lg p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold text-white mb-3">
            Governing Law
          </h2>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed">
            These Terms shall be governed by and construed in accordance with the laws of 
            Bangladesh. Any disputes arising from these terms will be subject to the exclusive 
            jurisdiction of the courts in Dhaka, Bangladesh.
          </p>
        </div>

        {/* Contact Section */}
        <div className="mt-6 bg-gradient-to-r from-secondary/20 to-primary/20 border border-secondary/30 rounded-lg p-4 md:p-6">
          <div className="flex items-center gap-3 mb-2">
            <BiEnvelope className="text-xl text-secondary" />
            <h2 className="text-lg md:text-xl font-semibold text-white">
              Questions About These Terms?
            </h2>
          </div>
          <p className="text-gray-400 text-sm md:text-base">
            If you have any questions about these Terms of Service, please contact us at:{" "}
            <a
              href="mailto:mubinulislam14@gmail.com"
              className="text-secondary hover:text-secondary/80 underline"
            >
              mubinulislam14@gmail.com
            </a>
          </p>
        </div>

        {/* Agreement Note */}
        <p className="text-center text-gray-500 text-xs md:text-sm mt-8">
          By using EmptyBD, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
        </p>
      </div>
    </div>
  );
}
