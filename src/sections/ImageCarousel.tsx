"use client";

import { CircleChevronRight } from "lucide-react";
import { Noto_Serif } from "@next/font/google";
import NextImage from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetTemplatesQuery } from "@/redux/services/template";

const notoSerif = Noto_Serif({
  weight: "600",
  style: "italic",
  subsets: ["latin"],
});

// Skeleton component for carousel
function ImageCarouselSkeleton() {
  return (
    <div className="flex gap-6 animate-marquee w-[200%]">
      {Array.from({ length: 10 }).map((_, i) => (
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

export function ImageCarousel() {
  const [isClient, setIsClient] = useState(false);

  const { templates, isLoading } = useGetTemplatesQuery(
    {
      page: 1,
      limit: 10,
      orderBy: "updatedAt",
      order: "DESC",
    },
    {
      selectFromResult: ({ data, isLoading }) => ({
        isLoading,
        templates:
          data?.items?.map((t: any) => {
            const bg = t?.config?.backgroundImage;
            return {
              id: t.id,
              slug: t.slug,
              title: t.title,
              previewUrl: bg?.src ?? "/placeholder-meme.png",
            };
          }) ?? [],
      }),
    }
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <section className="py-16 mb-10 mt-5">
      <div className="mx-auto max-w-6xl px-4 text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-[#300458] mb-4">
          <span
            className={`${notoSerif.className} bg-clip-text text-transparent`}
            style={{ backgroundImage: "linear-gradient(90deg,#CD01BA,#E20317)" }}
          >
            Trending{" "}
          </span>
          Templates
        </h2>
        <p className="text-[#4b087ea5] font-medium text-lg">
          Pick from our latest trending templates
        </p>
      </div>

      {/* Carousel */}
      <div className="relative w-full overflow-hidden">
        {isLoading ? (
          <ImageCarouselSkeleton />
        ) : (
          <div className="flex gap-6 animate-marquee w-[200%]">
            {[...templates, ...templates].map((template, idx) => (
              <div
                key={idx}
                className="flex-none w-48 sm:w-56 md:w-64 lg:w-72 xl:w-80"
              >
                <Link href={`/meme/${template.slug}`} target="_blank">
                  <div className="relative h-64 overflow-hidden rounded-2xl border border-black/10 bg-black shadow-sm hover:shadow-md transition-shadow duration-300">
                    <img
                      src={template.previewUrl}
                      alt={template.title}
                      className="object-contain"
                      sizes="(max-width: 768px) 40vw,
                             (max-width: 1024px) 25vw,
                             20vw"
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

      <div className="text-center mt-12">
        <div
          className="inline-block rounded-full p-[3px]"
          style={{
            background: "linear-gradient(90deg,#CD01BA,#E20317)",
            boxShadow:
              "0 2px 8px rgba(205,1,186,0.5), 0 2px 8px rgba(226,3,23,0.5)",
          }}
        >
          <Link
            href="/meme"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-medium shadow-sm text-sm md:text-base"
            style={{ backgroundImage: "linear-gradient(90deg,#CD01BA,#E20317)" }}
          >
            Use Template
            <CircleChevronRight className="w-4 h-4 mt-0.5" />
          </Link>
        </div>
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
