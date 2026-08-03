import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/_next/",
          "/profile",
          "/transaction/",
          "/notification",
          "/my-bided",
          "/bid/create-bid",
          "/e-commerce-products/create",
          "/e-commerce-products/edit",
          "/e-commerce-products/order",
          "/news/create-news",
          "/login",
          "/register",
          "/forgot-password",
          "/verify-email",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/api/",
          "/profile",
          "/transaction/",
          "/notification",
          "/my-bided",
          "/bid/create-bid",
          "/e-commerce-products/create",
          "/e-commerce-products/edit",
          "/e-commerce-products/order",
          "/news/create-news",
          "/login",
          "/register",
        ],
      },
    ],
    sitemap: "https://emptybd.com/sitemap.xml",
    host: "https://emptybd.com",
  };
}
