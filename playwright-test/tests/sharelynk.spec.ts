import * as dotenv from 'dotenv'
import { test } from '@playwright/test'

import LoginPage from '../pages/login.page'
import SharelynkPage from '../pages/sharelynk.page'

dotenv.config({ path: '../.env' })

const url: any = process.env.PLAYWRIGHT_TEST_URL
const email: any = process.env.PLAYWRIGHT_USER_EMAIL
const password: any = process.env.PLAYWRIGHT_USER_PASSWORD

test.beforeEach(async ({ page }) => {
  await page.goto(url)
  const lp = new LoginPage(page)
  await lp.appLoginCommonFunctionality(email, password)
})

test('TC_005 Sharelynk Test', async ({ page }) => {
  test.setTimeout(120000)
  const pp = new SharelynkPage(page)
  try {
    await pp.sharelynkFunctionality()
  } catch (error) {
    console.error('Sharelynk test failed:', error)
    throw error
  }
})

test.afterEach(async ({ page }) => {
  await page.close()
})
