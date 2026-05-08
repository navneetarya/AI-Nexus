import React from 'react';

interface Crumb {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  crumbs: Crumb[];
  navigate: (to: string) => void;
}

export function Breadcrumb({ crumbs, navigate }: BreadcrumbProps) {
  return (
    <nav aria-label="breadcrumb" style={{
      fontSize: 13,
      color: 'var(--mut)',
      marginBottom: 20,
      display: 'flex',
      flexWrap: 'wrap',
      gap: 6,
      alignItems: 'center',
    }}>
      {crumbs.map((c, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span style={{ opacity: 0.4, fontSize: 11 }}>›</span>}
          {c.href ? (
            <span
              onClick={() => navigate(c.href!)}
              style={{ cursor: 'pointer', color: 'var(--a1)', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
            >
              {c.label}
            </span>
          ) : (
            <span style={{ color: 'var(--mut2)' }}>{c.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
