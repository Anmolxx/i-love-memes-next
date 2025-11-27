"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Rocket } from "lucide-react";
import { Noto_Serif } from "@next/font/google";
import StarryBackground from "@/components/animation/background";

const notoSerif = Noto_Serif({
  weight: "600",
  style: "italic",
  subsets: ["latin"],
});

export function Hero() {
  const [hovered, setHovered] = useState(false);

  return (
    <StarryBackground height="550px">
      <section
        id="hero"
        className="w-full relative flex items-center justify-center"
      >
        <div className="mx-auto max-w-7xl px-4 pt-12 md:pt-16 pb-20 md:pb-28 grid items-center gap-8 md:gap-50 md:grid-cols-2">
          {/* Text content */}
          <div className="space-y-4 md:space-y-6 text-center md:text-left">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-[#300458]">
              Memes Made{" "}
              <span
                className={`${notoSerif.className} bg-clip-text text-transparent`}
                style={{
                  backgroundImage: "linear-gradient(90deg,#CD01BA,#E20317)",
                }}
              >
                Simple
              </span>
              .<br />
              Fun Made{" "}
              <span
                className={`${notoSerif.className} bg-clip-text text-transparent`}
                style={{
                  backgroundImage: "linear-gradient(90deg,#CD01BA,#E20317)",
                }}
              >
                Endless
              </span>
              .
            </h1>
            <p className="text-[#4b087ea5] font-medium text-sm md:text-lg max-w-[450px]">
              Dive into your meme playground—fun starts the moment you click!
            </p>
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div
                className="rounded-full p-[3px]"
                style={{
                  background: "linear-gradient(90deg,#CD01BA,#E20317)",
                  boxShadow:
                    "0 2px 8px rgba(205,1,186,0.5), 0 2px 8px rgba(226,3,23,0.5)",
                }}
              >
                <Link
                  href="/meme"
                  className="flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 rounded-full text-white font-medium shadow-sm text-sm md:text-base"
                  style={{
                    backgroundImage: "linear-gradient(90deg,#CD01BA,#E20317)",
                  }}
                  target="_blank"
                >
                  Generate Meme
                  <Rocket className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Image content */}
          <div
            className="relative order-first md:order-last"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <div
              className="relative w-full max-w-xs sm:max-w-sm mx-auto md:max-w-md overflow-hidden rounded-xl border border-black/10 bg-white/70"
              style={{ aspectRatio: "4/2.5" }}
            >
              <Image
                src="/hero/hero-meme.png"
                alt="Meme preview"
                fill
                className="object-cover"
                sizes="(min-width: 768px) 20rem, (max-width: 640px) 16rem, 100vw"
                priority
              />
            </div>

            {/* hover pop-outs */}
            <div className="pointer-events-none absolute inset-0 hidden md:block">
              <div
                className={`absolute left-2 -top-4 rounded-full px-1 py-1 transition-all duration-300 transform
                  ${
                    hovered
                      ? "opacity-100 -translate-x-8"
                      : "opacity-0 translate-x-4 translate-y-10" 
                  }`}
              >
                <div
                  className="bg-white/50 absolute inset-0 rounded-full backdrop-blur-sm shadow-md"
                ></div>
                <div
                  className="relative bg-white/80 rounded-full px-1 py-1 text-base font-medium text-gray-800"
                >
                 <img
                     src="/pro/fireworks.gif"
                     alt="Pro"
                     className="object-contain w-15 h-15"
                   />
                </div>
              </div>
              <div
                className={`absolute -right-6 -bottom-12 rounded-3xl px-1 py-1 transition-all duration-300 transform
                  ${
                    hovered
                      ? "opacity-100 translate-x-8 -translate-y-4" 
                      : "opacity-0 translate-y-0"  
                  }`}
              >
                <div
                  className="bg-white/50 absolute inset-0 rounded-3xl backdrop-blur-sm shadow-md"
                ></div>
                <div
                  className="relative bg-white/80 rounded-3xl px-4 py-2 text-base font-medium text-gray-800 flex flex-col items-center justify-center gap-2"
                >
                  <img
                      src="/pro/refresh.gif"
                      alt="Pro"
                      className="object-contain w-12 h-12"
                    />
                    Rotate / Resize Anything
                </div>
              </div>
              <div
                  className={`absolute left-1/2 -top-4 rounded-3xl px-1 py-1 transition-all duration-300 transform -translate-x-1/2
                  ${
                      hovered
                        ? "opacity-100 -translate-y-4"
                        : "opacity-0 translate-y-0"
                  }`}
              >
                  <div
                    className="bg-white/50 absolute inset-0 rounded-3xl backdrop-blur-sm shadow-md"
                  ></div>
              
                  <div
                    className="relative bg-white/80 rounded-3xl px-4 py-2 text-base font-medium text-gray-800"
                  >
                    Too Funny not to share
                  </div>
              </div>
              <div
                className={`absolute -left-16 bottom-[2rem] rounded-3xl px-1 py-1 transition-all duration-300 transform
                  ${
                    hovered
                      ? "opacity-100 -translate-x-8" 
                      : "opacity-0 translate-x-10"  
                  }`}
              >
                <div
                  className="bg-white/50 absolute inset-0 rounded-3xl backdrop-blur-sm shadow-md"
                ></div>
                <div
                  className="relative bg-white/80 rounded-3xl px-4 py-2 text-base font-medium text-gray-800 flex flex-col items-center justify-center gap-2"
                >
                  <img
                      src="/pro/emoji.gif"
                      alt="Pro"
                      className="object-contain w-12 h-12"
                    />
                  Add Stickers/Emojis
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </StarryBackground>
  );
}
