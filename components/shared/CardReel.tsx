import Link from "next/link";
import { Button } from "@/components/ui/Button";
import BackendImage from "@/components/shared/BackendImage";

export type ExchangeAsset = {
  sellerEmail: any;
  _id: string;
  title: string;
  description: string;
  currentPrice: number;
  image: string;
  category: string;
  status: string;
  isListed: boolean;
  owner: {
    _id: string;
    name: string;
    email: string;
    img?: string;
  };
  sellerName?: string;
  sellerAvatar?: string;
  type?: 'exchange';
};

export function CardReel({
  asset,
  index,
  total,
}: {
  asset: ExchangeAsset;
  index: number;
  total: number;
}) {
  return (
    <div className="relative w-full h-[92vh] snap-start snap-always bg-black flex flex-col justify-center overflow-hidden group">
      {/* Main Card Image */}
      <div className="absolute inset-0 z-0">
        <BackendImage
          showShine
          src={asset.image}
          alt={asset.title}
          className="w-full h-full object-cover opacity-90"
        />
        {/* Dark gradient overlay for text readability */}
        <div className="absolute inset-0 pointer-events-none" />
      </div>

      {/* Floating Info Section */}
      <div className="absolute bottom-0 left-0 right-0 p-6 pt-24 z-20 pointer-events-auto">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 mb-1">
              {asset.sellerAvatar ? (
                <BackendImage
                  src={asset.sellerAvatar}
                  alt={asset.sellerName || "Seller"}
                  className="w-8 h-8 rounded-full object-cover border border-gray-700 shadow-md"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700 shadow-md">
                  <span className="text-xs text-gray-400">{(asset.sellerName || "S")[0].toUpperCase()}</span>
                </div>
              )}
              <Link href={`/user/${asset.sellerEmail}`} className="text-sm font-medium text-white/90 drop-shadow-md">{asset.sellerName || "EmptyBD System"}</Link>
            </div>
            <div className="text-xl md:text-2xl font-bold text-green-400 font-mono drop-shadow-lg bg-black/40 px-3 py-1 rounded-lg backdrop-blur-sm border border-green-500/30">
              ৳ {asset.currentPrice}
            </div>
          </div>

          <Link href={`/digital-exchange/${asset._id}`} className="hover:opacity-80 transition-opacity">
            <h1 className="text-xl md:text-3xl font-bold font-orbitron text-white drop-shadow-lg">
              {asset.title}
            </h1>
          </Link>

          <div className="flex items-center justify-between mt-2">
            <div className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white backdrop-blur-md border border-white/20">
              {asset.category}
            </div>

            <Link href={`/digital-exchange/${asset._id}`}>
              <Button className="bg-primary hover:bg-primary/90 text-black font-bold px-6 py-2 rounded-full shadow-xl">
                View Asset
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
