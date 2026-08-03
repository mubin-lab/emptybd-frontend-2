import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Moderation Policy | EmptyBD",
  description: "Learn about EmptyBD's moderation policies, reporting mechanisms, and how we keep the marketplace safe from spam and fake listings.",
};

export default function ModerationPolicyPage() {
  return (
    <div className="max-w-[1440px] w-[95%] mx-auto py-8 md:py-12 text-gray-300 font-hind">
      <div className="max-w-4xl mx-auto bg-gray-900/50 p-6 md:p-10 rounded-2xl border border-gray-800 shadow-xl">
        <h1 className="text-3xl md:text-4xl font-semibold text-white font-parkinsans mb-8 border-b border-gray-800 pb-4">
          Moderation & Content Policy
        </h1>

        <div className="space-y-8 text-sm md:text-base leading-relaxed">
          <section>
            <h2 className="text-xl font-medium text-white mb-3 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-blue-500 rounded-full inline-block"></span>
              Commitment to Safety
            </h2>
            <p>
              At EmptyBD, we are committed to maintaining a safe, transparent, and trustworthy marketplace for all our users. We employ a zero-tolerance policy towards fraudulent activities, fake listings, misleading pricing, and spam.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-white mb-3 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-green-500 rounded-full inline-block"></span>
              Verified Sellers
            </h2>
            <p>
              To ensure the highest quality of service, we manually vet sellers who apply for verification. A "Verified Seller" badge indicates that the seller has undergone our identity and business verification checks. However, buyers should always exercise caution and use our secure payment channels.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-white mb-3 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-red-500 rounded-full inline-block"></span>
              Prohibited Content & Actions
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-400 mt-2">
              <li><strong className="text-gray-300">Fake Listings:</strong> Posting items you do not own or intend to sell.</li>
              <li><strong className="text-gray-300">Misleading Pricing:</strong> Listing an item at an artificially low price but demanding more during the transaction.</li>
              <li><strong className="text-gray-300">Spam:</strong> Repeatedly posting the same item or irrelevant content.</li>
              <li><strong className="text-gray-300">Prohibited Items:</strong> Weapons, illegal substances, or any goods restricted by the laws of Bangladesh.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-medium text-white mb-3 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-purple-500 rounded-full inline-block"></span>
              Reporting System
            </h2>
            <p>
              Every product and auction listing on EmptyBD features a "Report" button. If you encounter a listing that violates our policies, please report it immediately. Our moderation team reviews all reports within 24 hours.
            </p>
            <p className="mt-2">
              Upon receiving a valid report, EmptyBD reserves the right to:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-400 mt-2">
              <li>Temporarily suspend the listing pending investigation.</li>
              <li>Permanently remove the listing.</li>
              <li>Suspend or permanently ban the seller's account.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
