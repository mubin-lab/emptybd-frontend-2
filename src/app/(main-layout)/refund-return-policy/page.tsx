import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund & Return Policy",
  description: "Learn about the refund and return guidelines at EmptyBD.",
};

export default function RefundReturnPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 font-parkinsans min-h-screen text-gray-300">
      <h1 className="text-3xl font-bold mb-6 font-orbitron text-white">Refund & Return Policy</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-3 text-white">1. Return Eligibility</h2>
          <p>
            Items can be returned within 7 days of delivery if they are damaged, defective, or not as described. 
            The item must be unused, in its original packaging, and include all tags and accessories.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-white">2. Non-Returnable Items</h2>
          <p>
            Certain categories of products, such as perishable goods, customized items, digital products, and items 
            sold in final-sale auctions, cannot be returned unless they arrive significantly damaged.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-white">3. Refund Process</h2>
          <p>
            Once we receive your returned item, our team will inspect it and notify you of the approval or rejection of your refund. 
            Approved refunds will be processed and credited to your original method of payment or your EmptyBD wallet within 5-7 business days.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-white">4. Return Shipping</h2>
          <p>
            You will be responsible for paying for your own shipping costs for returning your item unless the return is due to our error. 
            Shipping costs are non-refundable.
          </p>
        </section>
      </div>
    </div>
  );
}
