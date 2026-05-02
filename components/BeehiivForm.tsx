/**
 * BeehiivForm.tsx — Custom email capture, no iframe
 * Submits to Beehiiv's subscribe page with email pre-filled.
 * Looks native to the AI Nexus theme — no external branding.
 */

import React, { useState } from 'react';
import { Mail, ArrowRight, CheckCircle, Loader } from 'lucide-react';
import { SITE_CONFIG } from '../constants';

interface BeehiivFormProps {
  variant?: 'hero' | 'article';
}

const C = {
  a1:     'var(--a1)',
  a1card: 'var(--a1-card)',
  a1brd:  'var(--a1-brd)',
  surf:   'var(--surf)',
  txt:    'var(--txt)',
  mut:    'var(--mut)',
  mut2:   'var(--mut2)',
};

// Your Beehiiv publication subscribe URL
const BEEHIIV_URL = (SITE_CONFIG as any).beehiivEmbedUrl as string;

export function BeehiivForm({ variant = 'hero' }: BeehiivFormProps) {
  const [email,   setEmail]   = useState('');
  const [status,  setStatus]  = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errMsg,  setErrMsg]  = useState('');

  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleSubmit = async () => {
    if (!isValidEmail(email)) {
      setErrMsg('Please enter a valid email address.');
      setStatus('error');
      return;
    }
    setStatus('loading');
    setErrMsg('');

    try {
      // Open Beehiiv subscribe page in new tab with email pre-filled
      const base = BEEHIIV_URL.replace(/\/$/, '');
      window.open(`${base}/subscribe?email=${encodeURIComponent(email)}`, '_blank');
      setStatus('success');
    } catch {
      setStatus('error');
      setErrMsg('Something went wrong. Please try again.');
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  // ── SUCCESS state ─────────────────────────────────────────────────────────
  if (status === 'success') {
    return (
      <SuccessState variant={variant} />
    );
  }

  // ── HERO variant ──────────────────────────────────────────────────────────
  if (variant === 'hero') {
    return (
      <div style={{
        background:   'linear-gradient(135deg,rgba(13,148,136,.07) 0%,rgba(13,148,136,.03) 100%)',
        borderTop:    `1px solid ${C.a1brd}`,
        borderBottom: `1px solid ${C.a1brd}`,
        padding: '26px 24px',
      }}>
        <div style={{ maxWidth:820, margin:'0 auto', display:'flex',
          alignItems:'center', gap:28, flexWrap:'wrap' as const }}>

          {/* Copy */}
          <div style={{ flex:'0 0 auto', maxWidth:270 }}>
            <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:5 }}>
              <div style={{ width:30, height:30, borderRadius:8, background:C.a1,
                flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow:'0 2px 8px rgba(13,148,136,.35)' }}>
                <Mail size={14} color="#fff" />
              </div>
              <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:14.5,
                color:C.txt, letterSpacing:'-0.02em' }}>
                New AI tool reviews
              </span>
            </div>
            <p style={{ fontSize:12.5, color:C.mut, margin:'0 0 0 39px', lineHeight:1.6 }}>
              {SITE_CONFIG.newsletterNote}
            </p>
          </div>

          {/* Form */}
          <div style={{ flex:'1 1 300px', minWidth:260 }}>
            <EmailRow
              email={email}
              setEmail={setEmail}
              status={status}
              errMsg={errMsg}
              onSubmit={handleSubmit}
              onKey={handleKey}
            />
          </div>
        </div>
      </div>
    );
  }

  // ── ARTICLE variant ───────────────────────────────────────────────────────
  return (
    <div style={{ background:C.a1card, border:`1.5px solid ${C.a1brd}`,
      borderRadius:16, padding:'1.5rem', margin:'2.5rem 0',
      boxShadow:'0 4px 20px rgba(13,148,136,.09)' }}>

      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
        <div style={{ width:34, height:34, borderRadius:9, background:C.a1,
          flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:'0 2px 10px rgba(13,148,136,.30)' }}>
          <Mail size={16} color="#fff" />
        </div>
        <div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:15,
            color:C.txt, letterSpacing:'-0.02em', lineHeight:1.2 }}>
            Found this useful?
          </div>
          <div style={{ fontSize:12.5, color:C.mut, marginTop:2 }}>
            {SITE_CONFIG.newsletterNote}
          </div>
        </div>
      </div>

      <EmailRow
        email={email}
        setEmail={setEmail}
        status={status}
        errMsg={errMsg}
        onSubmit={handleSubmit}
        onKey={handleKey}
      />
    </div>
  );
}

// ── Shared email input row ────────────────────────────────────────────────
function EmailRow({ email, setEmail, status, errMsg, onSubmit, onKey }: {
  email: string;
  setEmail: (v: string) => void;
  status: string;
  errMsg: string;
  onSubmit: () => void;
  onKey: (e: React.KeyboardEvent) => void;
}) {
  const isLoading = status === 'loading';

  return (
    <div>
      <div style={{ display:'flex', gap:8, alignItems:'stretch' }}>
        {/* Input */}
        <div style={{ position:'relative', flex:1 }}>
          <Mail size={14} style={{ position:'absolute', left:12, top:'50%',
            transform:'translateY(-50%)', color:'var(--mut2)', pointerEvents:'none' as const }} />
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={onKey}
            disabled={isLoading}
            style={{
              width: '100%', height: 44,
              paddingLeft: 36, paddingRight: 14,
              border: `1.5px solid ${status === 'error' ? '#ef4444' : 'var(--a1-brd)'}`,
              borderRadius: 10, fontSize: 14,
              outline: 'none', boxSizing: 'border-box' as const,
              fontFamily: "'DM Sans',sans-serif",
              background: 'var(--surf)', color: 'var(--txt)',
              opacity: isLoading ? 0.6 : 1,
            }}
            onFocus={e  => (e.target.style.borderColor = 'var(--a1)')}
            onBlur={e   => (e.target.style.borderColor = status === 'error' ? '#ef4444' : 'var(--a1-brd)')}
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
              : 'linear-gradient(135deg,var(--a1),#0b7a6e)',
            color: '#fff', border: 'none', borderRadius: 10,
            fontSize: 13.5, fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer',
            fontFamily: "'DM Sans',sans-serif",
            display: 'flex', alignItems: 'center', gap: 6,
            whiteSpace: 'nowrap' as const,
            boxShadow: '0 3px 10px rgba(13,148,136,.35)',
            flexShrink: 0,
          }}
        >
          {isLoading
            ? <><Loader size={13} style={{ animation:'spin 1s linear infinite' }}/> Subscribing…</>
            : <>Subscribe <ArrowRight size={13}/></>
          }
        </button>
      </div>

      {/* Error message */}
      {status === 'error' && errMsg && (
        <p style={{ fontSize:12, color:'#ef4444', margin:'6px 0 0', lineHeight:1.5 }}>
          {errMsg}
        </p>
      )}

      <p style={{ fontSize:11, color:'var(--mut2)', margin:'7px 0 0', lineHeight:1.5 }}>
        No commitment. Unsubscribe anytime. Confirm in the new tab — takes 5 seconds.
      </p>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Success state ─────────────────────────────────────────────────────────
function SuccessState({ variant }: { variant: 'hero' | 'article' }) {
  const inner = (
    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
      <div style={{ width:38, height:38, borderRadius:10, background:'rgba(16,185,129,.12)',
        border:'1.5px solid rgba(16,185,129,.25)', flexShrink:0,
        display:'flex', alignItems:'center', justifyContent:'center' }}>
        <CheckCircle size={18} color="#10b981" />
      </div>
      <div>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14,
          color:'var(--txt)', marginBottom:3 }}>
          Almost there — check the new tab!
        </div>
        <div style={{ fontSize:12.5, color:'var(--mut)', lineHeight:1.5 }}>
          Confirm your email on Beehiiv and you're in. Welcome to the list 🎉
        </div>
      </div>
    </div>
  );

  if (variant === 'hero') {
    return (
      <div style={{ background:'linear-gradient(135deg,rgba(13,148,136,.07) 0%,rgba(13,148,136,.03) 100%)',
        borderTop:'1px solid var(--a1-brd)', borderBottom:'1px solid var(--a1-brd)',
        padding:'20px 24px' }}>
        <div style={{ maxWidth:820, margin:'0 auto' }}>{inner}</div>
      </div>
    );
  }

  return (
    <div style={{ background:'var(--a1-card)', border:'1.5px solid var(--a1-brd)',
      borderRadius:16, padding:'1.25rem 1.5rem', margin:'2.5rem 0' }}>
      {inner}
    </div>
  );
}
