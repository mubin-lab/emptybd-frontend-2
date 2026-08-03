import React from 'react'
import MyOrdersPage from '../dashboard/my-orders/page'

export default function page() {
  return (
    <div>
      <MyOrdersPage/>
    </div>
  )
}




// "use client";
import BackendImage from "@/components/shared/BackendImage";

// /* eslint-disable react-hooks/rules-of-hooks */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @next/next/no-img-element */

// import { useEffect, useRef, useState } from "react";
// import Countdown from "@/components/short-component/Countdown";
// import { BidStatus } from "@/components/short-component/BidStatus";
// import {
//   Dialog,
//   DialogClose,
//   DialogContent,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/Button";
// import { useAuthStore } from "@/lib/store/authStore";
// import { io, Socket } from "socket.io-client";
// import { Input } from "@/components/ui/Input";
// import Link from "next/link";
// import Empty from "@/components/NotFound.tsx/Empty";
// import Unauthorized from "@/components/NotFound.tsx/Unauthorized";
// import { SpinnerCustom } from "@/components/loading/Spinner";
// import MyOrdersPage from "../dashboard/my-orders/page";

// const SOCKET_URL = `${process.env.NEXT_PUBLIC_NODE_API_URL}`;

// // Single socket instance
// const socket: Socket = io(SOCKET_URL, {
//   autoConnect: true,
//   reconnection: true,
//   reconnectionAttempts: 5,
//   reconnectionDelay: 1000,
// });

// interface BidForAll {
//   _id: string;
//   product: {
//     image_url: string | Blob | undefined;
//     title: string;
//     media_url: string;
//     media_type: string;
//     base_price: number;
//   };
//   bidding_price: number;
//   start_bid: number;
//   end_bid_time: string;
//   user_bidded: Array<{
//     bidder_name: string;
//     bidder_email: string;
//     bidder_img: string;
//     bidd_price: number;
//     bidd_time: string | Date;
//   }>;
//   seller?: {
//     seller_plan: string;
//     seller_id: string;
//     seller_img: string;
//     seller_name: string;
//     seller_email: string;
//   };
// }

// export default function page() {
//   const [bids, setBids] = useState<BidForAll[]>([]);
//   const [loadingBid, setLoadingBid] = useState(true);
//   const { user, fetchUser, loading } = useAuthStore();

//   // Auth check
//   useEffect(() => {
//     if (!user) {
//       fetchUser();
//     }
//   }, [user, fetchUser]);

//   // Fetch all bids
//   useEffect(() => {
//     if (!user) return;

//     const fetchMyBids = async () => {
//       try {
//         const res = await fetch(
//           `${process.env.NEXT_PUBLIC_NODE_API_URL}/bid/user/my-bids`,
//           {
//             headers: {
//               Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
//             },
//           },
//         );

//         const data = await res.json();
//         setBids(data);
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoadingBid(false);
//       }
//     };

//     fetchMyBids();
//   }, [user]);

//   // Socket: connection + global real-time listener
//   useEffect(() => {
//     // Connection debug
//     socket.on("connect", () => {
//       console.log("Socket connected to backend:", socket.id);
//     });

//     socket.on("connect_error", (err) => {
//       console.error("Socket connection error:", err.message);
//     });

//     // Real-time bid update listener (global)
//     socket.on("bid_updated", (updatedBid: BidForAll) => {
//       console.log(
//         "REAL-TIME BID UPDATE RECEIVED:",
//         updatedBid._id,
//         updatedBid.bidding_price,
//       );

//       setBids((prev) =>
//         prev.map((b) =>
//           b._id === updatedBid._id
//             ? {
//                 ...b,
//                 bidding_price: updatedBid.bidding_price,
//                 user_bidded: updatedBid.user_bidded || b.user_bidded,
//               }
//             : b,
//         ),
//       );
//     });

//     return () => {
//       socket.off("connect");
//       socket.off("connect_error");
//       socket.off("bid_updated");
//     };
//   }, []);
//   if(!user) return <Unauthorized description="You are not authorized to view this page"/>

//   if (loadingBid || loading) {
//     return <SpinnerCustom />;
//   }

//   if(bids.length === 0) return <Empty description="Ohh! No Data availabe for you."/>
//   return (
//     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 max-w-[1440px] w-11/12 mx-auto">
//       {Array.isArray(bids) &&
//         bids.map((bid) => <BidCard key={bid._id} bid={bid} user={user} />)}
//     </div>
//   );
// }

// // Bid Card + Dialog
// function BidCard({ bid, user }: { bid: BidForAll; user: any }) {
//   // Room join (per card)
//   useEffect(() => {
//     socket.emit("joinBidRoom", bid._id);
//     console.log("Card joined room:", bid._id);

//     return () => {
//       socket.emit("leaveBidRoom", bid._id);
//       console.log("Left room:", bid._id);
//     };
//   }, [bid._id]);


//   return (
//     <div className="backdrop-blur-sm bg-black/20 rounded-lg lg:p-4 flex flex-col justify-between min-h-full">



//     {bid.product.media_type && (
//         <div className="relative w-full aspect-6/3 overflow-hidden rounded-t-lg bg-black/20">
//           {bid.product.media_type === "image" ? (
//             // Image case
//             <BackendImage
//               src={bid.product.media_url}
//               alt={bid.product.title || "Product image"}
//               className="absolute inset-0 h-full w-full object-cover"
//               loading="lazy"
//              />
//           ) : bid.product.media_type === "video" ? (
//             // Video case
//             <video
//               src={bid.product.media_url}
//               autoPlay
//               loop
//               muted
//               playsInline
//               className="absolute inset-0 h-full w-full object-cover"
//             >
//               <source src={bid.product.media_url} type="video/mp4" />
//               Your browser does not support the video tag.
//             </video>
//           ) : (
//             <div className="absolute inset-0 flex items-center justify-center text-gray-400">
//               No media available
//             </div>
//           )}

//           <div className="absolute top-[3%] right-[2%] z-10">
//             <BidStatus endTime={bid?.end_bid_time || ""} />
//           </div>

//           <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
//         </div>
//       )}

//       {!bid.product.media_type && (
//         <div className="relative w-full aspect-6/3 overflow-hidden rounded-t-lg bg-black/20">
//           <BackendImage
//             src={bid.product.image_url}
//             alt={bid.product.title || "Product image"}
//             className="absolute inset-0 h-full w-full object-cover"
//             loading="lazy"
//            />

//           <div className="absolute top-[3%] right-[2%] z-10">
//             <BidStatus endTime={bid?.end_bid_time || ""} />
//           </div>

//           <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
//         </div>
//       )}

//       <div className="p-2 flex-1 space-y-1">
//         <h2 className="text-lg lg:text-xl font-medium mt-2 font-averia-gruesa-libre">
//           {bid.product.title}
//         </h2>

//         <div className="flex items-start justify-between">
//           <div className="space-y-1">
//             {bid.seller && (
//               <div className="flex items-center gap-2">
//                 <BackendImage
//                   src={bid.seller.seller_img}
//                   alt={bid.seller?.seller_name}
//                   className="w-6 h-6 rounded-full"
//                  />
//                 <div className="flex items-center gap-1">
//                   <p className="text-xs lg:text-base font-semibold line-clamp-1">
//                     {bid.seller?.seller_name}
//                   </p>
//                   {bid.seller?.seller_plan === "premium" && (
//                     <svg
//                       width="13"
//                       height="13"
//                       viewBox="0 0 13 13"
//                       xmlns="http://www.w3.org/2000/svg"
//                     >
//                       <defs>
//                         <radialGradient id="blue">
//                           <stop offset="0%" stop-color="#4dabf7" />
//                           <stop offset="60%" stop-color="#006aff" />
//                           <stop offset="100%" stop-color="#0050cc" />
//                         </radialGradient>
//                       </defs>

//                       <circle cx="6.5" cy="6.5" r="6.2" fill="url(#blue)" />

//                       <path
//                         d="M4 6.6 L5.8 8.4 L9 5.2"
//                         stroke="white"
//                         stroke-width="1.35"
//                         fill="none"
//                       />
//                     </svg>
//                   )}
//                   {bid.seller?.seller_plan === "owner" && (
//                     <svg
//                       width="13"
//                       height="13"
//                       viewBox="0 0 13 13"
//                       xmlns="http://www.w3.org/2000/svg"
//                     >
//                       <defs>
//                         <radialGradient id="gold">
//                           <stop offset="0%" stop-color="#ffdd80" />
//                           <stop offset="60%" stop-color="#ffb516" />
//                           <stop offset="100%" stop-color="#e89f00" />
//                         </radialGradient>
//                       </defs>
//                       <circle cx="6.5" cy="6.5" r="6.2" fill="url(#gold)" />
//                       <path
//                         d="M4 6.6 L5.8 8.4 L9 5.2"
//                         stroke="white"
//                         stroke-width="1.35"
//                         fill="none"
//                       />
//                     </svg>
//                   )}
//                 </div>
//               </div>
//             )}

//             <p className="text-xs lg:text-base font-light font-averia-gruesa-libre">
//               Base price: <span className="font-orbitron">৳</span>{" "}
//               {bid.start_bid} (Taka)
//             </p>

//             {bid.user_bidded?.at(-1)?.bidder_name ? (
//               <p className="text-xs lg:text-sm text-gray-400">
//                 Last bid by{" "}
//                 <span className="font-medium">
//                   {/* {bid.user_bidded?.at(-1)?.bidder_name || "No bids yet"}  */}
//                   {user?.name === bid.user_bidded?.at(-1)?.bidder_name
//                     ? "You"
//                     : `${bid.user_bidded?.at(-1)?.bidder_name}`}
//                 </span>
//               </p>
//             ) : (
//               <p className="text-xs lg:text-sm text-gray-400">No bids yet</p>
//             )}
//           </div>
//           <div className="flex flex-col items-end">
//             <p className="text-xl lg:text-base font-medium font-averia-gruesa-libre">
//               <span className="font-orbitron">৳</span> {bid.bidding_price}
//             </p>
//             <Countdown
//               endTime={bid.end_bid_time}
//               className="text-green-400 text-xs lg:text-sm font-medium"
//             />
//           </div>
//         </div>
//       </div>
//       <Link prefetch={false} href={`/bid/all-selling-product/${bid._id}`}>
//         <Button variant="outline" className="w-full">
//           View
//         </Button>
//       </Link>
//     </div>
//   );
// }
