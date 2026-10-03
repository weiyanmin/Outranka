import { NextRequest, NextResponse } from 'next/server';
import { fetchTop10Results } from '../../../lib/serp';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { keyword, location } = body;

    if (!keyword || typeof keyword !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Target keyword is required.' },
        { status: 400 }
      );
    }

    const competitors = await fetchTop10Results(keyword, location || 'global');

    return NextResponse.json({
      success: true,
      competitors,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
