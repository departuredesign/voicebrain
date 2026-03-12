import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

// ════════════════════════════════════════════════════════
// TOKENS
// ════════════════════════════════════════════════════════
const C = {
  bg: "#080e16",
  camera: "#FF585F", radio: "#E8FB56", voice: "#507FE5",
  cad: "#ACCDF6", dispatch: "#8E52E8", drone: "#4ECDC4",
  accent: "#60A6FB", danger: "#DD4452", dangerBg: "#3c070d",
  white: "#fff", muted: "#5a5e65",
  glass: "rgba(0,0,0,0.72)", glassBorder: "rgba(255,255,255,0.2)",
};

// ════════════════════════════════════════════════════════
// ICON PATHS — matched to actual uploaded PNG filenames
// Since there are no separate outline variants, we use
// the same icon for both states and control appearance
// via opacity/border in the marker component.
// ════════════════════════════════════════════════════════
const ICON_PATHS = {
  camera:   "/icons/Camera_Icon.png",
  radio:    "/icons/Radio_Icon.png",
  voice:    "/icons/Voice_Icon.png",
  drone:    "/icons/Drone_Icon.png",
  cad:      "/icons/CAD_Icon.png",
  dispatch: "/icons/Walkie_Talkie.png",
};

// ════════════════════════════════════════════════════════
// SENSORS
// ════════════════════════════════════════════════════════
const MAP_CENTER = [-122.413, 37.775];
const MAP_ZOOM = 14.5;
const SENSORS = [
  { id:"cam1", type:"camera", lng:-122.424, lat:37.784 },
  { id:"cam2", type:"camera", lng:-122.406, lat:37.783 },
  { id:"cam3", type:"camera", lng:-122.399, lat:37.776 },
  { id:"cam4", type:"camera", lng:-122.401, lat:37.767 },
  { id:"cam5", type:"camera", lng:-122.414, lat:37.764 },
  { id:"rad1", type:"radio",  lng:-122.420, lat:37.783 },
  { id:"rad2", type:"radio",  lng:-122.401, lat:37.764 },
  { id:"rad3", type:"radio",  lng:-122.408, lat:37.776 },
  { id:"cam6", type:"camera", lng:-122.413, lat:37.779 },
  { id:"cad1", type:"cad",    lng:-122.419, lat:37.774 },
  { id:"voice1", type:"voice",  lng:-122.411, lat:37.769 },
  { id:"drone1", type:"drone",  lng:-122.402, lat:37.771 },
];

const SM = {
  camera:   { color: C.camera,   label: "Camera" },
  radio:    { color: C.radio,    label: "Radio" },
  voice:    { color: C.voice,    label: "Voice" },
  drone:    { color: C.drone,    label: "Drone" },
  cad:      { color: C.cad,      label: "CAD" },
  dispatch: { color: C.dispatch, label: "Dispatch" },
};

// ════════════════════════════════════════════════════════
// STEPS
// ════════════════════════════════════════════════════════
const STEPS = [
  { id:0, phase:"intro",    headline:"The Dispatcher's Second Brain", sub:"Six radio channels. Four 911 calls holding. A critical detail just got buried.", time:null, center:MAP_CENTER, zoom:MAP_ZOOM, bearing:0, pitch:0, activate:[], connect:[], icon:"dispatch" },
  { id:1, phase:"dispatch",  headline:"911 Call Received", sub:"Shots fired reported near Canal & Norman. The clock starts now.", time:"17:43:02", center:[-122.413,37.778], zoom:15, bearing:10, pitch:30, activate:[], connect:[], icon:"dispatch" },
  { id:2, phase:"voice",     headline:"Radio Transcription", sub:"VoiceBrain captures every word across all channels — transcribed and structured in real time.", time:"17:43:05", center:[-122.412,37.777], zoom:15.3, bearing:15, pitch:40, activate:["rad3","cad1"], connect:[["rad3","cad1"]], icon:"voice" },
  { id:3, phase:"camera",    headline:"Camera Correlation", sub:"AI automatically correlates the radio call with the nearest camera feed. Suspect vehicle identified.", time:"17:43:08", center:[-122.413,37.778], zoom:15.8, bearing:20, pitch:45, activate:["cam6"], connect:[["cam6","rad3"]], icon:"camera" },
  { id:4, phase:"alert",     headline:"KODI Alert Triggered", sub:"Suspect armed. Officer on scene in distress. Command notified instantly.", time:"17:43:12", center:[-122.410,37.777], zoom:15.5, bearing:15, pitch:40, activate:[], connect:[], icon:"dispatch" },
  { id:5, phase:"response",  headline:"Multi-District Response", sub:"Three districts responding. Pursuit crosses city lines. Everyone sees the same picture.", time:"17:43:15", center:[-122.411,37.774], zoom:15, bearing:5, pitch:30, activate:["voice1"], connect:[["voice1","cam6"]], icon:"voice" },
  { id:6, phase:"drone",     headline:"Drone Dispatched", sub:"Aerial unit en route with live video feed. ETA 90 seconds.", time:"17:43:18", center:[-122.406,37.773], zoom:15.3, bearing:-10, pitch:50, activate:["drone1"], connect:[["drone1","cam6"]], icon:"drone" },
  { id:7, phase:"result",    headline:"Complete Operational Picture", sub:"20 seconds. Voice, video, CAD — correlated. Information comes to the dispatcher.", time:"17:43:22", center:MAP_CENTER, zoom:MAP_ZOOM, bearing:0, pitch:0, activate:[], connect:[], icon:"cad" },
];

const typeColor = t =>
  t === "dispatch" || t === "alert" ? C.dispatch :
  t === "voice"    || t === "response" ? C.voice :
  t === "camera" ? C.camera :
  t === "drone"  ? C.drone : C.accent;

// ════════════════════════════════════════════════════════
// TRANSCRIPT DATA — simulated live feed
// ════════════════════════════════════════════════════════
const TRANSCRIPTS = [
  { time: "17:43:02", channel: "CH-1", speaker: "Dispatch", text: "All units, shots fired reported Canal and Norman. Code 3.", color: C.dispatch },
  { time: "17:43:05", channel: "CH-3", speaker: "Unit 42", text: "10-4, responding from Guerrero. ETA two minutes.", color: C.radio },
  { time: "17:43:07", channel: "CH-1", speaker: "Unit 18", text: "I'm on scene. Single male, dark hoodie, headed south on Canal.", color: C.camera },
  { time: "17:43:09", channel: "CH-2", speaker: "Dispatch", text: "Camera 6 confirms suspect vehicle — gray sedan, partial plate 7-King.", color: C.camera },
  { time: "17:43:12", channel: "CH-1", speaker: "Unit 18", text: "Suspect is armed! Requesting backup immediately.", color: C.danger },
  { time: "17:43:14", channel: "CH-4", speaker: "KODI", text: "⚠ ALERT: Officer distress signal — Unit 18, Canal & Norman.", color: C.danger },
  { time: "17:43:16", channel: "CH-2", speaker: "Sgt. Reyes", text: "District 3 responding. All available units redirect.", color: C.voice },
  { time: "17:43:18", channel: "CH-5", speaker: "Air Unit", text: "Drone 1 airborne. Live feed to command in 90 seconds.", color: C.drone },
  { time: "17:43:20", channel: "CH-3", speaker: "Unit 42", text: "On scene. Perimeter established east side.", color: C.radio },
  { time: "17:43:22", channel: "CH-1", speaker: "Dispatch", text: "Full picture locked. All units have shared operational view.", color: C.accent },
];

const ALERTS = [
  { step: 1, severity: "info",     label: "911 CALL",       text: "Shots fired — Canal & Norman", color: C.accent },
  { step: 2, severity: "warning",  label: "VOICE CAPTURE",  text: "Radio transcription active — 6 channels", color: C.voice },
  { step: 3, severity: "info",     label: "CORRELATION",    text: "Camera 6 matched — suspect vehicle ID'd", color: C.camera },
  { step: 4, severity: "critical", label: "KODI ALERT",     text: "Officer distress — Unit 18", color: C.danger },
  { step: 5, severity: "warning",  label: "MULTI-DISTRICT", text: "3 districts responding — shared picture active", color: C.dispatch },
  { step: 6, severity: "info",     label: "DRONE DEPLOYED", text: "Aerial unit en route — ETA 90s", color: C.drone },
];

// ════════════════════════════════════════════════════════
// MAP COMPONENT
// ════════════════════════════════════════════════════════
function MapboxMap({ mapRef, mapContainerRef, onReady }) {
  useEffect(() => {
    if (mapRef.current) return;
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: MAP_CENTER,
      zoom: MAP_ZOOM,
      bearing: 0,
      pitch: 0,
      interactive: false,
      attributionControl: false,
    });
    map.on("load", () => {
      mapRef.current = map;
      onReady();
    });
    return () => { map.remove(); mapRef.current = null; };
  }, []);
  return <div ref={mapContainerRef} style={{ position:"absolute", inset:0, width:"100%", height:"100%" }} />;
}

// ════════════════════════════════════════════════════════
// SENSOR MARKER — single effect, innerHTML approach
// ════════════════════════════════════════════════════════
function SensorMarker({ sensor, isActive, map }) {
  const markerRef = useRef(null);
  const m = SM[sensor.type];
  const iconSrc = ICON_PATHS[sensor.type];

  useEffect(() => {
    if (!map) return;

    const sz = isActive ? 60 : 36;
    const iconSz = isActive ? 28 : 16;
    const borderW = isActive ? 3 : 2;
    const borderColor = isActive ? m.color : 'rgba(255,255,255,0.18)';
    const shadow = isActive
      ? `0 0 24px ${m.color}55, 0 0 60px ${m.color}22`
      : '0 2px 8px rgba(0,0,0,0.5)';

    // Build pulse rings HTML
    let pulsesHtml = '';
    if (isActive) {
      for (let d = 0; d < 2; d++) {
        const ringSz = Math.round(sz * 2.2);
        pulsesHtml += `<div style="position:absolute;left:50%;top:50%;width:${ringSz}px;height:${ringSz}px;margin-left:${-ringSz/2}px;margin-top:${-ringSz/2}px;border-radius:50%;border:${d===0?2:1.5}px solid ${m.color};animation:vbP 2s ease-out infinite ${d*0.7}s;opacity:${d===0?0.4:0.2};pointer-events:none;"></div>`;
      }
    }

    // Label HTML
    let labelHtml = '';
    if (isActive) {
      labelHtml = `<div style="position:absolute;left:50%;top:100%;transform:translate(-50%,8px);font-size:9px;font-weight:700;letter-spacing:2px;color:${m.color};text-shadow:0 0 12px ${m.color}50;white-space:nowrap;font-family:-apple-system,sans-serif;pointer-events:none;">${m.label.toUpperCase()}</div>`;
    }

    // Create the element with ALL content as innerHTML
    const el = document.createElement("div");
    el.style.width = sz + 'px';
    el.style.height = sz + 'px';
    el.style.position = 'relative';
    el.style.cursor = 'pointer';
    el.innerHTML = `
      ${pulsesHtml}
      <div style="width:${sz}px;height:${sz}px;border-radius:50%;background:#111;border:${borderW}px solid ${borderColor};display:flex;align-items:center;justify-content:center;overflow:hidden;box-shadow:${shadow};position:relative;z-index:1;">
        <img src="${iconSrc}" width="${iconSz}" height="${iconSz}" style="display:block;object-fit:contain;opacity:${isActive?1:0.5};filter:brightness(${isActive?1.3:0.9});" />
      </div>
      ${labelHtml}
    `;

    // Remove old marker if it exists
    if (markerRef.current) {
      markerRef.current.remove();
    }

    // Create new marker
    const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
      .setLngLat([sensor.lng, sensor.lat])
      .addTo(map);
    markerRef.current = marker;

    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    };
  }, [map, sensor.lng, sensor.lat, isActive, m, iconSrc]);

  return null;
}

// ════════════════════════════════════════════════════════
// CONNECTION LINES — Mapbox native GeoJSON layer
// ════════════════════════════════════════════════════════
function useConnectionLines(mapRef, connections, mapReady) {
  const sourceAdded = useRef(false);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    // Add source + layers once
    if (!sourceAdded.current) {
      if (!map.getSource("vb-conns")) {
        map.addSource("vb-conns", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });
        map.addLayer({
          id: "vb-conn-glow",
          type: "line",
          source: "vb-conns",
          paint: { "line-color": C.accent, "line-width": 8, "line-opacity": 0.08, "line-blur": 6 },
        });
        map.addLayer({
          id: "vb-conn-line",
          type: "line",
          source: "vb-conns",
          paint: { "line-color": C.accent, "line-width": 2, "line-opacity": 0.55, "line-dasharray": [2, 1.5] },
        });
      }
      sourceAdded.current = true;
    }

    // Build features from sensor pairs
    const features = connections
      .map(([fId, tId]) => {
        const f = SENSORS.find(s => s.id === fId);
        const t = SENSORS.find(s => s.id === tId);
        if (!f || !t) return null;
        return {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [[f.lng, f.lat], [t.lng, t.lat]],
          },
        };
      })
      .filter(Boolean);

    const src = map.getSource("vb-conns");
    if (src) {
      src.setData({ type: "FeatureCollection", features });
    }
  }, [mapRef, connections, mapReady]);
}

// ════════════════════════════════════════════════════════
// TRAVELING PARTICLES along connection lines
// ════════════════════════════════════════════════════════
function TravelingParticles({ connections, mapRef }) {
  const [pts, setPts] = useState([]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !connections.length) { setPts([]); return; }

    const update = () => {
      const p = connections.map(([fId, tId]) => {
        const f = SENSORS.find(s => s.id === fId);
        const t = SENSORS.find(s => s.id === tId);
        if (!f || !t) return null;
        const p1 = map.project([f.lng, f.lat]);
        const p2 = map.project([t.lng, t.lat]);
        return { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, key: `${fId}-${tId}` };
      }).filter(Boolean);
      setPts(p);
    };
    map.on("render", update);
    update();
    return () => { map.off("render", update); };
  }, [connections, mapRef]);

  if (!pts.length) return null;
  return (
    <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", zIndex:6, pointerEvents:"none" }}>
      <defs>
        <filter id="glow"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      {pts.map((p, i) => (
        <g key={p.key}>
          <circle r="4" fill={C.white} opacity="0.8" filter="url(#glow)">
            <animateMotion dur={`${2.2 + i * 0.4}s`} repeatCount="indefinite" path={`M${p.x1},${p.y1} L${p.x2},${p.y2}`} keyPoints="0;1" keyTimes="0;1" calcMode="linear" />
          </circle>
          <circle r="2.5" fill={C.accent} opacity="0.5">
            <animateMotion dur={`${2.2 + i * 0.4}s`} repeatCount="indefinite" begin={`${1.1 + i * 0.2}s`} path={`M${p.x1},${p.y1} L${p.x2},${p.y2}`} keyPoints="0;1" keyTimes="0;1" calcMode="linear" />
          </circle>
        </g>
      ))}
    </svg>
  );
}

// ════════════════════════════════════════════════════════
// MAP OVERLAY — positions HTML at a lng/lat
// ════════════════════════════════════════════════════════
function MapOverlay({ lng, lat, map, children, style }) {
  const [pos, setPos] = useState(null);
  useEffect(() => {
    if (!map) return;
    const u = () => { const p = map.project([lng, lat]); setPos({ x: p.x, y: p.y }); };
    map.on("render", u);
    u();
    return () => { map.off("render", u); };
  }, [map, lng, lat]);
  if (!pos) return null;
  return <div style={{ position:"absolute", left:pos.x, top:pos.y, ...style }}>{children}</div>;
}

// ════════════════════════════════════════════════════════
// LOADING SCREEN
// ════════════════════════════════════════════════════════
function LoadingScreen() {
  return (
    <div style={{ position:"absolute", inset:0, background:C.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", zIndex:100 }}>
      <img src={ICON_PATHS.voice} alt="" style={{ width:64, height:64, opacity:0.8, animation:"vbLoadPulse 1.5s ease infinite" }} />
      <div style={{ marginTop:20, fontSize:12, letterSpacing:3, color:"rgba(255,255,255,0.3)", fontWeight:600, textTransform:"uppercase" }}>Loading Map</div>
    </div>
  );
}

// ════════════════════════════════════════════════════════
// SIDEBAR ICON
// ════════════════════════════════════════════════════════
function SidebarIcon({ type, isActive, isPast, size = 16 }) {
  const iconSrc = ICON_PATHS[type];
  return <img src={iconSrc} alt="" style={{ width:size, height:size, objectFit:"contain", opacity:isActive ? 1 : isPast ? 0.5 : 0.2 }} />;
}

// ════════════════════════════════════════════════════════
// RIGHT PANEL — Transcript Feed, Alerts, Device Status
// ════════════════════════════════════════════════════════
function RightPanel({ step, active }) {
  const visibleTranscripts = useMemo(() => {
    // Show transcripts up to current step (roughly 1 per step after step 0)
    const count = Math.min(step, TRANSCRIPTS.length);
    return TRANSCRIPTS.slice(0, count);
  }, [step]);

  const visibleAlerts = useMemo(() => {
    return ALERTS.filter(a => a.step <= step);
  }, [step]);

  const deviceStatuses = useMemo(() => {
    return SENSORS.map(s => ({
      ...s,
      isActive: active.has(s.id),
      meta: SM[s.type],
    }));
  }, [active]);

  const activeDevices = deviceStatuses.filter(d => d.isActive);
  const inactiveDevices = deviceStatuses.filter(d => !d.isActive);

  if (step === 0 || step === 7) return null;

  return (
    <div style={{ width:320, minWidth:320, height:"100%", display:"flex", flexDirection:"column", zIndex:20, background:"rgba(8,14,22,0.97)", borderLeft:"1px solid rgba(255,255,255,0.06)", overflow:"hidden" }}>

      {/* ── ALERTS ── */}
      {visibleAlerts.length > 0 && (
        <div style={{ borderBottom:"1px solid rgba(255,255,255,0.06)", maxHeight:160, overflowY:"auto" }}>
          <div style={{ padding:"14px 20px 6px", fontSize:9, letterSpacing:2.5, color:C.danger, fontWeight:700, textTransform:"uppercase" }}>Alerts</div>
          {visibleAlerts.slice().reverse().map((a, i) => (
            <div key={i} style={{
              display:"flex", alignItems:"center", gap:10, padding:"8px 20px",
              background: i === 0 && a.severity === "critical" ? "rgba(221,68,82,0.08)" : "transparent",
              borderLeft: `3px solid ${a.color}`,
              animation: i === 0 ? "vbSlide 0.4s ease both" : "none",
            }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background: a.color, flexShrink:0, animation: a.severity === "critical" ? "vbGlow 1.5s ease infinite" : "none" }} />
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:9, fontWeight:700, letterSpacing:1.5, color: a.color, textTransform:"uppercase" }}>{a.label}</div>
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.65)", lineHeight:1.3, marginTop:1 }}>{a.text}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── LIVE TRANSCRIPT ── */}
      <div style={{ flex:1, borderBottom:"1px solid rgba(255,255,255,0.06)", overflowY:"auto", display:"flex", flexDirection:"column" }}>
        <div style={{ padding:"14px 20px 6px", fontSize:9, letterSpacing:2.5, color:C.accent, fontWeight:700, textTransform:"uppercase", position:"sticky", top:0, background:"rgba(8,14,22,0.97)", zIndex:2 }}>
          Live Transcript
          <span style={{ marginLeft:8, padding:"2px 8px", borderRadius:10, background:"rgba(96,166,251,0.12)", fontSize:8, fontWeight:600, color:C.accent }}>{visibleTranscripts.length} msgs</span>
        </div>
        <div style={{ flex:1, padding:"4px 0" }}>
          {visibleTranscripts.length === 0 && (
            <div style={{ padding:"20px", fontSize:12, color:"rgba(255,255,255,0.2)", textAlign:"center" }}>Awaiting radio traffic…</div>
          )}
          {visibleTranscripts.map((t, i) => (
            <div key={i} style={{
              padding:"8px 20px",
              animation: i === visibleTranscripts.length - 1 ? "vbSlide 0.4s ease both" : "none",
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                <span style={{ fontSize:10, fontVariantNumeric:"tabular-nums", color:"rgba(255,255,255,0.25)", fontWeight:600 }}>{t.time}</span>
                <span style={{ fontSize:9, padding:"1px 6px", borderRadius:4, background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.35)", fontWeight:600, letterSpacing:0.5 }}>{t.channel}</span>
                <span style={{ fontSize:11, fontWeight:600, color: t.color }}>{t.speaker}</span>
              </div>
              <div style={{ fontSize:13, color:"rgba(255,255,255,0.75)", lineHeight:1.4, paddingLeft:0 }}>{t.text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── DEVICE STATUS ── */}
      <div style={{ maxHeight:200, overflowY:"auto" }}>
        <div style={{ padding:"14px 20px 6px", fontSize:9, letterSpacing:2.5, color:"rgba(255,255,255,0.35)", fontWeight:700, textTransform:"uppercase" }}>
          Devices
          <span style={{ marginLeft:8, color:C.accent }}>{activeDevices.length} active</span>
        </div>
        <div style={{ padding:"0 14px 10px", display:"flex", flexWrap:"wrap", gap:6 }}>
          {activeDevices.map(d => (
            <div key={d.id} style={{
              display:"flex", alignItems:"center", gap:6, padding:"5px 10px",
              borderRadius:8, background:`${d.meta.color}12`, border:`1px solid ${d.meta.color}30`,
            }}>
              <img src={ICON_PATHS[d.type]} alt="" style={{ width:14, height:14, objectFit:"contain" }} />
              <span style={{ fontSize:10, fontWeight:600, color:d.meta.color, letterSpacing:0.5 }}>{d.id.toUpperCase()}</span>
            </div>
          ))}
          {inactiveDevices.slice(0, 6).map(d => (
            <div key={d.id} style={{
              display:"flex", alignItems:"center", gap:5, padding:"5px 10px",
              borderRadius:8, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)",
            }}>
              <img src={ICON_PATHS[d.type]} alt="" style={{ width:12, height:12, objectFit:"contain", opacity:0.25 }} />
              <span style={{ fontSize:10, color:"rgba(255,255,255,0.2)", letterSpacing:0.5 }}>{d.id.toUpperCase()}</span>
            </div>
          ))}
          {inactiveDevices.length > 6 && (
            <div style={{ padding:"5px 10px", fontSize:10, color:"rgba(255,255,255,0.15)" }}>
              +{inactiveDevices.length - 6} more
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════
// APP
// ════════════════════════════════════════════════════════
export default function App() {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const [step, setStep] = useState(0);
  const progressRef = useRef(0);
  const containerRef = useRef(null);

  // Fly camera on step change
  useEffect(() => {
    const m = mapRef.current;
    if (!m || !mapReady) return;
    const s = STEPS[step];
    m.flyTo({ center:s.center, zoom:s.zoom, bearing:s.bearing, pitch:s.pitch, duration:1500, essential:true });
  }, [step, mapReady]);

  // Scroll / touch navigation
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const S = 0.0008;
    const hw = (e) => {
      e.preventDefault();
      progressRef.current = Math.max(0, Math.min(1, progressRef.current + e.deltaY * S));
      setStep(p => {
        const n = Math.round(progressRef.current * (STEPS.length - 1));
        return p !== n ? n : p;
      });
    };
    let tY = 0;
    const hts = (e) => { tY = e.touches[0].clientY; };
    const htm = (e) => {
      e.preventDefault();
      progressRef.current = Math.max(0, Math.min(1, progressRef.current + (tY - e.touches[0].clientY) * 0.003));
      tY = e.touches[0].clientY;
      setStep(p => {
        const n = Math.round(progressRef.current * (STEPS.length - 1));
        return p !== n ? n : p;
      });
    };
    el.addEventListener("wheel", hw, { passive: false });
    el.addEventListener("touchstart", hts, { passive: true });
    el.addEventListener("touchmove", htm, { passive: false });
    return () => {
      el.removeEventListener("wheel", hw);
      el.removeEventListener("touchstart", hts);
      el.removeEventListener("touchmove", htm);
    };
  }, []);

  const goToStep = useCallback((i) => {
    progressRef.current = i / (STEPS.length - 1);
    setStep(i);
  }, []);

  // Cumulative active sensors + connections
  const state = useMemo(() => {
    const active = new Set();
    const conns = [];
    for (let i = 0; i <= step; i++) {
      STEPS[i].activate.forEach(id => active.add(id));
      STEPS[i].connect.forEach(c => {
        if (!conns.some(e => e[0] === c[0] && e[1] === c[1])) conns.push(c);
      });
    }
    return { active, conns };
  }, [step]);

  useConnectionLines(mapRef, state.conns, mapReady);
  const cur = STEPS[step];
  const { active, conns } = state;
  const isResult = cur.phase === "result";

  return (
    <div ref={containerRef} style={{ position:"relative", width:"100%", height:"100vh", overflow:"hidden", background:C.bg, fontFamily:"'SF Pro Display','SF Pro Text',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", color:C.white, display:"flex", touchAction:"none" }}>
      <style>{`
        @keyframes vbP{0%{transform:translate(-50%,-50%) scale(1);opacity:.3}100%{transform:translate(-50%,-50%) scale(3);opacity:0}}
        @keyframes vbGlow{0%,100%{opacity:.6}50%{opacity:1}}
        @keyframes vbBP{0%,100%{box-shadow:0 0 0 0 rgba(221,68,82,.4),inset 0 0 30px rgba(221,68,82,.05)}50%{box-shadow:0 0 0 10px rgba(221,68,82,0),inset 0 0 50px rgba(221,68,82,.12)}}
        @keyframes vbShake{0%,100%{transform:translate(-50%,-100%) scale(1)}10%{transform:translate(calc(-50% - 3px),-100%)}30%{transform:translate(calc(-50% + 3px),-100%)}50%{transform:translate(-50%,-100%) scale(1.02)}70%{transform:translate(calc(-50% + 1px),-100%)}}
        @keyframes vbSlide{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes vbBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(8px)}}
        @keyframes vbLoadPulse{0%,100%{opacity:0.4;transform:scale(1)}50%{opacity:1;transform:scale(1.1)}}
        .mapboxgl-canvas{outline:none}
      `}</style>

      {/* Loading screen */}
      {!mapReady && <LoadingScreen />}

      {/* ═══════ LEFT TOC ═══════ */}
      <div style={{ width:340, minWidth:340, height:"100%", display:"flex", flexDirection:"column", zIndex:20, background:"rgba(8,14,22,0.97)", borderRight:"1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ padding:"28px 28px 20px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize:11, letterSpacing:4, color:C.accent, fontWeight:600, textTransform:"uppercase", marginBottom:6 }}>VoiceBrain AI</div>
          <div style={{ fontSize:18, fontWeight:700, letterSpacing:-0.5, lineHeight:1.25 }}>Command & Dispatch<br/>Operations</div>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:"8px 0" }}>
          {STEPS.map((s, i) => {
            const isA = step === i, isP = step > i, color = typeColor(s.phase);
            return (
              <div key={s.id} onClick={() => goToStep(i)} style={{
                display:"flex", alignItems:"flex-start", gap:14, padding:"14px 24px", cursor:"pointer",
                background: isA ? "rgba(96,166,251,0.06)" : "transparent",
                borderLeft: isA ? `3px solid ${color}` : "3px solid transparent",
                transition:"all 0.4s ease",
                opacity: isA ? 1 : isP ? 0.45 : 0.22,
              }}>
                <div style={{
                  width:32, height:32, borderRadius:"50%", flexShrink:0, marginTop:1,
                  background: isA ? color : isP ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  transition:"all 0.4s ease",
                  boxShadow: isA ? `0 0 16px ${color}50` : "none",
                }}>
                  <SidebarIcon type={s.icon} isActive={isA} isPast={isP} size={16} />
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  {s.time && <div style={{ fontSize:11, fontWeight:600, letterSpacing:1.5, color: isA ? color : "rgba(255,255,255,0.25)", fontVariantNumeric:"tabular-nums", marginBottom:2 }}>{s.time}</div>}
                  <div style={{ fontSize:14, fontWeight: isA ? 700 : 500, color: isA ? C.white : "rgba(255,255,255,0.45)", transition:"all 0.4s ease", lineHeight:1.35 }}>{s.headline}</div>
                  {isA && <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", lineHeight:1.5, marginTop:6 }}>{s.sub}</div>}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ padding:"18px 24px", borderTop:"1px solid rgba(255,255,255,0.06)", minHeight:80 }}>
          {step === 0 && (
            <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
              <div style={{ fontSize:10, letterSpacing:2, color:C.danger, fontWeight:600, textTransform:"uppercase", marginBottom:2 }}>Pain Points</div>
              {["No real-time radio transcription", "Manual correlation of audio, video, sensors", "Critical details lost in noise"].map((p, j) => (
                <div key={j} style={{ display:"flex", alignItems:"center", gap:10, fontSize:12, color:"rgba(255,255,255,0.45)" }}>
                  <span style={{ color:C.danger, fontSize:8 }}>●</span>{p}
                </div>
              ))}
            </div>
          )}
          {step === 7 && (
            <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
              <div style={{ fontSize:10, letterSpacing:2, color:C.accent, fontWeight:600, textTransform:"uppercase", marginBottom:2 }}>Results</div>
              {["Complete visibility", "Faster response", "Safer officers"].map((r, j) => (
                <div key={j} style={{ display:"flex", alignItems:"center", gap:10, fontSize:12, color:"rgba(255,255,255,0.55)" }}>
                  <span style={{ color:C.accent, fontWeight:700 }}>✓</span>{r}
                </div>
              ))}
            </div>
          )}
          {step > 0 && step < 7 && (
            <div style={{ display:"flex", gap:20, flexWrap:"wrap" }}>
              {Object.entries(SM).filter(([k]) => k !== "dispatch").map(([k, v]) => (
                <div key={k} style={{ display:"flex", alignItems:"center", gap:6, fontSize:10, color:"rgba(255,255,255,0.3)", letterSpacing:0.5 }}>
                  <div style={{ width:7, height:7, borderRadius:"50%", background:v.color }} />{v.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ═══════ MAP ═══════ */}
      <div style={{ flex:1, position:"relative", overflow:"hidden" }}>
        <MapboxMap mapRef={mapRef} mapContainerRef={mapContainerRef} onReady={() => setMapReady(true)} />
        {mapReady && SENSORS.map(s => (
          <SensorMarker key={s.id} sensor={s} isActive={active.has(s.id)} map={mapRef.current} />
        ))}
        {mapReady && <TravelingParticles connections={conns} mapRef={mapRef} />}

        {/* ── Shots Fired overlay ── */}
        {mapReady && step >= 1 && step < 7 && (
          <MapOverlay lng={-122.413} lat={37.782} map={mapRef.current} style={{ transform:"translate(-50%,-100%)", zIndex:22, pointerEvents:"none", animation:"vbShake 0.6s ease 0.2s both" }}>
            <div style={{ display:"flex", alignItems:"center", gap:16, padding:"14px 24px", borderRadius:50, background:"rgba(0,0,0,0.85)", border:`2px solid ${C.danger}`, backdropFilter:"blur(24px)", animation:"vbBP 2s ease infinite", whiteSpace:"nowrap" }}>
              <div style={{ width:44, height:44, borderRadius:"50%", background:C.dispatch, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <div style={{ width:40, height:40, borderRadius:"50%", background:"#111", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <img src={ICON_PATHS.dispatch} alt="" style={{ width:22, height:22, objectFit:"contain" }} />
                </div>
              </div>
              <div>
                <div style={{ fontSize:10, color:C.danger, fontWeight:700, letterSpacing:2.5, textTransform:"uppercase", marginBottom:2 }}>● Active Incident</div>
                <div style={{ fontSize:20, fontWeight:800, letterSpacing:-0.5, lineHeight:1.1 }}>Shots Fired — 5:43 PM</div>
                <div style={{ display:"flex", gap:6, marginTop:5 }}>
                  <span style={{ padding:"2px 12px", borderRadius:40, background:C.dangerBg, color:C.danger, fontSize:10, fontWeight:600 }}>Assault</span>
                  <span style={{ padding:"2px 12px", borderRadius:40, background:"rgba(96,166,251,0.12)", color:C.accent, fontSize:10, fontWeight:500 }}>Canal & Norman</span>
                </div>
              </div>
            </div>
          </MapOverlay>
        )}

        {/* ── Voice Capture ── */}
        {mapReady && step >= 2 && step < 7 && (
          <MapOverlay lng={-122.422} lat={37.772} map={mapRef.current} style={{ transform:"translate(-50%,-50%)", zIndex:15, pointerEvents:"none" }}>
            <div style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 20px", borderRadius:40, background:C.glass, border:`1px solid ${C.glassBorder}`, backdropFilter:"blur(24px)", whiteSpace:"nowrap" }}>
              <div style={{ width:40, height:40, borderRadius:"50%", background:C.voice, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <div style={{ width:36, height:36, borderRadius:"50%", background:"#111", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <img src={ICON_PATHS.voice} alt="" style={{ width:20, height:20, objectFit:"contain" }} />
                </div>
              </div>
              <div>
                <div style={{ fontSize:11, color:C.accent, fontWeight:600, letterSpacing:1 }}>Voice Capture</div>
                <span style={{ fontSize:15, fontWeight:700 }}>
                  <span style={{ color:C.radio }}>"</span>Shots fired bear Canal and Norman<span style={{ color:C.radio }}>"</span>
                </span>
              </div>
            </div>
          </MapOverlay>
        )}

        {/* ── Camera Match ── */}
        {mapReady && step >= 3 && step < 7 && (
          <MapOverlay lng={-122.413} lat={37.779} map={mapRef.current} style={{ transform:"translate(35px,-100%)", zIndex:18, pointerEvents:"none" }}>
            <div style={{ background:C.glass, border:`1px solid ${C.glassBorder}`, borderRadius:12, padding:"12px 18px", textAlign:"center", backdropFilter:"blur(20px)", maxWidth:210 }}>
              <div style={{ fontSize:9, fontWeight:700, letterSpacing:1.5, marginBottom:4, color:C.camera, textTransform:"uppercase" }}>● Camera Match</div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.88)", lineHeight:1.4 }}>Suspect vehicle identified at Canal & Norman</div>
            </div>
          </MapOverlay>
        )}

        {/* ── KODI Alert ── */}
        {mapReady && step >= 4 && step < 7 && (
          <MapOverlay lng={-122.399} lat={37.781} map={mapRef.current} style={{ transform:"translate(-50%,-50%)", zIndex:25, pointerEvents:"none" }}>
            <div style={{ width:230, borderRadius:14, background:"rgba(30,30,30,0.9)", border:"2px solid rgba(221,68,82,0.5)", backdropFilter:"blur(35px)", textAlign:"center", overflow:"hidden", boxShadow:"0 0 40px rgba(221,68,82,0.15),0 16px 48px rgba(0,0,0,0.5)" }}>
              <div style={{ padding:"14px 14px 4px", fontSize:15, fontWeight:700, color:C.danger }}>⚠ KODI Alert</div>
              <div style={{ padding:"0 14px 12px", fontSize:12, color:"rgba(255,255,255,0.88)", lineHeight:1.45 }}>Suspect armed. Officer on scene in distress.</div>
              <div style={{ display:"flex", borderTop:"1px solid rgba(84,84,88,0.65)" }}>
                <div style={{ flex:1, padding:"9px 0", fontSize:13, color:"#0A84FF", textAlign:"center" }}>Dismiss</div>
                <div style={{ width:1, background:"rgba(84,84,88,0.65)" }} />
                <div style={{ flex:1, padding:"9px 0", fontSize:13, color:"#0A84FF", fontWeight:600, textAlign:"center" }}>Open</div>
              </div>
            </div>
          </MapOverlay>
        )}

        {/* ── Multi-District ── */}
        {mapReady && step >= 5 && step < 7 && (
          <MapOverlay lng={-122.409} lat={37.770} map={mapRef.current} style={{ transform:"translate(-50%,-100%)", zIndex:18, pointerEvents:"none" }}>
            <div style={{ background:"rgba(40,42,48,0.92)", border:"1px solid rgba(255,255,255,0.18)", borderRadius:12, padding:"12px 20px", maxWidth:280, fontSize:14, lineHeight:1.4, backdropFilter:"blur(15px)", position:"relative" }}>
              <span style={{ color:C.accent, fontWeight:600, fontSize:10, letterSpacing:1, display:"block", marginBottom:4 }}>Multi-District</span>
              Three districts responding. Pursuit crosses city lines.
              <div style={{ position:"absolute", bottom:-7, left:28, width:14, height:14, background:"rgba(40,42,48,0.92)", border:"1px solid rgba(255,255,255,0.18)", borderTop:"none", borderLeft:"none", transform:"rotate(45deg)", borderRadius:"0 0 3px 0" }} />
            </div>
          </MapOverlay>
        )}

        {/* ── LIVE badge ── */}
        {step > 0 && step < STEPS.length - 1 && (
          <div style={{ position:"absolute", top:18, right:20, zIndex:30, display:"flex", alignItems:"center", gap:8, padding:"6px 16px", borderRadius:20, background:"rgba(221,68,82,0.12)", border:"1px solid rgba(221,68,82,0.25)" }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:C.danger, animation:"vbGlow 1.5s ease infinite" }} />
            <span style={{ fontSize:10, fontWeight:600, letterSpacing:2, color:C.danger }}>LIVE</span>
          </div>
        )}

        {/* ── Result overlay ── */}
        {isResult && (
          <div style={{ position:"absolute", inset:0, background:"rgba(8,14,22,0.88)", backdropFilter:"blur(12px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:40, animation:"vbSlide 0.8s ease both" }}>
            <div style={{ textAlign:"center", maxWidth:500, padding:"0 32px" }}>
              <div style={{ fontSize:11, letterSpacing:4, color:C.accent, fontWeight:600, textTransform:"uppercase", marginBottom:14 }}>The Result</div>
              <div style={{ fontSize:36, fontWeight:700, letterSpacing:-1.2, marginBottom:16, background:`linear-gradient(135deg,${C.white},${C.accent})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", lineHeight:1.15 }}>Complete Operational Picture</div>
              <div style={{ fontSize:16, color:"rgba(255,255,255,0.5)", lineHeight:1.6, marginBottom:40 }}>Every radio transmission — transcribed, searchable, correlated with video and CAD in real time.</div>
              <div style={{ display:"flex", gap:44, justifyContent:"center", marginBottom:36 }}>
                {[{ v:"6", l:"Radio Channels", c:C.voice }, { v:"20s", l:"Time to Picture", c:C.camera }, { v:"0", l:"Details Lost", c:C.radio }].map((s, j) => (
                  <div key={j}>
                    <div style={{ fontSize:42, fontWeight:700, letterSpacing:-2, color:s.c }}>{s.v}</div>
                    <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)", letterSpacing:1.5, textTransform:"uppercase", marginTop:3 }}>{s.l}</div>
                  </div>
                ))}
              </div>
              <div style={{ display:"flex", gap:28, justifyContent:"center" }}>
                {["Complete visibility", "Faster response", "Safer officers"].map((r, j) => (
                  <div key={j} style={{ display:"flex", alignItems:"center", gap:8, fontSize:14, color:"rgba(255,255,255,0.6)" }}>
                    <span style={{ color:C.accent, fontWeight:700, fontSize:16 }}>✓</span>{r}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Progress bar */}
        <div style={{ position:"absolute", bottom:0, left:0, height:3, zIndex:50, width:`${(step / (STEPS.length - 1)) * 100}%`, background:`linear-gradient(90deg,${C.voice},${C.accent},${C.camera})`, transition:"width 0.5s ease" }} />

        {/* Scroll hint */}
        {step === 0 && (
          <div style={{ position:"absolute", bottom:48, left:"50%", transform:"translateX(-50%)", zIndex:35, display:"flex", flexDirection:"column", alignItems:"center", gap:10, pointerEvents:"none" }}>
            <div style={{ padding:"10px 28px", borderRadius:30, background:"rgba(96,166,251,0.1)", border:"1px solid rgba(96,166,251,0.25)", backdropFilter:"blur(10px)" }}>
              <span style={{ fontSize:12, color:C.accent, letterSpacing:2.5, fontWeight:600 }}>SCROLL TO EXPLORE</span>
            </div>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2" strokeLinecap="round" style={{ animation:"vbBounce 1.5s ease infinite", opacity:0.6 }}>
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          </div>
        )}
      </div>

      {/* ═══════ RIGHT PANEL ═══════ */}
      <RightPanel step={step} active={active} />
    </div>
  );
}
