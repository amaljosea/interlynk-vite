import * as dotenv from 'dotenv'
import { test } from '@playwright/test'

import SettingPage from '../pages/setting.page'

dotenv.config({ path: '../.env' })

const url: any = process.env.PLAYWRIGHT_TEST_URL

test.beforeEach(async ({ page }) => {
  await page.goto(url)
})

test('Product settings functionality', async ({ page }) => {
  test.setTimeout(120000)
  const pp = new SettingPage(page)
  try {
    await pp.checkSettings()
  } catch (error) {
    console.error('Product settings test failed:', error)
    throw error
  }
})
