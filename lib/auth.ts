// In real project → use Prisma / Drizzle / Supabase / MongoDB / etc.

type User = {
  id: string
  email: string
  name: string
  password: string // NEVER store plain in production!
}

const users: User[] = []

export async function registerUser(email: string, name: string, password: string) {
  if (users.find(u => u.email === email)) {
    return { error: "Email already exists" }
  }

  const user: User = {
    id: crypto.randomUUID(),
    email,
    name,
    password: password // ← in prod: await hash(password)
  }

  users.push(user)
  return { user: { id: user.id, email: user.email, name: user.name } }
}

export async function loginUser(email: string, password: string) {
  const user = users.find(u => u.email === email && u.password === password)
  if (!user) return { error: "Invalid credentials" }

  return { user: { id: user.id, email: user.email, name: user.name } }
}

export async function getUserById(id: string) {
  const user = users.find(u => u.id === id)
  if (!user) return null
  return { id: user.id, email: user.email, name: user.name }
}

export async function updateProfile(id: string, data: { name?: string }) {
  const user = users.find(u => u.id === id)
  if (!user) return { error: "User not found" }

  if (data.name) user.name = data.name

  return { user: { id: user.id, email: user.email, name: user.name } }
}

// For forgot-password demo (just simulate)
export async function sendResetEmail(email: string) {
  const user = users.find(u => u.email === email)
  if (!user) return { error: "Email not found" }
  
  // In real app → send email with token
  console.log(`Reset link would be sent to ${email}`)
  return { success: true, message: "If the email exists, reset link was sent" }
}