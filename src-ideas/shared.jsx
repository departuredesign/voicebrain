// Shared tokens, logo, and primitives for VoiceBrain homepage concepts.
import React from 'react';

export const VB_TOKENS = {
  ink:        '#101923',
  inkDeep:    '#080e16',
  inkSoft:    '#1a2433',
  paper:      '#ffffff',
  paperWarm:  '#fdefdc',
  line:       '#283e57',
  lineSoft:   'rgba(220,225,229,0.18)',
  mute:       '#dce1e5',
  muteDim:    '#7b8794',

  // sensor palette (from existing demo)
  camera:   '#FF585F',
  radio:    '#E8FB56',
  voice:    '#507FE5',
  cad:      '#ACCDF6',
  dispatch: '#8E52E8',
  drone:    '#56FBBE',
  danger:   '#DD4452',

  // type
  display:  "'Inter Tight', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  body:     "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  mono:     "'IBM Plex Mono', ui-monospace, 'SF Mono', Menlo, monospace",
};

export function VBLogo({ height = 22 }) {
  return (
    <img src="/ideas/assets/vb-logo.svg" alt="VoiceBrain"
      style={{ height, width: 'auto', display: 'block' }} />
  );
}

export function VBNav({ accent }) {
  const c = VB_TOKENS.paper;
  const items = ['Platform', 'Use Cases', 'Customers', 'Company', 'Blog'];
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '20px 56px', color: c,
      borderBottom: `1px solid ${VB_TOKENS.lineSoft}`,
    }}>
      <VBLogo height={22} />
      <nav style={{ display: 'flex', gap: 32, fontFamily: VB_TOKENS.body, fontSize: 14, fontWeight: 500 }}>
        {items.map(i => <a key={i} style={{ color: c, opacity: 0.75, textDecoration: 'none' }}>{i}</a>)}
      </nav>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontFamily: VB_TOKENS.body, fontSize: 14 }}>
        <a style={{ color: c, opacity: 0.75 }}>Sign in</a>
        <button style={{
          padding: '9px 18px', borderRadius: 999,
          background: accent || VB_TOKENS.paper,
          color: VB_TOKENS.ink,
          border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer',
        }}>Book a demo</button>
      </div>
    </div>
  );
}

export function LiveInMarketBadge({ inverted = false }) {
  const c = inverted ? VB_TOKENS.paper : VB_TOKENS.ink;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 10,
      padding: '6px 12px 6px 8px', borderRadius: 999,
      background: inverted ? 'rgba(255,255,255,0.06)' : 'rgba(16,25,35,0.04)',
      border: `1px solid ${inverted ? 'rgba(255,255,255,0.18)' : 'rgba(16,25,35,0.12)'}`,
      fontFamily: VB_TOKENS.body, fontSize: 12, color: c,
    }}>
      <span style={{
        width: 8, height: 8, borderRadius: '50%', background: VB_TOKENS.danger,
        boxShadow: `0 0 0 4px ${inverted ? 'rgba(221,68,82,0.18)' : 'rgba(221,68,82,0.12)'}`,
        animation: 'vbPulse 1.6s ease-in-out infinite',
      }} />
      <span style={{ fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase' }}>Live in 12 agencies · 3M radio hrs ingested</span>
    </div>
  );
}

export function CustomerStrip({ inverted = false }) {
  const c = inverted ? 'rgba(255,255,255,0.55)' : 'rgba(16,25,35,0.5)';
  const logos = [
    { label: 'METRO PD', glyph: '★' },
    { label: 'COUNTY OEM', glyph: '◆' },
    { label: 'CITY 911', glyph: '●' },
    { label: 'STATE PATROL', glyph: '▲' },
    { label: 'PORT AUTH', glyph: '◇' },
    { label: 'TRANSIT OPS', glyph: '✦' },
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 48, color: c, fontFamily: VB_TOKENS.mono, fontSize: 12, letterSpacing: 1.5 }}>
      {logos.map((l, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: 0.85 }}>
          <span style={{ fontSize: 16 }}>{l.glyph}</span>
          <span>{l.label}</span>
        </div>
      ))}
    </div>
  );
}

export function SensorIcon({ type, size = 20, opacity = 1 }) {
  return <img src={`/ideas/assets/icons/${type}.png`} alt="" style={{ width: size, height: size, objectFit: 'contain', opacity, display: 'block' }} />;
}
