import { Skeleton } from "@/components/ui/skeleton";

export function ProfileLoading() {
  return (
    <div className="flex items-center gap-4 max-w-[1440px] w-[95%] mx-auto mt-5">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  );
}
