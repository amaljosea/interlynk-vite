import * as dotenv from 'dotenv'
import { test } from '@playwright/test'

import LicensePage from '../pages/license.page'

dotenv.config({ path: '../.env' })

const url: any = process.env.PLAYWRIGHT_TEST_URL

test.beforeEach(async ({ page }) => {
  await page.goto(url)
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
