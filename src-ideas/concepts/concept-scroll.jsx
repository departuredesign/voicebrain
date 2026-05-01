import React from 'react';
import { VB_TOKENS, VBNav, LiveInMarketBadge, CustomerStrip, SensorIcon } from '../shared.jsx';

// Concept 5 - SCROLL THEATER (Apple-style, DARK)
// A cinematic scroll-driven product reveal. Not a background video.
// Stages, in order, while the user scrolls:
//   00 INTRO     full-bleed video, centered headline, KEEP-SCROLLING hint
//   01 LIFTOFF   iPad scales/rotates in 3D, frame appears, video tightens
//   02 PARK      iPad parks slightly off-center; chapter copy fades in
//   03 CH 1..N   for each chapter: copy crossfades on the left,
//                video crossfades from one paused beat to the next,
//                accent callouts anchor onto the iPad screen
//   04 PULLOUT   final pose: iPad pulls back to full bleed for the closing line
// All driven by a single 0..1 progress var derived from scroll position.

function ConceptScroll({ accent }) {
  const accentColor = VB_TOKENS[accent] || VB_TOKENS.voice;

  // Each chapter pins to a beat (sec) of the source video. Callouts are
  // small annotations that anchor onto specific iPad-screen coordinates
  // (pct of inner display). They appear/disappear on a chapter window.
  // Use case: SFO Airport Integrated Operations Center. A gate delay is
  // cascading. The cause is buried in radio chatter. VoiceBrain correlates
  // voice + sensors + flight data so the AIOC sees what's actually happening.
  const chapters = [
    {
      k: "01", t: 0.4,
      eyebrow: "THE PROBLEM",
      h: "A gate delay is cascading.",
      p: "Forty minutes in, six gates are red. The ops center has charts, but no one knows why. The cause is buried in radio chatter no dashboard reads.",
      callouts: [
        { x: 22, y: 32, label: "Gate A12 — 38 min", c: VB_TOKENS.danger },
        { x: 76, y: 28, label: "Cascade: 6 gates", c: VB_TOKENS.danger },
      ],
    },
    {
      k: "02", t: 6.0,
      eyebrow: "TRANSCRIBE",
      h: "Every radio channel, in real time.",
      p: "Ground, ramp, tower, ops, dispatch, push-back. Six channels, diarized and tagged. Nothing dropped. Nothing waiting on a transcriptionist.",
      callouts: [
        { x: 18, y: 58, label: "RAMP-2 active", c: VB_TOKENS.voice },
        { x: 80, y: 62, label: "TOWER active", c: VB_TOKENS.voice },
      ],
    },
    {
      k: "03", t: 12.5,
      eyebrow: "CORRELATE",
      h: "Voice + video + sensors + flight data.",
      p: "Apron cameras, ADS-B, pushback sensors, gate-status feeds. Kodi links them to the same event the moment they're mentioned on the air.",
      callouts: [
        { x: 70, y: 24, label: "Cam-Apron-7", c: VB_TOKENS.camera },
        { x: 24, y: 72, label: "ADS-B linked", c: VB_TOKENS.drone },
      ],
    },
    {
      k: "04", t: 18.5,
      eyebrow: "ROOT CAUSE",
      h: "The AIOC stops reconstructing. It watches it unfold.",
      p: "One tug down on Stand 14, mentioned once at 06:42. Every dependent flight surfaced automatically. The whole cascade explained in a single timeline.",
      callouts: [
        { x: 50, y: 46, label: "Root: Tug-14 down", c: accentColor },
      ],
    },
    {
      k: "05", t: 24.0,
      eyebrow: "HANDOFF",
      h: "Predict, hand off, brief the next shift.",
      p: "The same picture follows the operation: shift handoffs, exec brief, after-action. Every signal preserved, every decision attributable.",
      callouts: [
        { x: 50, y: 86, label: "Shift handoff ready", c: VB_TOKENS.dispatch },
      ],
    },
  ];

  return <ScrollTheater chapters={chapters} accent={accentColor} />;
}

// Stage allocations along scroll-progress (0..1).
//   chat     [0.00, 0.16)   full-bleed backdrop, Kodi chat auto-types
//   liftoff  [0.16, 0.24)   chat dissolves, iPad bezel materializes around video
//   chapter  [0.24, 0.86)   divided across the chapters
//   pullout  [0.86, 1.00]
const STAGE = {
  introEnd: 0.16,
  liftoffEnd: 0.24,
  chaptersEnd: 0.86,
};

function ScrollTheater({ chapters, accent }) {
  const rootRef = React.useRef(null);
  const videoRef = React.useRef(null);
  const [p, setP] = React.useState(0);

  // Section height (within the artboard). Total scroll budget = chat + liftoff + chapters + pullout.
  const ARTBOARD_H = 900;
  const sectionH = Math.round(
    ARTBOARD_H * (1.8 /*chat*/ + 0.9 /*liftoff*/ + chapters.length * 1.1 /*chapters*/ + 1.0 /*pullout*/)
  );

  React.useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const total = el.scrollHeight - el.clientHeight;
        const pp = total > 0 ? Math.max(0, Math.min(1, el.scrollTop / total)) : 0;
        setP(pp);
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Per-stage progress
  const introT = clamp01(p / STAGE.introEnd);
  const liftoffT = clamp01((p - STAGE.introEnd) / (STAGE.liftoffEnd - STAGE.introEnd));
  const chapterSpan = (STAGE.chaptersEnd - STAGE.liftoffEnd);
  const chaptersTRaw = clamp01((p - STAGE.liftoffEnd) / chapterSpan);
  const chapterFloat = chaptersTRaw * chapters.length; // 0..N
  const activeIdx = Math.min(chapters.length - 1, Math.floor(chapterFloat));
  const localChapterT = chapterFloat - Math.floor(chapterFloat); // 0..1 inside this chapter
  const pulloutT = clamp01((p - STAGE.chaptersEnd) / (1 - STAGE.chaptersEnd));

  // Drive the video to the active chapter's pinned beat, with a small offset
  // for in-chapter scroll (so the frame isn't perfectly frozen).
  React.useEffect(() => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    let target;
    if (p < STAGE.liftoffEnd) {
      // intro/liftoff: linear scrub through first 4s of video for visual life
      target = lerp(0, Math.min(4, v.duration - 0.1), p / STAGE.liftoffEnd);
    } else if (p < STAGE.chaptersEnd) {
      const here = chapters[activeIdx];
      const next = chapters[Math.min(chapters.length - 1, activeIdx + 1)];
      const segEnd = next === here ? Math.min(v.duration - 0.1, here.t + 1.6) : next.t;
      target = lerp(here.t, segEnd, easeInOut(localChapterT));
    } else {
      // pullout: park on last frame, slight forward drift
      target = Math.min(v.duration - 0.1, chapters[chapters.length - 1].t + pulloutT * 1.5);
    }
    if (Math.abs(v.currentTime - target) > 0.05) {
      try { v.pause(); v.currentTime = target; } catch {}
    }
  }, [p, activeIdx, localChapterT, pulloutT, chapters]);

  // Compute iPad transform per stage. Center anchor: 50%/50% of viewport.
  // Stage 0 (intro): video full-bleed (NO iPad frame, just clipped video).
  // Stage 1 (liftoff): frame appears, scale 1.05 -> 0.92, slight 3D rotateY
  //                   from -8deg -> 0deg, video uncrops slightly.
  // Stage 2..3 (chapters): iPad parks at scale 0.74, x +6%; gentle parallax.
  // Stage 4 (pullout): iPad scales to 1.05 again, fades chrome, ends full-bleed.
  const stageStyles = computeStageTransforms({ p, introT, liftoffT, chapterFloat, pulloutT });

  return (
    <div ref={rootRef} style={{
      position: "relative", width: 1440, height: 900,
      overflowY: "auto", overflowX: "hidden",
      background: VB_TOKENS.inkDeep, color: VB_TOKENS.paper,
      fontFamily: VB_TOKENS.body,
    }}>
      {/* Tall inner content provides scroll budget */}
      <div style={{ position: "relative", width: 1440, height: sectionH }}>
        {/* Sticky stage */}
        <div style={{
          position: "sticky", top: 0, width: 1440, height: 900, overflow: "hidden",
          perspective: 1800,
        }}>
        {/* nav */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, zIndex: 60,
          background: p > 0.08 ? "rgba(8,14,22,0.85)" : "transparent",
          backdropFilter: p > 0.08 ? "blur(12px)" : "none",
          transition: "background .25s",
        }}>
          <VBNav inverted={true} accent={accent} />
        </div>

        {/* The hero element: rounded video / iPad. We use one frame whose
            border-radius, padding, scale, rotation animate across stages. */}
        <div style={{
          position: "absolute",
          left: stageStyles.left, top: stageStyles.top,
          width: stageStyles.w, height: stageStyles.h,
          transform: `translate3d(0,0,0) scale(${stageStyles.scale}) rotateY(${stageStyles.rotY}deg) rotateX(${stageStyles.rotX}deg)`,
          transformOrigin: "center center",
          transition: "none",
          willChange: "transform, width, height, left, top, border-radius",
          borderRadius: stageStyles.radius,
          overflow: "hidden",
          boxShadow: stageStyles.shadow,
          background: "#000",
          opacity: stageStyles.frameOpacity,
        }}>
          {/* Outer bezel that fades in during liftoff */}
          <div style={{
            position: "absolute", inset: 0, padding: stageStyles.bezelPad,
            background: "linear-gradient(160deg, #2a2f38 0%, #15181d 50%, #0c0e12 100%)",
            opacity: stageStyles.bezelOpacity,
            pointerEvents: "none",
          }} />

          {/* Inner screen area */}
          <div style={{
            position: "absolute",
            inset: stageStyles.bezelPad + "px",
            borderRadius: Math.max(0, stageStyles.radius - stageStyles.bezelPad),
            background: "#000", overflow: "hidden",
          }}>
            <video
              ref={videoRef}
              src="/ideas/assets/kodi-walkthrough.mp4"
              muted playsInline preload="auto"
              style={{
                width: "100%", height: "100%", objectFit: "cover", display: "block",
                transform: `scale(${stageStyles.videoScale})`,
                transformOrigin: "center center",
                transition: "transform .12s linear",
                background: "#000",
              }}
            />

            {/* Cinematic vignette - heavier in intro for legibility, softer in chapter */}
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              background: `radial-gradient(120% 100% at 50% 50%, transparent 35%, rgba(0,0,0,${stageStyles.vignette}) 100%)`,
            }} />

            {/* Accent color flash on chapter change */}
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              background: accent,
              mixBlendMode: "color",
              opacity: p < STAGE.liftoffEnd ? 0 : 0.06 + (1 - localChapterT) * 0.10,
              transition: "opacity .15s linear",
            }} />

            {/* Callouts that anchor on the screen for the active chapter */}
            <Callouts chapters={chapters} active={p >= STAGE.liftoffEnd && p < STAGE.chaptersEnd ? activeIdx : -1}
                      progress={localChapterT} accent={accent} />
          </div>
        </div>

        {/* CHAT INTRO scene - full-bleed dark backdrop with auto-typing Kodi conversation */}
        <KodiIntro
          accent={accent}
          progress={p}
          opacity={1 - clamp01((p - (STAGE.introEnd - 0.04)) / 0.06)}
        />

        {/* CHAPTER copy column on the LEFT - visible while chapters stage active */}
        <ChapterColumn
          chapters={chapters}
          activeIdx={activeIdx}
          localT={localChapterT}
          accent={accent}
          opacity={clamp01((p - STAGE.liftoffEnd + 0.02) / 0.06) - clamp01((p - STAGE.chaptersEnd + 0.05) / 0.05)}
        />

        {/* PULLOUT copy: end card */}
        <PulloutCopy accent={accent} opacity={clamp01((p - STAGE.chaptersEnd) / 0.06)} />

        {/* Persistent: stage label + scroll progress in lower right */}
        <StageHUD accent={accent} p={p} chapters={chapters} activeIdx={activeIdx} />
        </div>
      </div>
    </div>
  );
}

function computeStageTransforms({ p, introT, liftoffT, chapterFloat, pulloutT }) {
  // Frame default: full-bleed (covers the whole 1440x900 stage).
  const fullW = 1440, fullH = 900;
  const dockW = 760,  dockH = 478; // chapter parking size
  const introW = 1100, introH = 690; // post-handoff hero rectangle (slight inset)

  // Stage 0 (chat): iPad hidden (rendered tiny + opacity 0)
  // Stage 1 (liftoff): iPad scales/fades in, bezel materializes, parks on right
  // Stage 2 (chapters): docked on right
  // Stage 3 (pullout): expand to fill again
  let w, h, left, top, scale, rotY, rotX, radius, bezelPad, bezelOpacity, shadow, videoScale, vignette, frameOpacity;

  if (p < STAGE.introEnd) {
    // chat scene: iPad off-stage / invisible
    w = introW; h = introH;
    left = (fullW - introW) / 2;
    top  = (fullH - introH) / 2 + 30;
    scale = 0.7;
    rotY = 8; rotX = 0;
    radius = 28;
    bezelPad = 0;
    bezelOpacity = 0;
    shadow = "none";
    videoScale = 1.0;
    vignette = 0.3;
    frameOpacity = 0;
  } else if (p < STAGE.liftoffEnd) {
    // liftoff: chat dissolves; iPad rises into intro rect, then continues toward dock
    const t = liftoffT;
    const k = easeInOut(t);
    // First half: tiny -> intro rect (full-bleed cinematic frame)
    // Second half: intro rect -> docked
    if (t < 0.55) {
      const k1 = easeOut(t / 0.55);
      w = introW; h = introH;
      left = (fullW - introW) / 2;
      top  = (fullH - introH) / 2 + 30;
      scale = lerp(0.7, 1.0, k1);
      rotY = lerp(8, 0, k1);
      rotX = 0;
      radius = lerp(28, 24, k1);
      bezelPad = 0;
      bezelOpacity = 0;
      shadow = `0 60px 140px rgba(0,0,0,${0.6 * k1})`;
      videoScale = lerp(1.08, 1.02, k1);
      vignette = lerp(0.55, 0.40, k1);
      frameOpacity = k1;
    } else {
      const k2 = easeInOut((t - 0.55) / 0.45);
      w = lerp(introW, dockW, k2);
      h = lerp(introH, dockH, k2);
      left = lerp((fullW - introW) / 2, fullW - dockW - 56, k2);
      top  = lerp((fullH - introH) / 2 + 30, (fullH - dockH) / 2 + 30, k2);
      scale = 1.0;
      rotY = lerp(0, -6, k2);
      rotX = lerp(0, 2, k2);
      radius = lerp(24, 34, k2);
      bezelPad = lerp(0, 14, k2);
      bezelOpacity = lerp(0, 1, k2);
      shadow = "0 60px 140px rgba(0,0,0,0.6)";
      videoScale = lerp(1.02, 1.0, k2);
      vignette = lerp(0.40, 0.20, k2);
      frameOpacity = 1;
    }
  } else if (p < STAGE.chaptersEnd) {
    // chapters: docked, with subtle parallax over chapterFloat
    const drift = (chapterFloat % 1) * 2 - 1; // -1..1 within chapter
    w = dockW; h = dockH;
    left = fullW - dockW - 56;
    top  = (fullH - dockH) / 2 + 30 + drift * 14;
    scale = 1 + Math.sin(chapterFloat * Math.PI) * 0.012;
    rotY = -6 + drift * 1.5;
    rotX = 2 - drift * 0.6;
    radius = 34;
    bezelPad = 14;
    bezelOpacity = 1;
    shadow = "0 60px 140px rgba(0,0,0,0.55)";
    videoScale = 1.0;
    vignette = 0.20;
    frameOpacity = 1;
  } else {
    // pullout: dock -> back to full bleed (slight zoom-in style)
    const t = pulloutT;
    const k = easeInOut(t);
    w = lerp(dockW, fullW + 80, k);
    h = lerp(dockH, fullH + 80, k);
    left = lerp(fullW - dockW - 56, -40, k);
    top  = lerp((fullH - dockH) / 2 + 30, -40, k);
    scale = 1.0;
    rotY = lerp(-6, 0, k);
    rotX = lerp(2, 0, k);
    radius = lerp(34, 0, k);
    bezelPad = lerp(14, 0, k);
    bezelOpacity = lerp(1, 0, k);
    shadow = "0 60px 140px rgba(0,0,0,0.55)";
    videoScale = lerp(1.0, 1.06, k);
    vignette = lerp(0.20, 0.55, k);
    frameOpacity = 1;
  }
  return { w, h, left, top, scale, rotY, rotX, radius, bezelPad, bezelOpacity, shadow, videoScale, vignette, frameOpacity };
}

// Auto-typing chat intro. Once the section is scrolled into view, a scripted
// dialogue between an ops director and Kodi types itself out at a steady cadence.
// Scroll just controls the scene's opacity (and hands off to the iPad at the end).
const KODI_SCRIPT = [
  { who: "user",  text: "Kodi, gates A11 through A16 are red. What's actually going on?",     delay: 600  },
  { who: "kodi",  text: "Pulling every channel. Tug-14 went down at 06:42. The cascade traces back to one ramp call.", delay: 700  },
  { who: "user",  text: "Show me the picture.",                                                delay: 1200 },
  { who: "kodi",  text: "Voice, apron cameras, ADS-B, gate status — all on one timeline.",     delay: 700  },
];

function KodiIntro({ accent, progress, opacity }) {
  if (opacity <= 0.01) return null;
  const [step, setStep] = React.useState(0);   // index into KODI_SCRIPT, current message being typed
  const [typed, setTyped] = React.useState(""); // characters revealed so far in current message
  const startedRef = React.useRef(false);

  // Start typing once the section is reasonably in view. We start as soon as
  // the component is alive (i.e. opacity > 0). We DON'T tie typing to scroll.
  React.useEffect(() => {
    if (startedRef.current) return;
    if (opacity < 0.4) return;
    startedRef.current = true;
  }, [opacity]);

  React.useEffect(() => {
    if (!startedRef.current) return;
    if (step >= KODI_SCRIPT.length) return;
    const msg = KODI_SCRIPT[step];
    if (typed.length === 0) {
      // pre-delay before typing starts
      const t = setTimeout(() => setTyped(msg.text.slice(0, 1)), msg.delay);
      return () => clearTimeout(t);
    }
    if (typed.length < msg.text.length) {
      const t = setTimeout(() => setTyped(msg.text.slice(0, typed.length + 1)), 22 + Math.random() * 30);
      return () => clearTimeout(t);
    }
    // message complete -> advance
    const t = setTimeout(() => { setStep(step + 1); setTyped(""); }, 700);
    return () => clearTimeout(t);
  }, [typed, step]);

  // Visible messages: all completed + current partial
  const messages = [];
  for (let i = 0; i < step; i++) messages.push({ ...KODI_SCRIPT[i], partial: false });
  if (step < KODI_SCRIPT.length && typed.length > 0) messages.push({ ...KODI_SCRIPT[step], text: typed, partial: true });

  // Headline fades out as the chat fills, to keep focus on the conversation
  const headlineOpacity = Math.max(0, 1 - step * 0.32);

  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 30,
      opacity, transition: "opacity .15s linear",
      pointerEvents: opacity > 0.5 ? "auto" : "none",
      overflow: "hidden",
    }}>
      {/* Backdrop: deep gradient + faint signal scanlines + subtle radial glow at center */}
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(80% 60% at 50% 55%, ${hexA(accent, 0.18)} 0%, rgba(8,14,22,0) 60%), linear-gradient(180deg, #07090d 0%, #0c1219 100%)`,
      }} />
      <div style={{
        position: "absolute", inset: 0, opacity: 0.04, pointerEvents: "none",
        backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.6) 0 1px, transparent 1px 4px)",
      }} />
      {/* Edge ticks - hint of "ops room" without literal video */}
      <BackdropTicks accent={accent} />

      {/* Centered headline that recedes as conversation fills in */}
      <div style={{
        position: "absolute", left: 0, right: 0, top: 130, textAlign: "center", padding: "0 56px",
        opacity: headlineOpacity, transition: "opacity .4s ease",
        transform: `translateY(${(1 - headlineOpacity) * -10}px)`,
      }}>
        <div style={{ display: "inline-flex", marginBottom: 20 }}>
          <LiveInMarketBadge inverted={true} />
        </div>
        <h1 style={{
          fontFamily: VB_TOKENS.display, fontSize: 88, lineHeight: 0.94,
          letterSpacing: "-0.045em", margin: 0, fontWeight: 500, textWrap: "balance",
          color: VB_TOKENS.paper, maxWidth: 1100, marginInline: "auto",
        }}>
          The nerve center<br/>
          <span style={{ color: accent }}>sees everything now.</span>
        </h1>
      </div>

      {/* Centered chat composer */}
      <div style={{
        position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)",
        width: 720, maxWidth: "calc(100% - 112px)",
        marginTop: 40,
      }}>
        {/* Conversation transcript above the composer */}
        <div style={{
          display: "flex", flexDirection: "column", gap: 12, marginBottom: 16,
          maxHeight: 360, overflow: "hidden",
        }}>
          {messages.map((m, i) => <ChatBubble key={i} m={m} accent={accent} />)}
        </div>

        {/* Composer */}
        <div style={{
          background: "rgba(15,21,30,0.85)", backdropFilter: "blur(20px)",
          border: `1px solid ${step >= KODI_SCRIPT.length ? hexA(accent, 0.5) : "rgba(255,255,255,0.10)"}`,
          borderRadius: 18, padding: "16px 18px",
          display: "flex", alignItems: "center", gap: 14,
          boxShadow: `0 30px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.02) inset`,
          transition: "border-color .3s ease",
        }}>
          <KodiGlyph accent={accent} pulse={step < KODI_SCRIPT.length} />
          <div style={{ flex: 1, fontSize: 16, color: "rgba(220,225,229,0.55)", fontFamily: VB_TOKENS.body }}>
            {step >= KODI_SCRIPT.length ? "Ready. Scroll to watch the walkthrough." : "Kodi is responding…"}
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            fontFamily: VB_TOKENS.mono, fontSize: 10, letterSpacing: 2,
            color: "rgba(220,225,229,0.5)",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: accent, boxShadow: `0 0 8px ${accent}` }} />
            KODI · LIVE
          </div>
        </div>
      </div>

      {/* Scroll hint at the bottom, only after script completes */}
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 56,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
        fontFamily: VB_TOKENS.mono, fontSize: 11, letterSpacing: 3, color: accent,
        opacity: step >= KODI_SCRIPT.length ? 1 : 0,
        transition: "opacity .4s ease",
      }}>
        <span>KEEP SCROLLING</span>
        <ScrollHint />
      </div>
    </div>
  );
}

function ChatBubble({ m, accent }) {
  const isUser = m.who === "user";
  return (
    <div style={{
      display: "flex", justifyContent: isUser ? "flex-end" : "flex-start",
      animation: "vbBubbleIn .35s ease both",
    }}>
      {!isUser && <div style={{ marginRight: 10, alignSelf: "flex-end" }}><KodiGlyph accent={accent} small={true} /></div>}
      <div style={{
        maxWidth: 520,
        padding: "12px 16px",
        borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
        background: isUser ? "rgba(255,255,255,0.06)" : hexA(accent, 0.14),
        border: `1px solid ${isUser ? "rgba(255,255,255,0.10)" : hexA(accent, 0.32)}`,
        color: VB_TOKENS.paper, fontSize: 16, lineHeight: 1.45,
        fontFamily: VB_TOKENS.body,
        backdropFilter: "blur(8px)",
      }}>
        {m.text}
        {m.partial && <span style={{ display: "inline-block", width: 8, height: 18, marginLeft: 2, verticalAlign: "-3px", background: accent, animation: "vbCaret 0.9s steps(2) infinite" }} />}
      </div>
      <style>{`
        @keyframes vbBubbleIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        @keyframes vbCaret { 0%, 50% { opacity: 1; } 50.01%, 100% { opacity: 0; } }
      `}</style>
    </div>
  );
}

function KodiGlyph({ accent, small, pulse }) {
  const size = small ? 28 : 36;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `radial-gradient(circle at 35% 30%, ${hexA(accent, 0.95)} 0%, ${hexA(accent, 0.6)} 50%, ${hexA(accent, 0.15)} 100%)`,
      border: `1px solid ${hexA(accent, 0.6)}`,
      boxShadow: `0 0 ${pulse ? 16 : 8}px ${hexA(accent, 0.55)}`,
      position: "relative",
      animation: pulse ? "vbKodiPulse 1.6s ease-in-out infinite" : "none",
    }}>
      <style>{`@keyframes vbKodiPulse { 0%,100%{box-shadow:0 0 12px ${hexA(accent, 0.4)};} 50%{box-shadow:0 0 22px ${hexA(accent, 0.7)};} }`}</style>
    </div>
  );
}

function BackdropTicks({ accent }) {
  // Faint horizontal ticks at left & right edges hinting at ops-room signals.
  // No video, no real data. Just rhythm.
  return (
    <>
      <div style={{ position: "absolute", left: 24, top: 0, bottom: 0, width: 80, display: "flex", flexDirection: "column", justifyContent: "center", gap: 14, opacity: 0.45 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{
            height: 2, background: hexA(accent, 0.5), borderRadius: 1,
            width: `${30 + ((i * 37) % 50)}%`,
            animation: `vbTick ${1.2 + (i % 3) * 0.4}s ease-in-out ${i * 0.1}s infinite alternate`,
          }} />
        ))}
      </div>
      <div style={{ position: "absolute", right: 24, top: 0, bottom: 0, width: 80, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-end", gap: 14, opacity: 0.45 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{
            height: 2, background: hexA(accent, 0.5), borderRadius: 1,
            width: `${30 + ((i * 53) % 50)}%`,
            animation: `vbTick ${1.0 + (i % 3) * 0.5}s ease-in-out ${i * 0.13}s infinite alternate`,
          }} />
        ))}
      </div>
      <style>{`@keyframes vbTick { from { opacity: 0.3; transform: scaleX(0.8); transform-origin: left; } to { opacity: 0.85; transform: scaleX(1); } }`}</style>
    </>
  );
}

// hex + alpha helper for #rrggbb -> rgba(r,g,b,a)
function hexA(hex, a) {
  const m = /^#([0-9a-f]{6})$/i.exec(hex || "");
  if (!m) return `rgba(124,184,255,${a})`;
  const n = parseInt(m[1], 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

function ChapterColumn({ chapters, activeIdx, localT, accent, opacity }) {
  if (opacity <= 0.01) return null;
  // Crossfade between adjacent chapters across the local 0..1 progress.
  // Window: incoming chapter fades in over first 30%, outgoing over last 30%.
  return (
    <div style={{
      position: "absolute", left: 56, top: 130, bottom: 90, width: 540, zIndex: 25,
      opacity, transition: "opacity .15s linear",
      display: "flex", flexDirection: "column", gap: 24,
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        fontFamily: VB_TOKENS.mono, fontSize: 11, letterSpacing: 2.5,
        color: "rgba(220,225,229,0.55)",
      }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: accent }} />
        WALKTHROUGH · {String(activeIdx + 1).padStart(2,"0")} / {String(chapters.length).padStart(2,"0")}
      </div>

      {/* The active chapter, with subtle parallax tied to localT */}
      <div style={{ position: "relative", flex: 1 }}>
        {chapters.map((c, i) => {
          // Visible only when i === activeIdx (with crossfade window).
          const distance = i - activeIdx; // 0 if active, +1 next, -1 prev
          let op = 0, ty = 0;
          if (distance === 0) {
            // active chapter: in for full duration, but ease in at start
            const inEase = easeOut(clamp01(localT * 4));
            const outEase = clamp01((localT - 0.78) / 0.22);
            op = inEase * (1 - outEase);
            ty = (1 - inEase) * 24 - outEase * 24;
          } else if (distance === 1) {
            // upcoming: faintly start drifting in at the very end
            op = clamp01((localT - 0.85) / 0.15) * 0.4;
            ty = 30 - clamp01((localT - 0.85) / 0.15) * 14;
          }
          if (op <= 0.005) return null;
          return (
            <div key={i} style={{
              position: "absolute", inset: 0,
              opacity: op, transform: `translateY(${ty}px)`,
              transition: "opacity .15s linear, transform .15s linear",
            }}>
              <div style={{
                fontFamily: VB_TOKENS.mono, fontSize: 12, letterSpacing: 3,
                color: accent, marginBottom: 16,
              }}>{c.eyebrow} · CHAPTER {c.k}</div>
              <h3 style={{
                fontFamily: VB_TOKENS.display, fontSize: 64, lineHeight: 0.96,
                letterSpacing: "-0.035em", margin: "0 0 24px", fontWeight: 500,
                textWrap: "balance", color: VB_TOKENS.paper,
              }}>{c.h}</h3>
              <p style={{ fontSize: 18, lineHeight: 1.5, color: "rgba(220,225,229,0.78)", margin: 0, maxWidth: 480 }}>
                {c.p}
              </p>
            </div>
          );
        })}
      </div>

      {/* Bottom rail: chapter ticks */}
      <div style={{ paddingTop: 18, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ display: "flex", gap: 8 }}>
          {chapters.map((c, i) => (
            <div key={i} style={{ flex: 1 }}>
              <div style={{
                position: "relative", height: 3, borderRadius: 2,
                background: "rgba(255,255,255,0.18)", overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute", inset: 0,
                  width: i < activeIdx ? "100%" : i === activeIdx ? `${localT * 100}%` : "0%",
                  background: accent,
                  boxShadow: i === activeIdx ? `0 0 8px ${accent}` : "none",
                }} />
              </div>
              <div style={{
                fontFamily: VB_TOKENS.mono, fontSize: 9, letterSpacing: 1.5,
                color: "rgba(255,255,255,0.7)", marginTop: 8,
                opacity: i === activeIdx ? 1 : 0.5,
              }}>{c.k}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PulloutCopy({ accent, opacity }) {
  if (opacity <= 0.01) return null;
  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 30,
      display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
      padding: "0 56px", textAlign: "center",
      opacity, transition: "opacity .12s linear",
      pointerEvents: opacity > 0.5 ? "auto" : "none",
    }}>
      <div style={{ transform: `translateY(${(1 - opacity) * 24}px)`, display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
        <LiveInMarketBadge inverted={true} />
        <h2 style={{
          fontFamily: VB_TOKENS.display, fontSize: 88, lineHeight: 0.94,
          letterSpacing: "-0.04em", margin: 0, fontWeight: 500, textWrap: "balance",
          color: VB_TOKENS.paper, maxWidth: 1100,
        }}>
          Powering the AIOC.<br/>
          <span style={{ color: accent }}>And what's next.</span>
        </h2>
        <p style={{ fontSize: 18, color: "rgba(220,225,229,0.78)", margin: 0, lineHeight: 1.5, maxWidth: 640 }}>
          VoiceBrain runs SFO's Airport Integrated Operations Center — the nation's first AI Delay Agent. The same platform deploys alongside dispatch, command, and operations centers across public safety and aviation.
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <button style={{
            padding: "16px 28px", borderRadius: 999, background: VB_TOKENS.paper, color: VB_TOKENS.ink,
            border: "none", fontWeight: 600, fontSize: 14, cursor: "pointer",
          }}>Book a 20-minute demo →</button>
          <button style={{
            padding: "16px 28px", borderRadius: 999, background: "rgba(8,14,22,0.5)",
            color: VB_TOKENS.paper, border: "1px solid rgba(255,255,255,0.3)",
            fontWeight: 600, fontSize: 14, cursor: "pointer", backdropFilter: "blur(10px)",
          }}>Talk to a customer</button>
        </div>
      </div>
    </div>
  );
}

function Callouts({ chapters, active, progress, accent }) {
  if (active < 0) return null;
  const c = chapters[active];
  // Visible window inside chapter: in 0.18..0.85
  const inEase = easeOut(clamp01((progress - 0.10) / 0.20));
  const outEase = clamp01((progress - 0.80) / 0.20);
  const op = inEase * (1 - outEase);
  if (op <= 0.01) return null;
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {c.callouts.map((cl, i) => (
        <div key={i} style={{
          position: "absolute",
          left: cl.x + "%", top: cl.y + "%",
          transform: `translate(-50%, -50%) scale(${0.85 + 0.15 * op})`,
          opacity: op,
          transition: "opacity .15s linear, transform .15s linear",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <div style={{
            width: 18, height: 18, borderRadius: "50%",
            border: `2px solid ${cl.c}`,
            boxShadow: `0 0 0 4px ${cl.c}33`,
            background: "transparent",
          }} />
          <div style={{
            padding: "6px 10px", borderRadius: 999,
            background: "rgba(8,14,22,0.7)", backdropFilter: "blur(8px)",
            border: `1px solid ${cl.c}55`,
            fontFamily: VB_TOKENS.mono, fontSize: 10, color: VB_TOKENS.paper, letterSpacing: 1.2,
            whiteSpace: "nowrap",
          }}>{cl.label}</div>
        </div>
      ))}
    </div>
  );
}

function StageHUD({ accent, p, chapters, activeIdx }) {
  let stage;
  if (p < STAGE.introEnd) stage = "INTRO";
  else if (p < STAGE.liftoffEnd) stage = "LIFTOFF";
  else if (p < STAGE.chaptersEnd) stage = `CHAPTER ${chapters[activeIdx].k}`;
  else stage = "FINALE";
  return (
    <div style={{
      position: "absolute", right: 56, bottom: 32, zIndex: 40,
      display: "flex", alignItems: "center", gap: 12,
      fontFamily: VB_TOKENS.mono, fontSize: 10, letterSpacing: 2.5,
      color: "rgba(220,225,229,0.6)",
    }}>
      <span>{stage}</span>
      <span style={{ width: 80, height: 2, background: "rgba(255,255,255,0.12)", borderRadius: 1, position: "relative", overflow: "hidden" }}>
        <span style={{ position: "absolute", inset: 0, width: `${p * 100}%`, background: accent }} />
      </span>
      <span style={{ color: accent }}>{Math.round(p * 100)}%</span>
    </div>
  );
}

function ScrollHint() {
  return (
    <div style={{ width: 22, height: 34, borderRadius: 11, border: "1.5px solid currentColor", position: "relative" }}>
      <span style={{
        position: "absolute", left: "50%", top: 6, width: 2, height: 6,
        background: "currentColor", borderRadius: 1, transform: "translateX(-50%)",
        animation: "vbScrollHint 1.6s ease-in-out infinite",
      }} />
      <style>{`@keyframes vbScrollHint{0%{transform:translate(-50%,0);opacity:1}70%{transform:translate(-50%,10px);opacity:0}100%{transform:translate(-50%,0);opacity:0}}`}</style>
    </div>
  );
}

// helpers
function lerp(a, b, t) { return a + (b - a) * t; }
function clamp01(t) { return t < 0 ? 0 : t > 1 ? 1 : t; }
function easeInOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

export default ConceptScroll;
