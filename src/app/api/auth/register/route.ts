import { NextResponse } from 'next/server'
import { registerUser } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { email, name, password } = await request.json()
    
    if (!email || !password || !name) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const result = await registerUser(email, name, password)
    
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ user: result.user }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}