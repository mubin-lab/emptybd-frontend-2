import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  // Resolve relative URLs to absolute URLs using the request origin
  let absoluteUrl = imageUrl;
  if (!imageUrl.startsWith("http://") && !imageUrl.startsWith("https://")) {
    try {
      absoluteUrl = new URL(imageUrl, origin).toString();
    } catch (e) {
      return new NextResponse(`Invalid URL format: ${imageUrl}`, { status: 400 });
    }
  }

  try {
    const response = await fetch(absoluteUrl, {
      cache: "no-store", // CRITICAL: Stop Next.js from caching this fetch
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Cache-Control": "no-cache"
      }
    });

    if (!response.ok) {
      return new NextResponse(`Failed to fetch image from source`, { status: response.status });
    }

    const blob = await response.blob();
    const contentType = response.headers.get("Content-Type") || "image/png";

    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        "Pragma": "no-cache",
        "Expires": "0",
        "X-Proxy-Timestamp": Date.now().toString()
      },
    });
  } catch (error: any) {
    return new NextResponse(`Proxy server error: ${error?.message || error}`, { status: 500 });
  }
}

