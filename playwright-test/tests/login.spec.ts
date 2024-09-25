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

test('TC_001 Login with Email ID Test', async ({ page }) => {
  test.setTimeout(120000)
  const lp = new LoginPage(page)
  await lp.appLoginFunctionality(email, password)
})

test.afterEach(async ({ page }) => {
  await page.close()
})
