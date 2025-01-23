import * as dotenv from 'dotenv'
import { test } from '@playwright/test'

import LoginPage from '../pages/login.page'
import OrgPage from '../pages/org.page'

dotenv.config({ path: '../.env' })

const url: any = process.env.PLAYWRIGHT_TEST_URL
const email: any = process.env.PLAYWRIGHT_USER_EMAIL
const password: any = process.env.PLAYWRIGHT_USER_PASSWORD

test.beforeEach(async ({ page }) => {
  await page.goto(url)
  const lp = new LoginPage(page)
  await lp.appLoginCommonFunctionality(email, password)
})

test('Organization create and switch functionality', async ({ page }) => {
  test.setTimeout(120000)
  const pp = new OrgPage(page)
  try {
    await pp.createAndSwitch()
  } catch (error) {
    console.error('Organization create and switch test failed:', error)
    throw error
  }
})

test.afterEach(async ({ page }) => {
  await page.close()
})
