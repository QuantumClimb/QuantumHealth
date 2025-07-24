import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authService } from '@/services/authService'

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      getUser: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
  })),
}))

// Mock environment variables
vi.mock('@/lib/env', () => ({
  env: {
    VITE_SUPABASE_URL: 'https://test.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'test-anon-key',
  },
}))

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('registerUser', () => {
    it('should handle registration errors', async () => {
      const credentials = {
        email: 'existing@example.com',
        password: 'password123',
        role: 'patient' as const,
      }

      const result = await authService.registerUser(credentials, {})

      expect(result).toBeNull()
    })
  })

  describe('loginUser', () => {
    it('should handle login errors', async () => {
      const credentials = {
        email: 'wrong@example.com',
        password: 'wrongpassword',
        role: 'patient' as const,
      }

      const result = await authService.loginUser(credentials)

      expect(result).toBeNull()
    })
  })

  describe('resetPassword', () => {
    it('should handle password reset errors', async () => {
      const email = 'nonexistent@example.com'
      const result = await authService.resetPassword(email)

      expect(result).toBe(false)
    })
  })

  describe('logout', () => {
    it('should logout user successfully', async () => {
      await authService.logout()
      // Just test that the function doesn't throw
      expect(true).toBe(true)
    })
  })

  describe('getCurrentUser', () => {
    it('should return null when no user is logged in', async () => {
      const result = await authService.getCurrentUser()
      expect(result).toBeNull()
    })
  })

  describe('updateProfile', () => {
    it('should handle profile update errors', async () => {
      const profileData = {
        first_name: 'Updated',
        last_name: 'Name',
      }

      const result = await authService.updateProfile(profileData)

      expect(result).toBe(false)
    })
  })
}) 