import * as dotenv from 'dotenv'
import { test } from '@playwright/test'

import OrgPage from '../pages/org.page'

dotenv.config({ path: '../.env' })

const url: any = process.env.PLAYWRIGHT_TEST_URL

test.beforeEach(async ({ page }) => {
  await page.goto(url)
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
