'use client'

import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/** Horizontal scroll-snap row with arrow buttons on desktop; native swipe on touch. */
export function Rail({ children, label }: { children: React.ReactNode; label: string }) {
  const ref = useRef<HTMLDivElement>(null)

  function scroll(dir: 1 | -1) {
    const el = ref.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      <div
        ref={ref}
        role="region"
        aria-label={label}
        tabIndex={0}
        className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-2 [scrollbar-width:none] focus-visible:outline-none [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
      <button
        type="button"
        onClick={() => scroll(-1)}
        className="absolute -left-4 top-1/3 hidden size-10 items-center justify-center rounded-full border bg-white shadow-md transition hover:bg-muted lg:flex"
        aria-label="Anterior"
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        type="button"
        onClick={() => scroll(1)}
        className="absolute -right-4 top-1/3 hidden size-10 items-center justify-center rounded-full border bg-white shadow-md transition hover:bg-muted lg:flex"
        aria-label="Siguiente"
      >
        <ChevronRight className="size-5" />
      </button>
    </div>
  )
}

export function RailItem({ children }: { children: React.ReactNode }) {
  return <div className="w-[46%] shrink-0 snap-start sm:w-[31%] md:w-[23.5%] lg:w-[18.8%]">{children}</div>
}
