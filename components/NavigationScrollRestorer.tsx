"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function ScrollRestorerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleScroll = () => {
      // Reset main window scroll
      window.scrollTo(0, 0);
      document.documentElement.scrollTo(0, 0);
      document.body.scrollTo(0, 0);

      // Reset any internal layout containers (e.g. dashboard, admin main panel)
      const scrollContainers = document.querySelectorAll(".overflow-y-auto, .overflow-y-scroll");
      scrollContainers.forEach((container) => {
        container.scrollTo(0, 0);
      });
    };

    // Scroll immediately after component updates
    handleScroll();

    // Scroll again on the next animation frame to ensure dynamic DOM content matches top position
    const frameId = requestAnimationFrame(handleScroll);
    return () => cancelAnimationFrame(frameId);
  }, [pathname, searchParams]);

  return null;
}

export default function NavigationScrollRestorer() {
  return (
    <Suspense fallback={null}>
      <ScrollRestorerInner />
    </Suspense>
  );
}
