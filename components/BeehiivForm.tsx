/**
 * NotionForm.tsx
 * Replaces BeehiivForm. Submits name + email to a Cloudflare Worker proxy,
 * which securely writes to the Notion "AI Nexus Leads" database.
 *
 * ─── SETUP REQUIRED ────────────────────────────────────────────────────────
 * Replace WORKER_URL below with your deployed Cloudflare Worker URL.
 * Example: https://ai-nexus-leads.navneetarya1989.workers.dev
 * ───────────────────────────────────────────────────────────────────────────
 */

import React, { useState } from 'react';
import { Mail, CheckCircle, Loader2 } from 'lucide-react';
import { SITE_CONFIG } from '../constants';

// 👇 Replace this with your Cloudflare Worker URL after deploying it
const WORKER_URL = 'https://ai-nexus-leads.navneetarya1989.workers.dev';

// ─────────────────────────────────────────────────────────────────────────────

type SubmitState = 'idle' | 'loading' | 'success' | 'error';

interface NotionFormProps {
  variant?: 'hero' | 'article';
}

function useSubscribeForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [state, setState] = useState<SubmitState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setState('loading');
    setErrorMsg('');

    try {
      const res = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as any).error || 'Subscription failed');
      }

      setState('success');
      setName('');
      setEmail('');
    } catch (err: any) {
      setState('error');
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    }
  }

  return { name, setName, email, setEmail, state, errorMsg, handleSubmit };
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared form fields + button
// ─────────────────────────────────────────────────────────────────────────────

function FormFields({
  name, setName, email, setEmail, state, errorMsg, handleSubmit,
}: ReturnType<typeof useSubscribeForm>) {

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '9px 13px',
    borderRadius: 8,
    border: '1.5px solid var(--a1-brd)',
    background: 'var(--bg)',
    color: 'var(--txt)',
    fontSize: 13.5,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.18s',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11.5,
    fontWeight: 600,
    color: 'var(--mut)',
    marginBottom: 4,
    display: 'block',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  };

  if (state === 'success') {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 16px',
        background: 'rgba(13,148,136,.10)',
        border: '1.5px solid var(--a1-brd)',
        borderRadius: 10,
      }}>
        <CheckCircle size={18} color="var(--a1)" strokeWidth={2.5} />
        <span style={{ fontSize: 13.5, color: 'var(--txt)', fontWeight: 600 }}>
          You're in! Check your inbox for updates.
        </span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Name row */}
      <div>
        <label style={labelStyle}>Name <span style={{ color: 'var(--mut2)', fontWeight: 400, textTransform: 'none', fontSize: 11 }}>(optional)</span></label>
        <input
          type="text"
          placeholder="Navneet"
          value={name}
          onChange={e => setName(e.target.value)}
          disabled={state === 'loading'}
          style={inputStyle}
          onFocus={e => (e.target.style.borderColor = 'var(--a1)')}
          onBlur={e => (e.target.style.borderColor = 'var(--a1-brd)')}
        />
      </div>

      {/* Email + button row */}
      <div>
        <label style={labelStyle}>Email <span style={{ color: '#f87171', fontSize: 11 }}>*</span></label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            disabled={state === 'loading'}
            style={{ ...inputStyle, flex: 1 }}
            onFocus={e => (e.target.style.borderColor = 'var(--a1)')}
            onBlur={e => (e.target.style.borderColor = 'var(--a1-brd)')}
          />
          <button
            type="submit"
            disabled={state === 'loading' || !email.trim()}
            style={{
              padding: '9px 18px',
              borderRadius: 8,
              border: 'none',
              background: 'var(--a1)',
              color: '#fff',
              fontSize: 13.5,
              fontWeight: 700,
              fontFamily: "'Syne', sans-serif",
              cursor: state === 'loading' ? 'not-allowed' : 'pointer',
              opacity: state === 'loading' || !email.trim() ? 0.7 : 1,
              transition: 'opacity 0.15s, transform 0.12s',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
            onMouseEnter={e => { if (state !== 'loading') (e.currentTarget.style.transform = 'scale(1.02)'); }}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            {state === 'loading'
              ? <><Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Subscribing…</>
              : 'Subscribe'}
          </button>
        </div>
      </div>

      {/* Error */}
      {state === 'error' && (
        <p style={{ fontSize: 12, color: '#f87171', margin: 0 }}>⚠ {errorMsg}</p>
      )}

      {/* Fine print */}
      <p style={{ fontSize: 11, color: 'var(--mut2)', margin: 0, lineHeight: 1.5 }}>
        No spam. Unsubscribe anytime. Free weekly digest.
      </p>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────

export function NotionForm({ variant = 'hero' }: NotionFormProps) {
  return variant === 'hero' ? <HeroStrip /> : <ArticleCard />;
}

// Keep old name working so you don't need to update every import
export { NotionForm as BeehiivForm };

// ─────────────────────────────────────────────────────────────────────────────
// Hero strip (same layout as old BeehiivForm hero)
// ─────────────────────────────────────────────────────────────────────────────

function HeroStrip() {
  const formState = useSubscribeForm();

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(13,148,136,.07) 0%, rgba(13,148,136,.03) 100%)',
      borderTop: '1px solid var(--a1-brd)',
      borderBottom: '1px solid var(--a1-brd)',
      padding: '26px 24px',
    }}>
      <div style={{
        maxWidth: 820, margin: '0 auto',
        display: 'flex', alignItems: 'flex-start', gap: 28, flexWrap: 'wrap',
      }}>
        {/* Left: icon + title + sub-copy */}
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

        {/* Right: form */}
        <div style={{ flex: '1 1 300px', minWidth: 260 }}>
          <FormFields {...formState} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Article card (same layout as old BeehiivForm article)
// ─────────────────────────────────────────────────────────────────────────────

function ArticleCard() {
  const formState = useSubscribeForm();

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

      <FormFields {...formState} />
    </div>
  );
}
