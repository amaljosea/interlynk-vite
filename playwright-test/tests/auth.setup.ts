import { expect, test as setup } from '@playwright/test'
import path from 'path'

const authFile = path.join(__dirname, '../playwright/.auth/user.json')

setup('authenticate', async ({ page }) => {
  await page.goto('http://localhost:3000/auth')
  await page.fill("input[type='email']", 'amaljoseami@gmail.com')
  await page.fill("input[type='password']", 'LynkRisk@1.0')
  await page.locator("//button[text()='Log in']").click()
  // Wait until the page receives the cookies.
  // Wait for the final URL to ensure that the cookies are actually set.
  await page.waitForURL('http://localhost:3000/vendor/dashboard')
  await expect(page.getByLabel('dashboard')).toBeVisible()

  // End of authentication steps.

  await page.context().storageState({ path: authFile })
})
