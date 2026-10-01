export type Role = 'customer' | 'admin' | 'owner'

export type SessionUser = {
  id: string
  email: string
  name: string | null
  avatarUrl: string | null
  role: Role
}

export const isAdminRole = (role: Role) => role === 'admin' || role === 'owner'
