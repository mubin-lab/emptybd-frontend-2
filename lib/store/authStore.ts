/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReactNode } from "react";
import { create } from "zustand";

type User = {
  referral_code: string;
  referral_count: number;
  applied_referral: any;
  nid_img: any;
  address: any;
  phone_number: any;
  nid: any;
  selfie: any;
  adderss: string;
  role: string;
  product_account: string;
  bid_account: string;
  selling_status: any;
  plan: any;
  amount: ReactNode;
  img: any;
  _id: any;
  id: string;
  email: string;
  name: string;
  bio?: string;
  escrow_locked?: number;
  socials?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  orders?: any[];
  showSuggestedContacts?: boolean;
} | null;

interface AuthState {
  user: User;
  loading: boolean;
  setUser: (user: User) => void;
  clearUser: () => void;
  fetchUser: () => Promise<void>;
}



export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  setUser: (user) => set({ user }),

  clearUser: () => set({ user: null }),

  fetchUser: async () => {
  set({ loading: true });

  try {
    if (typeof window === "undefined") {
      // SSR / build time
      set({ user: null, loading: false });
      return;
    }

    const token = localStorage.getItem("auth_token");

    if (!token) {
      set({ user: null, loading: false });
      return;
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_NODE_API_URL}/auth/profile`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      throw new Error(`Request failed with status ${res.status}`);
    }

    const data = await res.json();
    set({ user: data.user, loading: false });

  } catch (err: any) {
    if (
      typeof window !== "undefined" &&
      (err.message.includes("401") || err.message.includes("403"))
    ) {
      localStorage.removeItem("auth_token");
    }

    set({ user: null, loading: false });
  }
},

}));



// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { ReactNode } from "react";
// import { create } from "zustand";

// type User = {
//   role: string;
//   product_account: string;
//   bid_account: string;
//   selling_status: any;
//   plan: any;
//   amount: ReactNode;
//   img: any;
//   _id: any;
//   id: string;
//   email: string;
//   name: string;
// } | null;

// interface AuthState {
//   user: User;
//   setUser: (user: User) => void;
//   clearUser: () => void;
//   fetchUser: () => Promise<void>;
// }

// export const useAuthStore = create<AuthState>((set) => ({
//   user: null,

//   setUser: (user) => set({ user }),

//   clearUser: () => set({ user: null }),

//   fetchUser: async () => {
//     try {
//       const token = localStorage.getItem("auth_token");
//       console.log(
//         "Token before fetch:",
//         token ? token.substring(0, 20) + "..." : "No token",
//       );

//       if (!token) {
//         console.log("No token found");
//         set({ user: null });
//         return;
//       }

//       console.log(
//         "Fetching profile from:",
//         `${process.env.NEXT_PUBLIC_NODE_API_URL}/auth/profile`,
//       );

//       const res = await fetch(
//         `${process.env.NEXT_PUBLIC_NODE_API_URL}/auth/profile`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//           cache: "no-store",
//         },
//       );

//       console.log("Response status:", res.status);
//       console.log("Response ok?", res.ok);

//       if (!res.ok) {
//         const errorText = await res.text();
//         console.log("Error response:", res.status, errorText);
//         throw new Error(`Request failed with status ${res.status}`);
//       }

//       const data = await res.json();
//       console.log("Received data:", data);

//       set({ user: data.user });
//       console.log("User state updated:", data.user);
//     } catch (err) {
//       console.error("fetchUser error:", err.message);
//       if (err.message.includes("401") || err.message.includes("403")) {
//         console.log("Unauthorized - removing token");
//         localStorage.removeItem("auth_token");
//       }
//       set({ user: null });
//     }
//   },
// }));
