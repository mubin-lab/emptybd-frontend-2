import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the EmptyBD team for support or inquiries.",
};

export default function ContactUsPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 font-parkinsans min-h-screen">
      <h1 className="text-3xl font-bold mb-6 font-orbitron">Contact Us</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-6 text-gray-300">
          <p>
            Have a question, feedback, or need assistance? We're here to help! 
            Reach out to us using the contact details below or fill out the form.
          </p>

          <div>
            <h3 className="text-xl font-semibold mb-2 text-white">Contact Information</h3>
            <ul className="space-y-2">
              <li><strong>Email:</strong> support@emptybd.com</li>
              <li><strong>Phone:</strong> +880 1234 567890</li>
              <li><strong>Address:</strong> Dhaka, Bangladesh</li>
            </ul>
          </div>
        </div>

        <div className="bg-neutral-900 p-6 rounded-lg border border-neutral-800">
          <form className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Name</label>
              <input type="text" id="name" className="w-full bg-neutral-800 border border-neutral-700 rounded-md p-2 text-white" placeholder="Your Name" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input type="email" id="email" className="w-full bg-neutral-800 border border-neutral-700 rounded-md p-2 text-white" placeholder="Your Email" />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">Message</label>
              <textarea id="message" rows={4} className="w-full bg-neutral-800 border border-neutral-700 rounded-md p-2 text-white" placeholder="How can we help?"></textarea>
            </div>
            <button type="button" className="w-full bg-white text-black font-semibold py-2 rounded-md hover:bg-gray-200 transition-colors">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
