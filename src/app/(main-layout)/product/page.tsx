import Empty from "@/components/NotFound.tsx/Empty";
import Unauthorized from "@/components/NotFound.tsx/Unauthorized";
import React from "react";

export default function page() {
  return (
    <div>
      {/* <Empty description="Ohh! No Data availabe for you."/> */}
      <Unauthorized description="You are not authorized to view this page"/>
    </div>
  );
}
