import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import './Wedding.css';

/* ╔═══════════════════════════════════════════════════════╗
   ║  CINEMATIC ENGAGEMENT INVITATION                     ║
   ║  Full-screen panels · Parallax · Scroll-driven       ║
   ╚═══════════════════════════════════════════════════════╝ */

// ─── OPENING CINEMATIC ──────────────────────────────────
function CinematicOpening({ onFinish }) {
  const [phase, setPhase] = useState(0);
  // 0: dark, 1: line1, 2: line2, 3: line3, 4: wipe out

  useEffect(() => {
    const delays = [400, 1600, 3000, 4400, 5800];
    const timers = delays.map((d, i) => setTimeout(() => setPhase(i + 1), d));
    const done = setTimeout(onFinish, 6800);
    return () => { timers.forEach(clearTimeout); clearTimeout(done); };
  }, [onFinish]);

  return (
    <div className={`cin ${phase >= 5 ? 'cin--out' : ''}`}>
      <div className="cin__grain" />
      <div className="cin__content">
        <p className={`cin__line ${phase >= 1 ? 'cin__line--vis' : ''}`}>
          Two families
        </p>
        <p className={`cin__line cin__line--accent ${phase >= 2 ? 'cin__line--vis' : ''}`}>
          One beautiful beginning
        </p>
        <p className={`cin__line cin__line--small ${phase >= 3 ? 'cin__line--vis' : ''}`}>
          💍
        </p>
        <div className={`cin__bar ${phase >= 4 ? 'cin__bar--go' : ''}`} />
      </div>
    </div>
  );
}

// ─── SCROLL PROGRESS BAR ────────────────────────────────
function ScrollProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setPct(h > 0 ? (window.scrollY / h) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return <div className="sprogress" style={{ width: `${pct}%` }} />;
}

// ─── PARALLAX WRAPPER ───────────────────────────────────
function Parallax({ children, speed = 0.3, className = '' }) {
  const ref = useRef(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const center = rect.top + rect.height / 2 - window.innerHeight / 2;
      setOffset(center * speed * -1);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [speed]);

  return (
    <div ref={ref} className={className} style={{ transform: `translateY(${offset}px)` }}>
      {children}
    </div>
  );
}

// ─── REVEAL ON SCROLL ───────────────────────────────────
function Reveal({ children, className = '', variant = 'up', delay = 0, threshold = 0.15 }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.unobserve(el); } },
      { threshold, rootMargin: '0px 0px -30px 0px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return (
    <div
      ref={ref}
      className={`rv rv--${variant} ${vis ? 'rv--in' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >{children}</div>
  );
}

// ─── SPLIT TEXT (per word reveal) ───────────────────────
function SplitText({ text, className = '', delay = 0, tag: Tag = 'span' }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.unobserve(el); } },
      { threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const words = text.split(' ');

  return (
    <Tag ref={ref} className={`split ${vis ? 'split--in' : ''} ${className}`}>
      {words.map((w, i) => (
        <span key={i} className="split__word" style={{ animationDelay: `${delay + i * 80}ms` }}>
          {w}&nbsp;
        </span>
      ))}
    </Tag>
  );
}

// ─── ROLLING NUMBER ─────────────────────────────────────
function RollingNum({ value, label }) {
  const ref = useRef(null);
  const [display, setDisplay] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setStarted(true); obs.unobserve(el); } },
      { threshold: 0.5 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const dur = 1200;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(ease * value));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [started, value]);

  return (
    <div ref={ref} className="rnum">
      <span className="rnum__val">{String(display).padStart(label === 'days' ? 3 : 2, '0')}</span>
      <span className="rnum__lbl">{label}</span>
    </div>
  );
}

// ─── COUNTDOWN ──────────────────────────────────────────
function Countdown() {
  const target = useMemo(() => new Date('2025-10-12T07:30:00Z'), []);

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
      <div className="cd-done">
        <p>The celebration has happened — thank you for the blessings! 💕</p>
      </div>
    );
  }

  return (
    <div className="cd">
      <RollingNum value={left.days} label="days" />
      <span className="cd__sep">:</span>
      <RollingNum value={left.hours} label="hrs" />
      <span className="cd__sep">:</span>
      <RollingNum value={left.minutes} label="min" />
      <span className="cd__sep">:</span>
      <RollingNum value={left.seconds} label="sec" />
    </div>
  );
}

// ─── AURORA BACKGROUND (Canvas) ──────────────────────────
function AuroraBG() {
  const ref = useRef(null);

  useEffect(() => {
    const cvs = ref.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    let raf;

    function resize() {
      cvs.width = window.innerWidth;
      cvs.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const blobs = [
      { x: 0.3, y: 0.4, r: 260, color: 'rgba(224,115,106,0.18)', vx: 0.0003, vy: 0.0002 },
      { x: 0.7, y: 0.3, r: 220, color: 'rgba(69,134,126,0.14)', vx: -0.0002, vy: 0.0003 },
      { x: 0.5, y: 0.7, r: 200, color: 'rgba(190,160,130,0.12)', vx: 0.0002, vy: -0.0002 },
    ];

    function draw(t) {
      ctx.clearRect(0, 0, cvs.width, cvs.height);
      blobs.forEach(b => {
        const cx = (b.x + Math.sin(t * b.vx) * 0.15) * cvs.width;
        const cy = (b.y + Math.cos(t * b.vy) * 0.15) * cvs.height;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, b.r * (cvs.width / 1000));
        grad.addColorStop(0, b.color);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, cvs.width, cvs.height);
      });
      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={ref} className="aurora" />;
}

// ═════════════════════════════════════════════════════════
//  PANEL 1 — HERO
// ═════════════════════════════════════════════════════════
function PanelHero() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const delays = [100, 500, 1100, 1600, 2200, 2800, 3400];
    const timers = delays.map((d, i) => setTimeout(() => setStep(i + 1), d));
    return () => timers.forEach(clearTimeout);
  }, []);

  const scrollNext = () => {
    const el = document.getElementById('panel-countdown');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="panel panel--hero" id="panel-hero">
      <AuroraBG />
      <div className="panel__grain" />

      <div className="hero">
        <span className={`hero__tag ${step >= 1 ? 'hero__tag--in' : ''}`}>THE ENGAGEMENT OF</span>

        <div className="hero__names">
          <h1 className={`hero__n1 ${step >= 2 ? 'hero__n1--in' : ''}`}>
            {'Bhargav'.split('').map((c, i) => (
              <span key={i} className="hero__ch" style={{ transitionDelay: `${i * 70 + 200}ms` }}>{c}</span>
            ))}
          </h1>
          <div className={`hero__and ${step >= 3 ? 'hero__and--in' : ''}`}>
            <span className="hero__line" />
            <span className="hero__heart">♥</span>
            <span className="hero__line" />
          </div>
          <h1 className={`hero__n2 ${step >= 4 ? 'hero__n2--in' : ''}`}>
            {'Sowmya'.split('').map((c, i) => (
              <span key={i} className="hero__ch" style={{ transitionDelay: `${i * 70 + 200}ms` }}>{c}</span>
            ))}
          </h1>
        </div>

        <p className={`hero__sub ${step >= 5 ? 'hero__sub--in' : ''}`}>
          Together with their families, request the pleasure of your company
        </p>

        <div className={`hero__pills ${step >= 6 ? 'hero__pills--in' : ''}`}>
          <span className="pill"><i className="pill__dot" />12 October 2025</span>
          <span className="pill"><i className="pill__dot pill__dot--teal" />1:00 PM IST</span>
          <span className="pill"><i className="pill__dot pill__dot--gold" />Tumakuru</span>
        </div>

        <button className={`hero__cta ${step >= 7 ? 'hero__cta--in' : ''}`} onClick={scrollNext}>
          <span>Explore</span>
          <svg className="hero__cta-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
        </button>
      </div>

      {/* Animated mouse indicator */}
      <div className={`hero__mouse ${step >= 7 ? 'hero__mouse--in' : ''}`}>
        <div className="hero__mouse-body">
          <div className="hero__mouse-wheel" />
        </div>
        <span className="hero__mouse-text">scroll</span>
      </div>
    </section>
  );
}

// ─── PEEK SECTION (visible below hero fold) ─────────────
function PeekSection() {
  return (
    <div className="peek">
      <div className="peek__inner">
        <span className="peek__label">coming up</span>
        <p className="peek__text">The countdown, the details & more...</p>
        <div className="peek__arrow" />
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════
//  PANEL 2 — COUNTDOWN
// ═════════════════════════════════════════════════════════
function PanelCountdown() {
  return (
    <section className="panel panel--cd" id="panel-countdown">
      <div className="panel__grain" />
      <div className="panel__inner">
        <Reveal>
          <span className="sec-num">01</span>
        </Reveal>
        <Reveal delay={100}>
          <SplitText text="The Countdown" className="sec-title" tag="h2" />
        </Reveal>
        <Reveal delay={200}>
          <p className="sec-sub">Every second brings us closer to the celebration</p>
        </Reveal>
        <Reveal delay={350}>
          <Countdown />
        </Reveal>
        <Reveal delay={500}>
          <a
            href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=Bhargav%20%26%20Sowmya%20Engagement&dates=20251012T063000Z/20251012T083000Z&details=Join%20us%20for%20the%20engagement%20ceremony%20of%20Bhargav%20and%20Sowmya&location=Shree%20Padmavathi%20Venkateshwara%20Samudaya%20Bhavana%2C%204th%20Main%20Rd%2C%20Jayanagar%20West%2C%20Tumakuru%2C%20Karnataka%20572102"
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
          >Save the date →</a>
        </Reveal>
      </div>
    </section>
  );
}

// ═════════════════════════════════════════════════════════
//  PANEL 3 — DETAILS (split)
// ═════════════════════════════════════════════════════════
function PanelDetails() {
  return (
    <section className="panel panel--details" id="panel-details">
      <div className="panel__grain" />
      <div className="split-layout">
        <div className="split-layout__left">
          <Reveal>
            <span className="sec-num">02</span>
          </Reveal>
          <Reveal delay={100}>
            <SplitText text="The Details" className="sec-title" tag="h2" />
          </Reveal>
          <Reveal delay={200}>
            <p className="sec-sub">Everything you need to know about the day</p>
          </Reveal>
        </div>
        <div className="split-layout__right">
          <Reveal delay={100}>
            <div className="info-card">
              <span className="info-card__num">📅</span>
              <div>
                <p className="info-card__label">Date</p>
                <p className="info-card__val">Sunday, 12th October 2025</p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={200}>
            <div className="info-card">
              <span className="info-card__num">🕐</span>
              <div>
                <p className="info-card__label">Time</p>
                <p className="info-card__val">1:00 PM IST onwards</p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={300}>
            <div className="info-card info-card--highlight">
              <span className="info-card__num">📍</span>
              <div>
                <p className="info-card__label">Venue</p>
                <p className="info-card__val">Shree Padmavathi Venkateshwara Samudaya Bhavana</p>
                <p className="info-card__extra">4th Main Rd, Jayanagar West, Tumakuru, Karnataka 572102</p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ═════════════════════════════════════════════════════════
//  PANEL 4 — SCHEDULE (horizontal timeline)
// ═════════════════════════════════════════════════════════
function PanelSchedule() {
  const items = [
    { time: '1:00 PM', title: 'Lunch & Refreshments', icon: '🍽️', desc: 'A feast to begin the celebrations as family and friends gather.' },
    { time: '2:00 PM', title: 'Nishchitartha', icon: '💍', desc: 'The sacred engagement ceremony — when two souls make a promise.' },
    { time: '3:00 PM', title: 'Blessings & Photography', icon: '📸', desc: 'Seek blessings from our elders, and capture the joy in photographs.' },
  ];

  return (
    <section className="panel panel--sched" id="panel-schedule">
      <div className="panel__grain" />
      <div className="panel__inner">
        <Reveal>
          <span className="sec-num">03</span>
        </Reveal>
        <Reveal delay={100}>
          <SplitText text="The Schedule" className="sec-title" tag="h2" />
        </Reveal>

        <div className="timeline">
          <div className="timeline__track" />
          {items.map((it, i) => (
            <Reveal key={i} delay={200 + i * 200} variant="scale">
              <div className="tl-card">
                <div className="tl-card__dot" />
                <span className="tl-card__icon">{it.icon}</span>
                <span className="tl-card__time">{it.time}</span>
                <h3 className="tl-card__title">{it.title}</h3>
                <p className="tl-card__desc">{it.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═════════════════════════════════════════════════════════
//  PANEL 5 — VENUE (immersive map)
// ═════════════════════════════════════════════════════════
function PanelVenue() {
  return (
    <section className="panel panel--venue" id="panel-venue">
      <div className="panel__grain" />
      <div className="venue-wrap">
        <div className="venue-info">
          <Reveal><span className="sec-num">04</span></Reveal>
          <Reveal delay={100}><SplitText text="The Venue" className="sec-title" tag="h2" /></Reveal>
          <Reveal delay={200}>
            <h3 className="venue-info__name">Shree Padmavathi Venkateshwara Samudaya Bhavana</h3>
          </Reveal>
          <Reveal delay={300}>
            <p className="venue-info__addr">4th Main Rd, Jayanagar West<br/>Tumakuru, Karnataka 572102</p>
          </Reveal>
          <Reveal delay={400}>
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=Shree+Padmavathi+Venkateshwara+Samudaya+Bhavana,+4th+Main+Rd,+Jayanagar+West,+Tumakuru,+Karnataka+572102"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--outline"
            >Get directions →</a>
          </Reveal>
        </div>
        <div className="venue-map">
          <iframe
            src="https://www.google.com/maps?q=Shree+Padmavathi+Venkateshwara+Samudaya+Bhavana+Tumkur&output=embed"
            title="Venue Map"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}

// ═════════════════════════════════════════════════════════
//  PANEL 6 — CLOSING (full cinematic)
// ═════════════════════════════════════════════════════════
function PanelClosing() {
  return (
    <section className="panel panel--closing" id="panel-closing">
      <div className="panel__grain" />
      <div className="closing">
        <Reveal>
          <p className="closing__over">with love & blessings</p>
        </Reveal>
        <Parallax speed={0.15}>
          <Reveal delay={200}>
            <h2 className="closing__headline">We would be honoured<br/>by your presence</h2>
          </Reveal>
        </Parallax>
        <Reveal delay={400}>
          <div className="closing__names">
            <span>Bhargav</span>
            <span className="closing__amp">♥</span>
            <span>Sowmya</span>
          </div>
        </Reveal>
        <Reveal delay={600}>
          <p className="closing__date">12 · 10 · 2025</p>
        </Reveal>
      </div>
    </section>
  );
}

// ─── PAGE BAR (fixed side nav) ──────────────────────────
const PAGE_SECTIONS = [
  { id: 'panel-hero', label: 'Home' },
  { id: 'panel-countdown', label: 'Countdown' },
  { id: 'panel-details', label: 'Details' },
  { id: 'panel-schedule', label: 'Schedule' },
  { id: 'panel-venue', label: 'Venue' },
  { id: 'panel-closing', label: 'Blessings' },
];

function useActivePanel() {
  const [active, setActive] = useState('panel-hero');

  useEffect(() => {
    const observers = [];
    PAGE_SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id); },
        { threshold: 0.25, rootMargin: '-5% 0px -50% 0px' },
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, []);

  return active;
}

function PageBar({ active }) {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const activeIdx = PAGE_SECTIONS.findIndex(s => s.id === active);

  return (
    <div className="pgbar">
      {/* Track line */}
      <div className="pgbar__track">
        <div
          className="pgbar__fill"
          style={{ height: `${(activeIdx / (PAGE_SECTIONS.length - 1)) * 100}%` }}
        />
      </div>
      {/* Dots with labels */}
      {PAGE_SECTIONS.map((s, i) => (
        <button
          key={s.id}
          className={`pgbar__item ${active === s.id ? 'pgbar__item--active' : ''}`}
          onClick={() => scrollTo(s.id)}
          aria-label={s.label}
        >
          <span className="pgbar__dot" />
          <span className="pgbar__label">{s.label}</span>
        </button>
      ))}
    </div>
  );
}

// ─── FOOTER ─────────────────────────────────────────────
function Footer() {
  return (
    <footer className="ft">
      <p>crafted with ❤️ by Bhargav B P</p>
    </footer>
  );
}

// ═════════════════════════════════════════════════════════
//  MAIN EXPORT
// ═════════════════════════════════════════════════════════
export default function WeddingPage() {
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);

  useEffect(() => {
    document.body.style.overflow = ready ? '' : 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [ready]);

  if (!ready) return <CinematicOpening onFinish={onReady} />;

  return <AppContent />;
}

function AppContent() {
  const active = useActivePanel();

  return (
    <div className="app">
      <ScrollProgress />
      <PageBar active={active} />
      <PanelHero />
      <PeekSection />
      <PanelCountdown />
      <PanelDetails />
      <PanelSchedule />
      <PanelVenue />
      <PanelClosing />
      <Footer />
    </div>
  );
}
