import React, { useEffect, useState } from 'react';
import GiftList from './GiftList';

const PARTY_START = new Date('2026-09-19T13:00:00-04:00');

const VENUE = {
  name: 'Cider Hill Farm',
  address: '45 Fern Ave, Amesbury, MA 01913',
  mapsUrl: 'https://maps.google.com/?q=Cider+Hill+Farm,+45+Fern+Ave,+Amesbury,+MA+01913',
  siteUrl: 'https://www.ciderhill.com/',
  gcalUrl:
    'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Austin%20Turns%2030%20%E2%80%94%20Apple%20Picking%20at%20Cider%20Hill%20Farm&dates=20260919T170000Z/20260919T220000Z&location=Cider%20Hill%20Farm%2C%2045%20Fern%20Ave%2C%20Amesbury%2C%20MA%2001913&details=Austin%27s%2030th%20at%20Cider%20Hill%20Farm.%20Apple%20picking%2C%20the%20PitchFork%20food%20truck%2C%20cider%20donuts%2C%20and%20the%20outdoor%20cider%20bar.%20Come%20and%20go%20any%20time%20between%201%20and%20close.%20Bags%20and%20drinks%20are%20pay-your-own%20%E2%80%94%20wear%20comfy%20shoes.',
  icsUrl: '/austin-turns-30.ics',
};

// What makes one stop enough — the reason the day doesn't need a second venue.
const ON_THE_FARM = [
  {
    label: 'Pick',
    title: 'Fifty-odd apple varieties',
    body: 'Grab a bag and wander the rows. Peaches and flowers are usually still going in September too.',
  },
  {
    label: 'Eat',
    title: 'The PitchFork + cider donuts',
    body: "Their food truck runs seasonal eats, fresh lemonade, and fruit ice cream. The cider donuts are the reason people drive out here.",
  },
  {
    label: 'Drink',
    title: 'The outdoor cider bar',
    body: 'Cider Hill Cellars pours hard cider pressed from fruit grown on the property, plus the non-alcoholic version. Live music some afternoons.',
  },
];

const pad = (n) => String(n).padStart(2, '0');

const useRaceClock = () => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const ms = PARTY_START.getTime() - now;
  if (ms <= 0) return null;
  const s = Math.floor(ms / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: pad(Math.floor((s % 86400) / 3600)),
    mins: pad(Math.floor((s % 3600) / 60)),
    secs: pad(s % 60),
  };
};

const OrchardRun = () => {
  const [tab, setTab] = useState('itinerary');
  const clock = useRaceClock();

  useEffect(() => {
    document.title = 'Austin Turns 30 · Apple Picking at Cider Hill Farm';
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Spline+Sans+Mono:wght@500;600&display=swap';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
      document.title = 'Austin Ramberg';
    };
  }, []);

  return (
    <div className="orun-page">
      <style>{ORUN_CSS}</style>

      <main className="orun-card">
        {/* ---------- masthead ---------- */}
        <header className="orun-mast">
          <div className="orun-apple" aria-hidden="true">
            <span className="orun-apple-num">30</span>
          </div>
          <p className="orun-eyebrow">you're invited · saturday, september 19, 2026</p>
          <h1 className="orun-title">
            Austin<br />Turns 30
          </h1>
          <p className="orun-sub">
            Apple picking at Cider Hill Farm · Amesbury, MA
          </p>
          <div className="orun-clock" role="timer" aria-label="Countdown to the party">
            {clock ? (
              <>
                <span className="orun-clock-label">countdown</span>
                <span className="orun-clock-digits">
                  {clock.days}<em>d</em> {clock.hours}<em>h</em> {clock.mins}<em>m</em> {clock.secs}<em>s</em>
                </span>
              </>
            ) : (
              <span className="orun-clock-digits">today's the day — see you at the orchard 🍎</span>
            )}
          </div>
        </header>

        {/* ---------- tabs ---------- */}
        <nav className="orun-tabs" role="tablist" aria-label="Page sections">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'itinerary'}
            className={`orun-tab${tab === 'itinerary' ? ' active' : ''}`}
            onClick={() => setTab('itinerary')}
          >
            Info
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'gifts'}
            className={`orun-tab${tab === 'gifts' ? ' active' : ''}`}
            onClick={() => setTab('gifts')}
          >
            Gift List
          </button>
        </nav>

        {tab === 'itinerary' ? (
          <div className="orun-body">
            {/* ---------- what ---------- */}
            <section className="orun-section">
              <h2 className="orun-h">The What</h2>
              <p className="orun-p">
                Austin is turning 30, and we're spending the afternoon at Cider Hill Farm —
                picking apples, eating our way through the food truck, and drinking cider
                pressed from the orchard we're standing in. One place, the whole day.
              </p>
            </section>

            {/* ---------- where ---------- */}
            <section className="orun-section">
              <h2 className="orun-h">The Where</h2>
              <div className="orun-place">
                <span className="orun-place-eyebrow">the orchard</span>
                <h3 className="orun-place-name">{VENUE.name}</h3>
                <p className="orun-place-addr">{VENUE.address}</p>
                <p className="orun-place-note">
                  About ten minutes off I-95 in Amesbury, with free parking on site.
                </p>
                <div className="orun-cal-row">
                  <a
                    className="orun-cal-btn solid"
                    href={VENUE.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open in Maps →
                  </a>
                  <a
                    className="orun-cal-btn"
                    href={VENUE.siteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Farm website →
                  </a>
                </div>
              </div>
            </section>

            {/* ---------- when ---------- */}
            <section className="orun-section">
              <h2 className="orun-h">The When</h2>
              <div className="orun-when-card">
                <div className="orun-when-row">
                  <span className="orun-when-dot solid" aria-hidden="true" />
                  <div>
                    <p className="orun-when-time">1:00 PM · Saturday, September 19</p>
                    <p className="orun-when-note">Meet at the farm — find the group by the barn.</p>
                  </div>
                </div>
                <div className="orun-when-row">
                  <span className="orun-when-dot" aria-hidden="true" />
                  <div>
                    <p className="orun-when-time">6:00 PM · the farm closes</p>
                    <p className="orun-when-note">
                      Come late, leave early, stay the whole time — no schedule to keep.
                    </p>
                  </div>
                </div>
                <div className="orun-cal-row">
                  <a className="orun-cal-btn" href={VENUE.gcalUrl} target="_blank" rel="noopener noreferrer">
                    + Google Calendar
                  </a>
                  <a className="orun-cal-btn" href={VENUE.icsUrl} download>
                    ⬇ .ics file
                  </a>
                </div>
              </div>
            </section>

            {/* ---------- on the farm ---------- */}
            <section className="orun-section">
              <h2 className="orun-h">On the Farm</h2>
              <ul className="orun-farm">
                {ON_THE_FARM.map((thing) => (
                  <li className="orun-farm-item" key={thing.label}>
                    <span className="orun-farm-label">{thing.label}</span>
                    <h3 className="orun-farm-title">{thing.title}</h3>
                    <p className="orun-farm-body">{thing.body}</p>
                  </li>
                ))}
              </ul>
            </section>

            {/* ---------- who ---------- */}
            <section className="orun-section">
              <h2 className="orun-h">The Who</h2>
              <p className="orun-p">
                Friends and family — partners and kids very welcome. It's a working farm with
                animals, wagons, and room to run, so the little ones do fine here. If you got
                the text, you're on the roster.
              </p>
              <p className="orun-rsvp">
                <strong>RSVP:</strong> just reply to the text with who's coming. That's it.
              </p>
            </section>

            {/* ---------- good to know ---------- */}
            <section className="orun-section">
              <h2 className="orun-h">Good to Know</h2>
              <ul className="orun-know">
                <li>Picking bags, food, and drinks are pay-your-own.</li>
                <li>Wear comfy shoes — it's a working orchard, and the rows get muddy.</li>
                <li>Bring a layer. September afternoons turn cool once the sun drops.</li>
                <li>No need to stay the whole time — drop in whenever works.</li>
              </ul>
            </section>
          </div>
        ) : (
          <div className="orun-body">
            <GiftList />
          </div>
        )}

        <footer className="orun-foot">
          austin turns 30 · sat 09.19.2026 · cider hill farm, amesbury, ma
        </footer>
      </main>
    </div>
  );
};

const ORUN_CSS = `
  .orun-page{
    --dusk:#1c2416;
    --dusk-2:#141b10;
    --paper:#f6efdd;
    --paper-2:#ede4c9;
    --apple:#c22f21;
    --gold:#d99a2b;
    --leaf:#43672f;
    --leaf-deep:#2c4a1e;
    --ink:#241f16;
    --ink-soft:#6b6353;
    --line:#d8cdae;
    min-height:100vh;
    background:
      radial-gradient(ellipse at 15% -5%, #2e3d22 0%, transparent 55%),
      radial-gradient(ellipse at 100% 105%, #10160c 0%, transparent 50%),
      var(--dusk);
    padding:96px 16px 72px;
    font-family:'Inter',system-ui,-apple-system,sans-serif;
    color:var(--ink);
    line-height:1.55;
  }
  .orun-page *{box-sizing:border-box;}
  .orun-card{
    max-width:720px;margin:0 auto;background:var(--paper);
    border-radius:8px;overflow:hidden;
    box-shadow:0 30px 70px rgba(0,0,0,.45);
    animation:orun-rise .5s ease both;
  }
  @keyframes orun-rise{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:none;}}

  /* ---------- masthead ---------- */
  .orun-mast{
    position:relative;
    background:linear-gradient(160deg,var(--leaf-deep),#1f3814 70%);
    color:var(--paper);
    padding:38px 32px 30px;
  }
  .orun-mast::after{
    content:"";position:absolute;left:0;right:0;bottom:0;height:7px;
    background:repeating-linear-gradient(90deg,var(--gold) 0 16px,transparent 16px 30px,var(--apple) 30px 46px,transparent 46px 60px);
  }
  .orun-eyebrow{
    font-family:'Spline Sans Mono',monospace;font-size:.72rem;font-weight:600;
    letter-spacing:.16em;text-transform:uppercase;color:var(--gold);margin:0 0 14px;
  }
  .orun-title{
    font-family:'Bricolage Grotesque','Inter',sans-serif;
    font-weight:800;font-size:clamp(2.6rem,9vw,4.2rem);line-height:.95;
    letter-spacing:-.02em;text-transform:uppercase;margin:0 0 12px;
  }
  .orun-sub{font-size:.95rem;color:#cfd8c2;margin:0 0 20px;max-width:26rem;}
  /* apple badge — the 30 sits in the fruit */
  .orun-apple{
    position:absolute;top:34px;right:30px;width:84px;height:80px;
    background:radial-gradient(circle at 34% 30%,#e0604c 0%,var(--apple) 48%,#8f2015 100%);
    border-radius:48% 48% 44% 44% / 44% 44% 56% 56%;
    box-shadow:0 8px 20px rgba(0,0,0,.32);
  }
  /* stem */
  .orun-apple::before{
    content:"";position:absolute;top:-11px;left:47%;width:5px;height:16px;
    background:#6b4426;border-radius:3px;transform:rotate(-10deg);
  }
  /* leaf */
  .orun-apple::after{
    content:"";position:absolute;top:-8px;left:56%;width:26px;height:15px;
    background:var(--leaf);border-radius:0 100% 0 100%;transform:rotate(-16deg);
  }
  .orun-apple-num{
    position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
    font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:2.1rem;
    color:var(--paper);letter-spacing:-.02em;
    text-shadow:0 1px 3px rgba(0,0,0,.28);
  }
  .orun-clock{
    display:inline-flex;align-items:baseline;gap:12px;flex-wrap:wrap;
    background:rgba(0,0,0,.28);border:1px solid rgba(217,154,43,.4);
    border-radius:6px;padding:8px 14px;
  }
  .orun-clock-label{
    font-family:'Spline Sans Mono',monospace;font-size:.68rem;font-weight:600;
    letter-spacing:.14em;text-transform:uppercase;color:#cfd8c2;
  }
  .orun-clock-digits{
    font-family:'Spline Sans Mono',monospace;font-size:1.05rem;font-weight:600;
    color:var(--gold);font-variant-numeric:tabular-nums;
  }
  .orun-clock-digits em{font-style:normal;font-size:.7rem;color:#cfd8c2;margin-right:2px;}

  /* ---------- tabs ---------- */
  .orun-tabs{display:flex;background:var(--paper-2);border-bottom:1px solid var(--line);}
  .orun-tab{
    flex:1;appearance:none;background:none;border:none;cursor:pointer;
    font-family:'Bricolage Grotesque','Inter',sans-serif;font-weight:700;
    font-size:1rem;text-transform:uppercase;letter-spacing:.06em;
    color:var(--ink-soft);padding:14px 8px 12px;
    border-bottom:3px solid transparent;transition:color .15s,border-color .15s;
  }
  .orun-tab:hover{color:var(--ink);}
  .orun-tab.active{color:var(--apple);border-bottom-color:var(--apple);background:var(--paper);}
  .orun-tab:focus-visible{outline:2px solid var(--apple);outline-offset:-4px;}

  /* ---------- body / sections ---------- */
  .orun-body{padding:30px 32px 8px;}
  .orun-section{margin-bottom:34px;}
  .orun-h{
    font-family:'Spline Sans Mono',monospace;font-size:.75rem;font-weight:600;
    letter-spacing:.18em;text-transform:uppercase;color:var(--leaf);
    margin:0 0 12px;display:flex;align-items:center;gap:10px;
  }
  .orun-h::after{content:"";flex:1;height:1px;background:var(--line);}
  .orun-p{margin:0 0 10px;font-size:.94rem;color:var(--ink);}

  /* ---------- when card ---------- */
  .orun-when-card{
    background:var(--paper-2);border:1px solid var(--line);border-radius:6px;
    padding:18px 20px 16px;
  }
  .orun-when-row{position:relative;display:flex;gap:16px;align-items:flex-start;}
  .orun-when-row + .orun-when-row{margin-top:14px;}
  /* dashed line linking the start of the afternoon to the farm's closing time */
  .orun-when-row:first-child::after{
    content:"";position:absolute;left:7px;top:20px;height:calc(100% + 6px);
    border-left:2px dashed var(--gold);
  }
  .orun-when-dot{
    flex:0 0 auto;width:16px;height:16px;margin:5px 0 0 0;border-radius:50%;
    border:2px solid var(--apple);background:var(--paper-2);position:relative;z-index:1;
  }
  .orun-when-dot.solid{background:var(--apple);}
  .orun-when-time{
    font-family:'Spline Sans Mono',monospace;font-size:.78rem;font-weight:600;
    letter-spacing:.08em;text-transform:uppercase;color:var(--apple);margin:0 0 2px;
  }
  .orun-when-note{margin:0;font-size:.9rem;color:var(--ink-soft);}
  .orun-cal-row{display:flex;gap:10px;flex-wrap:wrap;margin-top:16px;}
  .orun-cal-btn{
    font-family:'Spline Sans Mono',monospace;font-size:.72rem;font-weight:600;
    letter-spacing:.06em;text-decoration:none;color:var(--leaf-deep);
    border:1.5px solid var(--leaf);border-radius:999px;padding:6px 14px;
    transition:background .15s,color .15s;
  }
  .orun-cal-btn:hover{background:var(--leaf);color:var(--paper);}
  .orun-cal-btn:focus-visible{outline:2px solid var(--apple);outline-offset:2px;}

  /* ---------- where ---------- */
  .orun-place{
    position:relative;overflow:hidden;
    background:var(--paper-2);border:1px solid var(--line);border-radius:6px;
    padding:18px 20px 18px;
  }
  /* orchard rows receding to the right — quiet texture, not a picture of a map */
  .orun-place::after{
    content:"";position:absolute;top:0;right:0;bottom:0;width:38%;
    background:repeating-linear-gradient(76deg,
      rgba(67,103,47,.16) 0 2px, transparent 2px 13px);
    pointer-events:none;
  }
  .orun-place-eyebrow{
    font-family:'Spline Sans Mono',monospace;font-size:.66rem;font-weight:600;
    letter-spacing:.18em;text-transform:uppercase;color:var(--gold);
  }
  .orun-place-name{
    font-family:'Bricolage Grotesque',sans-serif;font-weight:800;
    font-size:clamp(1.4rem,5vw,1.85rem);line-height:1.05;letter-spacing:-.01em;
    margin:4px 0 6px;color:var(--ink);
  }
  .orun-place-addr{margin:0;font-size:.95rem;font-weight:500;color:var(--ink);}
  .orun-place-note{margin:4px 0 0;font-size:.86rem;color:var(--ink-soft);}
  .orun-cal-btn.solid{
    background:var(--leaf-deep);color:var(--paper);border-color:var(--leaf-deep);
  }
  .orun-cal-btn.solid:hover{background:var(--apple);border-color:var(--apple);}

  /* ---------- on the farm ---------- */
  .orun-farm{list-style:none;margin:0;padding:0;display:grid;gap:12px;}
  .orun-farm-item{
    position:relative;padding:12px 16px 14px 16px;
    background:var(--paper-2);border:1px solid var(--line);border-radius:6px;
    border-left:3px solid var(--gold);
  }
  .orun-farm-label{
    font-family:'Spline Sans Mono',monospace;font-size:.66rem;font-weight:600;
    letter-spacing:.18em;text-transform:uppercase;color:var(--gold);
  }
  .orun-farm-title{
    font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:1.08rem;
    margin:2px 0 4px;color:var(--ink);
  }
  .orun-farm-body{margin:0;font-size:.89rem;color:var(--ink-soft);}

  /* ---------- who / know ---------- */
  .orun-rsvp{
    margin:12px 0 0;padding:12px 16px;background:var(--paper-2);
    border-left:3px solid var(--apple);border-radius:0 6px 6px 0;font-size:.92rem;
  }
  .orun-know{list-style:none;margin:0;padding:0;display:grid;gap:8px;}
  .orun-know li{
    position:relative;padding-left:24px;font-size:.92rem;
  }
  .orun-know li::before{
    content:"";position:absolute;left:2px;top:.42em;width:10px;height:10px;
    border-radius:60% 40% 60% 40%;background:var(--apple);transform:rotate(35deg);
  }

  /* ---------- gift list ---------- */
  .orun-gifts-intro{margin:0 0 24px;font-size:.94rem;}
  .orun-gifts-foot{
    margin:26px 0 8px;padding-top:16px;border-top:1px solid var(--line);
    font-size:.82rem;color:var(--ink-soft);
  }
  .orun-gifts-foot strong{color:var(--gold);}
  .orun-tier{margin-bottom:28px;}
  .orun-tier-head{
    display:flex;align-items:baseline;gap:10px;
    background:var(--leaf-deep);color:var(--paper);
    border-radius:6px 6px 0 0;padding:10px 16px;
  }
  .orun-tier-no{
    font-family:'Spline Sans Mono',monospace;font-size:.72rem;font-weight:600;
    color:var(--gold);
  }
  .orun-tier-name{
    font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:1.05rem;
    text-transform:uppercase;letter-spacing:.04em;
  }
  .orun-tier-price{
    margin-left:auto;font-family:'Spline Sans Mono',monospace;font-size:.68rem;
    color:#cfd8c2;text-align:right;
  }
  .orun-tier-note{
    margin:0;padding:8px 16px;background:var(--paper-2);
    border:1px solid var(--line);border-top:0;font-size:.82rem;color:var(--ink-soft);
  }
  .orun-items{
    list-style:none;margin:0;padding:0;border:1px solid var(--line);border-top:0;
    border-radius:0 0 6px 6px;overflow:hidden;
  }
  .orun-item{
    display:flex;align-items:center;gap:8px;border-top:1px solid var(--line);
    transition:background .12s;
  }
  .orun-item:first-child{border-top:0;}
  .orun-item:hover{background:var(--paper-2);}
  .orun-item-link{
    flex:1;display:flex;align-items:baseline;justify-content:space-between;gap:12px;
    padding:11px 8px 11px 16px;text-decoration:none;color:var(--ink);min-width:0;
  }
  .orun-item-link:hover .orun-item-name{text-decoration:underline;text-underline-offset:3px;}
  .orun-item-name{font-size:.92rem;font-weight:500;}
  .orun-item-tag{
    display:inline-block;margin-left:8px;font-family:'Spline Sans Mono',monospace;
    font-size:.62rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase;
    color:var(--leaf);
  }
  .orun-item-price{
    font-family:'Spline Sans Mono',monospace;font-size:.74rem;font-weight:600;
    color:var(--ink-soft);white-space:nowrap;
  }
  .orun-claim-btn{
    appearance:none;cursor:pointer;margin-right:16px;flex-shrink:0;
    font-family:'Spline Sans Mono',monospace;font-size:.66rem;font-weight:600;
    letter-spacing:.06em;text-transform:uppercase;
    color:var(--apple);background:none;border:1.5px solid var(--apple);
    border-radius:999px;padding:4px 10px;transition:background .15s,color .15s;
  }
  .orun-claim-btn:hover:not(:disabled){background:var(--apple);color:var(--paper);}
  .orun-claim-btn:focus-visible{outline:2px solid var(--leaf);outline-offset:2px;}
  .orun-claim-btn:disabled{
    cursor:default;color:var(--paper);background:var(--leaf);border-color:var(--leaf);
  }
  .orun-item.claimed .orun-item-link{opacity:.45;text-decoration:line-through;}

  /* ---------- footer ---------- */
  .orun-foot{
    margin-top:8px;padding:16px 32px 20px;border-top:1px solid var(--line);
    background:var(--paper-2);
    font-family:'Spline Sans Mono',monospace;font-size:.64rem;font-weight:600;
    letter-spacing:.18em;text-transform:uppercase;color:var(--ink-soft);
    text-align:center;
  }

  /* ---------- responsive / a11y ---------- */
  @media (max-width:560px){
    .orun-page{padding:84px 10px 48px;}
    .orun-mast{padding:30px 20px 26px;}
    .orun-apple{top:22px;right:18px;width:62px;height:59px;}
    .orun-apple-num{font-size:1.5rem;}
    /* the apple is absolutely positioned — keep the header text clear of it */
    .orun-eyebrow{padding-right:72px;}
    .orun-title{padding-right:56px;}
    .orun-body{padding:24px 18px 4px;}
    .orun-when-card{padding:16px 14px 14px;}
    .orun-tier-head{flex-wrap:wrap;}
    .orun-tier-price{margin-left:0;width:100%;text-align:left;}
    .orun-item-link{flex-direction:column;align-items:flex-start;gap:2px;}
    .orun-claim-btn{margin-right:12px;}
    .orun-foot{padding:14px 18px 18px;letter-spacing:.1em;}
  }
  @media (prefers-reduced-motion:reduce){
    .orun-page *{transition:none!important;animation:none!important;}
  }
`;

export default OrchardRun;
