import * as dotenv from 'dotenv'
import { test } from '@playwright/test'

import ScorePage from '../pages/score.page'

dotenv.config({ path: '../.env' })

const url: any = process.env.PLAYWRIGHT_TEST_URL

test.beforeEach(async ({ page }) => {
  await page.goto(url)
})

test('Scores update functionality', async ({ page }) => {
  test.setTimeout(120000)
  const pp = new ScorePage(page)
  try {
    await pp.securityToken()
  } catch (error) {
    console.error('Scores update test failed:', error)
    throw error
  }
})
