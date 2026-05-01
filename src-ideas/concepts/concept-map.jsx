import React from 'react';
import { VB_TOKENS, VBNav, LiveInMarketBadge, CustomerStrip, SensorIcon } from '../shared.jsx';

// Concept 3 — THE MAP
// Geographic command picture. Anchors VoiceBrain's existing scrollytelling demo.
// Editorial / data-journalism feel.

function ConceptMap({ accent }) {
  const accentColor = VB_TOKENS[accent] || VB_TOKENS.voice;

  return (
    <div style={{
      width: 1440, height: 900, background: VB_TOKENS.inkDeep, color: VB_TOKENS.paper,
      fontFamily: VB_TOKENS.body, position: "relative", overflow: "hidden",
    }}>
      <VBNav inverted={true} accent={accentColor} />

      <div style={{ position: "relative", height: "calc(100% - 64px)" }}>
        {/* MAP CANVAS, full bleed */}
        <MapCanvas accent={accentColor} />

        {/* Top-left HERO copy overlay */}
        <div style={{
          position: "absolute", top: 56, left: 56, maxWidth: 480, zIndex: 5,
          display: "flex", flexDirection: "column", gap: 20,
        }}>
          <LiveInMarketBadge inverted={true} />
          <h1 style={{
            fontFamily: VB_TOKENS.display, fontSize: 68, lineHeight: 0.92, letterSpacing: "-0.035em",
            margin: 0, fontWeight: 500, textWrap: "balance", color: VB_TOKENS.paper,
          }}>
            One operational picture. <span style={{ fontWeight: 500, color: accentColor }}>Twenty seconds.</span>
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.5, color: "rgba(220,225,229,0.78)", margin: 0 }}>
            Voice, video, drone, and CAD. Fused live onto the map your dispatcher already trusts. Scroll the incident →
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <button style={{
              padding: "13px 20px", borderRadius: 999, background: VB_TOKENS.paper, color: VB_TOKENS.ink,
              border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer",
            }}>Walk through an incident →</button>
            <button style={{
              padding: "13px 20px", borderRadius: 999, background: "rgba(255,255,255,0.08)", color: VB_TOKENS.paper,
              border: `1px solid rgba(255,255,255,0.2)`, fontWeight: 600, fontSize: 13, cursor: "pointer",
              backdropFilter: "blur(10px)",
            }}>Book a demo</button>
          </div>
        </div>

        {/* Top-right INCIDENT badge */}
        <div style={{
          position: "absolute", top: 56, right: 56, zIndex: 5,
          display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-end",
        }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px",
            borderRadius: 999, background: "rgba(221,68,82,0.12)", border: "1px solid rgba(221,68,82,0.4)",
            backdropFilter: "blur(10px)",
          }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: VB_TOKENS.danger, animation: "vbPulse 1.4s infinite" }} />
            <span style={{ fontFamily: VB_TOKENS.mono, fontSize: 10, letterSpacing: 2, color: VB_TOKENS.danger, fontWeight: 600 }}>ACTIVE INCIDENT · 211A</span>
          </div>
          <div style={{
            background: "rgba(8,14,22,0.7)", backdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: 16, width: 280,
          }}>
            <div style={{ fontFamily: VB_TOKENS.mono, fontSize: 9, letterSpacing: 2, color: VB_TOKENS.danger, marginBottom: 6 }}>SHOTS FIRED · 17:43</div>
            <div style={{ fontFamily: VB_TOKENS.display, fontSize: 17, lineHeight: 1.2, fontWeight: 500, marginBottom: 8 }}>
              Canal & Norman, District 3
            </div>
            <div style={{ fontSize: 12, lineHeight: 1.45, color: "rgba(220,225,229,0.65)" }}>
              Suspect armed, gray sedan, partial plate 7-King. Three units responding, drone airborne.
            </div>
          </div>
        </div>

        {/* Bottom-left phase strip, visualizes the demo's 7 phases */}
        <PhaseStrip accent={accentColor} />

        {/* Right column: live correlation feed */}
        <CorrelationFeed accent={accentColor} />
      </div>
    </div>
  );
}

// Stylized map (SVG) — district grid with sensors and a glowing incident.
function MapCanvas({ accent }) {
  const sensors = [
    { type: "camera", x: 220, y: 280, active: false },
    { type: "camera", x: 380, y: 200, active: false },
    { type: "camera", x: 720, y: 360, active: true  },
    { type: "camera", x: 980, y: 280, active: false },
    { type: "camera", x: 1180, y: 460, active: false },
    { type: "radio",  x: 460, y: 440, active: true },
    { type: "radio",  x: 880, y: 540, active: false },
    { type: "radio",  x: 300, y: 580, active: false },
    { type: "voice",  x: 720, y: 460, active: true },
    { type: "drone",  x: 820, y: 320, active: true },
    { type: "cad",    x: 600, y: 380, active: true },
  ];
  const incident = { x: 720, y: 380 };

  return (
    <svg viewBox="0 0 1440 836" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
      {/* gradient background */}
      <defs>
        <radialGradient id="mapBg" cx="0.5" cy="0.55" r="0.7">
          <stop offset="0%" stopColor="#15212e" />
          <stop offset="100%" stopColor="#080e16" />
        </radialGradient>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(220,225,229,0.05)" strokeWidth="0.5" />
        </pattern>
        <filter id="mGlow"><feGaussianBlur stdDeviation="3" /></filter>
      </defs>
      <rect width="100%" height="100%" fill="url(#mapBg)" />
      <rect width="100%" height="100%" fill="url(#grid)" />

      {/* abstract street network */}
      <g stroke="rgba(220,225,229,0.18)" strokeWidth="1.5" fill="none">
        <path d="M 0 200 Q 360 240 720 220 T 1440 280" />
        <path d="M 0 380 Q 280 360 560 380 T 1100 400 T 1440 420" />
        <path d="M 0 540 Q 360 560 720 540 T 1440 580" />
        <path d="M 0 700 Q 480 720 960 680 T 1440 700" />
        <path d="M 240 0 Q 280 280 320 560 T 360 836" />
        <path d="M 600 0 Q 640 280 680 560 T 720 836" />
        <path d="M 960 0 Q 1000 280 1040 560 T 1080 836" />
        <path d="M 1280 0 Q 1300 280 1320 560 T 1340 836" />
      </g>

      {/* district outlines */}
      <g stroke={accent} strokeOpacity="0.25" strokeWidth="1" strokeDasharray="6 4" fill="none">
        <path d="M 100 100 L 540 80 L 580 360 L 140 400 Z" />
        <path d="M 580 80 L 1080 100 L 1100 460 L 580 360 Z" />
        <path d="M 1080 100 L 1380 140 L 1360 540 L 1100 460 Z" />
      </g>
      <text x="320" y="240" fill="rgba(220,225,229,0.35)" fontFamily={VB_TOKENS.mono} fontSize="11" letterSpacing="3">DISTRICT 1</text>
      <text x="800" y="220" fill={accent} fillOpacity="0.6" fontFamily={VB_TOKENS.mono} fontSize="11" letterSpacing="3">DISTRICT 3 · ACTIVE</text>
      <text x="1180" y="320" fill="rgba(220,225,229,0.35)" fontFamily={VB_TOKENS.mono} fontSize="11" letterSpacing="3">DISTRICT 5</text>

      {/* connection lines from incident to active sensors */}
      <g>
        {sensors.filter(s => s.active).map((s, i) => (
          <g key={i}>
            <line x1={incident.x} y1={incident.y} x2={s.x} y2={s.y}
                  stroke={accent} strokeWidth="1" strokeOpacity="0.5" strokeDasharray="3 4" />
            <circle r="3" fill="white" filter="url(#mGlow)">
              <animateMotion dur={`${1.6 + i * 0.3}s`} repeatCount="indefinite"
                path={`M${incident.x},${incident.y} L${s.x},${s.y}`} />
            </circle>
          </g>
        ))}
      </g>

      {/* incident pulse */}
      <g>
        {[0, 0.7, 1.4].map((d, i) => (
          <circle key={i} cx={incident.x} cy={incident.y} r="0" fill="none" stroke={VB_TOKENS.danger} strokeWidth="1.5">
            <animate attributeName="r" from="14" to="80" dur="2.4s" repeatCount="indefinite" begin={`${d}s`} />
            <animate attributeName="opacity" from="0.7" to="0" dur="2.4s" repeatCount="indefinite" begin={`${d}s`} />
          </circle>
        ))}
        <circle cx={incident.x} cy={incident.y} r="14" fill={VB_TOKENS.danger} fillOpacity="0.2" stroke={VB_TOKENS.danger} strokeWidth="1.5" />
        <circle cx={incident.x} cy={incident.y} r="5" fill={VB_TOKENS.danger} />
      </g>

      {/* sensor markers as foreignObjects so we can use PNG icons */}
      {sensors.map((s, i) => (
        <foreignObject key={i} x={s.x - 16} y={s.y - 16} width="32" height="32">
          <div xmlns="http://www.w3.org/1999/xhtml" style={{
            width: 32, height: 32, borderRadius: "50%", background: "#0a0f17",
            border: `1.5px solid ${s.active ? VB_TOKENS[s.type] : "rgba(255,255,255,0.18)"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: s.active ? `0 0 16px ${VB_TOKENS[s.type]}88` : "none",
          }}>
            <SensorIcon type={s.type} size={14} opacity={s.active ? 1 : 0.4} />
          </div>
        </foreignObject>
      ))}
    </svg>
  );
}

function PhaseStrip({ accent }) {
  const [active, setActive] = React.useState(0);
  const phases = [
    { id: 1, t: "17:43:02", label: "911 CALL",        c: accent },
    { id: 2, t: "17:43:05", label: "VOICE CAPTURE",   c: VB_TOKENS.voice },
    { id: 3, t: "17:43:08", label: "CAMERA MATCH",    c: VB_TOKENS.camera },
    { id: 4, t: "17:43:12", label: "KODI ALERT",      c: VB_TOKENS.danger },
    { id: 5, t: "17:43:15", label: "MULTI-DISTRICT",  c: VB_TOKENS.dispatch },
    { id: 6, t: "17:43:18", label: "DRONE DEPLOYED",  c: VB_TOKENS.drone },
    { id: 7, t: "17:43:22", label: "PICTURE LOCKED",  c: VB_TOKENS.radio },
  ];
  React.useEffect(() => {
    const id = setInterval(() => setActive(a => (a + 1) % phases.length), 1300);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{
      position: "absolute", bottom: 24, left: 56, right: 380, zIndex: 5,
      background: "rgba(8,14,22,0.78)", backdropFilter: "blur(20px)",
      border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: 16,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontFamily: VB_TOKENS.mono, fontSize: 10, color: "rgba(220,225,229,0.5)", letterSpacing: 2 }}>INCIDENT TIMELINE · 20 SECONDS</div>
        <div style={{ fontFamily: VB_TOKENS.mono, fontSize: 10, color: accent, letterSpacing: 2 }}>SCROLL ↓ TO REPLAY</div>
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "stretch" }}>
        {phases.map((p, i) => (
          <div key={p.id} style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              height: 3, borderRadius: 2,
              background: i <= active ? p.c : "rgba(220,225,229,0.1)",
              boxShadow: i === active ? `0 0 8px ${p.c}` : "none",
              transition: "all 0.3s",
            }} />
            <div style={{ marginTop: 8, opacity: i <= active ? 1 : 0.35, transition: "opacity 0.3s" }}>
              <div style={{ fontFamily: VB_TOKENS.mono, fontSize: 9, color: p.c, letterSpacing: 1.5 }}>{p.t}</div>
              <div style={{ fontFamily: VB_TOKENS.mono, fontSize: 10, color: VB_TOKENS.paper, letterSpacing: 1.2, marginTop: 2 }}>{p.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CorrelationFeed({ accent }) {
  const events = [
    { c: VB_TOKENS.voice,  t: "RADIO",   text: "\"Shots fired Canal and Norman\"" },
    { c: VB_TOKENS.camera, t: "VIDEO",   text: "Cam-6 → vehicle: gray sedan" },
    { c: VB_TOKENS.cad,    t: "CAD",     text: "Code 3 dispatched, 3 units" },
    { c: VB_TOKENS.danger, t: "ALERT",   text: "Officer distress · Unit 18" },
    { c: VB_TOKENS.drone,  t: "DRONE",   text: "Aerial unit en route, ETA 90s" },
  ];
  return (
    <div style={{
      position: "absolute", right: 24, top: 240, width: 320, zIndex: 5,
      background: "rgba(8,14,22,0.78)", backdropFilter: "blur(20px)",
      border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: 14, maxHeight: 380, overflow: "hidden",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontFamily: VB_TOKENS.mono, fontSize: 10, color: accent, letterSpacing: 2 }}>● CORRELATION FEED</div>
        <div style={{ fontFamily: VB_TOKENS.mono, fontSize: 10, color: "rgba(220,225,229,0.4)" }}>5 sources</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {events.map((e, i) => (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: "60px 1fr", gap: 10, alignItems: "center",
            padding: "8px 10px", background: "rgba(255,255,255,0.03)",
            border: `1px solid rgba(220,225,229,0.08)`, borderLeft: `2px solid ${e.c}`, borderRadius: 6,
          }}>
            <span style={{ fontFamily: VB_TOKENS.mono, fontSize: 9, color: e.c, letterSpacing: 1.5 }}>{e.t}</span>
            <span style={{ fontSize: 12, color: "rgba(220,225,229,0.85)", lineHeight: 1.3 }}>{e.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ConceptMap;
