'use client';

import React, { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';

export default function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (password !== confirmation) {
      setError('The passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      const { error: updateError } = await createClient().auth.updateUser({ password });
      if (updateError) throw updateError;
      router.replace('/');
      router.refresh();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Could not update your password.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="login-fields" onSubmit={submit}>
      <label htmlFor="new-password">New password</label>
      <div className="login-input-wrap"><input id="new-password" type="password" autoComplete="new-password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required /></div>
      <label htmlFor="confirm-password">Confirm new password</label>
      <div className="login-input-wrap"><input id="confirm-password" type="password" autoComplete="new-password" minLength={8} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required /></div>
      {error && <p className="login-message login-error" role="alert">{error}</p>}
      <button className="login-submit" type="submit" disabled={busy}>{busy ? 'Updating…' : 'Update password'}</button>
    </form>
  );
}
