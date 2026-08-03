const fs = require('fs');
let c = fs.readFileSync('src/app/(main-layout)/bid/all-selling-product/[id]/page.tsx', 'utf8');

c = c.replace('import { BsBookmark, BsBookmarkFill } from "react-icons/bs";', 
`import { BsBookmark, BsBookmarkFill } from "react-icons/bs";
import ReportModal from "@/components/shared/ReportModal";
import { ShieldCheck } from "lucide-react";`);

c = c.replace('email?: string;', 
`email?: string;
    isVerified?: boolean;`);

c = c.replace(`<div className="flex justify-between items-center gap-4">
          <label className="text-sm lg:text-base">Product Details:</label>
          <button
            onClick={handleToggleBookmark}`, 
`<div className="flex justify-between items-center gap-4">
          <label className="text-sm lg:text-base">Product Details:</label>
          <div className="flex items-center gap-3">
            <ReportModal itemId={bid._id} itemType="auction" buttonText="Report" />
            <button
              onClick={handleToggleBookmark}`);

c = c.replace(`<BsBookmark size={18} />
            )}
          </button>
        </div>`, 
`<BsBookmark size={18} />
            )}
            </button>
          </div>
        </div>`);

c = c.replace(`{bid.seller?.seller_plan === "premium" && (`, 
`{bid.seller.isVerified && (
                  <span title="Verified Seller">
                    <ShieldCheck className="text-emerald-500 w-4 h-4 ml-1" />
                  </span>
                )}
                {bid.seller?.seller_plan === "premium" && (`);

fs.writeFileSync('src/app/(main-layout)/bid/all-selling-product/[id]/page.tsx', c);
console.log("Fixed!");
