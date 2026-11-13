import React from 'react';

// components/AudioSample.tsx
//
// Renders a single <audio> player with a caption, for voice/audio tool pages.
// Deliberately minimal — no custom player chrome — so it degrades to the browser's
// native controls and needs no JavaScript to work once hydrated.
// Only renders when `src` is set; callers should not render this component at all
// if tool.audioSample is undefined (keeps empty states out of the DOM entirely).

interface AudioSampleProps {
  src: string;
  caption: string;
  durationLabel?: string;
  accent: string;
  cardBg: string;
  cardBrd: string;
  textColor: string;
  mutedColor: string;
}

export default function AudioSample({
  src,
  caption,
  durationLabel,
  accent,
  cardBg,
  cardBrd,
  textColor,
  mutedColor,
}: AudioSampleProps) {
  return (
    <div
      style={{
        background: cardBg,
        border: `1px solid ${cardBrd}`,
        borderRadius: 12,
        padding: '18px 20px',
        marginBottom: 14,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: accent,
          letterSpacing: '0.08em',
          textTransform: 'uppercase' as const,
          marginBottom: 10,
        }}
      >
        Audio sample
      </div>
      <audio controls preload="none" src={src} style={{ width: '100%', marginBottom: 10 }}>
        Your browser does not support embedded audio. <a href={src}>Download the sample</a> instead.
      </audio>
      <p style={{ fontSize: 13, color: mutedColor, lineHeight: 1.6, margin: 0, fontWeight: 300 }}>
        {caption}
        {durationLabel ? ` (${durationLabel})` : ''}
      </p>
      <p style={{ fontSize: 11, color: mutedColor, margin: '6px 0 0', fontWeight: 300 }}>
        Generated through our own account, not vendor-supplied marketing audio.
      </p>
    </div>
  );
}
