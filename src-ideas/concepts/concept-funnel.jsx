import React from 'react';
import { VB_TOKENS, VBNav, LiveInMarketBadge, CustomerStrip, SensorIcon } from '../shared.jsx';

// Concept 1 — THE FUNNEL (DARK)
// Inspired by the Figma "VoiceBrain Funnel" frame.
// Capture → Correlate → Act, with live signals streaming through a literal funnel
// into a single intelligence statement. Mission-critical / serious tone.

function ConceptFunnel({ accent }) {
  const accentColor = VB_TOKENS[accent] || VB_TOKENS.voice;
  const sources = [
    { type: "radio",    label: "Radio · CH-1",   text: "Shots fired Canal & Norman", t: "17:43:02", color: VB_TOKENS.radio },
    { type: "voice",    label: "Voice · 911",    text: "Caller reports two males, black sedan", t: "17:43:04", color: VB_TOKENS.voice },
    { type: "camera",   label: "Camera · 14",    text: "Vehicle match, partial plate 7-King", t: "17:43:08", color: VB_TOKENS.camera },
    { type: "drone",    label: "Drone · A1",     text: "Aerial feed online", t: "17:43:18", color: VB_TOKENS.drone },
    { type: "cad",      label: "CAD · 211A",     text: "3 units assigned, Code 3", t: "17:43:11", color: VB_TOKENS.cad },
    { type: "walkietalkie", label: "Talkgroup · D3", text: "District 3 redirected", t: "17:43:14", color: VB_TOKENS.dispatch },
  ];

  return (
    <div style={{
      width: 1440, height: 900, background: VB_TOKENS.inkDeep,
      fontFamily: VB_TOKENS.body, color: VB_TOKENS.paper, position: "relative", overflow: "hidden",
    }}>
      <VBNav inverted={true} accent={accentColor} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, padding: "56px 56px 92px" }}>
        {/* LEFT, copy */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22, paddingTop: 16 }}>
          <LiveInMarketBadge inverted={true} />
          <h1 style={{
            fontFamily: VB_TOKENS.display, fontSize: 64, lineHeight: 0.95, letterSpacing: "-0.035em",
            margin: 0, fontWeight: 500, textWrap: "balance", color: VB_TOKENS.paper,
          }}>
            From frontline transmission to <span style={{ color: accentColor }}>actionable intelligence</span> in 20 seconds.
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.5, color: "rgba(220,225,229,0.7)", maxWidth: 520, margin: 0 }}>
            VoiceBrain captures every radio, 911 call, camera, drone, and CAD event. We correlate them into one operational picture, automatically. Live in 12 agencies today.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
            <button style={{
              padding: "14px 22px", borderRadius: 999, background: VB_TOKENS.paper, color: VB_TOKENS.ink,
              border: "none", fontWeight: 600, fontSize: 14, cursor: "pointer",
            }}>Book a 20-minute demo →</button>
            <button style={{
              padding: "14px 22px", borderRadius: 999, background: "transparent", color: VB_TOKENS.paper,
              border: `1px solid rgba(255,255,255,0.3)`, fontWeight: 600, fontSize: 14, cursor: "pointer",
            }}>Watch the incident replay</button>
          </div>
          <div style={{ display: "flex", gap: 32, marginTop: 4, paddingTop: 18, borderTop: "1px solid rgba(220,225,229,0.12)" }}>
            {[
              { v: "20s", l: "to operational picture" },
              { v: "6+", l: "radio channels, simultaneously" },
              { v: "0", l: "details lost in the noise" },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ fontFamily: VB_TOKENS.display, fontSize: 32, fontWeight: 500, letterSpacing: "-0.04em", color: VB_TOKENS.paper }}>{s.v}</div>
                <div style={{ fontSize: 12, color: "rgba(220,225,229,0.55)", marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT, animated funnel diagram */}
        <FunnelDiagram sources={sources} accent={accentColor} />
      </div>

      {/* BOTTOM, customer strip */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        padding: "20px 56px", borderTop: "1px solid rgba(220,225,229,0.1)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: VB_TOKENS.inkDeep,
      }}>
        <div style={{ fontFamily: VB_TOKENS.mono, fontSize: 11, letterSpacing: 2, color: "rgba(220,225,229,0.45)" }}>
          TRUSTED BY PUBLIC SAFETY AGENCIES NATIONWIDE
        </div>
        <CustomerStrip inverted={true} />
      </div>
    </div>
  );
}

function FunnelDiagram({ sources, accent }) {
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1400);
    return () => clearInterval(id);
  }, []);
  const activeIdx = tick % sources.length;

  return (
    <div style={{
      position: "relative", height: 620, background: VB_TOKENS.ink, borderRadius: 16, overflow: "hidden",
      border: `1px solid ${VB_TOKENS.line}`,
    }}>
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.18 }}>
        <defs>
          <pattern id="dotsP" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="rgba(220,225,229,0.45)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dotsP)" />
      </svg>

      <div style={{ position: "absolute", top: 18, left: 22, fontFamily: VB_TOKENS.mono, fontSize: 10, letterSpacing: 2, color: "rgba(220,225,229,0.5)" }}>
        VOICEBRAIN FUNNEL · LIVE
      </div>
      <div style={{ position: "absolute", top: 18, right: 22, display: "flex", alignItems: "center", gap: 6, fontFamily: VB_TOKENS.mono, fontSize: 10, letterSpacing: 2, color: VB_TOKENS.danger }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: VB_TOKENS.danger, animation: "vbPulse 1.4s infinite" }} />
        REC · 17:43:24
      </div>

      <div style={{ position: "absolute", top: 50, left: 0, right: 0, display: "flex", justifyContent: "space-between", padding: "0 32px", fontFamily: VB_TOKENS.mono, fontSize: 10, letterSpacing: 3, color: "rgba(220,225,229,0.5)" }}>
        <span>CAPTURE</span><span>CORRELATE</span><span>ACT</span>
      </div>

      <svg viewBox="0 0 600 540" width="100%" height="calc(100% - 90px)" style={{ position: "absolute", top: 80, left: 0 }}>
        <defs>
          <linearGradient id="funnelFill" x1="0" x2="1">
            <stop offset="0%" stopColor="rgba(80,127,229,0)" />
            <stop offset="100%" stopColor={accent} stopOpacity="0.18" />
          </linearGradient>
          <filter id="glowF"><feGaussianBlur stdDeviation="2" /></filter>
        </defs>
        <path d="M 40 80 L 230 240 L 230 360 L 40 460 Z M 560 80 L 370 240 L 370 360 L 560 460 Z"
              fill="url(#funnelFill)" stroke="rgba(220,225,229,0.25)" strokeWidth="1" />
        <line x1="230" y1="240" x2="370" y2="240" stroke="rgba(220,225,229,0.35)" strokeWidth="1" strokeDasharray="3 3" />
        <line x1="230" y1="360" x2="370" y2="360" stroke="rgba(220,225,229,0.35)" strokeWidth="1" strokeDasharray="3 3" />
        <rect x="230" y="240" width="140" height="120" fill="rgba(80,127,229,0.06)" stroke={accent} strokeOpacity="0.4" strokeWidth="1" />

        {sources.map((s, i) => {
          const y = 110 + i * 60;
          const isActive = i === activeIdx;
          const x2 = 230;
          const y2 = 240 + ((y - 110) / (5 * 60)) * 120;
          return (
            <g key={s.type} opacity={isActive ? 1 : 0.45}>
              <line x1={40} y1={y} x2={x2} y2={y2}
                    stroke={isActive ? s.color : "rgba(220,225,229,0.25)"}
                    strokeWidth={isActive ? 1.5 : 1}
                    strokeDasharray={isActive ? "0" : "2 4"} />
              {isActive && (
                <circle r="4" fill={s.color} filter="url(#glowF)">
                  <animateMotion dur="0.9s" repeatCount="1" path={`M${40},${y} L${x2},${y2}`} />
                </circle>
              )}
            </g>
          );
        })}

        <line x1={370} y1={300} x2={560} y2={300} stroke={accent} strokeWidth="2" />
        <circle r="5" fill={accent} filter="url(#glowF)">
          <animateMotion dur="2s" repeatCount="indefinite" path="M370,300 L560,300" />
        </circle>
      </svg>

      <div style={{ position: "absolute", left: 22, top: 110, display: "flex", flexDirection: "column", gap: 16, width: 220 }}>
        {sources.map((s, i) => (
          <div key={s.type} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "8px 12px", borderRadius: 8,
            background: i === activeIdx ? "rgba(255,255,255,0.06)" : "transparent",
            border: `1px solid ${i === activeIdx ? s.color + "55" : "rgba(220,225,229,0.1)"}`,
            transition: "all .3s",
          }}>
            <SensorIcon type={s.type} size={18} opacity={i === activeIdx ? 1 : 0.5} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: VB_TOKENS.mono, fontSize: 9, color: s.color, letterSpacing: 1, textTransform: "uppercase" }}>{s.label}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.text}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        position: "absolute", right: 22, top: 200, width: 250,
        background: VB_TOKENS.inkSoft, borderRadius: 12,
        border: `1px solid ${accent}66`, padding: 16,
        boxShadow: `0 0 40px ${accent}22`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <div style={{ width: 24, height: 24, borderRadius: "50%", border: `1.5px solid ${VB_TOKENS.paper}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="12" height="10" viewBox="0 0 51 40" fill={VB_TOKENS.paper}>
              <path d="M 22.13 20.83 L 22.12 20.83 L 31.27 40 L 19.44 40 L 0 0 L 12.15 0 L 22.13 20.83 Z M 33.4 36.39 L 27.66 24.35 L 39.39 0 L 51.14 0 L 33.4 36.39 Z" />
            </svg>
          </div>
          <span style={{ fontFamily: VB_TOKENS.mono, fontSize: 10, letterSpacing: 2, color: accent }}>KODI · INTELLIGENCE</span>
        </div>
        <div style={{ fontFamily: VB_TOKENS.display, fontSize: 16, lineHeight: 1.25, color: VB_TOKENS.paper, fontWeight: 500, marginBottom: 8 }}>
          Active assault. Canal & Norman.
        </div>
        <div style={{ fontSize: 12, lineHeight: 1.45, color: "rgba(220,225,229,0.7)" }}>
          Two males in a black sedan, partial plate 7-King. Suspect armed. <span style={{ color: VB_TOKENS.danger, fontWeight: 600 }}>Officer in distress.</span> District 3 responding, drone airborne.
        </div>
        <div style={{ marginTop: 12, padding: "8px 0 0", borderTop: "1px solid rgba(220,225,229,0.12)",
            display: "flex", justifyContent: "space-between", fontFamily: VB_TOKENS.mono, fontSize: 9, color: "rgba(220,225,229,0.55)" }}>
          <span>SYNTHESIZED · 17:43:22</span>
          <span style={{ color: accent }}>20s elapsed</span>
        </div>
      </div>
    </div>
  );
}

export default ConceptFunnel;
