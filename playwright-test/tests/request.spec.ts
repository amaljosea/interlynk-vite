import * as dotenv from 'dotenv'
import { test } from '@playwright/test'

import RequestPage from '../pages/request.page'

dotenv.config({ path: '../.env' })

const url: any = process.env.PLAYWRIGHT_TEST_URL

test.beforeEach(async ({ page }) => {
  await page.goto(url)
})

test('SBOM request functionality', async ({ page }) => {
  const pp = new RequestPage(page)
  try {
    await pp.sbomRequest()
  } catch (error) {
    console.error('SBOM request test failed:', error)
    throw error
  }
})
