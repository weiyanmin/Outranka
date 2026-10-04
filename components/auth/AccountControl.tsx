'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';

export default function AccountControl() {
  const router = useRouter();
  const [email, setEmail] = useState('');

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

  const signOut = async () => {
    try {
      await createClient().auth.signOut();
    } finally {
      router.replace('/login');
      router.refresh();
    }
  };

  if (!email) return null;

  return (
    <div className="account-control">
      <span title={email}>{email}</span>
      <button type="button" onClick={signOut}>Sign out</button>
    </div>
  );
}
