import * as dotenv from 'dotenv'
import { expect, test as setup } from '@playwright/test'
import path from 'path'

dotenv.config({ path: '../.env' })

const authFile = path.join(__dirname, '../playwright/.auth/user.json')

const url: any = process.env.PLAYWRIGHT_TEST_URL
const email: any = process.env.PLAYWRIGHT_USER_EMAIL
const password: any = process.env.PLAYWRIGHT_USER_PASSWORD

setup('authenticate', async ({ page }) => {
  await page.goto(url + '/auth')
  await page.fill("input[type='email']", email)
  await page.fill("input[type='password']", password)
  await page.locator("//button[text()='Log in']").click()
  // Wait until the page receives the cookies.
  // Wait for the final URL to ensure that the cookies are actually set.
  await page.waitForURL(url + '/vendor/dashboard')
  await expect(page.getByLabel('dashboard')).toBeVisible()

  // End of authentication steps.

  await page.context().storageState({ path: authFile })
})
