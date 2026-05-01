import React, { useState, useEffect, useRef } from 'react';
import { CONCEPTS } from './concepts.js';
import { VB_TOKENS } from './shared.jsx';

import ConceptFunnel from './concepts/concept-funnel.jsx';
import ConceptVoiceFirst from './concepts/concept-voice.jsx';
import ConceptMap from './concepts/concept-map.jsx';
import ConceptCinematic from './concepts/concept-cinematic.jsx';
import ConceptScroll from './concepts/concept-scroll.jsx';

const CONCEPT_COMPONENTS = {
  funnel: ConceptFunnel,
  voice: ConceptVoiceFirst,
  map: ConceptMap,
  cinematic: ConceptCinematic,
  scroll: ConceptScroll,
};

const ACCENT_OPTIONS = [
  { value: 'voice',    label: 'Voice',    color: VB_TOKENS.voice },
  { value: 'camera',   label: 'Camera',   color: VB_TOKENS.camera },
  { value: 'drone',    label: 'Drone',    color: VB_TOKENS.drone },
  { value: 'dispatch', label: 'Dispatch', color: VB_TOKENS.dispatch },
  { value: 'radio',    label: 'Radio',    color: VB_TOKENS.radio },
];

// Read the active concept from the URL hash (e.g. #map). Default to first.
function readActive() {
  if (typeof window === 'undefined') return CONCEPTS[0].id;
  const fromHash = window.location.hash.replace('#', '');
  return CONCEPTS.find((c) => c.id === fromHash)?.id || CONCEPTS[0].id;
}

export default function App() {
  const [activeId, setActiveId] = useState(() => readActive());
  const [accent, setAccent] = useState('voice');
  const [tweaksOpen, setTweaksOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false); // mobile

  const active = CONCEPTS.find((c) => c.id === activeId) || CONCEPTS[0];
  const Concept = CONCEPT_COMPONENTS[active.id];

  // Sync to URL hash so links are shareable.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const next = `#${activeId}`;
    if (window.location.hash !== next) {
      window.history.replaceState(null, '', next);
    }
  }, [activeId]);

  // Listen for back/forward.
  useEffect(() => {
    const onHash = () => setActiveId(readActive());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Close mobile nav on selection.
  const handleSelect = (id) => {
    setActiveId(id);
    setNavOpen(false);
    // Reset scroll when switching, especially for the scroll-driven concept.
    window.scrollTo(0, 0);
    const stage = document.querySelector('[data-stage]');
    if (stage) stage.scrollTop = 0;
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0b0f15', color: '#fff' }}>
      <Sidebar
        active={active}
        onSelect={handleSelect}
        navOpen={navOpen}
        onCloseNav={() => setNavOpen(false)}
      />

      <main style={{
        flex: 1,
        marginLeft: 0,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
      }} className="vb-main">
        <MobileTopBar
          active={active}
          onOpenNav={() => setNavOpen(true)}
        />

        <ConceptHeader active={active} />

        <Stage>
          <Concept accent={accent} key={active.id} />
        </Stage>
      </main>

      <TweaksDock
        open={tweaksOpen}
        onToggle={() => setTweaksOpen((v) => !v)}
        accent={accent}
        onAccentChange={setAccent}
      />

      <GlobalStyles />
    </div>
  );
}

// ─── Sidebar ────────────────────────────────────────────────────────

function Sidebar({ active, onSelect, navOpen, onCloseNav }) {
  return (
    <>
      {/* Backdrop on mobile when nav is open */}
      <div
        onClick={onCloseNav}
        className="vb-sidebar-backdrop"
        style={{
          display: navOpen ? 'block' : 'none',
        }}
      />
      <aside
        className={`vb-sidebar ${navOpen ? 'is-open' : ''}`}
        style={{
          width: 320,
          borderRight: '1px solid rgba(255,255,255,0.06)',
          background: '#070b10',
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          alignSelf: 'flex-start',
          height: '100vh',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: VB_TOKENS.body,
        }}
      >
        {/* Brand block */}
        <div style={{ padding: '28px 28px 0' }}>
          <img
            src="/ideas/assets/vb-logo.svg"
            alt="VoiceBrain"
            style={{ height: 22, display: 'block', opacity: 0.95 }}
          />
          <div style={{
            marginTop: 18,
            fontFamily: VB_TOKENS.mono,
            fontSize: 10,
            letterSpacing: 2.2,
            color: 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase',
          }}>
            Homepage Concepts · v1
          </div>
          <div style={{
            marginTop: 8,
            fontFamily: VB_TOKENS.display,
            fontSize: 22,
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            fontWeight: 500,
            color: '#fff',
          }}>
            Five directions for the next site.
          </div>
          <p style={{
            marginTop: 10,
            fontSize: 13,
            lineHeight: 1.55,
            color: 'rgba(255,255,255,0.55)',
            margin: '10px 0 0',
          }}>
            Each is a complete homepage in a different voice. Pick the one that feels right — or the parts of each you want.
          </p>
        </div>

        {/* Concept list */}
        <nav style={{ padding: '24px 14px', flex: 1 }}>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {CONCEPTS.map((c) => {
              const isActive = c.id === active.id;
              return (
                <li key={c.id}>
                  <button
                    onClick={() => onSelect(c.id)}
                    className="vb-concept-btn"
                    data-active={isActive}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '12px 14px',
                      borderRadius: 8,
                      background: isActive ? 'rgba(255,255,255,0.04)' : 'transparent',
                      border: '1px solid',
                      borderColor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                      color: '#fff',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      display: 'block',
                      transition: 'background 0.15s, border-color 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                      <span style={{
                        fontFamily: VB_TOKENS.mono,
                        fontSize: 11,
                        letterSpacing: 1.5,
                        color: isActive ? '#fff' : 'rgba(255,255,255,0.35)',
                        flexShrink: 0,
                      }}>
                        {c.number}
                      </span>
                      <span style={{
                        fontSize: 14,
                        fontWeight: 600,
                        letterSpacing: '-0.01em',
                        color: isActive ? '#fff' : 'rgba(255,255,255,0.85)',
                      }}>
                        {c.title}
                      </span>
                    </div>
                    <div style={{
                      marginTop: 4,
                      paddingLeft: 26,
                      fontSize: 12,
                      lineHeight: 1.45,
                      color: isActive ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.45)',
                    }}>
                      {c.tagline}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sign-off */}
        <div style={{
          padding: '20px 28px 28px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          fontSize: 11,
          lineHeight: 1.5,
          color: 'rgba(255,255,255,0.4)',
          fontFamily: VB_TOKENS.mono,
          letterSpacing: 0.5,
        }}>
          <div style={{ color: 'rgba(255,255,255,0.55)', marginBottom: 4 }}>Ben Fogarty</div>
          <div>Departure Studio · May 2026</div>
        </div>
      </aside>
    </>
  );
}

// ─── Mobile top bar ─────────────────────────────────────────────────

function MobileTopBar({ active, onOpenNav }) {
  return (
    <div className="vb-mobile-topbar" style={{
      display: 'none',
      padding: '14px 18px',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      background: '#070b10',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 14,
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <button
        onClick={onOpenNav}
        aria-label="Open concepts menu"
        style={{
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 8,
          padding: '8px 10px',
          color: '#fff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontFamily: VB_TOKENS.mono,
          fontSize: 11,
          letterSpacing: 1.5,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="18" x2="20" y2="18" />
        </svg>
        CONCEPTS
      </button>
      <div style={{
        fontFamily: VB_TOKENS.mono,
        fontSize: 11,
        letterSpacing: 1.5,
        color: 'rgba(255,255,255,0.6)',
      }}>
        {active.number} · {active.title.toUpperCase()}
      </div>
    </div>
  );
}

// ─── Concept header ─────────────────────────────────────────────────

function ConceptHeader({ active }) {
  return (
    <header style={{
      padding: '32px 48px 24px',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      background: '#070b10',
    }} className="vb-concept-header">
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 14,
        marginBottom: 8,
        fontFamily: VB_TOKENS.mono,
        fontSize: 11,
        letterSpacing: 2,
        color: 'rgba(255,255,255,0.45)',
      }}>
        <span>CONCEPT {active.number}</span>
        <span style={{ width: 24, height: 1, background: 'rgba(255,255,255,0.2)' }} />
        <span>{active.title.toUpperCase()}</span>
      </div>
      <h1 style={{
        margin: 0,
        fontFamily: VB_TOKENS.display,
        fontSize: 28,
        lineHeight: 1.15,
        letterSpacing: '-0.02em',
        fontWeight: 500,
        color: '#fff',
      }}>
        {active.tagline}
      </h1>
      <p style={{
        margin: '12px 0 0',
        maxWidth: 760,
        fontSize: 14,
        lineHeight: 1.6,
        color: 'rgba(255,255,255,0.6)',
      }}>
        {active.description}
      </p>
      {active.id === 'scroll' && (
        <div style={{
          marginTop: 14,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 12px',
          borderRadius: 999,
          background: 'rgba(80,127,229,0.1)',
          border: '1px solid rgba(80,127,229,0.3)',
          fontFamily: VB_TOKENS.mono,
          fontSize: 11,
          letterSpacing: 1.4,
          color: 'rgba(255,255,255,0.8)',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: VB_TOKENS.voice }} />
          SCROLL INSIDE THE ARTBOARD TO ADVANCE
        </div>
      )}
    </header>
  );
}

// ─── Stage (the artboard viewport) ──────────────────────────────────

function Stage({ children }) {
  const wrapRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const recalc = () => {
      if (!wrapRef.current) return;
      const w = wrapRef.current.clientWidth;
      // Concepts are designed at 1440 wide. Scale down if narrower; never up.
      const PADDING = 48; // matches container padding
      const available = w - PADDING * 2;
      const next = Math.min(1, available / 1440);
      setScale(next);
    };
    recalc();
    window.addEventListener('resize', recalc);
    return () => window.removeEventListener('resize', recalc);
  }, []);

  return (
    <div
      ref={wrapRef}
      data-stage
      style={{
        flex: 1,
        padding: '32px 48px 64px',
        overflow: 'auto',
      }}
      className="vb-stage"
    >
      <div style={{
        width: 1440 * scale,
        height: 900 * scale,
        position: 'relative',
        margin: '0 auto',
        boxShadow: '0 30px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)',
        borderRadius: 4,
        overflow: 'hidden',
      }}>
        <div style={{
          width: 1440,
          height: 900,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── Tweaks dock (accent picker) ────────────────────────────────────

function TweaksDock({ open, onToggle, accent, onAccentChange }) {
  return (
    <div style={{
      position: 'fixed',
      right: 20,
      bottom: 20,
      zIndex: 100,
      fontFamily: VB_TOKENS.body,
    }}>
      {open && (
        <div style={{
          marginBottom: 10,
          background: 'rgba(7,11,16,0.96)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 12,
          padding: '14px 16px',
          minWidth: 220,
          backdropFilter: 'blur(12px)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        }}>
          <div style={{
            fontFamily: VB_TOKENS.mono,
            fontSize: 10,
            letterSpacing: 1.8,
            color: 'rgba(255,255,255,0.45)',
            marginBottom: 10,
          }}>
            ACCENT COLOR
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {ACCENT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onAccentChange(opt.value)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 10px',
                  background: opt.value === accent ? 'rgba(255,255,255,0.06)' : 'transparent',
                  border: '1px solid',
                  borderColor: opt.value === accent ? 'rgba(255,255,255,0.1)' : 'transparent',
                  borderRadius: 6,
                  color: '#fff',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: 13,
                  textAlign: 'left',
                }}
              >
                <span style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: opt.color,
                  boxShadow: opt.value === accent ? `0 0 0 2px rgba(255,255,255,0.2)` : 'none',
                }} />
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
      <button
        onClick={onToggle}
        aria-label={open ? 'Close tweaks' : 'Open tweaks'}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 14px',
          borderRadius: 999,
          background: 'rgba(7,11,16,0.96)',
          border: '1px solid rgba(255,255,255,0.15)',
          color: '#fff',
          cursor: 'pointer',
          fontFamily: VB_TOKENS.mono,
          fontSize: 11,
          letterSpacing: 1.5,
          backdropFilter: 'blur(12px)',
          boxShadow: '0 10px 24px rgba(0,0,0,0.3)',
        }}
      >
        <span style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: ACCENT_OPTIONS.find((o) => o.value === accent)?.color,
        }} />
        TWEAKS
      </button>
    </div>
  );
}

// ─── Global responsive styles ───────────────────────────────────────

function GlobalStyles() {
  return (
    <style>{`
      .vb-concept-btn:hover[data-active="false"] {
        background: rgba(255,255,255,0.025) !important;
      }
      .vb-sidebar-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.6);
        z-index: 90;
      }
      @media (max-width: 900px) {
        .vb-sidebar {
          position: fixed !important;
          left: 0;
          top: 0;
          bottom: 0;
          z-index: 100;
          transform: translateX(-100%);
          transition: transform 0.25s ease;
        }
        .vb-sidebar.is-open {
          transform: translateX(0);
        }
        .vb-mobile-topbar {
          display: flex !important;
        }
        .vb-concept-header {
          padding: 24px 22px 18px !important;
        }
        .vb-concept-header h1 {
          font-size: 22px !important;
        }
        .vb-stage {
          padding: 18px 18px 40px !important;
        }
      }
      @media (min-width: 901px) {
        .vb-sidebar-backdrop { display: none !important; }
      }
    `}</style>
  );
}
