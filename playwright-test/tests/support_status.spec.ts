import * as dotenv from 'dotenv'
import { test } from '@playwright/test'

import SupportStatusPage from '../pages/support_status.page'

dotenv.config({ path: '../.env' })

const url: any = process.env.PLAYWRIGHT_TEST_URL

test.beforeEach(async ({ page }) => {
  await page.goto(url)
})

test('Support status functionality', async ({ page }) => {
  test.setTimeout(120000)
  const pp = new SupportStatusPage(page)
  try {
    await pp.securityToken()
  } catch (error) {
    console.error('Support status test failed:', error)
    throw error
  }
})
