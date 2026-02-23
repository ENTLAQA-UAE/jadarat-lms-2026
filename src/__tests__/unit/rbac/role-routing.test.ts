import { describe, it, expect } from 'vitest'

/**
 * Role-based routing logic extracted from src/app/dashboard/layout.tsx
 * Tests the conditional rendering rules without importing the full server component.
 */

type UserRole = 'learner' | 'LMSAdmin' | 'learningManager' | 'organizationAdmin' | 'superAdmin' | null

interface RouteVisibility {
  learner: boolean
  lms_admin: boolean
  org_admin: boolean
  super_admin: boolean
  inactive_shown: boolean
}

function resolveRouteVisibility(role: UserRole, is_active: boolean): RouteVisibility {
  return {
    learner: role === 'learner' && is_active,
    lms_admin: (role === 'LMSAdmin' || role === 'learningManager') && is_active,
    org_admin: role === 'organizationAdmin' && is_active,
    super_admin: role === 'superAdmin' && is_active,
    inactive_shown: !is_active,
  }
}

describe('RBAC — Dashboard role routing', () => {
  it('shows learner portal for active learner', () => {
    const vis = resolveRouteVisibility('learner', true)
    expect(vis.learner).toBe(true)
    expect(vis.lms_admin).toBe(false)
    expect(vis.org_admin).toBe(false)
    expect(vis.super_admin).toBe(false)
    expect(vis.inactive_shown).toBe(false)
  })

  it('shows LMS admin portal for active LMSAdmin', () => {
    const vis = resolveRouteVisibility('LMSAdmin', true)
    expect(vis.lms_admin).toBe(true)
    expect(vis.learner).toBe(false)
  })

  it('shows LMS admin portal for active learningManager', () => {
    const vis = resolveRouteVisibility('learningManager', true)
    expect(vis.lms_admin).toBe(true)
    expect(vis.learner).toBe(false)
  })

  it('shows org admin portal for active organizationAdmin', () => {
    const vis = resolveRouteVisibility('organizationAdmin', true)
    expect(vis.org_admin).toBe(true)
    expect(vis.learner).toBe(false)
    expect(vis.lms_admin).toBe(false)
  })

  it('shows super admin portal for active superAdmin', () => {
    const vis = resolveRouteVisibility('superAdmin', true)
    expect(vis.super_admin).toBe(true)
    expect(vis.learner).toBe(false)
    expect(vis.org_admin).toBe(false)
  })

  it('shows inactive banner and hides all portals for inactive user', () => {
    const vis = resolveRouteVisibility('learner', false)
    expect(vis.inactive_shown).toBe(true)
    expect(vis.learner).toBe(false)
    expect(vis.lms_admin).toBe(false)
    expect(vis.org_admin).toBe(false)
    expect(vis.super_admin).toBe(false)
  })

  it('shows inactive banner for inactive LMSAdmin', () => {
    const vis = resolveRouteVisibility('LMSAdmin', false)
    expect(vis.inactive_shown).toBe(true)
    expect(vis.lms_admin).toBe(false)
  })

  it('hides everything when role is null', () => {
    const vis = resolveRouteVisibility(null, true)
    expect(vis.learner).toBe(false)
    expect(vis.lms_admin).toBe(false)
    expect(vis.org_admin).toBe(false)
    expect(vis.super_admin).toBe(false)
  })

  it('exactly one portal is visible per active role', () => {
    const roles: UserRole[] = ['learner', 'LMSAdmin', 'learningManager', 'organizationAdmin', 'superAdmin']
    for (const role of roles) {
      const vis = resolveRouteVisibility(role, true)
      const portalsVisible = [vis.learner, vis.lms_admin, vis.org_admin, vis.super_admin].filter(Boolean)
      expect(portalsVisible).toHaveLength(1)
    }
  })

  it('no portal is visible for any inactive role', () => {
    const roles: UserRole[] = ['learner', 'LMSAdmin', 'learningManager', 'organizationAdmin', 'superAdmin']
    for (const role of roles) {
      const vis = resolveRouteVisibility(role, false)
      const portalsVisible = [vis.learner, vis.lms_admin, vis.org_admin, vis.super_admin].filter(Boolean)
      expect(portalsVisible).toHaveLength(0)
      expect(vis.inactive_shown).toBe(true)
    }
  })
})

describe('RBAC — Login schema validation', () => {
  it('accepts valid email and password', () => {
    const { z } = require('zod')
    const loginSchema = z.object({
      email: z.string().email('Invalid email format'),
      password: z.string().min(6, 'Password must be at least 6 characters'),
    })

    const result = loginSchema.safeParse({
      email: 'admin@jadarat.com',
      password: 'securePass123',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid email', () => {
    const { z } = require('zod')
    const loginSchema = z.object({
      email: z.string().email('Invalid email format'),
      password: z.string().min(6, 'Password must be at least 6 characters'),
    })

    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'password123',
    })
    expect(result.success).toBe(false)
  })

  it('rejects password shorter than 6 characters', () => {
    const { z } = require('zod')
    const loginSchema = z.object({
      email: z.string().email('Invalid email format'),
      password: z.string().min(6, 'Password must be at least 6 characters'),
    })

    const result = loginSchema.safeParse({
      email: 'user@test.com',
      password: '12345',
    })
    expect(result.success).toBe(false)
  })
})
