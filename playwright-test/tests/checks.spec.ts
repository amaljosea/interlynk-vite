import * as dotenv from 'dotenv'
import { test } from '@playwright/test'

import ChecksPage from '../pages/checks.page'

dotenv.config({ path: '../.env' })

const url: any = process.env.PLAYWRIGHT_TEST_URL

test.beforeEach(async ({ page }) => {
  await page.goto(url)
})

test('SBOM checks functionality', async ({ page }) => {
  test.setTimeout(90000)
  const pp = new ChecksPage(page)
  try {
    await pp.sbomCheck()
  } catch (error) {
    console.error('SBOM checks test failed:', error)
    throw error
  }
})
