"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; 
import UserBidPostTable from "./UserBidPostTable";
import UserNewsPostTable from "./UserNewsPostTable";
import UserEshopPostTable from "./UserEshopPostTable";

export function UserPost({ email }: { email: string }) {
   
  return (
    <Tabs defaultValue="bid" className="my-5">
      <TabsList >
        <TabsTrigger value="bid">Bid</TabsTrigger>
        <TabsTrigger value="e-shop">e-Shop</TabsTrigger>
        <TabsTrigger value="news">News</TabsTrigger>
      </TabsList>
      <TabsContent value="bid">
        <UserBidPostTable email={email}/>
      </TabsContent>
      <TabsContent value="e-shop">
        <UserEshopPostTable email={email}/>
      </TabsContent>
      <TabsContent value="news">
        <UserNewsPostTable email={email}/>
      </TabsContent>
    </Tabs>
  );
}
