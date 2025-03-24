import * as dotenv from 'dotenv'
import { test } from '@playwright/test'

import SharelynkPage from '../pages/sharelynk.page'

dotenv.config({ path: '../.env' })

const url: any = process.env.PLAYWRIGHT_TEST_URL

test.beforeEach(async ({ page }) => {
  await page.goto(url)
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
