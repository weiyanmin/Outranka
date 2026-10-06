'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';

export default function AccountControl() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const accountControlRef = useRef<HTMLDivElement>(null);
  const avatarButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    try {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email || ''));
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setEmail(session?.user.email || '');
      });
      return () => subscription.unsubscribe();
    } catch {
      return;
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (accountControlRef.current && !accountControlRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        avatarButtonRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const signOut = async () => {
    if (!window.confirm('Are you sure you want to sign out?')) return;

    try {
      await createClient().auth.signOut();
    } finally {
      router.replace('/login');
      router.refresh();
    }
  };

  if (!email) return null;

  return (
    <div className="account-control" ref={accountControlRef}>
      <button
        ref={avatarButtonRef}
        className="account-avatar"
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={`Account menu for ${email}`}
        aria-haspopup="true"
        aria-expanded={isOpen}
        title={email}
      >
        {email.trim().charAt(0).toUpperCase()}
      </button>
      {isOpen && (
        <div className="account-popover">
          <span className="account-email">{email}</span>
          <button className="account-signout" type="button" onClick={signOut}>Sign out</button>
        </div>
      )}
    </div>
  );
}
