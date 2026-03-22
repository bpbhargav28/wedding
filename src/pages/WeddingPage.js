import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import './Wedding.css';

/* ═══════════════════════════════════════════════════
   LOADING SCREEN — Minimal elegant loader
   ═══════════════════════════════════════════════════ */
function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.random() * 14 + 4;
        if (next >= 100) {
          clearInterval(id);
          setTimeout(() => setExiting(true), 300);
          setTimeout(onComplete, 1100);
          return 100;
        }
        return next;
      });
    }, 100);
    return () => clearInterval(id);
  }, [onComplete]);

  return (
    <div className={`loader ${exiting ? 'loader--exit' : ''}`}>
      <div className="loader__content">
        <span className="loader__icon">💍</span>
        <p className="loader__names">B &amp; S</p>
        <div className="loader__track">
          <div className="loader__bar" style={{ width: `${progress}%` }} />
        </div>
        <p className="loader__pct">{Math.round(progress)}%</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   OPENING SCREEN — Cinematic reveal
   ═══════════════════════════════════════════════════ */
function OpeningScreen({ onComplete }) {
  const [step, setStep] = useState(0); // 0=enter, 1=visible, 2=exit

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 50);
    const t2 = setTimeout(() => setStep(2), 3200);
    const t3 = setTimeout(onComplete, 4000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  const cls = step === 0 ? '' : step === 1 ? 'opening--in' : 'opening--out';

  return (
    <div className={`opening ${cls}`}>
      <div className="opening__frame">
        <div className="opening__corner opening__corner--tl" />
        <div className="opening__corner opening__corner--tr" />
        <div className="opening__corner opening__corner--bl" />
        <div className="opening__corner opening__corner--br" />
      </div>
      <div className="opening__body">
        <p className="opening__kicker">You Are Cordially Invited</p>
        <h1 className="opening__title">Engagement</h1>
        <div className="opening__rule">
          <span /><em>💍</em><span />
        </div>
        <div className="opening__names">
          <span>Bhargav</span>
          <span className="opening__amp">&amp;</span>
          <span>Sowmya</span>
        </div>
        <p className="opening__date">12 &middot; October &middot; 2025</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   AMBIENT PARTICLES — subtle background
   ═══════════════════════════════════════════════════ */
function Particles() {
  const dots = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 2 + Math.random() * 3,
        dur: 10 + Math.random() * 14,
        delay: Math.random() * 10,
      })),
    [],
  );

  return (
    <div className="particles" aria-hidden="true">
      {dots.map((d) => (
        <i
          key={d.id}
          className="particles__dot"
          style={{
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: d.size,
            height: d.size,
            animationDuration: `${d.dur}s`,
            animationDelay: `${d.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   COUNTDOWN
   ═══════════════════════════════════════════════════ */
function Countdown() {
  const target = useMemo(() => new Date('2025-10-12T07:30:00Z'), []); // 1 PM IST

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
        <p className="countdown__done-title">The Celebration Has Happened!</p>
        <p className="countdown__done-sub">Thank you for being part of our special day.</p>
      </div>
    );
  }

  const units = [
    { v: left.days, l: 'Days', pad: 3 },
    { v: left.hours, l: 'Hours', pad: 2 },
    { v: left.minutes, l: 'Min', pad: 2 },
    { v: left.seconds, l: 'Sec', pad: 2 },
  ];

  return (
    <div className="countdown">
      {units.map((u) => (
        <div key={u.l} className="countdown__cell">
          <span className="countdown__num">{String(u.v).padStart(u.pad, '0')}</span>
          <span className="countdown__lbl">{u.l}</span>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   REVEAL ON SCROLL — IntersectionObserver
   ═══════════════════════════════════════════════════ */
function Reveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.unobserve(el); } },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${vis ? 'reveal--vis' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   HERO
   ═══════════════════════════════════════════════════ */
function Hero() {
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 80); return () => clearTimeout(t); }, []);

  return (
    <section className={`hero ${ready ? 'hero--ready' : ''}`}>
      {/* decorative bg shapes */}
      <div className="hero__shape hero__shape--1" />
      <div className="hero__shape hero__shape--2" />
      <div className="hero__shape hero__shape--3" />

      <div className="hero__inner">
        <p className="hero__kicker">ENGAGEMENT CEREMONY</p>
        <h1 className="hero__groom">Bhargav</h1>
        <div className="hero__amp-wrap">
          <span className="hero__amp">&amp;</span>
        </div>
        <h1 className="hero__bride">Sowmya</h1>
        <p className="hero__tagline">Together with their families, request the pleasure of your company</p>
        <div className="hero__badge">
          <span className="hero__badge-day">12</span>
          <span className="hero__badge-month">October 2025</span>
          <span className="hero__badge-time">1:00 PM IST</span>
        </div>
      </div>

      {/* scroll indicator pinned to bottom of viewport */}
      <div className="hero__scroll">
        <span className="hero__scroll-txt">Scroll</span>
        <span className="hero__scroll-line" />
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   DETAILS SECTION
   ═══════════════════════════════════════════════════ */
function Details() {
  return (
    <section className="sec sec--details" id="details">
      <div className="sec__wrap">
        <Reveal>
          <p className="sec__kicker">Save The Date</p>
          <h2 className="sec__title">Event Details</h2>
        </Reveal>

        <div className="details-grid">
          <Reveal delay={100}>
            <div className="info-card">
              <span className="info-card__icon">📅</span>
              <h3 className="info-card__heading">Date</h3>
              <p className="info-card__text">Sunday, 12th October 2025</p>
            </div>
          </Reveal>
          <Reveal delay={200}>
            <div className="info-card">
              <span className="info-card__icon">🕐</span>
              <h3 className="info-card__heading">Time</h3>
              <p className="info-card__text">1:00 PM IST onwards</p>
            </div>
          </Reveal>
          <Reveal delay={300}>
            <div className="info-card info-card--wide">
              <span className="info-card__icon">📍</span>
              <h3 className="info-card__heading">Venue</h3>
              <p className="info-card__text">
                Shree Padmavathi Venkateshwara Samudaya Bhavana
                <br />
                <small>4th Main Rd, Jayanagar West, Tumakuru, Karnataka 572102</small>
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={400}>
          <Countdown />
        </Reveal>

        <Reveal delay={500}>
          <div className="cal-cta">
            <a
              href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=Bhargav%20%26%20Sowmya%20Engagement&dates=20251012T063000Z/20251012T083000Z&details=Join%20us%20for%20the%20engagement%20ceremony%20of%20Bhargav%20and%20Sowmya&location=Shree%20Padmavathi%20Venkateshwara%20Samudaya%20Bhavana%2C%204th%20Main%20Rd%2C%20Jayanagar%20West%2C%20Tumakuru%2C%20Karnataka%20572102"
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
            >
              <span className="btn__icon">📅</span>
              Add to Google Calendar
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   SCHEDULE
   ═══════════════════════════════════════════════════ */
function Schedule() {
  const items = [
    { icon: '🍽️', time: '1:00 PM', title: 'Lunch & Refreshments', desc: 'Enjoy delicious food and refreshments as we gather together' },
    { icon: '💍', time: '2:00 PM', title: 'Nishchitartha — Engagement', desc: 'The sacred moment of our engagement ceremony' },
    { icon: '📸', time: '3:00 PM', title: 'Blessings & Photography', desc: 'Receiving blessings from our elders and capturing precious memories' },
  ];

  return (
    <section className="sec sec--schedule" id="schedule">
      <div className="sec__wrap">
        <Reveal>
          <p className="sec__kicker">The Day's Plan</p>
          <h2 className="sec__title">Event Schedule</h2>
        </Reveal>

        <div className="timeline">
          {items.map((e, i) => (
            <Reveal key={i} delay={i * 180}>
              <div className="tl-item">
                <div className="tl-item__dot">{e.icon}</div>
                <div className="tl-item__line" />
                <div className="tl-item__body">
                  <span className="tl-item__time">{e.time}</span>
                  <h4 className="tl-item__title">{e.title}</h4>
                  <p className="tl-item__desc">{e.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
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
          <h2 className="sec__title">Venue</h2>
        </Reveal>

        <Reveal delay={120}>
          <div className="venue-card">
            <div className="venue-card__info">
              <span className="venue-card__emoji">🏛️</span>
              <div>
                <h3 className="venue-card__name">Shree Padmavathi Venkateshwara Samudaya Bhavana</h3>
                <p className="venue-card__addr">4th Main Rd, Jayanagar West</p>
                <p className="venue-card__addr">Tumakuru, Karnataka 572102</p>
              </div>
            </div>
            <div className="venue-card__map">
              <iframe
                src="https://www.google.com/maps?q=Shree+Padmavathi+Venkateshwara+Samudaya+Bhavana+Tumkur&output=embed"
                title="Venue Location"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="venue-card__actions">
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=Shree+Padmavathi+Venkateshwara+Samudaya+Bhavana,+4th+Main+Rd,+Jayanagar+West,+Tumakuru,+Karnataka+572102"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--outline"
              >
                <span className="btn__icon">🧭</span>
                Get Directions
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
            <span className="closing__ornament">✦ ✦ ✦</span>
            <h2 className="closing__title">With the Blessings of Our Families</h2>
            <p className="closing__text">
              We joyously invite you to celebrate this beautiful beginning with us.
              Your presence and blessings would make our day truly memorable.
            </p>
            <div className="closing__names">
              <span>Bhargav</span>
              <em>💕</em>
              <span>Sowmya</span>
            </div>
            <span className="closing__ornament">✦ ✦ ✦</span>
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
      <p className="footer__made">crafted with ❤️ by Bhargav B P</p>
      <p className="footer__copy">&copy; 2025</p>
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
      <Particles />
      <Hero />
      <Details />
      <Schedule />
      <Venue />
      <Closing />
      <Footer />
    </div>
  );
}

export default WeddingPage;
