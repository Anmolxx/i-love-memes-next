import { Skeleton } from "@/components/ui/skeleton";

export function ImageCarouselSkeleton() {
  const count = 8; 

  return (
    <div className="flex gap-6 animate-marquee w-[200%]">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex-none w-48 sm:w-56 md:w-64 lg:w-72 xl:w-80"
        >
          <div className="relative h-64 overflow-hidden rounded-2xl border border-black/10 bg-black/10">
            <Skeleton className="absolute inset-0 rounded-2xl" />
          </div>
        </div>
      ))}
    </div>
  );
}
