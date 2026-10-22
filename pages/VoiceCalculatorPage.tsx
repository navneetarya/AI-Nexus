import React, { useEffect, useRef } from 'react';
import { SharedNav } from './SharedNav';
import { VoiceCalculator } from '../components/VoiceCalculator';
import { AFFILIATE_LINKS } from '../lib/affiliate-links';
import type { VoiceScenario } from '../lib/calc/voice';
import type { ConversionAssumptions, VoiceVendorId } from '../lib/calc/voice-inputs';

interface Props {
  navigate: (to: string) => void;
  isDark: boolean;
  toggleTheme: () => void;
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

function track(name: string, params: Record<string, unknown>) {
  if (typeof window.gtag === 'function') window.gtag('event', name, params);
}

export function VoiceCalculatorPage({ navigate, isDark, toggleTheme }: Props) {
  const changeTimer = useRef<number | null>(null);

  useEffect(() => {
    track('calc_start', { calculator: 'voice_cost', page_path: '/calculators/voice-cost/' });
    return () => {
      if (changeTimer.current !== null) window.clearTimeout(changeTimer.current);
    };
  }, []);

  const onChange = (scenario: VoiceScenario, assumptions: ConversionAssumptions, view: { currency: 'USD' | 'INR'; fxRate: number }) => {
    if (changeTimer.current !== null) window.clearTimeout(changeTimer.current);
    changeTimer.current = window.setTimeout(() => {
      track('calc_change', {
        calculator: 'voice_cost',
        monthly_characters: scenario.monthlyCharacters,
        commercial_use: scenario.commercialUse,
        cloning: scenario.cloning,
        billing: scenario.billing,
        currency: view.currency,
        fx_rate: view.fxRate,
        credits_per_character: assumptions.creditsPerCharacter,
        characters_per_minute: assumptions.charactersPerMinute,
      });
    }, 300);
  };

  const onCtaClick = (vendor: VoiceVendorId, event: React.MouseEvent<HTMLAnchorElement>) => {
    track('calc_cta_click', {
      calculator: 'voice_cost',
      vendor,
      link_url: event.currentTarget.href,
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: "'Inter', system-ui, sans-serif", color: 'var(--txt)' }}>
      <SharedNav navigate={navigate} isDark={isDark} toggleTheme={toggleTheme} />
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(24px, 6vw, 48px) clamp(16px, 4vw, 24px) 80px' }}>
        <h1 style={{ fontSize: 'clamp(26px, 5vw, 38px)', fontWeight: 800, lineHeight: 1.15, margin: '0 0 12px' }}>
          ElevenLabs vs Murf: Voice Cost Calculator
        </h1>
        <p style={{ maxWidth: 720, margin: '0 0 24px', color: 'var(--mut)', lineHeight: 1.65 }}>
          Estimate which published plan fits your monthly voice workload. The calculator shows its assumptions and links to each vendor&apos;s official pricing page.
        </p>
        <VoiceCalculator
          affiliateLinks={{ elevenlabs: AFFILIATE_LINKS.elevenlabs, 'murf-ai': AFFILIATE_LINKS['murf-ai'] }}
          onChange={onChange}
          onCtaClick={onCtaClick}
        />
      </main>
    </div>
  );
}

export default VoiceCalculatorPage;