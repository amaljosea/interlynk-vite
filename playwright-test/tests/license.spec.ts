import * as dotenv from 'dotenv'
import { test } from '@playwright/test'

import LicensePage from '../pages/license.page'
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

test('License CRUD functionality', async ({ page }) => {
  test.setTimeout(120000)
  const pp = new LicensePage(page)
  try {
    await pp.license()
  } catch (error) {
    console.error('License test failed:', error)
    throw error
  }
})

test.afterEach(async ({ page }) => {
  await page.close()
})
