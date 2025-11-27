import { ReactNode } from "react";
import clsx from "clsx";
import { Noto_Serif } from "@next/font/google";
import StarryBackground from "@/components/animation/background";

const notoSerif = Noto_Serif({
  weight: "600",
  style: "italic",
  subsets: ["latin"],
});
type Feature = {
  title: string;
  sub: string;
  bg: string;
  text: string;
};

function ProFeatureCard({ title, sub, bg, text }: Feature) {
  return (
    <div className="group relative rounded-2xl overflow-hidden transition-transform duration-300">
      <div
        className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          backgroundImage: "linear-gradient(90deg,#CD01BA,#E20317)",
          opacity: 0.7,
        }}
      />

      <div
        className={clsx(
          "relative rounded-2xl text-center overflow-hidden transition-all duration-300",
          "border border-black/10 group-hover:border-transparent group-hover:bg-transparent",
          "min-h-[18rem] sm:min-h-[20rem] md:min-h-[22rem] lg:min-h-[24rem] px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-14",
          bg
        )}
      >
        <div className="pointer-events-none absolute inset-[1px] rounded-[15px] transition-all duration-300 group-hover:bg-transparent" />

        <div
          className="pointer-events-none absolute inset-[1px] rounded-[15px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ boxShadow: "inset 0 0 15px rgba(255, 255, 255, 0.9)" }}
        />
        <div className="relative mx-auto flex h-full w-full max-w-[18rem] sm:max-w-[20rem] md:max-w-[22rem] flex-col items-center justify-center gap-4 sm:gap-6 md:gap-8 z-10">
          <h3
            className={clsx(
              "text-xl sm:text-2xl md:text-3xl font-semibold leading-tight tracking-tight transition-colors",
              text,
              "group-hover:text-white"
            )}
          >
            {title}
          </h3>
          <p
            className={clsx(
              "text-sm sm:text-base md:text-lg leading-6 sm:leading-7 transition-colors",
              text,
              "group-hover:text-white"
            )}
          >
            {sub}
          </p>
        </div>
      </div>
    </div>
  );
}

const features: Feature[] = [
  {
    title: "Add Text",
    sub: "Impact-style, outlined, perfectly meme‑y.",
    bg: "bg-[#5B3DF1]",
    text: "text-white",
  },
  {
    title: "Move & Rotate",
    sub: "Drag it, twist it, make it your own",
    bg: "bg-[#E6362A]",
    text: "text-white",
  },
  {
    title: "Stickers & Emojis",
    sub: "Slap on some flair! Add fun",
    bg: "bg-white",
    text: "text-[#5B3DF1]",
  },
  {
    title: "Undo & Reset",
    sub: "Oops? No problem! Fix fast",
    bg: "bg-[#F3D9FF]",
    text: "text-[#2E2633]",
  },
];

export function ProSection() {
  return (
    <StarryBackground className="min-h-[600px] sm:min-h-[650px] md:min-h-[700px]">
      <section id="pro" className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex flex-col items-center text-center gap-6">
          <div className="h-16 w-16 relative bg-transparent">
            {/* CONFIRMED: This remains an <img> tag as requested. */}
            <img
              src="/pro/Love.gif"
              alt="Pro"
              className="object-contain w-full h-full"
            />
          </div>

          <h2 className="text-3xl md:text-4xl font-bold font-['Inter']">
            <span
              className={`${notoSerif.className} bg-clip-text text-transparent`}
              style={{
                backgroundImage: "linear-gradient(90deg,#CD01BA,#E20317)",
              }}
            >
              Everything
            </span>{" "}
            <span className="text-[#300458]">You Need to Meme Like a</span>{" "}
            <span
              className={`${notoSerif.className} bg-clip-text text-transparent`}
              style={{
                backgroundImage: "linear-gradient(90deg,#CD01BA,#E20317)",
              }}
            >
              Pro
            </span>
          </h2>
          <p className="text-black/60">
            Our editor is packed with tools to make meme‑making effortless—and
            fun!
          </p>

          <div className="mt-6 grid w-full gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <ProFeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>
    </StarryBackground>
  );
}
