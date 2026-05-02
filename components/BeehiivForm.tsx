/**
 * BeehiivForm.tsx — Native dark-themed form, submits to Beehiiv silently.
 * No iframe, no popup. Fully matches the AI Nexus brand theme.
 */

import React, { useState } from 'react';
import { Mail, ArrowRight, CheckCircle, Loader, AlertCircle } from 'lucide-react';
import { SITE_CONFIG } from '../constants';

interface BeehiivFormProps {
  variant?: 'hero' | 'article';
}

const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

// Submit email to Beehiiv silently using a hidden form post (no-cors)
async function submitToBeehiiv(email: string): Promise<void> {
  const body = new URLSearchParams({ email });
  await fetch('https://ainexus-weekly.beehiiv.com/', {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  // no-cors means we can't read the response — we optimistically show success
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared email row
// ─────────────────────────────────────────────────────────────────────────────
function EmailRow({
  email, setEmail, status, errMsg, onSubmit,
}: {
  email: string;
  setEmail: (v: string) => void;
  status: 'idle' | 'loading' | 'success' | 'error';
  errMsg: string;
  onSubmit: () => void;
}) {
  const isLoading = status === 'loading';
  const hasError  = status === 'error';

  if (status === 'success') {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 16px',
        background: 'rgba(16,185,129,.08)',
        border: '1.5px solid rgba(16,185,129,.25)',
        borderRadius: 12,
      }}>
        <CheckCircle size={20} color="#10b981" style={{ flexShrink: 0 }} />
        <div>
          <div style={{
            fontFamily: "'Syne', sans-serif", fontWeight: 700,
            fontSize: 14, color: 'var(--txt)', marginBottom: 2,
          }}>
            You're on the list! 🎉
          </div>
          <div style={{ fontSize: 12, color: 'var(--mut)', lineHeight: 1.5 }}>
            Check your inbox to confirm — then you're all set.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
        {/* Input */}
        <div style={{ position: 'relative', flex: 1 }}>
          <Mail
            size={14}
            style={{
              position: 'absolute', left: 12, top: '50%',
              transform: 'translateY(-50%)',
              color: hasError ? '#ef4444' : 'var(--mut2)',
              pointerEvents: 'none',
            }}
          />
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onSubmit()}
            disabled={isLoading}
            style={{
              width: '100%', height: 44,
              paddingLeft: 36, paddingRight: 14,
              border: `1.5px solid ${hasError ? '#ef4444' : 'var(--a1-brd)'}`,
              borderRadius: 10, fontSize: 14,
              outline: 'none', boxSizing: 'border-box',
              fontFamily: "'DM Sans', sans-serif",
              background: 'var(--surf)', color: 'var(--txt)',
              opacity: isLoading ? 0.6 : 1,
              transition: 'border-color 0.15s',
            }}
            onFocus={e  => { e.target.style.borderColor = 'var(--a1)'; }}
            onBlur={e   => { e.target.style.borderColor = hasError ? '#ef4444' : 'var(--a1-brd)'; }}
          />
        </div>

        {/* Button */}
        <button
          onClick={onSubmit}
          disabled={isLoading}
          style={{
            height: 44, padding: '0 18px',
            background: isLoading
              ? 'rgba(13,148,136,.5)'
              : 'linear-gradient(135deg, var(--a1), #0b7a6e)',
            color: '#fff', border: 'none', borderRadius: 10,
            fontSize: 13.5, fontWeight: 700,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontFamily: "'DM Sans', sans-serif",
            display: 'flex', alignItems: 'center', gap: 6,
            whiteSpace: 'nowrap',
            boxShadow: isLoading ? 'none' : '0 3px 10px rgba(13,148,136,.35)',
            flexShrink: 0,
            transition: 'all 0.2s ease',
          }}
        >
          {isLoading
            ? <><Loader size={13} style={{ animation: 'spin 1s linear infinite' }} /> Subscribing…</>
            : <>Subscribe <ArrowRight size={13} /></>
          }
        </button>
      </div>

      {/* Error */}
      {hasError && errMsg && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          marginTop: 7, fontSize: 12, color: '#ef4444',
        }}>
          <AlertCircle size={12} /> {errMsg}
        </div>
      )}

      <p style={{ fontSize: 11, color: 'var(--mut2)', margin: '7px 0 0', lineHeight: 1.5 }}>
        No spam. Unsubscribe anytime. Free weekly digest.
      </p>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared submit logic hook
// ─────────────────────────────────────────────────────────────────────────────
function useSubscribe() {
  const [email,  setEmail]  = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errMsg, setErrMsg] = useState('');

  const handleSubmit = async () => {
    if (!isValidEmail(email)) {
      setErrMsg('Please enter a valid email address.');
      setStatus('error');
      return;
    }
    setStatus('loading');
    setErrMsg('');
    try {
      await submitToBeehiiv(email);
      setStatus('success');
    } catch {
      setStatus('error');
      setErrMsg('Something went wrong. Please try again.');
    }
  };

  return { email, setEmail, status, errMsg, handleSubmit };
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────
export function BeehiivForm({ variant = 'hero' }: BeehiivFormProps) {
  const sub = useSubscribe();
  return variant === 'hero'
    ? <HeroStrip  {...sub} />
    : <ArticleCard {...sub} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hero strip
// ─────────────────────────────────────────────────────────────────────────────
function HeroStrip(props: ReturnType<typeof useSubscribe>) {
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
        {/* Copy */}
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

        {/* Form */}
        <div style={{ flex: '1 1 300px', minWidth: 260 }}>
          <EmailRow
            email={props.email}
            setEmail={props.setEmail}
            status={props.status}
            errMsg={props.errMsg}
            onSubmit={props.handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Article card
// ─────────────────────────────────────────────────────────────────────────────
function ArticleCard(props: ReturnType<typeof useSubscribe>) {
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

      <EmailRow
        email={props.email}
        setEmail={props.setEmail}
        status={props.status}
        errMsg={props.errMsg}
        onSubmit={props.handleSubmit}
      />
    </div>
  );
}
