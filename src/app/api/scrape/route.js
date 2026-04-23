import { NextResponse } from 'next/server';
import { runScraper } from '@/lib/scraper/engine';

export async function GET() {
  try {
    const results = await runScraper();
    return NextResponse.json({
      success: true,
      message: 'Scraping cycle completed successfully',
      results
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Scraping cycle failed',
      error: error.message
    }, { status: 500 });
  }
}

// Optional: POST method if you want to pass parameters
export async function POST() {
  return GET();
}
