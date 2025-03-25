import * as dotenv from 'dotenv'
import { test } from '@playwright/test'

import LabelPage from '../pages/label.page'

dotenv.config({ path: '../.env' })

const url: any = process.env.PLAYWRIGHT_TEST_URL

test.beforeEach(async ({ page }) => {
  await page.goto(url)
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
