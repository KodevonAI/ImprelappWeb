'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface HeroSlide {
  eyebrow: string
  title: string
  text: string
  cta: { label: string; href: string }
  images: Array<{ src: string; alt: string }>
  /** Tailwind gradient classes for the slide background. */
  tone: string
}

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = slides.length
  const go = useCallback((i: number) => setIndex((i + count) % count), [count])

  useEffect(() => {
    if (paused || count < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => setIndex((i) => (i + 1) % count), 6000)
    return () => clearInterval(id)
  }, [paused, count])

  return (
    <section
      aria-roledescription="carrusel"
      aria-label="Destacados"
      className="relative overflow-hidden rounded-2xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="grid">
        {slides.map((s, i) => (
          <div
            key={s.title}
            role="group"
            aria-roledescription="diapositiva"
            aria-label={`${i + 1} de ${count}`}
            aria-hidden={i !== index}
            inert={i !== index}
            className={cn(
              'col-start-1 row-start-1 grid min-h-[300px] items-center gap-6 bg-gradient-to-br px-6 pt-8 pb-14 text-white transition-opacity duration-700 sm:min-h-[340px] sm:px-12 sm:pb-12 md:grid-cols-[1.1fr_1fr]',
              s.tone,
              i === index ? 'opacity-100' : 'pointer-events-none opacity-0'
            )}
          >
            <div className="max-w-xl">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">{s.eyebrow}</p>
              {i === 0 ? (
                <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">{s.title}</h1>
              ) : (
                <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">{s.title}</h2>
              )}
              <p className="mt-3 text-base text-white/85 sm:text-lg">{s.text}</p>
              <Link
                href={s.cta.href}
                className="mt-6 inline-flex h-11 items-center rounded-lg bg-white px-5 text-sm font-semibold text-primary transition hover:bg-blue-50"
              >
                {s.cta.label}
              </Link>
            </div>
            {s.images.length > 0 && (
              <div className="hidden grid-cols-3 gap-3 md:grid">
                {s.images.slice(0, 3).map((img, j) => (
                  <div
                    key={img.src}
                    className={cn(
                      'relative aspect-square overflow-hidden rounded-xl bg-white shadow-xl',
                      j === 1 && 'translate-y-6'
                    )}
                  >
                    <Image src={img.src} alt={img.alt} fill sizes="180px" className="object-contain p-3" priority={i === 0} />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(index - 1)}
            className="absolute left-3 top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/30 sm:flex"
            aria-label="Diapositiva anterior"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            className="absolute right-3 top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/30 sm:flex"
            aria-label="Diapositiva siguiente"
          >
            <ChevronRight className="size-5" />
          </button>
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {slides.map((s, i) => (
              <button
                key={s.title}
                type="button"
                onClick={() => go(i)}
                className={cn('h-2 rounded-full transition-all', i === index ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80')}
                aria-label={`Ir a diapositiva ${i + 1}`}
                aria-current={i === index}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
