import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

// ════════════════════════════════════════════════════════
// DESIGN TOKENS
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
// SVG ICON COMPONENTS (for TOC sidebar)
// ════════════════════════════════════════════════════════
const CameraIcon = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
    <path d="M14 42h32a3 3 0 003-3V22a3 3 0 00-3-3h-7l-3-5H24l-3 5h-7a3 3 0 00-3 3v17a3 3 0 003 3z" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="30" cy="30" r="7" stroke={color} strokeWidth="2.5"/>
  </svg>
);
const RadioIcon = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
    <rect x="20" y="10" width="20" height="40" rx="3" stroke={color} strokeWidth="2.5"/>
    <rect x="24" y="28" width="12" height="8" rx="1.5" stroke={color} strokeWidth="2"/>
    <line x1="30" y1="10" x2="38" y2="3" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <circle cx="27" cy="42" r="1.5" fill={color}/><circle cx="33" cy="42" r="1.5" fill={color}/>
  </svg>
);
const VoiceIcon = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
    {[12,15.6,19.2,22.8,26.4,30,33.6,37.2,40.8,44.4,48].map((x,i) => {
      const h = [3.6,10.8,14.4,10.8,7.8,3.6,7.8,3.6,1.8,3.6,0.4][i];
      return <path key={i} d={`M${x} ${30+h/2}V${30-h/2}`} stroke={color} strokeWidth="1.8" strokeLinecap="round"/>;
    })}
  </svg>
);
const DroneIcon = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
    <circle cx="30" cy="30" r="5" stroke={color} strokeWidth="2.2"/>
    <line x1="22" y1="22" x2="14" y2="14" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <line x1="38" y1="22" x2="46" y2="14" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <line x1="22" y1="38" x2="14" y2="46" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <line x1="38" y1="38" x2="46" y2="46" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="12" r="4" stroke={color} strokeWidth="1.8"/><circle cx="48" cy="12" r="4" stroke={color} strokeWidth="1.8"/>
    <circle cx="12" cy="48" r="4" stroke={color} strokeWidth="1.8"/><circle cx="48" cy="48" r="4" stroke={color} strokeWidth="1.8"/>
  </svg>
);
const CadIcon = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
    <rect x="8" y="12" width="44" height="28" rx="3" stroke={color} strokeWidth="2.5"/>
    <path d="M22 46h16M30 40v6" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="30" cy="26" r="4" stroke={color} strokeWidth="1.5"/>
  </svg>
);
const DispatchIcon = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
    <path d="M50 40.92v6a4 4 0 01-4.36 4A39.58 39.58 0 0128.4 44.78a39 39 0 01-12-12A39.58 39.58 0 0110.26 15.36 4 4 0 0114.22 11h6a4 4 0 014 3.44c.254 1.92.722 3.806 1.4 5.62a4 4 0 01-.9 4.22L22.18 26.82a32 32 0 0012 12l2.54-2.54a4 4 0 014.22-.9 25.68 25.68 0 005.62 1.4A4 4 0 0150 40.92z" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const ICON_MAP = { camera: CameraIcon, radio: RadioIcon, voice: VoiceIcon, drone: DroneIcon, cad: CadIcon, dispatch: DispatchIcon };

// SVG strings for DOM marker injection
const ICON_SVG = {
  camera: (c) => `<svg width="18" height="18" viewBox="0 0 60 60" fill="none"><path d="M14 42h32a3 3 0 003-3V22a3 3 0 00-3-3h-7l-3-5H24l-3 5h-7a3 3 0 00-3 3v17a3 3 0 003 3z" stroke="${c}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="30" cy="30" r="7" stroke="${c}" stroke-width="3"/></svg>`,
  radio: (c) => `<svg width="18" height="18" viewBox="0 0 60 60" fill="none"><rect x="20" y="10" width="20" height="40" rx="3" stroke="${c}" stroke-width="3"/><rect x="24" y="28" width="12" height="8" rx="1.5" stroke="${c}" stroke-width="2.5"/><line x1="30" y1="10" x2="38" y2="3" stroke="${c}" stroke-width="2.5" stroke-linecap="round"/></svg>`,
  voice: (c) => `<svg width="18" height="18" viewBox="0 0 60 60" fill="none"><path d="M12 33.6V26.4" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/><path d="M15.6 40.8V19.2" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/><path d="M19.2 44.4V15.6" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/><path d="M22.8 40.8V19.2" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/><path d="M26.4 37.8V22.2" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/><path d="M30 33.6V26.4" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/><path d="M33.6 37.8V22.2" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/><path d="M37.2 33.6V26.4" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/><path d="M40.8 31.8V28.2" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/><path d="M44.4 33.6V26.4" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/><path d="M48 30.4V29.6" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/></svg>`,
  drone: (c) => `<svg width="18" height="18" viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="5" stroke="${c}" stroke-width="2.5"/><line x1="22" y1="22" x2="14" y2="14" stroke="${c}" stroke-width="2.5" stroke-linecap="round"/><line x1="38" y1="22" x2="46" y2="14" stroke="${c}" stroke-width="2.5" stroke-linecap="round"/><line x1="22" y1="38" x2="14" y2="46" stroke="${c}" stroke-width="2.5" stroke-linecap="round"/><line x1="38" y1="38" x2="46" y2="46" stroke="${c}" stroke-width="2.5" stroke-linecap="round"/><circle cx="12" cy="12" r="4" stroke="${c}" stroke-width="2"/><circle cx="48" cy="12" r="4" stroke="${c}" stroke-width="2"/><circle cx="12" cy="48" r="4" stroke="${c}" stroke-width="2"/><circle cx="48" cy="48" r="4" stroke="${c}" stroke-width="2"/></svg>`,
  cad: (c) => `<svg width="18" height="18" viewBox="0 0 60 60" fill="none"><rect x="8" y="12" width="44" height="28" rx="3" stroke="${c}" stroke-width="3"/><path d="M22 46h16M30 40v6" stroke="${c}" stroke-width="3" stroke-linecap="round"/><circle cx="30" cy="26" r="4" stroke="${c}" stroke-width="2"/></svg>`,
};

// ════════════════════════════════════════════════════════
// SENSORS — spread out more naturally around SF SoMa
// ════════════════════════════════════════════════════════
const MAP_CENTER = [-122.413, 37.775];
const MAP_ZOOM = 14.5;

const SENSORS = [
  { id:"cam1",  type:"camera", lng:-122.424, lat:37.784 },
  { id:"cam2",  type:"camera", lng:-122.408, lat:37.783 },
  { id:"cam3",  type:"camera", lng:-122.401, lat:37.777 },
  { id:"cam4",  type:"camera", lng:-122.402, lat:37.768 },
  { id:"cam5",  type:"camera", lng:-122.412, lat:37.764 },
  { id:"cam6",  type:"camera", lng:-122.414, lat:37.779 },  // near incident
  { id:"rad1",  type:"radio",  lng:-122.419, lat:37.783 },
  { id:"rad2",  type:"radio",  lng:-122.403, lat:37.765 },
  { id:"rad3",  type:"radio",  lng:-122.407, lat:37.775 },  // key radio
  { id:"drone1",type:"drone",  lng:-122.400, lat:37.771 },
  { id:"voice1",type:"voice",  lng:-122.410, lat:37.768 },
  { id:"cad1",  type:"cad",    lng:-122.419, lat:37.774 },  // CAD terminal
];
const SM = {
  camera:{color:C.camera,label:"Camera"},radio:{color:C.radio,label:"Radio"},
  voice:{color:C.voice,label:"Voice"},drone:{color:C.drone,label:"Drone"},cad:{color:C.cad,label:"CAD"},
};

// ════════════════════════════════════════════════════════
// STEPS
// ════════════════════════════════════════════════════════
const STEPS = [
  { id:0, phase:"intro",    headline:"The Dispatcher's Second Brain", sub:"Six radio channels. Four 911 calls holding. A critical detail just got buried.", time:null, center:MAP_CENTER, zoom:MAP_ZOOM, bearing:0, pitch:0, activate:[], connect:[], icon:"dispatch" },
  { id:1, phase:"dispatch",  headline:"911 Call Received", sub:"Shots fired reported near Canal & Norman. The clock starts now.", time:"17:43:02", center:[-122.413, 37.777], zoom:15, bearing:10, pitch:30, activate:[], connect:[], icon:"dispatch" },
  { id:2, phase:"voice",     headline:"Radio Transcription", sub:"VoiceBrain captures every word across all channels — transcribed and structured in real time.", time:"17:43:05", center:[-122.413, 37.776], zoom:15.3, bearing:15, pitch:40, activate:["rad3","cad1"], connect:[["rad3","cad1"]], icon:"voice" },
  { id:3, phase:"camera",    headline:"Camera Correlation", sub:"AI automatically correlates the radio call with the nearest camera feed. Suspect vehicle identified.", time:"17:43:08", center:[-122.412, 37.778], zoom:15.8, bearing:20, pitch:45, activate:["cam6"], connect:[["cam6","rad3"],["cam6","cad1"]], icon:"camera" },
  { id:4, phase:"alert",     headline:"KODI Alert Triggered", sub:"Suspect armed. Officer on scene in distress. Command notified instantly.", time:"17:43:12", center:[-122.410, 37.777], zoom:15.5, bearing:15, pitch:40, activate:[], connect:[], icon:"dispatch" },
  { id:5, phase:"response",  headline:"Multi-District Response", sub:"Three districts responding. Pursuit crosses city lines. Everyone sees the same picture.", time:"17:43:15", center:[-122.411, 37.774], zoom:15, bearing:5, pitch:30, activate:["voice1"], connect:[["voice1","rad3"],["voice1","cam6"]], icon:"voice" },
  { id:6, phase:"drone",     headline:"Drone Dispatched", sub:"Aerial unit en route with live video feed. ETA 90 seconds.", time:"17:43:18", center:[-122.406, 37.772], zoom:15.3, bearing:-10, pitch:50, activate:["drone1"], connect:[["drone1","cam6"],["drone1","voice1"]], icon:"drone" },
  { id:7, phase:"result",    headline:"Complete Operational Picture", sub:"20 seconds. Voice, video, CAD — correlated. Information comes to the dispatcher.", time:"17:43:22", center:MAP_CENTER, zoom:MAP_ZOOM, bearing:0, pitch:0, activate:[], connect:[], icon:"cad" },
];
const typeColor = t => t==="dispatch"||t==="alert"?C.dispatch:t==="voice"||t==="response"?C.voice:t==="camera"?C.camera:t==="drone"?C.drone:C.accent;

// ════════════════════════════════════════════════════════
// MAP
// ════════════════════════════════════════════════════════
function MapboxMap({ mapRef, mapContainerRef }) {
  useEffect(() => {
    if (mapRef.current) return;
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: MAP_CENTER, zoom: MAP_ZOOM, bearing: 0, pitch: 0,
      interactive: false, attributionControl: false,
    });
    map.on("load", () => { mapRef.current = map; });
    mapRef.current = map;
    return () => map.remove();
  }, []);
  return <div ref={mapContainerRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />;
}

// ════════════════════════════════════════════════════════
// SENSOR MARKER — with real SVG icons
// ════════════════════════════════════════════════════════
function SensorMarker({ sensor, isActive, map }) {
  const markerRef = useRef(null);
  const elRef = useRef(null);
  const m = SM[sensor.type];

  useEffect(() => {
    if (!map) return;
    const el = document.createElement("div");
    elRef.current = el;
    const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
      .setLngLat([sensor.lng, sensor.lat]).addTo(map);
    markerRef.current = marker;
    return () => marker.remove();
  }, [map, sensor.lng, sensor.lat]);

  useEffect(() => {
    const el = elRef.current; if (!el) return;
    const sz = isActive ? 60 : 30;
    const innerSz = isActive ? 38 : 22;
    el.style.width = `${sz}px`;
    el.style.height = `${sz}px`;
    el.style.transition = "all 0.7s cubic-bezier(0.23,1,0.32,1)";
    el.style.position = "relative";
    el.innerHTML = "";

    if (isActive) {
      for (let d = 0; d < 2; d++) {
        const ring = document.createElement("div");
        ring.style.cssText = `position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:100px;height:100px;border-radius:50%;border:${d===0?2:1.5}px solid ${m.color};animation:vbP 2s ease-out infinite ${d*0.7}s;opacity:${d===0?0.3:0.15};pointer-events:none;`;
        el.appendChild(ring);
      }
    }

    const circle = document.createElement("div");
    circle.style.cssText = `position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:${sz}px;height:${sz}px;border-radius:50%;background:${isActive?m.color:"#111"};border:${isActive?"none":`2px solid ${C.muted}`};display:flex;align-items:center;justify-content:center;box-shadow:${isActive?`0 0 28px ${m.color}55, 0 0 56px ${m.color}22`:"none"};transition:all 0.7s cubic-bezier(0.23,1,0.32,1);`;

    const inner = document.createElement("div");
    inner.style.cssText = `width:${innerSz}px;height:${innerSz}px;border-radius:50%;background:${isActive?"rgba(17,17,17,0.8)":"transparent"};display:flex;align-items:center;justify-content:center;`;
    const svgFn = ICON_SVG[sensor.type];
    if (svgFn) inner.innerHTML = svgFn(isActive ? m.color : C.muted);
    circle.appendChild(inner);
    el.appendChild(circle);

    if (isActive) {
      const label = document.createElement("div");
      label.textContent = m.label.toUpperCase();
      label.style.cssText = `position:absolute;left:50%;top:100%;transform:translate(-50%,10px);font-size:9px;font-weight:700;letter-spacing:2px;color:${m.color};text-shadow:0 0 12px ${m.color}50;white-space:nowrap;font-family:-apple-system,sans-serif;`;
      el.appendChild(label);
    }
  }, [isActive, m, sensor.type]);

  return null;
}

// ════════════════════════════════════════════════════════
// CONNECTION LINES — use Mapbox GeoJSON source/layer for
// pixel-perfect alignment with markers
// ════════════════════════════════════════════════════════
function useConnectionLines(map, connections, mapReady) {
  const sourceAdded = useRef(false);
  const animFrameRef = useRef(null);

  useEffect(() => {
    if (!map || !mapReady) return;

    // Add source and layers once
    if (!sourceAdded.current) {
      map.addSource("vb-connections", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      // Glow layer
      map.addLayer({
        id: "vb-conn-glow",
        type: "line",
        source: "vb-connections",
        paint: {
          "line-color": C.accent,
          "line-width": 6,
          "line-opacity": 0.12,
          "line-blur": 4,
        },
      });
      // Dashed line
      map.addLayer({
        id: "vb-conn-dash",
        type: "line",
        source: "vb-connections",
        paint: {
          "line-color": C.accent,
          "line-width": 1.8,
          "line-opacity": 0.6,
          "line-dasharray": [3, 2],
        },
      });
      sourceAdded.current = true;
    }

    // Update data
    const features = connections.map(([fromId, toId]) => {
      const from = SENSORS.find(s => s.id === fromId);
      const to = SENSORS.find(s => s.id === toId);
      if (!from || !to) return null;
      return {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [[from.lng, from.lat], [to.lng, to.lat]],
        },
      };
    }).filter(Boolean);

    const src = map.getSource("vb-connections");
    if (src) {
      src.setData({ type: "FeatureCollection", features });
    }

    // Animate dash offset
    let dashOffset = 0;
    const animateDash = () => {
      dashOffset = (dashOffset + 0.05) % 5;
      if (map.getLayer("vb-conn-dash")) {
        map.setPaintProperty("vb-conn-dash", "line-dasharray", [3, 2]);
      }
      animFrameRef.current = requestAnimationFrame(animateDash);
    };
    animateDash();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [map, connections, mapReady]);
}

// ════════════════════════════════════════════════════════
// Traveling particle overlays (SVG on top of map)
// ════════════════════════════════════════════════════════
function TravelingParticles({ connections, map }) {
  const [points, setPoints] = useState([]);

  useEffect(() => {
    if (!map || !connections.length) { setPoints([]); return; }
    const update = () => {
      const pts = connections.map(([fromId, toId]) => {
        const from = SENSORS.find(s => s.id === fromId);
        const to = SENSORS.find(s => s.id === toId);
        if (!from || !to) return null;
        const p1 = map.project([from.lng, from.lat]);
        const p2 = map.project([to.lng, to.lat]);
        return { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, key: `${fromId}-${toId}` };
      }).filter(Boolean);
      setPoints(pts);
    };
    map.on("render", update);
    update();
    return () => { map.off("render", update); };
  }, [connections, map]);

  if (!points.length) return null;

  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 6, pointerEvents: "none" }}>
      <defs>
        <filter id="glow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      {points.map((p, i) => (
        <g key={p.key}>
          <circle r="4" fill={C.white} opacity="0.8" filter="url(#glow)">
            <animateMotion dur={`${2 + i * 0.4}s`} repeatCount="indefinite" path={`M${p.x1},${p.y1} L${p.x2},${p.y2}`} keyPoints="0;1" keyTimes="0;1" calcMode="linear" />
          </circle>
          <circle r="2.5" fill={C.accent} opacity="0.5">
            <animateMotion dur={`${2 + i * 0.4}s`} repeatCount="indefinite" begin={`${1 + i * 0.2}s`} path={`M${p.x1},${p.y1} L${p.x2},${p.y2}`} keyPoints="0;1" keyTimes="0;1" calcMode="linear" />
          </circle>
        </g>
      ))}
    </svg>
  );
}

// ════════════════════════════════════════════════════════
// MAP OVERLAY
// ════════════════════════════════════════════════════════
function MapOverlay({ lng, lat, map, children, style }) {
  const [pos, setPos] = useState(null);
  useEffect(() => {
    if (!map) return;
    const update = () => { const p = map.project([lng, lat]); setPos({ x: p.x, y: p.y }); };
    map.on("render", update); update();
    return () => { map.off("render", update); };
  }, [map, lng, lat]);
  if (!pos) return null;
  return <div style={{ position: "absolute", left: pos.x, top: pos.y, ...style }}>{children}</div>;
}

// ════════════════════════════════════════════════════════
// MAIN APP
// ════════════════════════════════════════════════════════
export default function App() {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const [step, setStep] = useState(0);
  const progressRef = useRef(0);
  const containerRef = useRef(null);

  useEffect(() => {
    const check = setInterval(() => {
      if (mapRef.current && mapRef.current.loaded()) { setMapReady(true); clearInterval(check); }
    }, 100);
    return () => clearInterval(check);
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    const s = STEPS[step];
    map.flyTo({ center: s.center, zoom: s.zoom, bearing: s.bearing, pitch: s.pitch, duration: 1500, essential: true });
  }, [step, mapReady]);

  useEffect(() => {
    const el = containerRef.current; if (!el) return;
    const SENS = 0.0008;
    const handleWheel = (e) => {
      e.preventDefault();
      progressRef.current = Math.max(0, Math.min(1, progressRef.current + e.deltaY * SENS));
      setStep(prev => { const n = Math.round(progressRef.current * (STEPS.length - 1)); return prev !== n ? n : prev; });
    };
    let touchY = 0;
    const handleTS = (e) => { touchY = e.touches[0].clientY; };
    const handleTM = (e) => {
      e.preventDefault();
      progressRef.current = Math.max(0, Math.min(1, progressRef.current + (touchY - e.touches[0].clientY) * 0.003));
      touchY = e.touches[0].clientY;
      setStep(prev => { const n = Math.round(progressRef.current * (STEPS.length - 1)); return prev !== n ? n : prev; });
    };
    el.addEventListener("wheel", handleWheel, { passive: false });
    el.addEventListener("touchstart", handleTS, { passive: true });
    el.addEventListener("touchmove", handleTM, { passive: false });
    return () => { el.removeEventListener("wheel", handleWheel); el.removeEventListener("touchstart", handleTS); el.removeEventListener("touchmove", handleTM); };
  }, []);

  const goToStep = useCallback((i) => { progressRef.current = i / (STEPS.length - 1); setStep(i); }, []);

  const state = useMemo(() => {
    const active = new Set(), conns = [];
    for (let i = 0; i <= step; i++) {
      STEPS[i].activate.forEach(id => active.add(id));
      STEPS[i].connect.forEach(c => { if (!conns.some(e => e[0] === c[0] && e[1] === c[1])) conns.push(c); });
    }
    return { active, conns };
  }, [step]);

  // Connection lines via Mapbox layer (pixel-perfect)
  useConnectionLines(mapRef.current, state.conns, mapReady);

  const cur = STEPS[step];
  const { active, conns } = state;
  const isResult = cur.phase === "result";

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%", height: "100vh", overflow: "hidden", background: C.bg, fontFamily: "'SF Pro Display','SF Pro Text',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", color: C.white, display: "flex", touchAction: "none" }}>
      <style>{`
        @keyframes vbP{0%{transform:translate(-50%,-50%) scale(1);opacity:.3}100%{transform:translate(-50%,-50%) scale(3);opacity:0}}
        @keyframes vbGlow{0%,100%{opacity:.6}50%{opacity:1}}
        @keyframes vbBP{0%,100%{box-shadow:0 0 0 0 rgba(221,68,82,.4),inset 0 0 30px rgba(221,68,82,.05)}50%{box-shadow:0 0 0 10px rgba(221,68,82,0),inset 0 0 50px rgba(221,68,82,.12)}}
        @keyframes vbShake{0%,100%{transform:translate(-50%,-100%) scale(1)}10%{transform:translate(calc(-50% - 3px),-100%)}30%{transform:translate(calc(-50% + 3px),-100%)}50%{transform:translate(-50%,-100%) scale(1.02)}70%{transform:translate(calc(-50% + 1px),-100%)}}
        @keyframes vbSlide{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes vbBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(8px)}}
        .mapboxgl-canvas{outline:none}
      `}</style>

      {/* ═══════ LEFT: FIXED TIMELINE TOC ═══════ */}
      <div style={{ width: 340, minWidth: 340, height: "100%", display: "flex", flexDirection: "column", zIndex: 20, background: "rgba(8,14,22,0.97)", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ padding: "28px 28px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: 11, letterSpacing: 4, color: C.accent, fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>VoiceBrain AI</div>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1.25 }}>Command & Dispatch<br />Operations</div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
          {STEPS.map((s, i) => {
            const isActive = step === i, isPast = step > i;
            const color = typeColor(s.phase);
            const Ic = ICON_MAP[s.icon];
            return (
              <div key={s.id} onClick={() => goToStep(i)} style={{
                display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 24px", cursor: "pointer",
                background: isActive ? "rgba(96,166,251,0.06)" : "transparent",
                borderLeft: isActive ? `3px solid ${color}` : "3px solid transparent",
                transition: "all 0.4s ease", opacity: isActive ? 1 : isPast ? 0.45 : 0.22,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%", flexShrink: 0, marginTop: 1,
                  background: isActive ? color : isPast ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)",
                  display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.4s ease",
                  boxShadow: isActive ? `0 0 16px ${color}50` : "none",
                }}>
                  <Ic size={16} color={isActive ? "#111" : isPast ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.12)"} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {s.time && <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.5, color: isActive ? color : "rgba(255,255,255,0.25)", fontVariantNumeric: "tabular-nums", marginBottom: 2 }}>{s.time}</div>}
                  <div style={{ fontSize: 14, fontWeight: isActive ? 700 : 500, color: isActive ? C.white : "rgba(255,255,255,0.45)", transition: "all 0.4s ease", lineHeight: 1.35 }}>{s.headline}</div>
                  {isActive && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.5, marginTop: 6 }}>{s.sub}</div>}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ padding: "18px 24px", borderTop: "1px solid rgba(255,255,255,0.06)", minHeight: 80 }}>
          {step === 0 && <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <div style={{ fontSize: 10, letterSpacing: 2, color: C.danger, fontWeight: 600, textTransform: "uppercase", marginBottom: 2 }}>Pain Points</div>
            {["No real-time radio transcription", "Manual correlation of audio, video, sensors", "Critical details lost in noise"].map((p, j) => (
              <div key={j} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "rgba(255,255,255,0.45)" }}><span style={{ color: C.danger, fontSize: 8 }}>●</span>{p}</div>
            ))}
          </div>}
          {step === 7 && <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <div style={{ fontSize: 10, letterSpacing: 2, color: C.accent, fontWeight: 600, textTransform: "uppercase", marginBottom: 2 }}>Results</div>
            {["Complete visibility", "Faster response", "Safer officers"].map((r, j) => (
              <div key={j} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "rgba(255,255,255,0.55)" }}><span style={{ color: C.accent, fontWeight: 700 }}>✓</span>{r}</div>
            ))}
          </div>}
          {step > 0 && step < 7 && <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            {Object.entries(SM).map(([k, v]) => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 0.5 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: v.color }} />{v.label}
              </div>
            ))}
          </div>}
        </div>
      </div>

      {/* ═══════ RIGHT: MAP ═══════ */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <MapboxMap mapRef={mapRef} mapContainerRef={mapContainerRef} />

        {mapReady && SENSORS.map(s => <SensorMarker key={s.id} sensor={s} isActive={active.has(s.id)} map={mapRef.current} />)}

        {/* Traveling particles overlay */}
        {mapReady && <TravelingParticles connections={conns} map={mapRef.current} />}

        {/* ── SHOTS FIRED ── */}
        {mapReady && step >= 1 && step < 7 && (
          <MapOverlay lng={-122.413} lat={37.781} map={mapRef.current} style={{ transform: "translate(-50%,-100%)", zIndex: 22, pointerEvents: "none", animation: "vbShake 0.6s ease 0.2s both" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 24px", borderRadius: 50, background: "rgba(0,0,0,0.85)", border: `2px solid ${C.danger}`, backdropFilter: "blur(24px)", animation: "vbBP 2s ease infinite", whiteSpace: "nowrap" }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: C.dispatch, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#111", display: "flex", alignItems: "center", justifyContent: "center" }}><DispatchIcon size={20} color={C.dispatch} /></div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: C.danger, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", marginBottom: 2 }}>● Active Incident</div>
                <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5, lineHeight: 1.1 }}>Shots Fired — 5:43 PM</div>
                <div style={{ display: "flex", gap: 6, marginTop: 5 }}>
                  <span style={{ padding: "2px 12px", borderRadius: 40, background: C.dangerBg, color: C.danger, fontSize: 10, fontWeight: 600 }}>Assault</span>
                  <span style={{ padding: "2px 12px", borderRadius: 40, background: "rgba(96,166,251,0.12)", color: C.accent, fontSize: 10, fontWeight: 500 }}>Canal & Norman</span>
                </div>
              </div>
            </div>
          </MapOverlay>
        )}

        {/* ── Voice transcription ── */}
        {mapReady && step >= 2 && step < 7 && (
          <MapOverlay lng={-122.422} lat={37.773} map={mapRef.current} style={{ transform: "translate(-50%,-50%)", zIndex: 15, pointerEvents: "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 20px", borderRadius: 40, background: C.glass, border: `1px solid ${C.glassBorder}`, backdropFilter: "blur(24px)", whiteSpace: "nowrap" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: C.voice, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#111", display: "flex", alignItems: "center", justifyContent: "center" }}><VoiceIcon size={18} color={C.voice} /></div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: C.accent, fontWeight: 600, letterSpacing: 1 }}>Voice Capture</div>
                <span style={{ fontSize: 15, fontWeight: 700 }}><span style={{ color: C.radio }}>"</span>Shots fired bear Canal and Norman<span style={{ color: C.radio }}>"</span></span>
              </div>
            </div>
          </MapOverlay>
        )}

        {/* ── Camera Match tooltip ── */}
        {mapReady && step >= 3 && step < 7 && (
          <MapOverlay lng={-122.414} lat={37.779} map={mapRef.current} style={{ transform: "translate(30px, -100%)", zIndex: 18, pointerEvents: "none" }}>
            <div style={{ background: C.glass, border: `1px solid ${C.glassBorder}`, borderRadius: 12, padding: "12px 18px", textAlign: "center", backdropFilter: "blur(20px)", maxWidth: 210 }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, marginBottom: 4, color: C.camera, textTransform: "uppercase" }}>● Camera Match</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.88)", lineHeight: 1.4 }}>Suspect vehicle identified at Canal & Norman</div>
            </div>
          </MapOverlay>
        )}

        {/* ── KODI Alert ── */}
        {mapReady && step >= 4 && step < 7 && (
          <MapOverlay lng={-122.400} lat={37.781} map={mapRef.current} style={{ transform: "translate(-50%,-50%)", zIndex: 25, pointerEvents: "none" }}>
            <div style={{ width: 230, borderRadius: 14, background: "rgba(30,30,30,0.9)", border: `2px solid rgba(221,68,82,0.5)`, backdropFilter: "blur(35px)", textAlign: "center", overflow: "hidden", boxShadow: `0 0 40px rgba(221,68,82,0.15),0 16px 48px rgba(0,0,0,0.5)` }}>
              <div style={{ padding: "14px 14px 4px", fontSize: 15, fontWeight: 700, color: C.danger }}>⚠ KODI Alert</div>
              <div style={{ padding: "0 14px 12px", fontSize: 12, color: "rgba(255,255,255,0.88)", lineHeight: 1.45 }}>Suspect armed. Officer on scene in distress.</div>
              <div style={{ display: "flex", borderTop: "1px solid rgba(84,84,88,0.65)" }}>
                <div style={{ flex: 1, padding: "9px 0", fontSize: 13, color: "#0A84FF", textAlign: "center" }}>Delete</div>
                <div style={{ width: 1, background: "rgba(84,84,88,0.65)" }} />
                <div style={{ flex: 1, padding: "9px 0", fontSize: 13, color: "#0A84FF", fontWeight: 600, textAlign: "center" }}>Open</div>
              </div>
            </div>
          </MapOverlay>
        )}

        {/* ── Multi-District Speech Bubble ── */}
        {mapReady && step >= 5 && step < 7 && (
          <MapOverlay lng={-122.408} lat={37.770} map={mapRef.current} style={{ transform: "translate(-50%, -100%)", zIndex: 18, pointerEvents: "none" }}>
            <div style={{ background: "rgba(40,42,48,0.92)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 12, padding: "12px 20px", maxWidth: 280, fontSize: 14, lineHeight: 1.4, letterSpacing: -0.3, backdropFilter: "blur(15px)" }}>
              <span style={{ color: C.accent, fontWeight: 600, fontSize: 10, letterSpacing: 1, display: "block", marginBottom: 4 }}>Multi-District</span>
              Three districts responding. Pursuit crosses city lines.
              <div style={{ position: "absolute", bottom: -7, left: 28, width: 14, height: 14, background: "rgba(40,42,48,0.92)", border: "1px solid rgba(255,255,255,0.18)", borderTop: "none", borderLeft: "none", transform: "rotate(45deg)", borderRadius: "0 0 3px 0" }} />
            </div>
          </MapOverlay>
        )}

        {/* LIVE badge */}
        {step > 0 && step < STEPS.length - 1 && (
          <div style={{ position: "absolute", top: 18, right: 20, zIndex: 30, display: "flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 20, background: "rgba(221,68,82,0.12)", border: "1px solid rgba(221,68,82,0.25)" }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.danger, animation: "vbGlow 1.5s ease infinite" }} />
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 2, color: C.danger }}>LIVE</span>
          </div>
        )}

        {/* Result overlay */}
        {isResult && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(8,14,22,0.88)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 40, animation: "vbSlide 0.8s ease both" }}>
            <div style={{ textAlign: "center", maxWidth: 500, padding: "0 32px" }}>
              <div style={{ fontSize: 11, letterSpacing: 4, color: C.accent, fontWeight: 600, textTransform: "uppercase", marginBottom: 14 }}>The Result</div>
              <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: -1.2, marginBottom: 16, background: `linear-gradient(135deg,${C.white},${C.accent})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.15 }}>Complete Operational Picture</div>
              <div style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, marginBottom: 40 }}>Every radio transmission — transcribed, searchable, correlated with video and CAD in real time.</div>
              <div style={{ display: "flex", gap: 44, justifyContent: "center", marginBottom: 36 }}>
                {[{ v: "6", l: "Radio Channels", c: C.voice }, { v: "20s", l: "Time to Picture", c: C.camera }, { v: "0", l: "Details Lost", c: C.radio }].map((s, j) => (
                  <div key={j}><div style={{ fontSize: 42, fontWeight: 700, letterSpacing: -2, color: s.c }}>{s.v}</div><div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: 1.5, textTransform: "uppercase", marginTop: 3 }}>{s.l}</div></div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 28, justifyContent: "center" }}>
                {["Complete visibility", "Faster response", "Safer officers"].map((r, j) => (
                  <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "rgba(255,255,255,0.6)" }}><span style={{ color: C.accent, fontWeight: 700, fontSize: 16 }}>✓</span>{r}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Progress bar */}
        <div style={{ position: "absolute", bottom: 0, left: 0, height: 3, zIndex: 50, width: `${(step / (STEPS.length - 1)) * 100}%`, background: `linear-gradient(90deg,${C.voice},${C.accent},${C.camera})`, transition: "width 0.5s ease" }} />

        {/* Scroll hint */}
        {step === 0 && (
          <div style={{ position: "absolute", bottom: 48, left: "50%", transform: "translateX(-50%)", zIndex: 35, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, pointerEvents: "none" }}>
            <div style={{ padding: "10px 28px", borderRadius: 30, background: "rgba(96,166,251,0.1)", border: "1px solid rgba(96,166,251,0.25)", backdropFilter: "blur(10px)" }}>
              <span style={{ fontSize: 12, color: C.accent, letterSpacing: 2.5, fontWeight: 600 }}>SCROLL TO EXPLORE</span>
            </div>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2" strokeLinecap="round" style={{ animation: "vbBounce 1.5s ease infinite", opacity: 0.6 }}>
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
