/**
 * BeehiivForm.tsx
 * Uses beehiiv's official v3 embed script injected via useEffect.
 * Keeps the original branded wrapper (gradient strip / article card).
 */

import React, { useEffect, useRef } from 'react';
import { Mail } from 'lucide-react';
import { SITE_CONFIG } from '../constants';

interface BeehiivFormProps {
  variant?: 'hero' | 'article';
}

const BEEHIIV_FORM_ID = '6823bb76-8ce8-4571-99d4-e9cd15027dc9';

// ─────────────────────────────────────────────────────────────────────────────
// Injects the beehiiv v3 loader script into a div ref so it renders
// the real subscribe form exactly where the embed code expects to live.
// ─────────────────────────────────────────────────────────────────────────────
function BeehiivEmbed() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Avoid double-injection on re-renders
    if (container.querySelector('script')) return;

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://subscribe-forms.beehiiv.com/v3/loader.js';
    script.setAttribute('data-beehiiv-form', BEEHIIV_FORM_ID);
    container.appendChild(script);
  }, []);

  return (
    <div>
      <div ref={containerRef} />
      <p style={{ fontSize: 11, color: 'var(--mut2)', margin: '7px 0 0', lineHeight: 1.5 }}>
        No spam. Unsubscribe anytime. Free weekly digest.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────
export function BeehiivForm({ variant = 'hero' }: BeehiivFormProps) {
  return variant === 'hero' ? <HeroStrip /> : <ArticleCard />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hero strip
// ─────────────────────────────────────────────────────────────────────────────
function HeroStrip() {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(13,148,136,.07) 0%, rgba(13,148,136,.03) 100%)',
      borderTop: '1px solid var(--a1-brd)',
      borderBottom: '1px solid var(--a1-brd)',
      padding: '26px 24px',
    }}>
      <div style={{
        maxWidth: 820, margin: '0 auto',
        display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap',
      }}>
        {/* Left: title + sub-copy */}
        <div style={{ flex: '0 0 auto', maxWidth: 270 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 5 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8, background: 'var(--a1)',
              flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(13,148,136,.35)',
            }}>
              <Mail size={14} color="#fff" />
            </div>
            <span style={{
              fontFamily: "'Syne', sans-serif", fontWeight: 800,
              fontSize: 14.5, color: 'var(--txt)', letterSpacing: '-0.02em',
            }}>
              New AI tool reviews
            </span>
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--mut)', margin: '0 0 0 39px', lineHeight: 1.6 }}>
            {SITE_CONFIG.newsletterNote}
          </p>
        </div>

        {/* Right: beehiiv embed */}
        <div style={{ flex: '1 1 300px', minWidth: 260 }}>
          <BeehiivEmbed />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Article card
// ─────────────────────────────────────────────────────────────────────────────
function ArticleCard() {
  return (
    <div style={{
      background: 'var(--a1-card)',
      border: '1.5px solid var(--a1-brd)',
      borderRadius: 16, padding: '1.5rem', margin: '2.5rem 0',
      boxShadow: '0 4px 20px rgba(13,148,136,.09)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 9, background: 'var(--a1)',
          flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 10px rgba(13,148,136,.30)',
        }}>
          <Mail size={16} color="#fff" />
        </div>
        <div>
          <div style={{
            fontFamily: "'Syne', sans-serif", fontWeight: 800,
            fontSize: 15, color: 'var(--txt)', letterSpacing: '-0.02em', lineHeight: 1.2,
          }}>
            Found this useful?
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--mut)', marginTop: 2 }}>
            {SITE_CONFIG.newsletterNote}
          </div>
        </div>
      </div>

      <BeehiivEmbed />
    </div>
  );
}
