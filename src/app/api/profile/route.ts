import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getUserById, updateProfile } from '@/lib/auth'

export async function GET() {
  const token = (await cookies()).get('token')?.value
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await getUserById(token)
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  return NextResponse.json(user)
}

export async function PATCH(request: Request) {
  const token = (await cookies()).get('token')?.value
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const data = await request.json()
    const result = await updateProfile(token, data)
    
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json(result.user)
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}