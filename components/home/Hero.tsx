'use client'
import { usePathname } from "next/navigation";

const HeroSection = ({}) => {
  const pathname = usePathname();

  if(pathname === "/profile" ||  pathname.startsWith("/e-commerce-products/") || pathname.startsWith("/news/") || pathname.startsWith("/user/") || pathname.startsWith("/messages")) return <></>
  return (
    <div className="grid grid-cols-11 w-[95%] lg:max-w-[1440px] mx-auto rounded-xl bg-black border border-gray-900 shadow-2xl h-[95px] md:h-[240px] px-4 sm:px-8 md:px-12 lg:px-16 overflow-hidden mt-4 mb-6 md:mt-6">
      {/* Content */}
      <div className="relative col-span-7 lg:col-span-8 z-10 flex flex-col justify-center h-full text-white text-center">
        <h1
          className="font-orbitron font-bold text-primary-foreground text-start max-w-[200px] md:max-w-[988px]
          text-[14px] md:text-3xl lg:text-4xl xl:text-5xl leading-tight"
        >
          Your product will <span className="text-primary">Sell</span>{" "}
          <span className="text-secondary">depending</span> on the demand
        </h1>
        <p className="font-normal text-[9px] lg:text-sm text-start w-fit flex items-center gap-0.5 text-gray-400 font-parkinsans mt-1.5">
          or how much people want it in Bangladesh
        </p>

        {/* <p
          className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl lg:text-2xl font-normal font-parkinsans 
          max-w-[950px] mx-auto px-2 sm:px-4"
        >
          {description}
        </p> */}

        {/* <div className="flex items-start">
          <Link
            href=""
            className="font-normal text-xs lg:text-sm text-start w-fit underline flex items-center gap-0.5 text-gray-400 font-parkinsans mt-2"
          >
            Explore <FaLocationArrow />
          </Link>
        </div> */}
      </div>

      {/* Background video */}
      <div className="col-span-4 lg:col-span-3 relative w-full h-full overflow-hidden">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/v1775532742/Untitled-4_wlddrm.mp4`}
          autoPlay
          loop
          muted
          playsInline
        />

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
        radial-gradient(circle at 50% 50%, transparent 40%, rgba(0,0,0,0.4) 65%, rgba(0,0,0,0.8) 85%, rgba(0,0,0,0.95) 100%),
        radial-gradient(circle at 50% 50%, transparent 30%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.7) 90%)
      `,
          }}
        />
      </div>
    </div>
  );
};

export default HeroSection;
