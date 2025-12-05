"use client";

import * as React from "react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import { Skeleton } from "@/components/ui/skeleton";
import { useGetMemesQuery } from "@/redux/services/meme";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MemeCarouselProps {
  templateIds: string[];
}

function CustomNextArrow(props: any) {
  const { onClick } = props;
  return (
    <div
      className="absolute top-1/2 right-[-25px] z-10 cursor-pointer -translate-y-1/2 p-2 rounded-full bg-gray-100 shadow-md transition hover:bg-white"
      onClick={onClick}
      aria-label="Next"
    >
      <ChevronRight className="h-6 w-6 text-[#300458]" />
    </div>
  );
}

function CustomPrevArrow(props: any) {
  const { onClick } = props;
  return (
    <div
      className="absolute top-1/2 left-[-25px] z-10 cursor-pointer -translate-y-1/2 p-2 rounded-full bg-gray-100 shadow-md transition hover:bg-white"
      onClick={onClick}
      aria-label="Previous"
    >
      <ChevronLeft className="h-6 w-6 text-[#300458]" />
    </div>
  );
}

function MemeCarouselSkeleton() {
  return (
    <div className="flex gap-6 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="w-1/4 pr-3 min-w-[200px]">
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-black/10 bg-black/10">
            <Skeleton className="absolute inset-0 rounded-2xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MemeCarousel({ templateIds }: MemeCarouselProps) {
  const [isClient, setIsClient] = React.useState(false);
  const sliderRef = useRef<Slider>(null);

  const { memes, isLoading } = useGetMemesQuery(
    {
      page: 1,
      limit: 10,
      templateIds: templateIds,
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

  React.useEffect(() => setIsClient(true), []);

  const MIN_ITEMS = 10;
  let pool: any[] = [];
  if (memes && memes.length > 0) {
    while (pool.length < MIN_ITEMS) pool = pool.concat(memes);
  }
  const display = pool.length > 0 ? pool : memes;

  const settings = {
    dots: false,
    infinite: true,
    speed: 1000,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2500,
    pauseOnHover: true,
    cssEase: "linear",
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
    arrows: true,
    responsive: [
      { breakpoint: 1200, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1 } },
    ],
  };

  if (!isClient) return null;
  if (isLoading || display.length === 0) return <MemeCarouselSkeleton />;

  return (
    <div className="w-full flex justify-center">
      <div className="relative w-full max-w-6xl p-8 rounded-2xl shadow-lg bg-white overflow-visible">
        <style jsx global>{`
          .slick-prev:before,
          .slick-next:before {
            color: #300458;
          }
          .slick-slide > div {
            padding: 0 0.5rem;
          }
        `}</style>

        <Slider {...settings} ref={sliderRef}>
          {display.map((meme, idx) => (
            <div key={`${meme.id}-${idx}`}>
              <Link href={`/community/${meme.slug}`} target="_blank">
                <div className="relative aspect-square overflow-hidden rounded-lg border border-black/10 bg-black shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.05] hover:z-10">
                  <img
                    src={meme.imageUrl}
                    alt={meme.title}
                    className="object-cover w-full h-full"
                    onError={(e) =>
                      (e.currentTarget.src = "/carousel/placeholder.png")
                    }
                  />
                </div>
              </Link>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
}
