import * as dotenv from 'dotenv'
import { test } from '@playwright/test'

import LabelPage from '../pages/label.page'
import LoginPage from '../pages/login.page'

dotenv.config({ path: '../.env' })

const url: any = process.env.PLAYWRIGHT_TEST_URL
const email: any = process.env.PLAYWRIGHT_USER_EMAIL
const password: any = process.env.PLAYWRIGHT_USER_PASSWORD

test.beforeEach(async ({ page }) => {
  await page.goto(url)
  const lp = new LoginPage(page)
  await lp.appLoginCommonFunctionality(email, password)
})

test('TC_007 Label Test', async ({ page }) => {
  test.setTimeout(200000)
  const pp = new LabelPage(page)
  try {
    await pp.labelFunctionality()
  } catch (error) {
    console.error('Product label test failed:', error)
    throw error
  }
})

test.afterEach(async ({ page }) => {
  await page.close()
})
