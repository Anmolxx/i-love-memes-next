type TextCarouselProps = { texts: string[] }

export function TextCarousel({ texts }: TextCarouselProps) {
  const marquee = [...texts, ...texts]

  return (
    <section className="w-full overflow-hidden border-y border-black/10 bg-white/60">
      <div
        className="whitespace-nowrap flex p-[3px]"
        style={{
          background: 'linear-gradient(90deg,#CD01BA,#E20317)',
          boxShadow: 'inset 0 2px 2px 4px rgba(205,1,186,0.5), inset 0 -2px 2px 4px rgba(205,1,186,0.5)',
        }}
      >
        <div className="flex gap-8 md:gap-12 py-2 px-4 min-w-max animate-carousel-scroll bg-clip-text text-white rounded-full">
          {marquee.map((t, i) => (
            <span
              key={i}
              className="text-base sm:text-lg md:text-xl font-semibold"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
