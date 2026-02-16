import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type Story = {
  id: number;
  coverUrl: string;
  href: string;
};

const DEFAULT_STORIES: Story[] = [
  { id: 1, coverUrl: 'img/storys1.png', href: '#' },
  { id: 2, coverUrl: 'img/storys2.png', href: '#' },
  { id: 3, coverUrl: 'img/storys3.png', href: '#' },
  { id: 4, coverUrl: 'img/storys4.png', href: '#' },
  { id: 5, coverUrl: 'img/storys5.png', href: '#' },
  { id: 6, coverUrl: 'img/storys6.png', href: '#' },
  { id: 7, coverUrl: 'img/storys7.png', href: '#' },
  { id: 8, coverUrl: 'img/storys8.png', href: '#' },
  { id: 9, coverUrl: 'img/storys9.png', href: '#' },
  { id: 10, coverUrl: 'img/storys10.png', href: '#' },
  { id: 11, coverUrl: 'img/storys11.png', href: '#' },
  { id: 12, coverUrl: 'img/storys12.png', href: '#' },
];

export function StoriesSteamCarousel({
  stories = DEFAULT_STORIES,
  intervalMs = 3200,
}: {
  stories?: Story[];
  intervalMs?: number;
}) {
  const railRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const pausedRef = useRef(false);

  const cards = useMemo(() => stories, [stories]);

  const scrollToIndex = useCallback((nextIndex: number, behavior: ScrollBehavior = 'smooth') => {
    const rail = railRef.current;
    if (!rail) return;

    const els = Array.from(rail.querySelectorAll<HTMLElement>('[data-story-card]'));
    if (!els.length) return;

    const normalized = (nextIndex + els.length) % els.length;
    els[normalized].scrollIntoView({ behavior, inline: 'center', block: 'nearest' });
    setActiveIndex(normalized);
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    let rafPending = false;

    const updateCenterFromScroll = () => {
      const els = Array.from(rail.querySelectorAll<HTMLElement>('[data-story-card]'));
      if (!els.length) return;

      const railRect = rail.getBoundingClientRect();
      const railCenterX = railRect.left + railRect.width / 2;

      let bestIndex = 0;
      let bestDistance = Number.POSITIVE_INFINITY;

      // Center mode (Steam-style):
      // Pick the card whose center is closest to the rail center; that one becomes "active".
      // Active card gets more scale/opacity + glow; side cards are smaller + dimmer.
      els.forEach((el, index) => {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const distance = Math.abs(centerX - railCenterX);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = index;
        }
      });

      setActiveIndex(bestIndex);
    };

    const onScroll = () => {
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(() => {
        rafPending = false;
        updateCenterFromScroll();
      });
    };

    rail.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateCenterFromScroll);

    scrollToIndex(0, 'auto');
    requestAnimationFrame(updateCenterFromScroll);

    return () => {
      rail.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', updateCenterFromScroll);
    };
  }, [scrollToIndex]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (prefersReducedMotion) return;

    const timer = window.setInterval(() => {
      if (pausedRef.current) return;
      scrollToIndex(activeIndex + 1);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [activeIndex, intervalMs, scrollToIndex]);

  return (
    <div className="relative">
      <div className="flex items-center justify-between gap-3">
        <p className="text-white font-semibold">Stories</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="soft-glow inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-700 bg-graphite/40 text-slate-200 hover:text-white"
            onClick={() => scrollToIndex(activeIndex - 1)}
            aria-label="Stories anteriores"
          >
            <span className="material-icons text-[20px]">chevron_left</span>
          </button>
          <button
            type="button"
            className="soft-glow inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-700 bg-graphite/40 text-slate-200 hover:text-white"
            onClick={() => scrollToIndex(activeIndex + 1)}
            aria-label="Próximas stories"
          >
            <span className="material-icons text-[20px]">chevron_right</span>
          </button>
        </div>
      </div>

      <div
        ref={railRef}
        className="no-scrollbar flex items-stretch gap-4 overflow-x-auto py-3 snap-x snap-mandatory scroll-smooth px-6 -mx-6"
        onMouseEnter={() => {
          pausedRef.current = true;
        }}
        onMouseLeave={() => {
          pausedRef.current = false;
        }}
        onFocus={() => {
          pausedRef.current = true;
        }}
        onBlur={() => {
          pausedRef.current = false;
        }}
      >
        {cards.map((story, index) => {
          const isActive = index === activeIndex;
          return (
            <a
              key={story.id}
              href={story.href}
              data-story-card
              className={[
                'group snap-center shrink-0 w-[68vw] sm:w-[220px] lg:w-[170px] aspect-[9/16] rounded-2xl overflow-hidden border bg-graphite/35 transition-all duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-electric/70',
                isActive ? 'opacity-100 scale-100 border-electric/60 shadow-glow' : 'opacity-70 scale-[0.92] border-slate-800',
              ].join(' ')}
              aria-label={`Abrir story ${String(story.id).padStart(2, '0')}`}
            >
              <div className="relative w-full h-full">
                <img src={story.coverUrl} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async" />
                <div className="absolute inset-0 bg-gradient-to-t from-deep/70 via-transparent to-transparent opacity-80" />
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
