import * as dotenv from 'dotenv'
import { expect, test } from '@playwright/test'

import LoginPage from '../pages/login.page'

dotenv.config({ path: '../.env' })

const url: any = process.env.PLAYWRIGHT_TEST_URL
const email: any = process.env.PLAYWRIGHT_USER_EMAIL
const password: any = process.env.PLAYWRIGHT_USER_PASSWORD

test.beforeEach(async ({ page }) => {
  await page.goto(url)
})

test('Redirect to documentation site', async ({ page }) => {
  test.setTimeout(120000)
  const lp = new LoginPage(page)
  await lp.appLoginCommonFunctionality(email, password)
  const page1Promise = page.waitForEvent('popup')
  await page.locator('.documentation').click()
  const page1 = await page1Promise
  await expect(page1).toHaveURL('https://docs.interlynk.io/')
})

test.afterEach(async ({ page }) => {
  await page.close()
})
