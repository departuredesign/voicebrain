import React from 'react';
import { VB_TOKENS, VBNav, LiveInMarketBadge, CustomerStrip, SensorIcon } from '../shared.jsx';

// Concept 4 — CINEMATIC (DARK)
// Full-bleed dispatcher photograph as the hero. Heroic, mission-critical tone.
// Inspired by enterprise B2B sites that lead with the human/operator behind the product.

function ConceptCinematic({ accent }) {
  const accentColor = VB_TOKENS[accent] || VB_TOKENS.voice;

  return (
    <div style={{
      width: 1440, height: 900, background: VB_TOKENS.inkDeep,
      color: VB_TOKENS.paper, fontFamily: VB_TOKENS.body,
      position: "relative", overflow: "hidden",
    }}>
      {/* Full-bleed hero image */}
      <img src="/ideas/assets/911dispatch.webp" alt=""
        style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          objectFit: "cover", objectPosition: "center 35%",
          filter: "saturate(0.85) contrast(1.05)",
        }} />

      {/* Cinematic gradient, dark left for copy, dark bottom for chrome */}
      <div style={{
        position: "absolute", inset: 0,
        background: `
          linear-gradient(90deg, ${VB_TOKENS.inkDeep}f5 0%, ${VB_TOKENS.inkDeep}b8 32%, ${VB_TOKENS.inkDeep}40 55%, ${VB_TOKENS.inkDeep}10 75%, ${VB_TOKENS.inkDeep}80 100%),
          linear-gradient(180deg, ${VB_TOKENS.inkDeep}90 0%, transparent 18%, transparent 60%, ${VB_TOKENS.inkDeep}f0 100%)
        `,
      }} />

      {/* Subtle accent vignette */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `radial-gradient(800px 500px at 75% 30%, ${accentColor}1c, transparent 70%)`,
        mixBlendMode: "screen",
      }} />

      {/* Top nav (transparent over photo) */}
      <div style={{ position: "relative", zIndex: 5 }}>
        <VBNav inverted={true} accent={accentColor} />
      </div>

      {/* Headline column */}
      <div style={{
        position: "absolute", left: 56, top: 148, right: 440, maxWidth: 620, zIndex: 5,
        display: "flex", flexDirection: "column", gap: 22,
      }}>
        <LiveInMarketBadge inverted={true} />
        <h1 style={{
          fontFamily: VB_TOKENS.display, fontSize: 84, lineHeight: 0.9,
          letterSpacing: "-0.045em", margin: 0, fontWeight: 500,
          textWrap: "balance", color: VB_TOKENS.paper,
        }}>
          Every second <span style={{ color: accentColor }}>counts.</span><br/>
          Every signal, captured.
        </h1>
        <p style={{
          fontSize: 18, lineHeight: 1.45, color: "rgba(220,225,229,0.78)",
          maxWidth: 520, margin: 0,
        }}>
          VoiceBrain unifies radio, 911, video, drone and CAD into one operational picture. Dispatchers and incident commanders see the whole event in 20 seconds, not 20 minutes.
        </p>
        <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
          <button style={{
            padding: "14px 24px", borderRadius: 999, background: VB_TOKENS.paper, color: VB_TOKENS.ink,
            border: "none", fontWeight: 600, fontSize: 14, cursor: "pointer",
          }}>Book a 20-minute demo →</button>
          <button style={{
            padding: "14px 24px", borderRadius: 999, background: "rgba(255,255,255,0.08)",
            color: VB_TOKENS.paper, border: "1px solid rgba(255,255,255,0.25)",
            fontWeight: 600, fontSize: 14, cursor: "pointer", backdropFilter: "blur(12px)",
          }}>See it on the floor</button>
        </div>
      </div>

      {/* Right-side glass card, operator quote */}
      <div style={{
        position: "absolute", right: 56, top: 200, width: 340, zIndex: 5,
        background: "rgba(8,14,22,0.55)", backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.14)", borderRadius: 16, padding: 22,
      }}>
        <div style={{
          fontFamily: VB_TOKENS.mono, fontSize: 10, letterSpacing: 2.5,
          color: accentColor, marginBottom: 14,
        }}>FROM THE FLOOR</div>
        <div style={{
          fontFamily: VB_TOKENS.display, fontSize: 22, lineHeight: 1.25,
          fontWeight: 500, color: VB_TOKENS.paper, marginBottom: 16,
          letterSpacing: "-0.01em",
        }}>
          "We used to lose details in the cross-talk. Now Kodi tells me what mattered before I finish the call."
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            background: `linear-gradient(135deg, ${accentColor}, ${VB_TOKENS.dispatch})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: VB_TOKENS.display, fontWeight: 600, fontSize: 14,
          }}>JR</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>J. Ramirez</div>
            <div style={{ fontSize: 11, color: "rgba(220,225,229,0.6)" }}>Senior Dispatcher · Metro PD</div>
          </div>
        </div>
      </div>

      {/* Bottom telemetry strip, proves "real, live product" */}
      <div style={{
        position: "absolute", left: 56, right: 56, bottom: 40, zIndex: 5,
        paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.14)",
        display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", gap: 32,
      }}>
        {/* Live counter cluster */}
        <div style={{ display: "flex", gap: 32 }}>
          {[
            { v: "20s", l: "Avg time-to-picture" },
            { v: "12",  l: "Agencies live today" },
            { v: "3.4M",l: "Radio hrs ingested" },
            { v: "6+",  l: "Channels per agency" },
          ].map((s, i) => (
            <div key={i} style={{ borderLeft: i === 0 ? "none" : "1px solid rgba(255,255,255,0.18)", paddingLeft: i === 0 ? 0 : 32 }}>
              <div style={{
                fontFamily: VB_TOKENS.display, fontSize: 38, fontWeight: 500,
                letterSpacing: "-0.04em", color: VB_TOKENS.paper, lineHeight: 1,
              }}>{s.v}</div>
              <div style={{ fontSize: 11, color: "rgba(220,225,229,0.65)", marginTop: 6, letterSpacing: 0.3 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Live event ticker (right-aligned) */}
        <CinematicTicker accent={accentColor} />

        <div style={{
          fontFamily: VB_TOKENS.mono, fontSize: 10, color: "rgba(220,225,229,0.55)",
          letterSpacing: 2, textAlign: "right", lineHeight: 1.5,
        }}>
          TRUSTED BY PUBLIC<br/>SAFETY AGENCIES<br/>NATIONWIDE
        </div>
      </div>
    </div>
  );
}

function CinematicTicker({ accent }) {
  const events = [
    { c: VB_TOKENS.dispatch, label: "CH-1", text: "Code 3 dispatch · Canal & Norman" },
    { c: VB_TOKENS.camera,   label: "CAM 14", text: "Vehicle match · plate 7-K…" },
    { c: VB_TOKENS.voice,    label: "911",   text: "Caller: two males, sedan" },
    { c: VB_TOKENS.drone,    label: "DRONE A1", text: "Aerial feed online" },
    { c: VB_TOKENS.radio,    label: "CH-3",  text: "Unit 42 responding · ETA 2m" },
  ];
  const [i, setI] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setI(p => (p + 1) % events.length), 2200);
    return () => clearInterval(id);
  }, []);
  const e = events[i];
  return (
    <div style={{ justifySelf: "end", maxWidth: 460 }}>
      <div style={{
        fontFamily: VB_TOKENS.mono, fontSize: 10, letterSpacing: 2.5,
        color: accent, marginBottom: 8, display: "flex", alignItems: "center", gap: 8,
      }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: accent, animation: "vbPulse 1.4s infinite" }} />
        LIVE · INGESTING NOW
      </div>
      <div key={i} style={{
        display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
        background: "rgba(8,14,22,0.6)", backdropFilter: "blur(14px)",
        border: "1px solid rgba(255,255,255,0.1)", borderRadius: 999,
        animation: "vbSlideIn 0.4s ease",
      }}>
        <span style={{
          fontFamily: VB_TOKENS.mono, fontSize: 9, padding: "3px 8px",
          background: `${e.c}22`, color: e.c, borderRadius: 999, letterSpacing: 1.2,
        }}>{e.label}</span>
        <span style={{ fontSize: 13, color: "rgba(220,225,229,0.85)", whiteSpace: "nowrap" }}>{e.text}</span>
      </div>
    </div>
  );
}

export default ConceptCinematic;
