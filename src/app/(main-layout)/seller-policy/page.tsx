import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Seller Policy",
  description: "Guidelines and policies for sellers on EmptyBD.",
};

export default function SellerPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 font-parkinsans min-h-screen text-gray-300">
      <h1 className="text-3xl font-bold mb-6 font-orbitron text-white">Seller Policy</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-3 text-white">1. Prohibited Items</h2>
          <p>
            Sellers are strictly prohibited from listing illegal items, counterfeit goods, weapons, hazardous materials, and 
            any products that violate local laws or third-party intellectual property rights.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-white">2. Product Descriptions</h2>
          <p>
            All product descriptions and images must be accurate and truthful. Sellers must clearly disclose any defects or damages. 
            Using generic or duplicate descriptions for varying items is not allowed.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-white">3. Fees and Payments</h2>
          <p>
            Sellers agree to EmptyBD's fee structure, which includes listing fees and commission on successful sales. 
            All payments will be processed securely through our platform and credited to your seller wallet.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-white">4. Order Fulfillment</h2>
          <p>
            Sellers must dispatch items within the promised timeframe. Delays or failure to fulfill orders may result in 
            account suspension or permanent bans from the EmptyBD marketplace.
          </p>
        </section>
      </div>
    </div>
  );
}
