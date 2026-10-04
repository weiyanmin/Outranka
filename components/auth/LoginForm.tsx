'use client';

import React, { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import GoogleIcon from '../GoogleIcon';
import BrandMark from '../BrandMark';
import { createClient } from '../../lib/supabase/client';

type Mode = 'signin' | 'signup' | 'forgot';

function getSafeNextPath() {
  const value = new URLSearchParams(window.location.search).get('next');
  if (!value) return '/';
  const candidate = new URL(value, window.location.origin);
  return candidate.origin === window.location.origin ? `${candidate.pathname}${candidate.search}${candidate.hash}` : '/';
}

export default function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [configured, setConfigured] = useState(true);

  useEffect(() => {
    setConfigured(Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY));
    if (new URLSearchParams(window.location.search).get('error') === 'auth') {
      setError('Sign-in could not be completed. Check the provider setup and try again.');
    }
  }, []);

  const callbackUrl = (next: string) => {
    const url = new URL('/auth/callback', window.location.origin);
    url.searchParams.set('next', next);
    return url.toString();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setNotice('');
    setBusy(true);

    try {
      const supabase = createClient();
      const next = getSafeNextPath();

      if (mode === 'forgot') {
        const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: callbackUrl('/login/reset-password'),
        });
        if (authError) throw authError;
        setNotice('If an account exists for this email, a password reset link is on its way.');
        return;
      }

      if (mode === 'signup') {
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: callbackUrl(next) },
        });
        if (authError) throw authError;
        if (data.session) {
          router.push(next);
          router.refresh();
        } else {
          setNotice('Check your email for a confirmation link to finish creating your account.');
        }
        return;
      }

      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      router.push(next);
      router.refresh();
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Unable to sign in. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'linkedin_oidc') => {
    setError('');
    setNotice('');
    setBusy(true);
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: callbackUrl(getSafeNextPath()) },
      });
      if (authError) throw authError;
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Unable to start social sign-in.');
      setBusy(false);
    }
  };

  const title = mode === 'signup' ? 'Create your Outranka account' : mode === 'forgot' ? 'Reset your password' : 'Welcome back to Outranka';
  const description = mode === 'signup'
    ? 'Create an account to save your SERP audits and competitor playbooks.'
    : mode === 'forgot'
      ? 'Enter your work email and we’ll send you a password reset link.'
      : 'Enter your credentials to access your SERP audits and competitor playbooks.';

  return (
    <section className="login-form-wrap" aria-labelledby="login-title">
      <div className="login-brand-row">
        <a className="login-brand login-brand-primary" href="/login" aria-label="Outranka login"><BrandMark size={42} /><span>Outranka</span></a>
      </div>

      <div className="login-heading">
        <h1 id="login-title">{title}</h1>
        <p>{description}</p>
      </div>

      {mode !== 'forgot' && (
        <div className="login-oauth-row">
          <button type="button" className="login-oauth-button" onClick={() => handleOAuth('google')} disabled={busy || !configured}>
            <svg className="login-provider-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.44a5.5 5.5 0 0 1-2.39 3.61v3h3.87c2.26-2.08 3.57-5.15 3.57-8.85z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.37-.35-2.1s.13-1.44.35-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.94l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.27c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.98 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.63 6.16-4.63z" />
            </svg>
            Continue with Google
          </button>
          <button type="button" className="login-oauth-button" onClick={() => document.getElementById('login-email')?.focus()}>
            <GoogleIcon name="mail" size={18} color="#5f6368" />
            Continue with Email
          </button>
        </div>
      )}

      <form className="login-fields" onSubmit={handleSubmit}>
        <label htmlFor="login-email">Work email address</label>
        <div className="login-input-wrap">
          <GoogleIcon name="mail" size={18} color="#778094" />
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        {mode !== 'forgot' && (
          <>
            <div className="login-password-label">
              <label htmlFor="login-password">Password</label>
              {mode === 'signin' && (
                <button type="button" className="login-text-button" onClick={() => { setMode('forgot'); setError(''); setNotice(''); }}>
                  Forgot password?
                </button>
              )}
            </div>
            <div className="login-input-wrap">
              <GoogleIcon name="lock" size={18} color="#778094" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                placeholder={mode === 'signup' ? 'At least 8 characters' : 'Enter your password'}
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <button type="button" className="login-visibility-button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                <GoogleIcon name={showPassword ? 'visibility_off' : 'visibility'} size={18} color="#778094" />
              </button>
            </div>
          </>
        )}

        {!configured && (
          <p className="login-config-note">Supabase isn’t configured yet. Add your project URL and publishable key to <code>.env.local</code>.</p>
        )}
        {error && <p className="login-message login-error" role="alert">{error}</p>}
        {notice && <p className="login-message login-notice" role="status">{notice}</p>}

        <button className="login-submit" type="submit" disabled={busy || !configured}>
          {busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : mode === 'forgot' ? 'Send reset link' : 'Sign in to Outranka'}
          {!busy && <GoogleIcon name="arrow_forward" size={17} color="currentColor" />}
        </button>
      </form>

      <div className="login-switch-mode">
        {mode === 'forgot' ? (
          <button type="button" className="login-text-button" onClick={() => { setMode('signin'); setError(''); setNotice(''); }}>Back to sign in</button>
        ) : mode === 'signup' ? (
          <>Already have an account? <button type="button" className="login-text-button" onClick={() => { setMode('signin'); setError(''); setNotice(''); }}>Sign in</button></>
        ) : (
          <>Don’t have an account? <button type="button" className="login-text-button" onClick={() => { setMode('signup'); setError(''); setNotice(''); }}>Create account</button></>
        )}
      </div>

      <div className="login-security-note">
        <GoogleIcon name="shield" size={15} color="#6f7787" />
        <span>Secure, cookie-based session</span><span aria-hidden="true">·</span><span>Sign out anytime</span>
      </div>
    </section>
  );
}
