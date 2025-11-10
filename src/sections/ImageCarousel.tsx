"use client";

import { CircleChevronRight } from "lucide-react";
import { Noto_Serif } from "@next/font/google";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const notoSerif = Noto_Serif({
  weight: "600",
  style: "italic",
  subsets: ["latin"],
});

const memeImages = [
  { id: 1, src: "/carousel/meme1.png", alt: "Meme 1" },
  { id: 2, src: "/carousel/meme2.png", alt: "Meme 2" },
  { id: 3, src: "/carousel/meme3.png", alt: "Meme 3" },
  { id: 4, src: "/carousel/meme4.png", alt: "Meme 4" },
  { id: 5, src: "/carousel/meme5.png", alt: "Meme 5" },
  { id: 6, src: "/carousel/meme6.png", alt: "Meme 6" },
  { id: 7, src: "/carousel/meme7.png", alt: "Meme 7" },
  { id: 8, src: "/carousel/meme8.png", alt: "Meme 8" },
];

export function ImageCarousel() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <section className="py-16 mb-10 mt-5">
      <div className="mx-auto max-w-6xl px-4 text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-[#300458] mb-4">
          <span
            className={`${notoSerif.className} bg-clip-text text-transparent`}
            style={{
              backgroundImage: "linear-gradient(90deg,#CD01BA,#E20317)",
            }}
          >
            Trending{"  "}
          </span>
          Templates
        </h2>
        <p className="text-[#4b087ea5] font-medium text-lg">
          Pick from our collection of classic templates or upload your own image
        </p>
      </div>

      {/* Full-width carousel */}
      <div className="relative w-full overflow-hidden">
        <div className="flex gap-6 animate-marquee w-[200%]">
          {[...memeImages, ...memeImages].map((image, index) => (
            <div
              key={index}
              className="flex-none w-48 sm:w-56 md:w-64 lg:w-72 xl:w-80"
            >
              <div className="relative h-64 overflow-hidden rounded-2xl border border-black/10 bg-black shadow-sm hover:shadow-md transition-shadow duration-300">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 40vw, (max-width: 1024px) 25vw, 20vw"
                  priority
                />
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent"></div>
              </div>
            </div>
          ))}
        </div>
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
            style={{
              backgroundImage: "linear-gradient(90deg,#CD01BA,#E20317)",
            }}
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
