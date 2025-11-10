import { Card } from '@/components/ui/extension/card-extension'
import { Noto_Serif } from "@next/font/google";

import { ImagePlus, SquareBottomDashedScissors, Smile } from "lucide-react";

const notoSerif = Noto_Serif({
  weight: "600",
  style: "italic",
  subsets: ["latin"],
});

const steps = [
  {
    title: "Upload Your Image",
    description: "Pick a template or bring your own shot to kick things off.",
    icon: ImagePlus,
  },
  {
    title: "Craft The Perfect Caption",
    description:
      "Impact style, outlined, perfectly meme‑y. Add emojis and stickers.",
    icon: SquareBottomDashedScissors,
  },
  {
    title: "Share The Laughs",
    description:
      "Download or post instantly—let the internet enjoy your genius.",
    icon: Smile,
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-16 mb-20">
      <div className="mb-10 space-y-2 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-[#1F1147]">
          How it{" "}
          <span
            className={`${notoSerif.className} bg-clip-text text-transparent`}
            style={{
              backgroundImage: "linear-gradient(90deg,#CD01BA,#E20317)",
            }}
          >
            works
          </span>
        </h2>
        <p className="text-[#4A3A7A]">
          Your meme‑making journey in simple steps
        </p>
      </div>

      <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map((s) => (
          <Card
            key={s.title}
            title={s.title}
            description={s.description}
            icon={<s.icon className="w-8 h-8 text-[#CD01BA]" />}
          />
        ))}
      </div>
    </section>
  );
}
