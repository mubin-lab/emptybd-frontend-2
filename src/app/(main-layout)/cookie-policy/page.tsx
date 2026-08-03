import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Read about how EmptyBD uses cookies to improve your experience.",
};

export default function CookiePolicyPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 font-parkinsans min-h-screen text-gray-300">
      <h1 className="text-3xl font-bold mb-6 font-orbitron text-white">Cookie Policy</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-3 text-white">1. Introduction</h2>
          <p>
            EmptyBD ("we", "our", or "us") uses cookies and similar technologies to recognize you when you visit our website.
            This policy explains what these technologies are and why we use them.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-white">2. What are cookies?</h2>
          <p>
            Cookies are small data files that are placed on your computer or mobile device when you visit a website. 
            They are widely used to make websites work or to work more efficiently, as well as to provide reporting information.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-white">3. How do we use cookies?</h2>
          <p>
            We use cookies for several reasons. Some cookies are required for technical reasons in order for our website to operate 
            ("essential" cookies). Other cookies enable us to track and target the interests of our users to enhance the experience.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-white">4. Your Choices</h2>
          <p>
            You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting your 
            preferences in your web browser controls.
          </p>
        </section>
      </div>
    </div>
  );
}
