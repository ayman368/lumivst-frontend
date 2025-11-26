export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server'

const BASE_URL = 'http://localhost:8000'


export async function GET() {
  try {
    const response = await fetch(`${BASE_URL}/stocks`)
    const data = await response.json()
    
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch stocks' },
      { status: 500 }
    )
  }
}