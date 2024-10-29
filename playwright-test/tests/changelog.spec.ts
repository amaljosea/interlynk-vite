import * as dotenv from 'dotenv'
import { test } from '@playwright/test'

import ChangelogPage from '../pages/changelog.page'
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

test('SBOM changelog functionality', async ({ page }) => {
  test.setTimeout(120000)
  const pp = new ChangelogPage(page)
  try {
    await pp.checkLogs()
  } catch (error) {
    console.error('SBOM changelog test failed:', error)
    throw error
  }
})

test.afterEach(async ({ page }) => {
  await page.close()
})
