import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Buyer Protection Policy",
  description: "Shop with confidence at EmptyBD with our Buyer Protection Policy.",
};

export default function BuyerProtectionPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 font-parkinsans min-h-screen text-gray-300">
      <h1 className="text-3xl font-bold mb-6 font-orbitron text-white">Buyer Protection Policy</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-3 text-white">1. Secure Payments</h2>
          <p>
            All payments made on EmptyBD are processed through secure, encrypted gateways. 
            We hold funds securely until the transaction is successfully completed, ensuring your money is safe.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-white">2. Item Not Received</h2>
          <p>
            If you do not receive your item within the guaranteed delivery time, you are eligible for a full refund. 
            Our support team will intervene to track the package or process your refund promptly.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-white">3. Not as Described</h2>
          <p>
            If the item you receive is significantly different from the seller's description, you can return it 
            for a full refund or keep the item and agree to a partial refund with the seller.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-white">4. Dispute Resolution</h2>
          <p>
            In the event of a disagreement with a seller, our dedicated dispute resolution team will step in to 
            mediate and ensure a fair outcome based on our policies and the evidence provided.
          </p>
        </section>
      </div>
    </div>
  );
}
