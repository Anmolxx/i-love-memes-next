type CardItem = { title: string; body: string }

type CardStackProps = { cards: CardItem[] }

export function CardStack({ cards }: CardStackProps) {
  return (
    <div className="relative group h-72 w-full max-w-md">
      {cards.map((c, idx) => {
        const depth = cards.length - idx

        // Define different rotation degrees per card (to mimic your styled-jsx)
        const rotations = ['-rotate-3', '-rotate-2', '-rotate-1', 'rotate-0', 'rotate-1']

        return (
          <div
            key={c.title}
            className={`absolute inset-0 rounded-xl border border-black/10 bg-white/70 p-5 shadow-sm
              transition-transform duration-300 ease-out 
              group-hover:translate-y-${(idx + 1) * 4}
              ${rotations[idx] || ''}`}
            style={{
              transform: `translateY(${depth * 6}px)`,
              zIndex: 10 + idx,
            }}
          >
            <div className="text-base font-semibold text-black">{c.title}</div>
            <p className="mt-2 text-sm text-black/80">{c.body}</p>
          </div>
        )
      })}
    </div>
  )
}
