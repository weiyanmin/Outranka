import React from 'react';
import Link from 'next/link';
import BrandMark from '../../../components/BrandMark';
import ResetPasswordForm from '../../../components/auth/ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <main className="login-reset-page">
      <section className="login-reset-card">
        <Link className="login-brand" href="/login"><BrandMark size={32} /><span>Outranka</span></Link>
        <h1>Choose a new password</h1>
        <p>Use at least 8 characters for your new password.</p>
        <ResetPasswordForm />
      </section>
    </main>
  );
}
