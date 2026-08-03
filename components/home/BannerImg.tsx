"use client";
import Link from "next/link";
import React from "react";

export default function BannerImg() {
  return (
    <div
      className="relative w-[94%] rounded-md mx-auto my-5 h-[180px] lg:h-[700px] xl:h-[903px] overflow-hidden bg-center bg-no-repeat bg-cover"
      style={{
        backgroundImage:
          "url('https://martech.org/wp-content/uploads/2022/03/shutterstock_665225614-scaled.jpg')",
      }}
    >
      <div className="absolute inset-0 bg-black opacity-10 z-10"></div>
    </div>
  );
}
