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
   OUTLINE MOTIF — the signature is line, not fill. Every
   ornament here is a drawn stroke in maroon + orange:
   a temple arch, a paisley, corner brackets.
   ═══════════════════════════════════════════════════ */

/* A double-outlined temple arch (mandapa) that frames the names. */
function Arch({ className = '' }) {
  return (
    <svg className={`arch ${className}`} viewBox="0 0 300 220" fill="none" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
      {/* outer maroon rule */}
      <path className="arch__maroon" d="M14 214 L14 92 Q14 40 62 24 Q150 -4 238 24 Q286 40 286 92 L286 214" />
      {/* inner orange rule */}
      <path className="arch__orange" d="M28 214 L28 96 Q28 52 68 38 Q150 14 232 38 Q272 52 272 96 L272 214" />
      {/* keystone paisley finial */}
      <path className="arch__orange" d="M150 8 q10 12 0 26 q-10 -14 0 -26" />
      <circle className="arch__maroon" cx="150" cy="40" r="3" />
    </svg>
  );
}

/* A single outlined paisley (buta) — used as the divider heart. */
function Paisley({ className = '' }) {
  return (
    <svg className={`paisley ${className}`} viewBox="-24 -20 48 40" fill="none" aria-hidden="true">
      <path className="paisley__maroon" d="M0 16 C-16 10 -18 -8 -4 -16 C10 -22 20 -8 14 6 C11 14 4 16 0 16 Z" />
      <path className="paisley__orange" d="M-2 10 C-11 6 -12 -6 -3 -11 C6 -15 12 -6 9 3 C7 8 2 10 -2 10 Z" />
      <circle className="paisley__orange" cx="1" cy="-2" r="2.2" />
    </svg>
  );
}

/* Outlined divider: hairlines flanking a paisley. */
function Divider() {
  return (
    <div className="divider" aria-hidden="true">
      <span className="divider__rule" />
      <Paisley className="divider__paisley" />
      <span className="divider__rule" />
    </div>
  );
}

/* Corner brackets drawn as thin outlines, for framed cards. */
function Corners() {
  return (
    <>
      <i className="corner corner--tl" aria-hidden="true" />
      <i className="corner corner--tr" aria-hidden="true" />
      <i className="corner corner--bl" aria-hidden="true" />
      <i className="corner corner--br" aria-hidden="true" />
    </>
  );
}

/* ═══════════════════════════════════════════════════
   PETALS — ambient marigold-orange petals drifting down,
   with the occasional deep-maroon one for depth.
   ═══════════════════════════════════════════════════ */
function Petals() {
  const petals = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => {
        const kind = i % 5 === 0 ? 'maroon' : 'orange';
        return {
          id: i,
          kind,
          left: (i * 5.3 + (i % 6) * 5) % 100,
          sz: 8 + (i % 6) * 3,
          drift: (i % 2 ? 1 : -1) * (20 + (i % 5) * 22),
          rot: (i % 2 ? 1 : -1) * (180 + (i % 4) * 150),
          fall: 16 + (i % 8) * 3,
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
   LOADING SCREEN — an outlined mandala draws itself in
   inside a progress ring bound honestly to load percent.
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
          <svg className="loader__mandala" viewBox="0 0 160 160" fill="none">
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
   OPENING SCREEN — maroon panels part sideways, an
   outlined frame draws in, names reveal letter by letter
   with an orange-foil sweep, petals burst from center.
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
    maroon: i % 3 === 0,
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
        <svg key={c.k} className="opening__corner" style={c.style} viewBox="0 0 64 64" fill="none">
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
      <div className="opening__panel opening__panel--left" aria-hidden="true" />
      <div className="opening__panel opening__panel--right" aria-hidden="true" />
      <div className="opening__glow" aria-hidden="true" />
      <OpeningFrame />

      <div className="opening__burst" aria-hidden="true">
        {OPENING_BURST.map((p) => (
          <span
            key={p.id}
            className={`opening__petal ${p.maroon ? 'opening__petal--maroon' : 'opening__petal--orange'}`}
            style={{
              width: p.size, height: p.size * 1.15,
              '--tx': `${p.tx}px`, '--ty': `${p.ty}px`, '--r': `${p.r}deg`,
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
        <p className="opening__date">26 &amp; 27 · August · 2026</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   COUNTDOWN — odometer digits: only the changed digit
   remounts (keyed by position+char) and replays the roll.
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
        <p className="countdown__done-sub">Thank you for being part of our special days.</p>
      </div>
    );
  }

  const units = [
    { v: left.days, l: 'Days' },
    { v: left.hours, l: 'Hours' },
    { v: left.minutes, l: 'Minutes' },
    { v: left.seconds, l: 'Seconds' },
  ];

  return (
    <div className="countdown">
      {units.map((u, i) => {
        const digits = String(u.v).padStart(2, '0').split('');
        return (
          <div key={u.l} className="countdown__cell" style={{ '--cd-i': i }}>
            <Corners />
            <span className="countdown__num">
              {digits.map((ch, di) => (
                <span key={`${di}-${ch}`} className="countdown__digit">{ch}</span>
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

    if (typeof IntersectionObserver === 'undefined') { setVis(true); return; }

    let settled = false;
    const show = () => { if (!settled) { settled = true; setVis(true); } };

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) { show(); obs.disconnect(); }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );
    obs.observe(el);

    const raf = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      if (r.top < vh * 0.92 && r.bottom > 0) { show(); obs.disconnect(); }
    });

    const timer = setTimeout(() => { show(); obs.disconnect(); }, 2500 + delay);

    return () => { obs.disconnect(); cancelAnimationFrame(raf); clearTimeout(timer); };
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
   HERO — names framed by the outlined temple arch
   ═══════════════════════════════════════════════════ */
function Hero() {
  const [ready, setReady] = useState(false);
  const [hasPhoto, setHasPhoto] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 80);
    return () => clearTimeout(t);
  }, []);

  const toMuhurtham = () => {
    const el = document.getElementById('muhurtham');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section id="top" className={`hero ${ready ? 'hero--ready' : ''} ${hasPhoto ? 'hero--photo' : ''}`}>
      <div className="hero__photo" aria-hidden="true">
        <img
          src={`${process.env.PUBLIC_URL || ''}/couple.jpg`}
          alt=""
          onLoad={() => setHasPhoto(true)}
          onError={() => setHasPhoto(false)}
        />
        <span className="hero__photo-scrim" />
      </div>

      <div className="hero__inner">
        <Arch className="hero__crest" />
        <p className="hero__eyebrow">Together with their families</p>
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

      <button type="button" className="hero__scroll" onClick={toMuhurtham} aria-label="Scroll down">
        <span className="hero__scroll-txt">Scroll</span>
        <span className="hero__scroll-chevron" aria-hidden="true" />
      </button>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   MUHURTHAM — the centrepiece: an outlined frame, the
   auspicious time, and the live countdown.
   ═══════════════════════════════════════════════════ */
function Muhurtham() {
  return (
    <section className="sec sec--muhurtham" id="muhurtham">
      <div className="sec__wrap">
        <Reveal>
          <div className="muhurtham">
            <span className="muhurtham__glow" aria-hidden="true" />
            <Corners />
            <div className="muhurtham__body">
              <Paisley className="muhurtham__paisley" />
              <p className="muhurtham__kicker">The Auspicious Moment</p>
              <p className="muhurtham__when">Thursday, 27<sup>th</sup> August 2026</p>
              <span className="muhurtham__time-wrap">
                <span className="muhurtham__time-glow" aria-hidden="true" />
                <p className="muhurtham__time">11:05 – 11:25 AM</p>
              </span>
              <div className="muhurtham__om"><span /><em>ॐ</em><span /></div>
              <p className="countdown__intro">Counting down to the muhurtham</p>
              <Countdown />
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
              <Corners />
              <span className="day-card__tag">Day One</span>
              <h3 className="day-card__title">Reception</h3>
              <p className="day-card__date">Wednesday, 26 August 2026</p>
              <p className="day-card__time">7:00 PM onwards</p>
              <a href={CAL_RECEPTION} target="_blank" rel="noopener noreferrer" className="day-card__cal">
                Add to calendar
              </a>
            </article>
          </Reveal>

          <Reveal delay={220} dir="left">
            <article className="day-card day-card--accent">
              <span className="day-card__sheen" aria-hidden="true" />
              <Corners />
              <span className="day-card__tag">Day Two</span>
              <h3 className="day-card__title">Wedding</h3>
              <p className="day-card__date">Thursday, 27 August 2026</p>
              <p className="day-card__time">Muhurtham · 11:05 – 11:25 AM</p>
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
            <Corners />
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
    <section className="sec sec--closing" id="blessings">
      <div className="sec__wrap">
        <Reveal>
          <div className="closing">
            <Paisley className="closing__paisley" />
            <h2 className="closing__title">With the blessings of our families</h2>
            <p className="closing__text">
              Your presence is the blessing we hope for most. Come celebrate
              this beautiful beginning with us.
            </p>
            <div className="closing__names">
              <span>Bhargav</span><em>&amp;</em><span>Sowmya</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <p className="footer__made">Crafted with love by Bhargav B P</p>
      <p className="footer__copy">&copy; 2026</p>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════
   SCROLL RAIL — a custom scrollbar on the LEFT edge: a
   thin outlined track whose maroon→orange fill grows with
   scroll progress, with a clickable marker per section
   that lights up as you reach it. On phones it collapses
   to a slim progress line pinned to the edge.
   ═══════════════════════════════════════════════════ */
const SECTIONS = [
  { id: 'top', label: 'Invitation' },
  { id: 'muhurtham', label: 'Muhurtham' },
  { id: 'celebrations', label: 'The Days' },
  { id: 'venue', label: 'The Venue' },
  { id: 'blessings', label: 'Blessings' },
];

function ScrollRail() {
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
        // Active = last section whose top has passed 40% of the viewport.
        const mark = window.scrollY + window.innerHeight * 0.4;
        let idx = 0;
        SECTIONS.forEach((s, i) => {
          const el = document.getElementById(s.id);
          if (el && el.offsetTop <= mark) idx = i;
        });
        setActive(idx);
      });
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      cancelAnimationFrame(raf);
    };
  }, []);

  const jump = useCallback((id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <nav className="rail" aria-label="Sections">
      <span className="rail__track" aria-hidden="true">
        <span className="rail__fill" style={{ height: `${progress * 100}%` }} />
      </span>
      <ul className="rail__dots">
        {SECTIONS.map((s, i) => (
          <li key={s.id}>
            <button
              type="button"
              className={`rail__dot ${i === active ? 'rail__dot--on' : ''} ${i < active ? 'rail__dot--past' : ''}`}
              onClick={() => jump(s.id)}
              aria-label={`Go to ${s.label}`}
              aria-current={i === active ? 'true' : undefined}
            >
              <span className="rail__label">{s.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN ORCHESTRATOR — load → open → page
   ═══════════════════════════════════════════════════ */
function WeddingPage() {
  const [phase, setPhase] = useState('load');

  const onLoaded = useCallback(() => setPhase('open'), []);
  const onOpened = useCallback(() => setPhase('main'), []);

  // Lock page scroll during the intro screens only.
  useEffect(() => {
    document.body.style.overflow = phase === 'main' ? '' : 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [phase]);

  // One-time "peek": once the page is live and untouched, gently dip down a
  // little and glide back so the guest sees there's more below. Any real
  // scroll gesture cancels it; reduced-motion skips it entirely.
  useEffect(() => {
    if (phase !== 'main') return undefined;
    const reduced =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return undefined;

    let touched = false;
    const cancel = () => { touched = true; };
    window.addEventListener('wheel', cancel, { passive: true, once: true });
    window.addEventListener('touchstart', cancel, { passive: true, once: true });
    window.addEventListener('keydown', cancel, { once: true });

    const down = setTimeout(() => {
      if (!touched && window.scrollY < 4) {
        window.scrollTo({ top: 90, behavior: 'smooth' });
        setTimeout(() => { if (!touched) window.scrollTo({ top: 0, behavior: 'smooth' }); }, 780);
      }
    }, 2200);

    return () => {
      clearTimeout(down);
      window.removeEventListener('wheel', cancel);
      window.removeEventListener('touchstart', cancel);
      window.removeEventListener('keydown', cancel);
    };
  }, [phase]);

  if (phase === 'load') return <LoadingScreen onComplete={onLoaded} />;
  if (phase === 'open') return <OpeningScreen onComplete={onOpened} />;

  return (
    <div className="app">
      <Petals />
      <ScrollRail />
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
