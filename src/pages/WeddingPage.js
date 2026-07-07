import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import './Wedding.css';

/* ═══════════════════════════════════════════════════
   EVENT CONSTANTS — single source of truth
   Reception : 26 Aug 2026 · Wedding : 27 Aug 2026
   Wedding muhurtham is the countdown target.
   ═══════════════════════════════════════════════════ */
const VENUE = {
  name: 'Jain Bhavan',
  city: 'Tumakuru, Karnataka',
  mapEmbed: 'https://www.google.com/maps?q=Jain+Bhavan+Tumkur&output=embed',
  mapDir:
    'https://www.google.com/maps/dir/?api=1&destination=Jain+Bhavan+Tumkur',
};

/* Wedding muhurtham — 27 Aug 2026, 11:05 AM IST (05:35 UTC) */
const WEDDING_TARGET = '2026-08-27T05:35:00Z';

/* Google Calendar links (times in UTC; IST = UTC+5:30)
   Reception : 26 Aug 7:00 PM onwards IST → 13:30 UTC start
   Wedding   : 27 Aug 11:05–11:25 AM IST (muhurtham) → 05:35–05:55 UTC */
const CAL_RECEPTION =
  'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Bhargav%20%26%20Sowmya%20%E2%80%94%20Reception&dates=20260826T133000Z/20260826T170000Z&details=Join%20us%20for%20the%20wedding%20reception%20of%20Bhargav%20%26%20Sowmya&location=Jain%20Bhavan%2C%20Tumakuru%2C%20Karnataka';
const CAL_WEDDING =
  'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Bhargav%20%26%20Sowmya%20%E2%80%94%20Wedding&dates=20260827T053500Z/20260827T055500Z&details=Muhurtham%20of%20Bhargav%20%26%20Sowmya%27s%20wedding%20ceremony&location=Jain%20Bhavan%2C%20Tumakuru%2C%20Karnataka';

/* ═══════════════════════════════════════════════════
   KOLAM — symmetric dotted-lattice ornament (SVG),
   echoing the rice-flour thresholds drawn outside
   South-Indian homes for auspicious occasions.
   ═══════════════════════════════════════════════════ */
function Kolam({ className = '' }) {
  return (
    <svg
      className={`kolam ${className}`}
      viewBox="0 0 120 120"
      aria-hidden="true"
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <circle cx="60" cy="60" r="10" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <g key={a} transform={`rotate(${a} 60 60)`}>
            <path d="M60 50 q10 -14 0 -28 q-10 14 0 28" />
            <circle cx="60" cy="18" r="2.2" fill="currentColor" stroke="none" />
          </g>
        ))}
      </g>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════
   DIVIDER — a small gold lotus flanked by hairlines,
   used as a ceremonial separator between sections.
   ═══════════════════════════════════════════════════ */
function Divider({ className = '' }) {
  return (
    <div className={`divider ${className}`} aria-hidden="true">
      <span className="divider__line" />
      <svg className="divider__lotus" viewBox="0 0 48 24">
        <g fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M24 21 C24 12 20 6 24 2 C28 6 24 12 24 21" />
          <path d="M24 21 C18 16 12 15 9 8 C16 8 21 14 24 21" />
          <path d="M24 21 C30 16 36 15 39 8 C32 8 27 14 24 21" />
          <path d="M24 21 C21 15 14 13 6 14 C12 18 19 19 24 21" />
          <path d="M24 21 C27 15 34 13 42 14 C36 18 29 19 24 21" />
        </g>
      </svg>
      <span className="divider__line" />
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   TORAN — a layered marigold-and-mango-leaf garland
   crowning the hero, like a real doorway toran.
   Two rows (back buds + front leaf/flower) give depth;
   each string sways with its own staggered rhythm.
   ═══════════════════════════════════════════════════ */
function Toran() {
  const strings = useMemo(
    () =>
      Array.from({ length: 15 }, (_, i) => ({
        id: i,
        drop: 14 + (i % 4) * 10,
        delay: (i % 5) * 0.4,
        dur: 4.2 + (i % 3) * 0.9,
        big: i % 3 === 0,
      })),
    [],
  );
  const buds = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        drop: 8 + (i % 3) * 6,
        delay: (i % 4) * 0.5 + 0.2,
        dur: 5 + (i % 4) * 0.7,
      })),
    [],
  );

  return (
    <div className="toran" aria-hidden="true">
      <span className="toran__cord" />

      <div className="toran__row toran__row--inner">
        {buds.map((b) => (
          <span
            key={b.id}
            className="toran__string toran__string--bud"
            style={{
              '--drop': `${b.drop}px`,
              animationDelay: `${b.delay}s`,
              animationDuration: `${b.dur}s`,
            }}
          >
            <i className="toran__bud" />
          </span>
        ))}
      </div>

      <div className="toran__row toran__row--front">
        {strings.map((s) => (
          <span
            key={s.id}
            className={`toran__string ${s.big ? 'toran__string--lg' : ''}`}
            style={{
              '--drop': `${s.drop}px`,
              animationDelay: `${s.delay}s`,
              animationDuration: `${s.dur}s`,
            }}
          >
            <i className="toran__leaf" />
            <i className="toran__flower" />
          </span>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   PETALS — ambient marigold & rose petals with gold
   flecks, drifting down. A falling wrapper carries a
   fluttering inner leaf; negative delays pre-fill the air.
   ═══════════════════════════════════════════════════ */
function Petals() {
  const petals = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => {
        const kind = i % 7 === 0 ? 'fleck' : i % 3 === 0 ? 'rose' : 'marigold';
        const sz = kind === 'fleck' ? 4 + (i % 3) * 2 : 9 + (i % 6) * 3;
        return {
          id: i,
          kind,
          left: (i * 4.7 + (i % 5) * 6) % 100,
          sz,
          drift: (i % 2 ? 1 : -1) * (20 + (i % 5) * 22),
          rot: (i % 2 ? 1 : -1) * (180 + (i % 4) * 160),
          fall: 15 + (i % 8) * 3.2,
          flutter: 3 + (i % 5) * 0.9,
          delay: -((i % 10) * 2.3),
        };
      }),
    [],
  );

  return (
    <div className="petals" aria-hidden="true">
      {petals.map((p) => (
        <span
          key={p.id}
          className="petals__p"
          style={{
            left: `${p.left}%`,
            '--drift': `${p.drift}px`,
            '--sz': `${p.sz}px`,
            animationDuration: `${p.fall}s`,
            animationDelay: `${p.delay}s`,
          }}
        >
          <i
            className={`petals__leaf petals__leaf--${p.kind}`}
            style={{ '--rot': `${p.rot}deg`, animationDuration: `${p.flutter}s` }}
          />
        </span>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   LOADING SCREEN — cinematic diya + drawn-on kolam,
   a gold progress ring honestly bound to load percent.
   ═══════════════════════════════════════════════════ */
function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.random() * 6 + 2.4;
        if (next >= 100) {
          clearInterval(id);
          setTimeout(() => setExiting(true), 450);
          setTimeout(onComplete, 1250);
          return 100;
        }
        return next;
      });
    }, 110);
    return () => clearInterval(id);
  }, [onComplete]);

  const angles = [0, 45, 90, 135, 180, 225, 270, 315];

  return (
    <div
      className={`loader ${exiting ? 'loader--exit' : ''}`}
      role="status"
      aria-live="polite"
      aria-label={`Loading ${Math.round(progress)} percent`}
    >
      <div className="loader__glow" aria-hidden="true" />
      <div className="loader__content">
        <div className="loader__stage" aria-hidden="true">
          <svg className="loader__ring" viewBox="0 0 160 160">
            <circle className="loader__ring-track" cx="80" cy="80" r="66" />
            <circle
              className="loader__ring-fill"
              cx="80" cy="80" r="66"
              pathLength="100"
              style={{ strokeDashoffset: 100 - progress }}
            />
          </svg>

          <svg className="loader__kolam" viewBox="0 0 160 160">
            <circle className="loader__center" cx="80" cy="80" r="12" pathLength="100" />
            {angles.map((a, i) => (
              <g key={a} transform={`rotate(${a} 80 80)`}>
                <path
                  className="loader__petal"
                  pathLength="100"
                  style={{ animationDelay: `${0.25 + i * 0.09}s` }}
                  d="M80 70 q10 -14 0 -28 q-10 14 0 28"
                />
                <circle
                  className="loader__dot"
                  cx="80" cy="38" r="2.4"
                  style={{ animationDelay: `${0.55 + i * 0.09}s` }}
                />
              </g>
            ))}
          </svg>

          <span className="loader__flame" />
        </div>

        <p className="loader__blessing">ಶುಭ ವಿವಾಹ</p>
        <p className="loader__caption">ಬಿ &amp; ಎಸ್</p>
        <p className="loader__pct">
          <span className="loader__pct-num">{Math.round(progress)}</span>
          <span className="loader__pct-sym">%</span>
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   OPENING SCREEN — ceremonial reveal. Maroon silk
   curtains part, a gold corner frame draws in, petals
   burst from an expanding kolam mandala, names reveal
   letter by letter with a gold-foil sweep.
   ═══════════════════════════════════════════════════ */
const OPENING_BURST = Array.from({ length: 16 }, (_, i) => {
  const a = (360 / 16) * i;
  const d = 130 + (i % 3) * 46;
  const rad = (a * Math.PI) / 180;
  return {
    id: i,
    tx: Math.round(Math.cos(rad) * d),
    ty: Math.round(Math.sin(rad) * d),
    r: Math.round(a + 90),
    size: 7 + (i % 4) * 3,
    gold: i % 3 === 0,
    delay: 0.25 + (i % 5) * 0.05,
  };
});

function Letters({ text, base }) {
  return (
    <span className="opening__line">
      {Array.from(text).map((ch, i) => (
        <span
          key={i}
          className="opening__ltr"
          style={{ transitionDelay: `${base + i * 55}ms` }}
        >
          {ch}
        </span>
      ))}
    </span>
  );
}

function OpeningFrame() {
  const corners = [
    { k: 'tl', style: { top: 0, left: 0 } },
    { k: 'tr', style: { top: 0, right: 0, transform: 'rotate(90deg)' } },
    { k: 'br', style: { bottom: 0, right: 0, transform: 'rotate(180deg)' } },
    { k: 'bl', style: { bottom: 0, left: 0, transform: 'rotate(270deg)' } },
  ];
  return (
    <div className="opening__frame" aria-hidden="true">
      {corners.map((c) => (
        <svg
          key={c.k}
          className="opening__corner"
          style={c.style}
          viewBox="0 0 64 64"
          width="64"
          height="64"
        >
          <path pathLength="1" d="M4 60 L4 18 Q4 4 18 4 L60 4" />
          <path pathLength="1" d="M4 34 Q16 34 22 28 M34 4 Q34 16 28 22" />
          <circle pathLength="1" cx="15" cy="15" r="4" />
        </svg>
      ))}
    </div>
  );
}

function OpeningScreen({ onComplete }) {
  const [step, setStep] = useState(0); // 0=enter, 1=visible, 2=exit

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 50);
    const t2 = setTimeout(() => setStep(2), 3600);
    const t3 = setTimeout(onComplete, 4500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  const cls = step === 0 ? '' : step === 1 ? 'opening--in' : 'opening--out';

  return (
    <div className={`opening ${cls}`}>
      <div className="opening__panel opening__panel--top" aria-hidden="true" />
      <div className="opening__panel opening__panel--bottom" aria-hidden="true" />
      <div className="opening__glow" aria-hidden="true" />
      <OpeningFrame />
      <div className="opening__burst" aria-hidden="true">
        {OPENING_BURST.map((p) => (
          <span
            key={p.id}
            className={`opening__petal ${p.gold ? 'opening__petal--gold' : 'opening__petal--marigold'}`}
            style={{
              width: p.size,
              height: p.size * 1.15,
              '--tx': `${p.tx}px`,
              '--ty': `${p.ty}px`,
              '--r': `${p.r}deg`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="opening__body">
        <p className="opening__blessing">ಶುಭ ವಿವಾಹ</p>
        <p className="opening__kicker">A Wedding Invitation</p>
        <div className="opening__names">
          <Letters text="Bhargav" base={550} />
          <span className="opening__amp">&amp;</span>
          <Letters text="Sowmya" base={1150} />
        </div>
        <div className="opening__mandala">
          <Kolam className="kolam--opening" />
        </div>
        <p className="opening__date">26 &amp; 27 · August · 2026</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   COUNTDOWN — odometer digits: only the digit that
   changes remounts (keyed by position+char) and replays
   the roll-and-fade.
   ═══════════════════════════════════════════════════ */
function Countdown() {
  const target = useMemo(() => new Date(WEDDING_TARGET), []);

  const calc = useCallback(() => {
    const d = target.getTime() - Date.now();
    if (d <= 0) return null;
    return {
      days: Math.floor(d / 864e5),
      hours: Math.floor((d / 36e5) % 24),
      minutes: Math.floor((d / 6e4) % 60),
      seconds: Math.floor((d / 1e3) % 60),
    };
  }, [target]);

  const [left, setLeft] = useState(calc);

  useEffect(() => {
    const id = setInterval(() => setLeft(calc()), 1000);
    return () => clearInterval(id);
  }, [calc]);

  if (!left) {
    return (
      <div className="countdown countdown--done">
        <p className="countdown__done-title">We're Married!</p>
        <p className="countdown__done-sub">
          Thank you for being part of our special days.
        </p>
      </div>
    );
  }

  const units = [
    { v: left.days, l: 'Days', pad: 2 },
    { v: left.hours, l: 'Hours', pad: 2 },
    { v: left.minutes, l: 'Minutes', pad: 2 },
    { v: left.seconds, l: 'Seconds', pad: 2 },
  ];

  return (
    <div className="countdown">
      {units.map((u, i) => {
        const digits = String(u.v).padStart(u.pad, '0').split('');
        return (
          <div
            key={u.l}
            className={`countdown__cell countdown__cell--${u.l.toLowerCase()}`}
            style={{ '--cd-i': i }}
          >
            <span className="countdown__num">
              {digits.map((ch, di) => (
                <span key={`${di}-${ch}`} className="countdown__digit">
                  {ch}
                </span>
              ))}
            </span>
            <span className="countdown__lbl">{u.l}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   REVEAL ON SCROLL — IntersectionObserver with layered
   safety nets so content is NEVER left permanently hidden.
   ═══════════════════════════════════════════════════ */
function Reveal({ children, className = '', delay = 0, dir = 'up', as: Tag = 'div' }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // No IntersectionObserver (SSR / old browser) → show immediately.
    if (typeof IntersectionObserver === 'undefined') {
      setVis(true);
      return;
    }

    let settled = false;
    const show = () => {
      if (settled) return;
      settled = true;
      setVis(true);
    };

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          show();
          obs.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );
    obs.observe(el);

    // Safety net 1: already on-screen at mount but observer is slow.
    const raf = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      if (r.top < vh * 0.92 && r.bottom > 0) {
        show();
        obs.disconnect();
      }
    });

    // Safety net 2: hard fallback — content is never stranded.
    const timer = setTimeout(() => {
      show();
      obs.disconnect();
    }, 2500 + delay);

    return () => {
      obs.disconnect();
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [delay]);

  return (
    <Tag
      ref={ref}
      className={`reveal reveal--${dir} ${vis ? 'reveal--vis' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

/* ═══════════════════════════════════════════════════
   HERO — toran-crowned, names as the thesis
   ═══════════════════════════════════════════════════ */
function Hero() {
  const [ready, setReady] = useState(false);
  const [hasPhoto, setHasPhoto] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className={`hero ${ready ? 'hero--ready' : ''} ${hasPhoto ? 'hero--photo' : ''}`}>
      {/* Couple photo backdrop — appears only if public/couple.jpg exists.
          A warm scrim + paper wash keep the names crisp on top. */}
      <div className="hero__photo" aria-hidden="true">
        <img
          src={`${process.env.PUBLIC_URL || ''}/couple.jpg`}
          alt=""
          onLoad={() => setHasPhoto(true)}
          onError={() => setHasPhoto(false)}
        />
        <span className="hero__photo-scrim" />
      </div>
      <Toran />
      <div className="hero__inner">
        <p className="hero__kicker">Together With Their Families</p>
        <h1 className="hero__names">
          <span className="hero__name">Bhargav</span>
          <span className="hero__amp">&amp;</span>
          <span className="hero__name">Sowmya</span>
        </h1>
        <p className="hero__tagline">
          request the honour of your presence as they begin their life together
        </p>
        <div className="hero__meta">
          <span className="hero__meta-item">26 &amp; 27 August 2026</span>
          <span className="hero__meta-dot" />
          <span className="hero__meta-item">{VENUE.name}, {VENUE.city}</span>
        </div>
      </div>

      <div className="hero__scroll">
        <span className="hero__scroll-txt">Scroll</span>
        <span className="hero__scroll-line" />
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   MUHURTHAM — the signature centrepiece: a glowing gold
   frame with drawing corners, floating diya embers,
   the auspicious time, and the live countdown.
   ═══════════════════════════════════════════════════ */
function Muhurtham() {
  return (
    <section className="sec sec--muhurtham" id="muhurtham">
      <div className="sec__wrap">
        <Reveal>
          <div className="muhurtham">
            <span className="muhurtham__glow" aria-hidden="true" />
            <i className="muhurtham__corner muhurtham__corner--tl" aria-hidden="true" />
            <i className="muhurtham__corner muhurtham__corner--tr" aria-hidden="true" />
            <i className="muhurtham__corner muhurtham__corner--bl" aria-hidden="true" />
            <i className="muhurtham__corner muhurtham__corner--br" aria-hidden="true" />

            <div className="muhurtham__diyas" aria-hidden="true">
              <i className="muhurtham__diya" style={{ '--dx': '14%', '--dd': '0s', '--ds': '8s' }} />
              <i className="muhurtham__diya" style={{ '--dx': '32%', '--dd': '2.5s', '--ds': '10s' }} />
              <i className="muhurtham__diya" style={{ '--dx': '55%', '--dd': '1.2s', '--ds': '9s' }} />
              <i className="muhurtham__diya" style={{ '--dx': '72%', '--dd': '3.4s', '--ds': '11s' }} />
              <i className="muhurtham__diya" style={{ '--dx': '88%', '--dd': '.6s', '--ds': '8.5s' }} />
            </div>

            <div className="muhurtham__body">
              <Kolam className="kolam--panel kolam--panel-top" />
              <p className="muhurtham__kicker">The Auspicious Moment</p>
              <p className="muhurtham__when">
                Thursday, 27<sup>th</sup> August 2026
              </p>
              <span className="muhurtham__time-wrap">
                <span className="muhurtham__diya-glow" aria-hidden="true" />
                <p className="muhurtham__time">11:05 – 11:25 AM</p>
              </span>
              <div className="muhurtham__divider">
                <span /><em>ॐ</em><span />
              </div>
              <p className="countdown__intro">Counting down to the muhurtham</p>
              <Countdown />
              <Kolam className="kolam--panel kolam--panel-bottom" />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   CELEBRATIONS — the two days, no minute-by-minute plan
   ═══════════════════════════════════════════════════ */
function Celebrations() {
  return (
    <section className="sec sec--days" id="celebrations">
      <div className="sec__wrap">
        <Reveal>
          <p className="sec__kicker">Save The Dates</p>
          <h2 className="sec__title">Two Days of Celebration</h2>
        </Reveal>

        <Reveal delay={60}><Divider /></Reveal>

        <div className="days-grid">
          <Reveal delay={120} dir="right">
            <article className="day-card">
              <span className="day-card__tag">Day One</span>
              <h3 className="day-card__title">Reception</h3>
              <p className="day-card__date">Wednesday, 26 August 2026</p>
              <p className="day-card__time">7:00 PM onwards</p>
              <p className="day-card__note">
                An evening of music, blessings and celebration
              </p>
              <a href={CAL_RECEPTION} target="_blank" rel="noopener noreferrer" className="day-card__cal">
                Add to calendar
              </a>
            </article>
          </Reveal>

          <Reveal delay={220} dir="left">
            <article className="day-card day-card--accent">
              <span className="day-card__sheen" aria-hidden="true" />
              <span className="day-card__tag">Day Two</span>
              <h3 className="day-card__title">Wedding</h3>
              <p className="day-card__date">Thursday, 27 August 2026</p>
              <p className="day-card__time">Muhurtham · 11:05 – 11:25 AM</p>
              <p className="day-card__note">
                The sacred vows, followed by lunch with all our loved ones
              </p>
              <a href={CAL_WEDDING} target="_blank" rel="noopener noreferrer" className="day-card__cal">
                Add to calendar
              </a>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   VENUE / MAP
   ═══════════════════════════════════════════════════ */
function Venue() {
  return (
    <section className="sec sec--venue" id="venue">
      <div className="sec__wrap">
        <Reveal>
          <p className="sec__kicker">Find Us Here</p>
          <h2 className="sec__title">The Venue</h2>
        </Reveal>

        <Reveal delay={60}><Divider /></Reveal>

        <Reveal delay={120}>
          <div className="venue-card">
            <div className="venue-card__info">
              <div>
                <h3 className="venue-card__name">{VENUE.name}</h3>
                <p className="venue-card__addr">{VENUE.city}</p>
                <p className="venue-card__addr venue-card__addr--muted">
                  Both the reception and the wedding are held here
                </p>
              </div>
            </div>
            <div className="venue-card__map">
              <iframe
                src={VENUE.mapEmbed}
                title="Venue Location"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="venue-card__actions">
              <a href={VENUE.mapDir} target="_blank" rel="noopener noreferrer" className="btn">
                Get directions
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   CLOSING / BLESSINGS
   ═══════════════════════════════════════════════════ */
function Closing() {
  return (
    <section className="sec sec--closing">
      <div className="sec__wrap">
        <Reveal>
          <div className="closing">
            <Kolam className="kolam--closing" />
            <h2 className="closing__title">
              With the blessings of our families
            </h2>
            <p className="closing__text">
              Your presence is the blessing we hope for most. Come celebrate
              this beautiful beginning with us.
            </p>
            <div className="closing__names">
              <span>Bhargav</span>
              <em>&amp;</em>
              <span>Sowmya</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════════════ */
function Footer() {
  return (
    <footer className="footer">
      <p className="footer__made">Crafted with love by Bhargav B P</p>
      <p className="footer__copy">&copy; 2026</p>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN PAGE ORCHESTRATOR
   ═══════════════════════════════════════════════════ */
function WeddingPage() {
  const [phase, setPhase] = useState('load'); // load → open → main

  const onLoaded = useCallback(() => setPhase('open'), []);
  const onOpened = useCallback(() => setPhase('main'), []);

  // Lock scroll during intro screens
  useEffect(() => {
    document.body.style.overflow = phase === 'main' ? '' : 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [phase]);

  if (phase === 'load') return <LoadingScreen onComplete={onLoaded} />;
  if (phase === 'open') return <OpeningScreen onComplete={onOpened} />;

  return (
    <div className="app">
      <Petals />
      <Hero />
      <Muhurtham />
      <Celebrations />
      <Venue />
      <Closing />
      <Footer />
    </div>
  );
}

export default WeddingPage;
