import * as dotenv from 'dotenv'
import { test } from '@playwright/test'

import AutomationPage from '../pages/automation.page'

dotenv.config({ path: '../.env' })

const url: any = process.env.PLAYWRIGHT_TEST_URL

test.beforeEach(async ({ page }) => {
  await page.goto(url)
})

test('Automation create functionality', async ({ page }) => {
  test.setTimeout(60000)
  const pp = new AutomationPage(page)
  try {
    await pp.addRule()
  } catch (error) {
    console.error('Automation create test failed:', error)
    throw error
  }
})

test('Automation edit functionality', async ({ page }) => {
  test.setTimeout(60000)
  const pp = new AutomationPage(page)
  try {
    await pp.editRule()
  } catch (error) {
    console.error('Automation edit test failed:', error)
    throw error
  }
})

test('Automation delete functionality', async ({ page }) => {
  test.setTimeout(60000)
  const pp = new AutomationPage(page)
  try {
    await pp.deleteRule()
  } catch (error) {
    console.error('Automation delete test failed:', error)
    throw error
  }
})
