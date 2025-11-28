"use client";
import { Noto_Serif } from "@next/font/google";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetMemesQuery } from "@/redux/services/meme";

const notoSerif = Noto_Serif({
  weight: "600",
  style: "italic",
  subsets: ["latin"],
});

interface MemeCarouselProps {
  templateId: string;
}

function MemeCarouselSkeleton() {
  return (
    <div className="flex gap-6 animate-marquee w-[200%]">
      {Array.from({ length: 8 }).map((_, i) => (
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

export function MemeCarousel({ templateId }: MemeCarouselProps) {
  const [isClient, setIsClient] = useState(false);

  const { memes, isLoading } = useGetMemesQuery(
    {
      page: 1,
      limit: 10,
      templateIds: [templateId],
      orderBy: "trending",
      order: "DESC",
    },
    {
      selectFromResult: ({ data, isLoading }) => ({
        isLoading,
        memes:
          data?.items?.map((m: any) => ({
            id: m.id,
            slug: m.slug,
            title: m.title,
            imageUrl: m.file?.path ?? "/carousel/placeholder.png",
          })) ?? [],
      }),
    }
  );
  useEffect(() => setIsClient(true), []);

  if (!isClient) return null;

  return (
    <section className="py-16 mb-10 mt-5">
      <div className="relative w-full overflow-hidden">
        {isLoading ? (
          <MemeCarouselSkeleton />
        ) : (
          <div className="flex gap-6 animate-marquee w-[200%]">
            {[...memes, ...memes].map((meme, idx) => (
              <div
                key={idx}
                className="flex-none w-48 sm:w-56 md:w-64 lg:w-72 xl:w-80"
              >
                <Link href={`/community/${meme.slug}`} target="_blank">
                  <div className="relative h-64 overflow-hidden rounded-2xl border border-black/10 bg-black shadow-sm hover:shadow-md transition-shadow duration-300">
                    <img
                      src={meme.imageUrl}
                      alt={meme.title}
                      className="object-contain absolute inset-0 w-full h-full"
                      onError={(e) => (e.currentTarget.src = "/carousel/placeholder.png")}
                    />
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </section>
  );
}
