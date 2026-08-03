"use client";
import BackendImage from "@/components/shared/BackendImage";

import AllProducts from "@/components/ecommerce/AllProducts";
import { ProfileLoading } from "@/components/loading/ProfileLoading";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/lib/store/authStore";
import Link from "next/link";
import { BiCloudUpload, BiVideo } from "react-icons/bi";
import { BsDoorOpenFill } from "react-icons/bs";
import PageHelpPanel from "@/components/shared/PageHelpPanel";

export default function ECommerceProductsPage() {
  const { user, loading } = useAuthStore();

  if (loading) return <ProfileLoading />;

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <div className="max-w-[1440px] w-[95%] mx-auto flex items-center justify-between pb-2 mb-3 border-b-[1px] border-gray-500">
        {user && (
          <div className="flex items-center gap-3">
            <BackendImage src={user.img} alt="" className="h-10 w-10 rounded-full"  />
            <div>
              <h5 className="text-sm lg:text-base font-medium font-parkinsans">
                {user.name}
              </h5>
              <p className="text-[11px] lg:text-sm font-medium font-parkinsans text-gray-400">
                {user.role === "user" && "Verified User"}
                {user.role === "pending" && "Pending"}
                {user.role === "admin" && "Admin"}
                {user.role === "moderator" && "Moderator"}
              </p>
            </div>
          </div>
        )}
        {user ? (
          <>
          {user.bid_account === "seller" ? (
           <Link prefetch={false}
            href="/e-commerce-products/create"
            className="text-[13px] lg:text-base text-white font-parkinsans flex items-center gap-2 bg-black p-2 rounded-md"
          >
            <BiCloudUpload />
            Post Product
          </Link>
          ) : (
           <Link prefetch={false}
            href="/bid/bid-seller-request"
            className="text-[13px] lg:text-base text-white font-parkinsans flex items-center gap-2 bg-black p-2 rounded-md"
          >
            <BiCloudUpload />
            Post Product
          </Link>
          )}
          </>
          
        ) : (
          <Dialog>
            <DialogTrigger asChild>
              <div className="text-[13px] lg:text-base text-white font-parkinsans flex items-center gap-2 bg-black p-2 rounded-md ml-auto cursor-pointer">
                <BiCloudUpload />
                Post Product
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm p-4">
              <DialogHeader>
                <BsDoorOpenFill className="w-fit mx-auto" size={30} />
                <DialogTitle className="text-base lg:text-lg">
                  Please login your account.
                </DialogTitle>
              </DialogHeader>
              <DialogFooter className="grid grid-cols-2 gap-3">
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button>
                  <Link prefetch={false} href="/login">Login</Link>
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Page Title & SEO Description */}
      <div className="max-w-[1440px] w-[95%] mx-auto mb-6 bg-neutral-900 border border-neutral-800 p-6 rounded-lg mt-4">
        <h1 className="text-xl lg:text-2xl font-medium font-parkinsans text-white mb-2">
          E-Commerce Products Marketplace
        </h1>
        <div className="text-sm text-gray-400 font-hind space-y-2">
          <p>
            Welcome to the EmptyBD E-Commerce marketplace. Browse our extensive collection of products ranging from electronics, fashion, home appliances, and more. 
            We ensure all our sellers are verified to provide you with the best shopping experience in Bangladesh.
          </p>
          <p className="hidden md:block">
            Whether you are looking for the latest smartphones, trendy clothing, or essential home goods, our platform offers competitive pricing and secure transactions. 
            Use our advanced filters to find exactly what you need and take advantage of our robust buyer protection policies.
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <AllProducts />
      
      <PageHelpPanel pageKey="shop" />
    </div>
  );
}
