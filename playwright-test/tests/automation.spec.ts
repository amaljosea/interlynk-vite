import * as dotenv from 'dotenv'
import { test } from '@playwright/test'

import AutomationPage from '../pages/automation.page'
import LoginPage from '../pages/login.page'

dotenv.config({ path: '../.env' })

const url: any = process.env.PLAYWRIGHT_TEST_URL
const email: any = process.env.PLAYWRIGHT_USER_EMAIL
const password: any = process.env.PLAYWRIGHT_USER_PASSWORD

test.beforeEach(async ({ page }) => {
  await page.goto(url)
  const lp = new LoginPage(page)
  await lp.appLoginCommonFunctionality(email, password)
})

test('Automation create functionality', async ({ page }) => {
  test.setTimeout(120000)
  const pp = new AutomationPage(page)
  try {
    await pp.addRule()
  } catch (error) {
    console.error('Automation create test failed:', error)
    throw error
  }
})

test('Automation edit functionality', async ({ page }) => {
  test.setTimeout(120000)
  const pp = new AutomationPage(page)
  try {
    await pp.editRule()
  } catch (error) {
    console.error('Automation edit test failed:', error)
    throw error
  }
})

test('Automation delete functionality', async ({ page }) => {
  test.setTimeout(120000)
  const pp = new AutomationPage(page)
  try {
    await pp.deleteRule()
  } catch (error) {
    console.error('Automation delete test failed:', error)
    throw error
  }
})

test.afterEach(async ({ page }) => {
  await page.close()
})
