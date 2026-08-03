import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "../ui/Card";

export function CardLoading() {
  return (
    <div className="max-w-[1440px] w-[95%] mx-auto">
      <Card className="w-full bg-transparent p-0">
        <CardHeader>
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-14 aspect-video w-full" />
        </CardContent>
        <CardHeader>
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-14 aspect-video w-full" />
        </CardContent>
        <CardHeader>
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-14 aspect-video w-full" />
        </CardContent>
        <CardHeader>
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-14 aspect-video w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
