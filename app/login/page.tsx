import React from 'react';
import GoogleIcon from '../../components/GoogleIcon';
import LoginForm from '../../components/auth/LoginForm';

const productFeatures = [
  'Deterministic algorithmic audits',
  'Reverse-engineered top 10 SERPs',
  'AI Overview and citation tracking',
  'Automated content structure analysis',
];

export default function LoginPage() {
  return (
    <main className="login-page">
      <section className="login-showcase" aria-label="About Outranka">
        <div className="login-showcase-content">
          <div className="login-eyebrow"><GoogleIcon name="manage_search" size={16} color="currentColor" /> SERP intelligence for content teams</div>
          <h2>Stop Guessing, Outranks your Competitors now!</h2>
          <p className="login-showcase-copy">Find intent mismatches, see what the top ranking pages do differently, and plan improvements before publishing.</p>

          <div className="login-preview" aria-hidden="true">
            <div className="login-preview-top"><span>Content audit</span><span className="login-preview-status">Analysis ready</span></div>
            <div className="login-preview-grid">
              <div className="login-preview-score">
                <div className="login-preview-ring"><span>82<small>%</small></span></div>
                <strong>Content score</strong>
                <span>Strong structure</span>
              </div>
              <div className="login-preview-details">
                <strong>Performance pillars</strong>
                {[
                  ['Search intent', '72%'],
                  ['Content structure', '86%'],
                  ['Competitor parity', '64%'],
                ].map(([label, value], index) => (
                  <div className="login-preview-metric" key={label}>
                    <div><span>{label}</span><b>{value}</b></div>
                    <span className="login-preview-track"><i style={{ width: value, opacity: 1 - index * 0.08 }} /></span>
                  </div>
                ))}
              </div>
            </div>
            <div className="login-preview-footer"><GoogleIcon name="check_circle" size={15} color="var(--accent-hover)" /> Competitor comparison complete</div>
          </div>

          <ul className="login-feature-list">
            {productFeatures.map((feature) => (
              <li key={feature}><GoogleIcon name="check_circle" size={16} color="var(--accent-hover)" /> {feature}</li>
            ))}
          </ul>
        </div>
        <div className="login-showcase-bottom">Built for teams who want clear, actionable search insights.</div>
      </section>

      <section className="login-panel" aria-label="Sign in">
        <LoginForm />
      </section>
    </main>
  );
}
