import * as dotenv from 'dotenv'
import { test } from '@playwright/test'

import SupportPage from '../pages/support.page'

dotenv.config({ path: '../.env' })

const url: any = process.env.PLAYWRIGHT_TEST_URL

test.beforeEach(async ({ page }) => {
  await page.goto(url)
})

test('Support CRUD functionality', async ({ page }) => {
  test.setTimeout(30000)
  const pp = new SupportPage(page)
  try {
    await pp.support()
  } catch (error) {
    console.error('Support test failed:', error)
    throw error
  }
})
