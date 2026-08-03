import { useEffect, useState } from "react";

export function BidStatus({ endTime }: { endTime: string }) {
  const [isEnded, setIsEnded] = useState(false);

  useEffect(() => {
    const end = new Date(endTime).getTime();

    if (isNaN(end)) {
      setIsEnded(true);
      return;
    }

    const check = () => {
      const now = Date.now();
      if (now >= end) {
        setIsEnded(true);
      }
    };

    check();
    const interval = setInterval(check, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  return isEnded ? (
    <span className="text-red-500 text-xs lg:text-base">Closed</span>
  ) : (
    <span className=" px-1 pb-0.5 h-fit rounded-sm">
      <span className="underline text-green-400 animate-pulse font-semibold text-xs lg:text-base">
        {" "}
        • Live{" "}
      </span>
    </span>
  );
}
