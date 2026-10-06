'use client';

import React from 'react';
import GoogleIcon from './GoogleIcon';
import { ANALYSIS_PROGRESS_STEPS } from '../lib/analysisProgress';
import type { AnalysisProgressStep } from '../lib/analysisProgress';

interface LoadingStepsProps {
  keyword: string;
  currentStep: AnalysisProgressStep;
}

export default function LoadingSteps({ keyword, currentStep }: LoadingStepsProps) {
  const currentStepIndex = ANALYSIS_PROGRESS_STEPS.findIndex((step) => step.id === currentStep);

  return (
    <div className="card audit-progress-card" style={{ marginTop: '24px' }}>
      <div className="audit-progress-heading">
        <div className="badge-pill">
          <GoogleIcon name="progress_activity" size={13} color="currentColor" className="icon-spin" /> In Progress
        </div>
        <h3>Auditing &quot;{keyword}&quot;</h3>
        <p>We’ll keep you updated as each part of the audit finishes.</p>
      </div>

      <div className="audit-progress-steps" aria-label="Audit progress">
        {ANALYSIS_PROGRESS_STEPS.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;

          return (
            <div
              key={step.id}
              className={`audit-progress-step${isCurrent ? ' is-current' : ''}${isDone ? ' is-done' : ''}`}
              aria-current={isCurrent ? 'step' : undefined}
            >
              <div className="audit-progress-step-marker" aria-hidden="true">
                {isDone ? <GoogleIcon name="check" size={13} color="#ffffff" /> : idx + 1}
              </div>
              <div className="audit-progress-step-copy">
                <div className="audit-progress-step-title" aria-live={isCurrent ? 'polite' : undefined}>
                  {step.title}
                </div>
                <div className="audit-progress-step-description">{step.description}</div>
              </div>
              {isCurrent && <div className="audit-step-loader" role="status" aria-label={`${step.title} in progress`} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
