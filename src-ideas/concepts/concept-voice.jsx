import React from 'react';
import { VB_TOKENS, VBNav, LiveInMarketBadge, CustomerStrip, SensorIcon } from '../shared.jsx';

// Concept 2 — VOICE-FIRST (DARK, NO ITALIC)
function ConceptVoiceFirst({ accent }) {
  const accentColor = VB_TOKENS[accent] || VB_TOKENS.voice;
  const transcript = [
    { t: "17:43:02", ch: "CH-1", who: "Dispatch",  text: "All units, shots fired Canal and Norman. Code 3.", color: VB_TOKENS.dispatch, tags: ["incident:assault", "loc:Canal & Norman"] },
    { t: "17:43:05", ch: "CH-3", who: "Unit 42",   text: "10-4, responding from Guerrero. ETA two minutes.", color: VB_TOKENS.radio, tags: ["unit:42", "eta:2m"] },
    { t: "17:43:07", ch: "CH-1", who: "Unit 18",   text: "On scene. Single male, dark hoodie, headed south on Canal.", color: VB_TOKENS.camera, tags: ["suspect:male", "dir:south"] },
    { t: "17:43:09", ch: "CH-2", who: "Dispatch",  text: "Camera 6 confirms. Gray sedan, partial plate 7-King.", color: VB_TOKENS.camera, tags: ["vehicle:sedan", "plate:7K..."] },
    { t: "17:43:12", ch: "CH-1", who: "Unit 18",   text: "Suspect is armed! Requesting backup immediately.", color: VB_TOKENS.danger, tags: ["alert:armed"] },
  ];

  return (
    <div style={{ width: 1440, height: 900, background: VB_TOKENS.inkDeep, color: VB_TOKENS.paper, fontFamily: VB_TOKENS.body, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none",
        background: `radial-gradient(900px 500px at 70% 35%, ${accentColor}28, transparent 60%), radial-gradient(700px 400px at 15% 80%, ${VB_TOKENS.camera}1c, transparent 60%)` }} />
      <VBNav inverted={true} accent={accentColor} />
      <div style={{ display: "grid", gridTemplateColumns: "560px 1fr", gap: 56, padding: "56px 56px 0", position: "relative" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingTop: 40 }}>
          <LiveInMarketBadge inverted={true} />
          <div style={{ fontFamily: VB_TOKENS.mono, fontSize: 11, letterSpacing: 3, color: accentColor, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 24, height: 1, background: accentColor }} />
            VOICE INTELLIGENCE FOR OPERATIONS
          </div>
          <h1 style={{ fontFamily: VB_TOKENS.display, fontSize: 84, lineHeight: 0.92, letterSpacing: "-0.04em", margin: 0, fontWeight: 500, textWrap: "balance" }}>
            We hear<br/>
            <span style={{ color: accentColor }}>everything</span><br/>
            on the radio.
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.5, color: "rgba(220,225,229,0.7)", maxWidth: 460, margin: 0 }}>
            Six channels of frontline traffic, transcribed, structured, and correlated with video, CAD, and 911 in real time. So nothing critical gets buried in the noise.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button style={{ padding: "14px 22px", borderRadius: 999, background: accentColor, color: VB_TOKENS.paper, border: "none", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Hear it work →</button>
            <button style={{ padding: "14px 22px", borderRadius: 999, background: "transparent", color: VB_TOKENS.paper, border: `1px solid rgba(255,255,255,0.3)`, fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Book a demo</button>
          </div>
        </div>
        <WaveformHero accent={accentColor} transcript={transcript} />
      </div>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px 56px", borderTop: `1px solid ${VB_TOKENS.lineSoft}`, background: "rgba(8,14,22,0.9)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontFamily: VB_TOKENS.mono, fontSize: 11, letterSpacing: 2, color: "rgba(220,225,229,0.45)" }}>IN PRODUCTION · 12 AGENCIES · 3M+ HOURS INGESTED</div>
        <CustomerStrip inverted={true} />
      </div>
    </div>
  );
}

function WaveformHero({ accent, transcript }) {
  const [t, setT] = React.useState(0);
  React.useEffect(() => {
    let raf, last = performance.now();
    const loop = (now) => { setT(p => p + (now - last) / 1000); last = now; raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  const channels = [
    { name: "CH-1", color: VB_TOKENS.dispatch, freq: 1.2, density: 0.7 },
    { name: "CH-2", color: VB_TOKENS.camera,   freq: 1.8, density: 0.5 },
    { name: "CH-3", color: VB_TOKENS.radio,    freq: 0.9, density: 0.85 },
    { name: "CH-4", color: VB_TOKENS.danger,   freq: 2.4, density: 0.4 },
    { name: "CH-5", color: VB_TOKENS.drone,    freq: 1.5, density: 0.55 },
    { name: "CH-6", color: VB_TOKENS.cad,      freq: 1.1, density: 0.6 },
  ];
  const visibleTranscript = transcript.slice(0, Math.min(transcript.length, Math.floor(t / 1.6) + 1));
  return (
    <div style={{ position: "relative", height: 720, paddingTop: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: VB_TOKENS.mono, fontSize: 9, color: "rgba(220,225,229,0.4)", letterSpacing: 1.5, marginBottom: 12 }}>
        {["17:43:00","17:43:05","17:43:10","17:43:15","17:43:20","17:43:25"].map(x => <span key={x}>{x}</span>)}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "8px 0", borderTop: "1px solid rgba(220,225,229,0.08)", borderBottom: "1px solid rgba(220,225,229,0.08)" }}>
        {channels.map((c, ci) => (
          <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 14, height: 38 }}>
            <div style={{ width: 56, fontFamily: VB_TOKENS.mono, fontSize: 10, color: c.color, letterSpacing: 1 }}>{c.name}</div>
            <div style={{ flex: 1, height: "100%", display: "flex", alignItems: "center", gap: 2, position: "relative" }}>
              {Array.from({ length: 80 }).map((_, i) => {
                const phase = (t * c.freq + i * 0.18 + ci);
                const seed = Math.sin(phase) * 0.5 + 0.5;
                const burst = (Math.sin(t * 0.4 + ci * 1.3) > 0.3 - c.density) ? seed : seed * 0.15;
                const h = 4 + burst * 30;
                return <div key={i} style={{ flex: 1, height: h, background: c.color, opacity: 0.15 + burst * 0.85, borderRadius: 1 }} />;
              })}
              <div style={{ position: "absolute", left: `${((t * 8) % 100)}%`, top: 0, bottom: 0, width: 1, background: accent, boxShadow: `0 0 8px ${accent}` }} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10, maxHeight: 380, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <div style={{ fontFamily: VB_TOKENS.mono, fontSize: 10, color: accent, letterSpacing: 2.5 }}>LIVE TRANSCRIPT · STRUCTURED</div>
          <div style={{ fontFamily: VB_TOKENS.mono, fontSize: 10, color: "rgba(220,225,229,0.4)", letterSpacing: 1.5 }}>{visibleTranscript.length} of {transcript.length} EVENTS</div>
        </div>
        {visibleTranscript.map((row, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "70px 50px 1fr auto", gap: 14, alignItems: "baseline", padding: "10px 14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(220,225,229,0.08)", borderRadius: 8, borderLeft: `2px solid ${row.color}` }}>
            <span style={{ fontFamily: VB_TOKENS.mono, fontSize: 11, color: "rgba(220,225,229,0.45)" }}>{row.t}</span>
            <span style={{ fontFamily: VB_TOKENS.mono, fontSize: 9, color: row.color, letterSpacing: 1, padding: "2px 6px", border: `1px solid ${row.color}55`, borderRadius: 4, justifySelf: "start" }}>{row.ch}</span>
            <div>
              <div style={{ fontSize: 13, color: VB_TOKENS.paper, lineHeight: 1.35 }}>
                <span style={{ fontWeight: 600, color: row.color, marginRight: 8 }}>{row.who}:</span>"{row.text}"
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                {row.tags.map(tag => <span key={tag} style={{ fontFamily: VB_TOKENS.mono, fontSize: 9, padding: "1px 6px", background: "rgba(255,255,255,0.05)", color: "rgba(220,225,229,0.65)", borderRadius: 3, letterSpacing: 0.5 }}>{tag}</span>)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ConceptVoiceFirst;
