import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Auction Rules & Integrity | EmptyBD",
  description: "Read EmptyBD's official auction rules, bidding mechanics, and our strict anti-gambling policy.",
};

export default function AuctionRulesPage() {
  return (
    <div className="max-w-[1440px] w-[95%] mx-auto py-8 md:py-12 text-gray-300 font-hind">
      <div className="max-w-4xl mx-auto bg-gray-900/50 p-6 md:p-10 rounded-2xl border border-gray-800 shadow-xl">
        <h1 className="text-3xl md:text-4xl font-semibold text-white font-parkinsans mb-8 border-b border-gray-800 pb-4">
          Auction Rules & Integrity
        </h1>

        <div className="space-y-8 text-sm md:text-base leading-relaxed">
          <section>
            <h2 className="text-xl font-medium text-white mb-3 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-amber-500 rounded-full inline-block"></span>
              Nature of Auctions
            </h2>
            <p>
              EmptyBD facilitates genuine auctions for legitimate physical and digital goods. <strong>Our auctions are not lotteries, games of chance, or gambling.</strong> Bidding represents a legally binding contract to purchase the item at the bid price if you are the highest bidder at the end of the auction period.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-white mb-3 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-blue-500 rounded-full inline-block"></span>
              Bidding Rules
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-400 mt-2">
              <li><strong className="text-gray-300">Minimum Bids:</strong> Every bid must be at least ৳1 higher than the current highest bid.</li>
              <li><strong className="text-gray-300">Sufficient Balance:</strong> You must have sufficient balance in your EmptyBD wallet or account to cover the cost of your bid.</li>
              <li><strong className="text-gray-300">Binding Commitment:</strong> Once a bid is placed, it cannot be retracted. If you win, you must finalize the purchase.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-medium text-white mb-3 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-red-500 rounded-full inline-block"></span>
              Anti-Shill Bidding Policy
            </h2>
            <p>
              Shill bidding—the act of artificially inflating the price of an item by bidding on your own listing or colluding with others to do so—is strictly prohibited. 
            </p>
            <p className="mt-2">
              Our automated systems and moderation team actively monitor bidding patterns. If shill bidding is detected, the auction will be voided, and the offending accounts will be permanently banned from the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-white mb-3 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-purple-500 rounded-full inline-block"></span>
              Winning and Finalization
            </h2>
            <p>
              When an auction ends, the highest bidder is declared the winner. The winner will be notified immediately and must finalize the payment and shipping details within 48 hours. Failure to finalize the transaction may result in account penalties or suspension.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
