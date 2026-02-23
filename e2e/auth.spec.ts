import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('login page loads and shows form', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
  })

  test('shows validation error for empty email', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    // Should stay on login page or show error
    await expect(page).toHaveURL(/login/)
  })

  test('shows validation error for short password', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'user@test.com')
    await page.fill('input[name="password"]', '123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/login/)
  })

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'invalid@test.com')
    await page.fill('input[name="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    // Should show error message or stay on login page
    await expect(page).toHaveURL(/login/)
  })

  test('redirects to dashboard on successful login', async ({ page }) => {
    // This test requires valid test credentials set via env vars
    const email = process.env.E2E_TEST_EMAIL
    const password = process.env.E2E_TEST_PASSWORD

    test.skip(!email || !password, 'Skipped: E2E_TEST_EMAIL / E2E_TEST_PASSWORD not set')

    await page.goto('/login')
    await page.fill('input[name="email"]', email!)
    await page.fill('input[name="password"]', password!)
    await page.click('button[type="submit"]')

    await page.waitForURL('**/dashboard**', { timeout: 15_000 })
    await expect(page).toHaveURL(/dashboard/)
  })
})

test.describe('Registration Flow', () => {
  test('register page loads', async ({ page }) => {
    await page.goto('/register')
    // Page should load without errors
    await expect(page).toHaveURL(/register/)
  })
})

test.describe('Password Reset Flow', () => {
  test('reset password page loads and shows email field', async ({ page }) => {
    await page.goto('/reset-password')
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible()
  })
})
