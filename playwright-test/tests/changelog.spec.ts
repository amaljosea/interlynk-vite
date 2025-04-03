import * as dotenv from 'dotenv'
import { test } from '@playwright/test'

import ChangelogPage from '../pages/changelog.page'

dotenv.config({ path: '../.env' })

const url: any = process.env.PLAYWRIGHT_TEST_URL

test.beforeEach(async ({ page }) => {
  await page.goto(url)
})

test('SBOM changelog functionality', async ({ page }) => {
  test.setTimeout(90000)
  const pp = new ChangelogPage(page)
  try {
    await pp.checkLogs()
  } catch (error) {
    console.error('SBOM changelog test failed:', error)
    throw error
  }
})
