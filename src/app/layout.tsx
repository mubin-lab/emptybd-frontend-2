import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono, Orbitron, Averia_Gruesa_Libre, Parkinsans, Galada, Hind_Siliguri, Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";
import "driver.js/dist/driver.css";
import "react-quill-new/dist/quill.snow.css";
import NavigationScrollRestorer from "@/components/NavigationScrollRestorer";
// import ActivityTracker from "@/components/shared/ActivityTracker";
import ReactQueryProvider from "@/components/shared/ReactQueryProvider";
import { Suspense } from "react";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "EmptyBD - সোশ্যাল মিডিয়া এবং ব্লগিং প্ল্যাটফর্ম বাংলাদেশ",
    template: "%s | EmptyBD",
  },
  description: "EmptyBD হলো বাংলাদেশের অন্যতম প্রধান সোশ্যাল মিডিয়া এবং ব্লগিং প্ল্যাটফর্ম। আপনার কন্টেন্ট শেয়ার করুন, ব্লগ পড়ুন এবং কমিউনিটির সাথে কানেক্ট হোন।",
  keywords: [
    "social media Bangladesh",
    "blogging platform",
    "content sharing",
    "online community",
    "bangla blog",
    "social network",
    "news sharing",
    "সোশ্যাল মিডিয়া বাংলাদেশ",
    "ব্লগিং প্ল্যাটফর্ম",
    "কমিউনিটি",
    "বাংলা ব্লগ",
    "কন্টেন্ট শেয়ারিং",
    "নিউজ প্ল্যাটফর্ম",
    "সামাজিক যোগাযোগ মাধ্যম",
  ],
  authors: [{ name: "EmptyBD" }],
  creator: "EmptyBD",
  publisher: "EmptyBD",
  metadataBase: new URL("https://emptybd.com"),
  openGraph: {
    title: "EmptyBD - সোশ্যাল মিডিয়া এবং ব্লগিং প্ল্যাটফর্ম",
    description: "বাংলাদেশের অন্যতম প্রধান সোশ্যাল মিডিয়া এবং ব্লগিং প্ল্যাটফর্ম। আপনার কন্টেন্ট শেয়ার করুন এবং কমিউনিটির সাথে যুক্ত থাকুন।",
    url: "https://emptybd.com",
    siteName: "EmptyBD",
    locale: "bn_BD",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "EmptyBD - সোশ্যাল মিডিয়া এবং ব্লগ",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EmptyBD - সোশ্যাল মিডিয়া এবং ব্লগিং প্ল্যাটফর্ম",
    description: "বাংলাদেশের অন্যতম প্রধান সোশ্যাল মিডিয়া এবং ব্লগিং প্ল্যাটফর্ম। আপনার কন্টেন্ট শেয়ার করুন এবং কমিউনিটির সাথে যুক্ত থাকুন।",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code", // Replace with actual code
  },
  category: "e-commerce",
  manifest: "/manifest.webmanifest",
  other: {
    "google-adsense-account": "ca-pub-4118894327775590",
    monetag: "266ead5c815393814cae05767b402b6b",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "EmptyBD",
    startupImage: [
      {
        url: "/favicon.png",
        media: "(device-width: 768px) and (device-height: 1024px)",
      },
    ],
  },
};

export const viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
});
const averiaGruesaLibre = Averia_Gruesa_Libre({
  variable: "--font-averia-gruesa-libre-regular",
  subsets: ["latin"],
  weight: "400"
});
const parkinsans = Parkinsans({
  variable: "--font-parkinsans",
  subsets: ["latin"],
  weight: "400"
});

const galada = Galada({
  variable: "--font-galada",
  subsets: ["latin"],
  weight: "400"
});

const hindSiliguri = Hind_Siliguri({
  variable: "--hind-siliguri",
  subsets: ["bengali", "latin"],
  weight: "400"
});

const notoSansBengali = Noto_Sans_Bengali({
  variable: "--font-noto-bengali",
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4118894327775590"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <Script
          src="https://5gvci.com/act/files/tag.min.js?z=11370693"
          strategy="afterInteractive"
          data-cfasync="false"
        />
        <Script
          src="https://n6wxm.com/vignette.min.js"
          strategy="afterInteractive"
          data-zone="11370707"
        />




{/* in-page push */}
{/* <Script
          src="https://nap5k.com/tag.min.js"
          strategy="afterInteractive"
          data-zone="11371546"
        /> */}
 

        {/* multi */}
        {/* <Script
          src="https://quge5.com/88/tag.min.js"
          strategy="afterInteractive"
          data-zone="262405"
          data-cfasync="false"
        /> */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "@id": "https://emptybd.com/#website",
                  url: "https://emptybd.com/",
                  name: "EmptyBD",
                  description: "বাংলাদেশের অন্যতম প্রধান অনলাইন নিলাম এবং ই-কমার্স প্ল্যাটফর্ম।",
                  potentialAction: [
                    {
                      "@type": "SearchAction",
                      target: {
                        "@type": "EntryPoint",
                        urlTemplate: "https://emptybd.com/e-commerce-products?search={search_term_string}"
                      },
                      "query-input": "required name=search_term_string"
                    }
                  ],
                  inLanguage: "bn-BD"
                },
                {
                  "@type": "Organization",
                  "@id": "https://emptybd.com/#organization",
                  name: "EmptyBD",
                  url: "https://emptybd.com/",
                  logo: "https://emptybd.com/logo.png",
                  sameAs: [
                    "https://www.facebook.com/emptybd"
                  ]
                }
              ]
            })
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${orbitron.variable} ${averiaGruesaLibre.variable} ${parkinsans.variable} ${galada.variable} ${hindSiliguri.variable} ${notoSansBengali.variable} antialiased`}
      >
        <ReactQueryProvider>
          {/* User Activity Tracker - uncomment this and the import at the top to re-enable user tracking API */}
          {/* <Suspense fallback={null}>
            <ActivityTracker />
          </Suspense> */}
          <NavigationScrollRestorer />
          {children}
        </ReactQueryProvider>
      </body>
    </html>
  );
}

