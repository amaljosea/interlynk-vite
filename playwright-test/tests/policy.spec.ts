import * as dotenv from 'dotenv'
import { test } from '@playwright/test'

import LoginPage from '../pages/login.page'
import PolicyPage from '../pages/policy.page'

dotenv.config({ path: '../.env' })

const url: any = process.env.PLAYWRIGHT_TEST_URL
const email: any = process.env.PLAYWRIGHT_USER_EMAIL
const password: any = process.env.PLAYWRIGHT_USER_PASSWORD

test.beforeEach(async ({ page }) => {
  await page.goto(url)
  const lp = new LoginPage(page)
  await lp.appLoginCommonFunctionality(email, password)
})

test('Policy create functionality', async ({ page }) => {
  test.setTimeout(120000)
  const pp = new PolicyPage(page)
  try {
    await pp.addPolicy()
  } catch (error) {
    console.error('Policy create test failed:', error)
    throw error
  }
})

test('Policy edit functionality', async ({ page }) => {
  test.setTimeout(120000)
  const pp = new PolicyPage(page)
  try {
    await pp.editPolicy()
  } catch (error) {
    console.error('Policy edit test failed:', error)
    throw error
  }
})

test('Policy delete functionality', async ({ page }) => {
  test.setTimeout(120000)
  const pp = new PolicyPage(page)
  try {
    await pp.deletePolicy()
  } catch (error) {
    console.error('Policy delete test failed:', error)
    throw error
  }
})

test.afterEach(async ({ page }) => {
  await page.close()
})
