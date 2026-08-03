import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn more about EmptyBD, our mission, and our team.",
};

export default function AboutUsPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 font-parkinsans min-h-screen">
      <h1 className="text-3xl font-bold mb-6 font-orbitron">About Us</h1>
      
      <div className="space-y-6 text-gray-300">
        <section>
          <h2 className="text-2xl font-semibold mb-3 text-white">Who We Are</h2>
          <p>
            Welcome to EmptyBD, Bangladesh's premier social media and blogging platform. 
            We are dedicated to providing a secure, transparent, and vibrant space for creators and readers to connect.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-white">Our Mission</h2>
          <p>
            Our mission is to revolutionize digital content sharing and community building in Bangladesh by fostering trust, 
            ensuring quality interactions, and delivering an exceptional user experience. We aim to empower individuals to share their stories, 
            read news, and engage in meaningful discussions.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-white">Our Team</h2>
          <p>
            EmptyBD is powered by a team of passionate professionals with expertise in social networking, technology, and community management. 
            We work tirelessly to ensure that our platform remains safe, innovative, and user-friendly for everyone.
          </p>
        </section>
      </div>
    </div>
  );
}
