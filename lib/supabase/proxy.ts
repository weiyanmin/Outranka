import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { hasSupabaseEnv } from './env';

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => to.cookies.set(cookie));
  return to;
}

export async function updateSession(request: NextRequest) {
  if (!hasSupabaseEnv()) return NextResponse.next({ request });

  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const isAuthenticated = Boolean(claims);
  const path = request.nextUrl.pathname;
  const isAuthRoute = path === '/login' || path.startsWith('/login/') || path.startsWith('/auth/');

  if (!isAuthenticated && !isAuthRoute) {
    if (path.startsWith('/api/')) {
      return copyCookies(response, NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 }));
    }

    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('next', `${path}${request.nextUrl.search}`);
    return copyCookies(response, NextResponse.redirect(loginUrl));
  }

  if (isAuthenticated && path === '/login') {
    const nextPath = request.nextUrl.searchParams.get('next');
    const candidate = new URL(nextPath || '/', request.url);
    const safeNext = candidate.origin === request.nextUrl.origin ? candidate : new URL('/', request.url);
    return copyCookies(response, NextResponse.redirect(safeNext));
  }

  return response;
}
