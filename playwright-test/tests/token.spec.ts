import * as dotenv from 'dotenv'
import { test } from '@playwright/test'

import TokenPage from '../pages/token.page'

dotenv.config({ path: '../.env' })

const url: any = process.env.PLAYWRIGHT_TEST_URL

test.beforeEach(async ({ page }) => {
  await page.goto(url)
})

test('Security token CRUD functionality', async ({ page }) => {
  test.setTimeout(120000)
  const pp = new TokenPage(page)
  try {
    await pp.securityToken()
  } catch (error) {
    console.error('Security token CRUD test failed:', error)
    throw error
  }
})
