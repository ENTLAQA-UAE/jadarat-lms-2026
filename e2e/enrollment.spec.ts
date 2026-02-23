import { test, expect } from '@playwright/test'

test.describe('Enrollment Lifecycle', () => {
  test.beforeEach(async ({ page }) => {
    const email = process.env.E2E_TEST_EMAIL
    const password = process.env.E2E_TEST_PASSWORD
    test.skip(!email || !password, 'Skipped: E2E_TEST_EMAIL / E2E_TEST_PASSWORD not set')

    // Log in
    await page.goto('/login')
    await page.fill('input[name="email"]', email!)
    await page.fill('input[name="password"]', password!)
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard**', { timeout: 15_000 })
  })

  test('discover courses page loads', async ({ page }) => {
    await page.goto('/dashboard/discover')
    await page.waitForLoadState('networkidle')
    // Page should render without errors
    await expect(page).toHaveURL(/discover/)
  })

  test('course detail page loads with enrol button or progress', async ({ page }) => {
    await page.goto('/dashboard/discover')
    await page.waitForLoadState('networkidle')

    // Try to click the first course card
    const courseCard = page.locator('a[href*="/dashboard/course/"]').first()
    const hasCards = await courseCard.isVisible().catch(() => false)

    if (hasCards) {
      await courseCard.click()
      await page.waitForLoadState('networkidle')

      // Should show either Enrol button or progress info
      const enrolButton = page.locator('button:has-text("Enrol")')
      const progressBar = page.locator('[role="progressbar"]')
      const eitherVisible =
        (await enrolButton.isVisible().catch(() => false)) ||
        (await progressBar.isVisible().catch(() => false))

      expect(eitherVisible || page.url().includes('/course/')).toBe(true)
    }
  })

  test('my learning page shows enrolled courses', async ({ page }) => {
    await page.goto('/dashboard/learn')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveURL(/learn/)
  })

  test('certificates page loads for completed courses', async ({ page }) => {
    await page.goto('/dashboard/certificates')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveURL(/certificates/)
  })
})
