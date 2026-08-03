// app/api/auth/login/route.ts
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    const backendRes = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!backendRes.ok) {
      const errorData = await backendRes.json()
      return NextResponse.json(
        { message: errorData.message || 'Login failed' },
        { status: backendRes.status }
      )
    }

    const data = await backendRes.json()
    const token = data.token

    if (!token) {
      return NextResponse.json({ message: 'No token received from backend' }, { status: 500 })
    }

    // cookie সেট না করে শুধু token ফেরত দাও → frontend localStorage-এ রাখবে
    return NextResponse.json({ 
      token,
      message: 'Logged in successfully' 
    })

  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}