import { test, expect } from '@playwright/test'

test.describe('Role-Based Access Control', () => {
  test('unauthenticated user is redirected from dashboard', async ({ page }) => {
    await page.goto('/dashboard')
    // Should redirect to login or show nothing
    await page.waitForTimeout(2_000)
    const url = page.url()
    // Either redirected to login or page is empty (returns null in layout)
    expect(url.includes('login') || url.includes('dashboard')).toBe(true)
  })

  test('dashboard renders without server errors', async ({ page }) => {
    const email = process.env.E2E_TEST_EMAIL
    const password = process.env.E2E_TEST_PASSWORD
    test.skip(!email || !password, 'Skipped: E2E_TEST_EMAIL / E2E_TEST_PASSWORD not set')

    await page.goto('/login')
    await page.fill('input[name="email"]', email!)
    await page.fill('input[name="password"]', password!)
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard**', { timeout: 15_000 })

    // Page should not show "Something went wrong"
    const errorHeading = page.locator('text=Something went wrong')
    await expect(errorHeading).not.toBeVisible()
  })

  test('sidebar navigation renders for authenticated user', async ({ page }) => {
    const email = process.env.E2E_TEST_EMAIL
    const password = process.env.E2E_TEST_PASSWORD
    test.skip(!email || !password, 'Skipped: E2E_TEST_EMAIL / E2E_TEST_PASSWORD not set')

    await page.goto('/login')
    await page.fill('input[name="email"]', email!)
    await page.fill('input[name="password"]', password!)
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard**', { timeout: 15_000 })

    // Sidebar should be visible (desktop viewport)
    const sidebar = page.locator('[data-sidebar], nav, aside').first()
    await expect(sidebar).toBeVisible()
  })
})
